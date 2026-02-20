'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type RowType = 'checklist' | 'custom';

interface MentorDeadlineNoteCellProps {
  type: RowType;
  id: string;
  studentId: string;
  mentorNote: string | null;
  studentNote: string | null;
  title: string;
}

export default function MentorDeadlineNoteCell({
  type,
  id,
  studentId,
  mentorNote,
  studentNote,
  title,
}: MentorDeadlineNoteCellProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(mentorNote ?? '');
  const [saving, setSaving] = useState(false);

  const handleOpen = () => {
    setValue(mentorNote ?? '');
    setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url =
        type === 'custom'
          ? `/api/mentor/students/${studentId}/custom-deadlines/${id}`
          : `/api/mentor/students/${studentId}/task-progress/${id}`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentor_note: value.trim() || null }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Đã lưu ghi chú');
      setOpen(false);
      router.refresh();
    } catch {
      toast.error('Không lưu được ghi chú');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-1.5 text-sm">
        <div className="flex items-start gap-1">
          <span className="line-clamp-2 flex-1 text-muted-foreground">
            <span className="font-medium text-muted-foreground">Feedback (bạn): </span>
            {mentorNote || '—'}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleOpen}
            title="Sửa ghi chú (feedback)"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>
        {studentNote ? (
          <div className="rounded-md border border-border/60 bg-muted/20 px-2 py-1 text-xs">
            <span className="font-medium text-muted-foreground">Ghi chú học viên: </span>
            <p className="mt-0.5 line-clamp-2 text-foreground">{studentNote}</p>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Ghi chú học viên: —</span>
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ghi chú / Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="space-y-2">
              <Label>Ghi chú của mentor (feedback cho học viên)</Label>
              <Textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                rows={4}
                placeholder="Nhập feedback cho học viên..."
                className="resize-none"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
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
        </DialogContent>
      </Dialog>
    </>
  );
}
