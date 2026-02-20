'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  ArrowRight,
  ClipboardList,
  Eye,
  Pencil,
  Loader2,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export type RowType = 'checklist' | 'custom';

export interface DeadlineRow {
  id: string;
  type: RowType;
  title: string;
  description: string | null;
  stageName?: string | null;
  deadline: string | null;
  status: string;
  mentor_note: string | null;
  student_note: string | null;
  deadlineStatus: {
    label: string;
    sublabel: string;
    badgeClass: string;
    priority: number;
  };
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'COMPLETED':
      return 'Đã hoàn thành';
    case 'SUBMITTED':
      return 'Chờ review';
    case 'IN_PROGRESS':
      return 'Đang thực hiện';
    case 'NEEDS_REVISION':
      return 'Cần chỉnh sửa';
    default:
      return 'Chưa bắt đầu';
  }
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'SUBMITTED':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'IN_PROGRESS':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'NEEDS_REVISION':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-muted text-muted-foreground dark:bg-muted/80';
  }
}

const CAN_SUBMIT_REVIEW = ['PENDING', 'IN_PROGRESS', 'NEEDS_REVISION'];

function canSubmitReview(status: string): boolean {
  return CAN_SUBMIT_REVIEW.includes(String(status).toUpperCase());
}

interface StudentDeadlinesTableProps {
  rows: DeadlineRow[];
  onNoteSaved?: () => void;
}

export default function StudentDeadlinesTable({
  rows,
  onNoteSaved,
}: StudentDeadlinesTableProps) {
  const [viewRow, setViewRow] = useState<DeadlineRow | null>(null);
  const [noteRow, setNoteRow] = useState<DeadlineRow | null>(null);
  const [noteValue, setNoteValue] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [submittingReviewId, setSubmittingReviewId] = useState<string | null>(null);

  const handleSaveNote = async () => {
    if (!noteRow) return;
    setSavingNote(true);
    try {
      const url =
        noteRow.type === 'checklist'
          ? `/api/students/me/deadlines/checklist/${noteRow.id}`
          : `/api/students/me/deadlines/custom/${noteRow.id}`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_note: noteValue || null }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Đã lưu ghi chú');
      setNoteRow(null);
      onNoteSaved?.();
      if (typeof window !== 'undefined') window.location.reload();
    } catch {
      toast.error('Không lưu được ghi chú');
    } finally {
      setSavingNote(false);
    }
  };

  const openNoteEdit = (row: DeadlineRow) => {
    setNoteRow(row);
    setNoteValue(row.student_note ?? '');
  };

  const handleSubmitReview = async (row: DeadlineRow) => {
    const canSubmit =
      row.type === 'checklist'
        ? canSubmitReview(row.status)
        : canSubmitReview(row.status);
    if (!canSubmit) return;
    setSubmittingReviewId(row.id);
    try {
      const url =
        row.type === 'checklist'
          ? `/api/students/me/deadlines/checklist/${row.id}`
          : `/api/students/me/deadlines/custom/${row.id}`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SUBMITTED' }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Đã nộp để mentor review');
      onNoteSaved?.();
      if (typeof window !== 'undefined') window.location.reload();
    } catch {
      toast.error('Không nộp được');
    } finally {
      setSubmittingReviewId(null);
    }
  };

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">Chưa có deadline nào</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Mentor sẽ thiết lập deadline cho các nhiệm vụ của bạn
        </p>
        <Link
          href="/student/checklist"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ClipboardList className="h-4 w-4" />
          Xem Checklist
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground sm:px-6">
                Nhiệm vụ
              </th>
              <th className="hidden px-4 py-3 text-left text-sm font-semibold text-muted-foreground md:table-cell sm:px-6">
                Loại
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground sm:px-6">
                Hạn chót
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground sm:px-6">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground sm:px-6">
                Ghi chú
              </th>
              <th className="min-w-[200px] px-4 py-3 text-right text-sm font-semibold text-muted-foreground sm:px-6">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={`${row.type}-${row.id}`}
                className="border-b border-border transition-colors hover:bg-muted/30 last:border-0"
              >
                <td className="py-3 px-4 sm:px-6">
                  <div>
                    <div className="font-semibold text-foreground">
                      {row.title}
                    </div>
                    {(row.description || row.stageName) && (
                      <div className="mt-0.5 text-xs text-muted-foreground md:text-sm">
                        {row.stageName && (
                          <span className="md:hidden">{row.stageName} · </span>
                        )}
                        {row.description || row.stageName}
                      </div>
                    )}
                    {row.type === 'custom' && (
                      <div className="mt-0.5 text-xs text-muted-foreground md:hidden">
                        Tùy chỉnh
                      </div>
                    )}
                  </div>
                </td>
                <td className="hidden py-3 px-4 sm:px-6 md:table-cell">
                  <span
                    className={
                      row.type === 'checklist'
                        ? 'rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary'
                        : 'rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground dark:bg-muted/80'
                    }
                  >
                    {row.type === 'checklist' ? 'Checklist' : 'Tùy chỉnh'}
                  </span>
                </td>
                <td className="py-3 px-4 sm:px-6">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${row.deadlineStatus.badgeClass}`}
                  >
                    {row.deadlineStatus.label}
                    {row.deadlineStatus.sublabel &&
                      ` · ${row.deadlineStatus.sublabel}`}
                  </span>
                </td>
                <td className="py-3 px-4 sm:px-6">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(row.status)}`}
                  >
                    {getStatusLabel(row.status)}
                  </span>
                </td>
                <td className="max-w-[220px] py-3 px-4 sm:px-6">
                  <div className="flex flex-col gap-1.5">
                    {row.mentor_note ? (
                      <div className="rounded-md border border-border/60 bg-muted/30 px-2 py-1.5 text-xs">
                        <span className="font-medium text-muted-foreground">Feedback mentor:</span>
                        <p className="mt-0.5 line-clamp-2 text-foreground">{row.mentor_note}</p>
                      </div>
                    ) : null}
                    <div className="flex items-center gap-1">
                      <span className="line-clamp-2 flex-1 text-sm text-muted-foreground">
                        {row.student_note ? (
                          <>
                            <span className="font-medium text-muted-foreground">Ghi chú của bạn: </span>
                            {row.student_note}
                          </>
                        ) : (
                          '—'
                        )}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => openNoteEdit(row)}
                        title="Sửa ghi chú"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </td>
                <td className="min-w-[200px] py-3 px-4 text-right sm:px-6">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setViewRow(row)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Xem
                    </Button>
                    {canSubmitReview(row.status) ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="gap-1.5"
                        onClick={() => handleSubmitReview(row)}
                        disabled={submittingReviewId === row.id}
                        title="Nộp để mentor duyệt"
                      >
                        {submittingReviewId === row.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                        Nộp review
                      </Button>
                    ) : (
                      String(row.status).toUpperCase() === 'SUBMITTED' && (
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
                          <Send className="h-3.5 w-3.5" />
                          Đã nộp review
                        </span>
                      )
                    )}
                    {row.type === 'checklist' && (
                      <Link href="/student/checklist">
                        <Button size="sm" className="gap-1.5">
                          Checklist
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!viewRow} onOpenChange={(open) => !open && setViewRow(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chi tiết deadline</DialogTitle>
          </DialogHeader>
          {viewRow && (
            <div className="space-y-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Nhiệm vụ</Label>
                <p className="mt-1 font-medium text-foreground">{viewRow.title}</p>
                {(viewRow.description || viewRow.stageName) && (
                  <p className="mt-0.5 text-muted-foreground">
                    {viewRow.stageName &&
                      `${viewRow.stageName}. `}
                    {viewRow.description}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground">Loại</Label>
                <p className="mt-1 text-foreground">
                  {viewRow.type === 'checklist' ? 'Checklist' : 'Tùy chỉnh'}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Hạn chót</Label>
                <p className="mt-1 text-foreground">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${viewRow.deadlineStatus.badgeClass}`}
                  >
                    {viewRow.deadlineStatus.label} ·{' '}
                    {viewRow.deadlineStatus.sublabel}
                  </span>
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Trạng thái</Label>
                <p className="mt-1">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusBadgeClass(viewRow.status)}`}
                  >
                    {getStatusLabel(viewRow.status)}
                  </span>
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Feedback mentor</Label>
                <p className="mt-1 text-foreground">
                  {viewRow.mentor_note || '—'}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Ghi chú của bạn</Label>
                <p className="mt-1 text-foreground">
                  {viewRow.student_note || '—'}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!noteRow} onOpenChange={(open) => !open && setNoteRow(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sửa ghi chú</DialogTitle>
          </DialogHeader>
          {noteRow && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{noteRow.title}</p>
              <div className="space-y-2">
                <Label>Ghi chú của bạn</Label>
                <Textarea
                  value={noteValue}
                  onChange={(e) => setNoteValue(e.target.value)}
                  rows={3}
                  placeholder="Thêm ghi chú..."
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNoteRow(null)}>
                  Hủy
                </Button>
                <Button onClick={handleSaveNote} disabled={savingNote}>
                  {savingNote ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu'
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
