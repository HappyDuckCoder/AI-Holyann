'use client';

import { useEffect, useState } from 'react';
import { Calendar, Plus, Trash2, Loader2, Eye, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageLoading } from '@/components/ui/PageLoading';

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED' | 'NEEDS_REVISION';

interface Task {
  id: string;
  title: string;
  description: string | null;
  mentor_note: string | null;
  student_note: string | null;
  deadline: string | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

interface DeadlineManagementTabProps {
  studentId: string;
}

const API_BASE = (studentId: string) => `/api/mentor/students/${studentId}/custom-deadlines`;

export default function DeadlineManagementTab({ studentId }: DeadlineManagementTabProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addForm, setAddForm] = useState({ title: '', description: '', deadline: '' });
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const [editNoteTask, setEditNoteTask] = useState<Task | null>(null);
  const [editNoteValue, setEditNoteValue] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await fetch(API_BASE(studentId));
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error('Không tải được danh sách deadline');
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [studentId]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = addForm.title.trim();
    if (!title) {
      toast.error('Vui lòng nhập tên nhiệm vụ');
      return;
    }
    setAddSubmitting(true);
    try {
      const res = await fetch(API_BASE(studentId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: addForm.description.trim() || null,
          deadline: addForm.deadline ? new Date(addForm.deadline).toISOString() : null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Create failed');
      }
      toast.success('Đã thêm deadline');
      setAddOpen(false);
      setAddForm({ title: '', description: '', deadline: '' });
      await fetchTasks();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Không thêm được deadline');
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleDeadlineChange = async (taskId: string, newDeadline: string) => {
    setUpdatingId(taskId);
    try {
      const res = await fetch(`${API_BASE(studentId)}/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deadline: newDeadline ? new Date(newDeadline).toISOString() : null,
        }),
      });
      if (!res.ok) throw new Error('Update failed');
      await fetchTasks();
      toast.success('Đã cập nhật hạn chót');
    } catch {
      toast.error('Không cập nhật được hạn chót');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setUpdatingId(taskId);
    try {
      const res = await fetch(`${API_BASE(studentId)}/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Update failed');
      await fetchTasks();
      toast.success('Đã cập nhật trạng thái');
    } catch {
      toast.error('Không cập nhật được trạng thái');
    } finally {
      setUpdatingId(null);
    }
  };

  const openEditNote = (task: Task) => {
    setEditNoteTask(task);
    setEditNoteValue(task.mentor_note ?? '');
  };

  const handleSaveMentorNote = async () => {
    if (!editNoteTask) return;
    setSavingNote(true);
    try {
      const res = await fetch(`${API_BASE(studentId)}/${editNoteTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentor_note: editNoteValue.trim() || null }),
      });
      if (!res.ok) throw new Error('Update failed');
      await fetchTasks();
      toast.success('Đã lưu ghi chú (feedback)');
      setEditNoteTask(null);
    } catch {
      toast.error('Không lưu được ghi chú');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Bạn có chắc muốn xóa deadline này?')) return;
    setDeletingId(taskId);
    try {
      const res = await fetch(`${API_BASE(studentId)}/${taskId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await fetchTasks();
      toast.success('Đã xóa deadline');
    } catch {
      toast.error('Không xóa được deadline');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status: TaskStatus) => {
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
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case 'COMPLETED': return 'Hoàn thành';
      case 'SUBMITTED': return 'Đã nộp';
      case 'IN_PROGRESS': return 'Đang làm';
      case 'NEEDS_REVISION': return 'Cần sửa';
      default: return 'Chưa bắt đầu';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <PageLoading inline size="md" className="py-0" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Deadline tùy chỉnh ({tasks.length})
        </h3>
        <Button
          onClick={() => setAddOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Thêm deadline
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-xl border border-border bg-card py-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Chưa có deadline tùy chỉnh</p>
          <p className="mt-1 text-xs text-muted-foreground">Nhấn &quot;Thêm deadline&quot; để tạo</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground sm:px-6">Nhiệm vụ</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground sm:px-6">Hạn chót</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground sm:px-6">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground sm:px-6">Ghi chú (feedback)</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground sm:px-6">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b border-border transition-colors hover:bg-muted/20 last:border-0">
                    <td className="px-4 py-3 sm:px-6">
                      <div>
                        <div className="font-medium text-foreground">{task.title}</div>
                        {task.description && (
                          <div className="mt-1 text-sm text-muted-foreground line-clamp-2 max-w-[200px]">{task.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 sm:px-6">
                      <input
                        type="date"
                        value={task.deadline ? format(new Date(task.deadline), 'yyyy-MM-dd') : ''}
                        onChange={(e) => handleDeadlineChange(task.id, e.target.value)}
                        disabled={updatingId === task.id}
                        className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground disabled:opacity-50"
                      />
                      {updatingId === task.id && (
                        <Loader2 className="mt-1 inline h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </td>
                    <td className="px-4 py-3 sm:px-6">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                        disabled={updatingId === task.id}
                        className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium ${getStatusColor(task.status)}`}
                      >
                        <option value="PENDING">{getStatusLabel('PENDING')}</option>
                        <option value="IN_PROGRESS">{getStatusLabel('IN_PROGRESS')}</option>
                        <option value="SUBMITTED">{getStatusLabel('SUBMITTED')}</option>
                        <option value="COMPLETED">{getStatusLabel('COMPLETED')}</option>
                        <option value="NEEDS_REVISION">{getStatusLabel('NEEDS_REVISION')}</option>
                      </select>
                    </td>
                    <td className="max-w-[240px] px-4 py-3 sm:px-6">
                      <div className="flex flex-col gap-1.5 text-sm">
                        <div className="flex items-start gap-1">
                          <span className="line-clamp-2 flex-1 text-muted-foreground">
                            <span className="font-medium text-muted-foreground">Feedback (bạn): </span>
                            {task.mentor_note || '—'}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => openEditNote(task)}
                            title="Sửa ghi chú (feedback)"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        {task.student_note ? (
                          <div className="rounded-md border border-border/60 bg-muted/20 px-2 py-1 text-xs">
                            <span className="font-medium text-muted-foreground">Ghi chú học viên: </span>
                            <p className="mt-0.5 line-clamp-2 text-foreground">{task.student_note}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Ghi chú học viên: —</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right sm:px-6">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="outline" size="sm" className="gap-1" onClick={() => setViewTask(task)} title="Xem chi tiết">
                          <Eye className="h-3.5 w-3.5" />
                          Xem
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDelete(task.id)}
                          disabled={deletingId === task.id}
                          title="Xóa"
                        >
                          {deletingId === task.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View detail modal */}
      <Dialog open={!!viewTask} onOpenChange={(open) => !open && setViewTask(null)}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader className="pr-10">
            <DialogTitle>Chi tiết deadline</DialogTitle>
          </DialogHeader>
          {viewTask && (
            <div className="space-y-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Nhiệm vụ</Label>
                <p className="mt-1 font-medium text-foreground">{viewTask.title}</p>
                {viewTask.description && (
                  <p className="mt-0.5 text-muted-foreground">{viewTask.description}</p>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground">Hạn chót</Label>
                <p className="mt-1 text-foreground">
                  {viewTask.deadline ? format(new Date(viewTask.deadline), 'dd/MM/yyyy', { locale: vi }) : '—'}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Trạng thái</Label>
                <p className="mt-1">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(viewTask.status)}`}>
                    {getStatusLabel(viewTask.status)}
                  </span>
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Ghi chú / Feedback (mentor)</Label>
                <p className="mt-1 text-foreground">{viewTask.mentor_note || '—'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Ghi chú từ học viên</Label>
                <p className="mt-1 text-foreground">{viewTask.student_note || '—'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit mentor note (feedback) modal */}
      <Dialog open={!!editNoteTask} onOpenChange={(open) => !open && setEditNoteTask(null)}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader className="pr-10">
            <DialogTitle>Ghi chú / Feedback</DialogTitle>
          </DialogHeader>
          {editNoteTask && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{editNoteTask.title}</p>
              <div className="space-y-2">
                <Label>Ghi chú của mentor (feedback cho học viên)</Label>
                <Textarea
                  value={editNoteValue}
                  onChange={(e) => setEditNoteValue(e.target.value)}
                  rows={4}
                  placeholder="Nhập feedback cho học viên..."
                  className="resize-none"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditNoteTask(null)}>Hủy</Button>
                <Button onClick={handleSaveMentorNote} disabled={savingNote}>
                  {savingNote ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...</> : 'Lưu'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader className="pr-10">
            <DialogTitle>Thêm deadline tùy chỉnh</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-title">Tên nhiệm vụ *</Label>
              <Input
                id="add-title"
                value={addForm.title}
                onChange={(e) => setAddForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="VD: Nộp bài luận Common App"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-description">Mô tả (tùy chọn)</Label>
              <Textarea
                id="add-description"
                value={addForm.description}
                onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Ghi chú cho học viên"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-deadline">Hạn chót (tùy chọn)</Label>
              <Input
                id="add-deadline"
                type="date"
                value={addForm.deadline}
                onChange={(e) => setAddForm((f) => ({ ...f, deadline: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={addSubmitting}>
                {addSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang thêm...
                  </>
                ) : (
                  'Thêm'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
