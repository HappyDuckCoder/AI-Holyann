'use client';

import { useEffect, useState } from 'react';
import {
  CheckSquare,
  Square,
  Clock,
  Calendar,
  FileText,
  AlertCircle,
  Eye,
  MessageSquare,
  Loader2,
  ChevronDown,
  ChevronUp,
  X,
  CalendarDays
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getStudentChecklist, updateStudentTaskStatus, updateTaskDeadline } from '@/actions/mentor-checklist';
import FilePreviewModal from '@/components/common/FilePreviewModal';
import { PageLoading } from '@/components/ui/PageLoading';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChecklistTabProps {
  studentId: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  linkTo: string | null;
  orderIndex: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED' | 'NEEDS_REVISION';
  submissionUrl?: string | null;
  mentorNote?: string | null;
  deadline?: Date | null;
  completedAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

interface Stage {
  id: number;
  name: string;
  description: string | null;
  tasks: Task[];
}

const getStatusInfo = (status: Task['status']) => {
  switch (status) {
    case 'COMPLETED':
      return {
        icon: CheckSquare,
        text: 'Đã hoàn thành',
        color: 'text-green-600 bg-green-500/15 ring-green-500/30 dark:text-green-400 dark:bg-green-500/20 dark:ring-green-500/30',
        iconColor: 'text-green-600 dark:text-green-400'
      };
    case 'SUBMITTED':
      return {
        icon: Clock,
        text: 'Đang review',
        color: 'text-yellow-600 bg-yellow-500/15 ring-yellow-500/30 dark:text-yellow-400 dark:bg-yellow-500/20 dark:ring-yellow-500/30',
        iconColor: 'text-yellow-500 dark:text-yellow-400'
      };
    case 'IN_PROGRESS':
      return {
        icon: AlertCircle,
        text: 'Đang thực hiện',
        color: 'text-blue-600 bg-blue-500/15 ring-blue-500/30 dark:text-blue-400 dark:bg-blue-500/20 dark:ring-blue-500/30',
        iconColor: 'text-blue-600 dark:text-blue-400'
      };
    case 'NEEDS_REVISION':
      return {
        icon: AlertCircle,
        text: 'Cần sửa lại',
        color: 'text-red-600 bg-red-500/15 ring-red-500/30 dark:text-red-400 dark:bg-red-500/20 dark:ring-red-500/30',
        iconColor: 'text-red-600 dark:text-red-400'
      };
    default:
      return {
        icon: Square,
        text: 'Chưa bắt đầu',
        color: 'text-muted-foreground bg-muted ring-border',
        iconColor: 'text-muted-foreground'
      };
  }
};

export default function ChecklistTab({ studentId }: ChecklistTabProps) {
  const [stages, setStages] = useState<Stage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedStages, setExpandedStages] = useState<Set<number>>(new Set());
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [noteModal, setNoteModal] = useState<{
    isOpen: boolean;
    taskId: string;
    taskTitle: string;
    newStatus: Task['status'];
    currentNote: string;
  }>({
    isOpen: false,
    taskId: '',
    taskTitle: '',
    newStatus: 'PENDING',
    currentNote: ''
  });
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    fileUrl: string;
    fileName: string;
  }>({
    isOpen: false,
    fileUrl: '',
    fileName: ''
  });
  const [updatingDeadlineTaskId, setUpdatingDeadlineTaskId] = useState<string | null>(null);

  useEffect(() => {
    const fetchChecklist = async () => {
      try {
        setIsLoading(true);
        const result = await getStudentChecklist(studentId);

        if (result.success && result.data) {
          // Map data from server action to component interface
          const mappedStages: Stage[] = result.data.stages.map(stage => ({
            id: stage.id,
            name: stage.name,
            description: stage.description,
            tasks: stage.tasks.map(task => ({
              id: task.id,
              title: task.title,
              description: task.description,
              linkTo: task.link_to,
              orderIndex: task.order_index,
              status: task.progress?.status || 'PENDING',
              submissionUrl: task.progress?.submission_url,
              mentorNote: task.progress?.mentor_note,
              deadline: task.progress?.deadline,
              completedAt: task.progress?.completed_at,
              createdAt: task.progress?.created_at,
              updatedAt: task.progress?.updated_at,
            }))
          }));

          setStages(mappedStages);
          // Expand first stage by default
          if (mappedStages.length > 0) {
            setExpandedStages(new Set([mappedStages[0].id]));
          }
        } else {
          console.error('Failed to fetch checklist:', result.error);
        }
      } catch (error) {
        console.error('Error fetching checklist:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChecklist();
  }, [studentId]);

  const toggleStageExpansion = (stageId: number) => {
    setExpandedStages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stageId)) {
        newSet.delete(stageId);
      } else {
        newSet.add(stageId);
      }
      return newSet;
    });
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status'], taskTitle: string, currentNote: string = '') => {
    // Nếu status cần ghi chú (NEEDS_REVISION hoặc COMPLETED), mở modal
    if (newStatus === 'NEEDS_REVISION' || newStatus === 'COMPLETED') {
      const task = stages.flatMap(s => s.tasks).find(t => t.id === taskId);
      setNoteModal({
        isOpen: true,
        taskId,
        taskTitle,
        newStatus,
        currentNote: task?.mentorNote || ''
      });
      return;
    }

    // Cập nhật trực tiếp với các status khác
    await updateTaskStatus(taskId, newStatus);
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task['status'], note?: string) => {
    try {
      setUpdatingTaskId(taskId);
      const result = await updateStudentTaskStatus(studentId, taskId, newStatus, note);

      if (result.success) {
        // Update local state
        setStages(prev =>
          prev.map(stage => ({
            ...stage,
            tasks: stage.tasks.map(task =>
              task.id === taskId
                ? {
                    ...task,
                    status: newStatus,
                    mentorNote: note,
                    updatedAt: new Date()
                  }
                : task
            )
          }))
        );
      } else {
        alert('Lỗi khi cập nhật trạng thái: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleNoteSubmit = async (note: string) => {
    await updateTaskStatus(noteModal.taskId, noteModal.newStatus, note);
    setNoteModal(prev => ({ ...prev, isOpen: false }));
  };

  const handlePreviewFile = (fileUrl: string, taskTitle: string) => {
    // Extract filename from Supabase URL
    // URL format: https://xxx.supabase.co/storage/v1/object/public/bucket/folder/filename.ext
    const urlParts = fileUrl.split('/');
    const fileName = urlParts[urlParts.length - 1] || `${taskTitle.replace(/[^a-zA-Z0-9\s]/g, '_').trim()}.pdf`;

    // Decode filename if it's URL encoded
    const decodedFileName = decodeURIComponent(fileName);

    setPreviewModal({
      isOpen: true,
      fileUrl,
      fileName: decodedFileName
    });
  };

  const closePreviewModal = () => {
    setPreviewModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleDeadlineChange = async (taskId: string, newDate: Date | undefined) => {
    try {
      setUpdatingDeadlineTaskId(taskId);
      const result = await updateTaskDeadline(studentId, taskId, newDate || null);

      if (result.success) {
        // Update local state
        setStages(prev =>
          prev.map(stage => ({
            ...stage,
            tasks: stage.tasks.map(task =>
              task.id === taskId
                ? {
                    ...task,
                    deadline: newDate || null,
                    updatedAt: new Date()
                  }
                : task
            )
          }))
        );
      } else {
        alert('Lỗi khi cập nhật deadline: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating deadline:', error);
      alert('Có lỗi xảy ra khi cập nhật deadline');
    } finally {
      setUpdatingDeadlineTaskId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <PageLoading inline size="md" message="Đang tải checklist..." className="py-0" />
      </div>
    );
  }

  if (stages.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium text-foreground">Chưa có checklist</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Học viên này chưa có checklist tasks nào.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'NEEDS_REVISION'].map(status => {
          const count = stages.reduce((total, stage) =>
            total + stage.tasks.filter(task => task.status === status).length, 0
          );
          const statusInfo = getStatusInfo(status as Task['status']);

          return (
            <div key={status} className="bg-card border border-border rounded-lg p-4 text-center">
              <statusInfo.icon className={`w-6 h-6 mx-auto ${statusInfo.iconColor}`} />
              <p className="text-2xl font-bold text-foreground mt-2">{count}</p>
              <p className="text-xs text-muted-foreground">{statusInfo.text}</p>
            </div>
          );
        })}
      </div>

      {/* Checklist Stages */}
      <div className="space-y-4">
        {stages.map(stage => {
          const isExpanded = expandedStages.has(stage.id);
          const completedTasks = stage.tasks.filter(task => task.status === 'COMPLETED').length;
          const totalTasks = stage.tasks.length;
          const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

          return (
            <div key={stage.id} className="bg-card border border-border rounded-lg overflow-hidden">
              {/* Stage Header */}
              <div
                className="px-6 py-4 border-b border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleStageExpansion(stage.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{stage.name}</h3>
                    {stage.description && (
                      <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <div className="text-sm text-muted-foreground">
                        {completedTasks}/{totalTasks} hoàn thành
                      </div>
                      <div className="flex-1 max-w-xs">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-sm font-medium text-foreground">
                        {Math.round(progressPercentage)}%
                      </div>
                    </div>
                  </div>
                  <button className="ml-4 p-1 text-muted-foreground hover:text-foreground">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {/* Stage Tasks */}
              {isExpanded && (
                <div className="divide-y">
                  {stage.tasks.map(task => {
                    const statusInfo = getStatusInfo(task.status);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <div key={task.id} className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Status Icon */}
                          <div className={`flex-shrink-0 p-1 ${statusInfo.iconColor}`}>
                            <StatusIcon size={20} />
                          </div>

                          {/* Task Content */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-medium text-foreground">
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {task.description}
                              </p>
                            )}

                            {/* Status Badge */}
                            <div className="flex items-center gap-3 mt-3">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${statusInfo.color}`}>
                                <StatusIcon size={12} />
                                {statusInfo.text}
                              </span>

                              {task.completedAt && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar size={12} />
                                  {new Date(task.completedAt).toLocaleDateString('vi-VN')}
                                </span>
                              )}
                            </div>

                            {/* Deadline Picker */}
                            <div className="flex items-center gap-3 mt-3">
                              <span className="text-sm text-muted-foreground">Hạn chót:</span>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={updatingDeadlineTaskId === task.id}
                                    className={cn(
                                      "justify-start text-left font-normal h-8 px-3",
                                      !task.deadline && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarDays className="mr-2 h-4 w-4" />
                                    {updatingDeadlineTaskId === task.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : task.deadline ? (
                                      format(new Date(task.deadline), 'dd/MM/yyyy', { locale: vi })
                                    ) : (
                                      <span>Đặt hạn chót</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <CalendarComponent
                                    mode="single"
                                    selected={task.deadline ? new Date(task.deadline) : undefined}
                                    onSelect={(date) => handleDeadlineChange(task.id, date)}
                                    locale={vi}
                                  />
                                  {task.deadline && (
                                    <div className="p-2 border-t">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDeadlineChange(task.id, undefined)}
                                      >
                                        <X className="mr-2 h-4 w-4" />
                                        Xóa hạn chót
                                      </Button>
                                    </div>
                                  )}
                                </PopoverContent>
                              </Popover>
                            </div>

                            {/* Submission File */}
                            {task.submissionUrl && (
                              <div className="mt-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-2 text-sm text-primary">
                                    <FileText size={16} />
                                    <div>
                                      <p className="font-medium">File đã nộp</p>
                                      <p className="text-xs text-primary/80 mt-1">
                                        Nhấp để xem trước hoặc tải xuống file
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1 font-mono break-all">
                                        {task.submissionUrl}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <button
                                      onClick={() => handlePreviewFile(
                                        task.submissionUrl!,
                                        task.title
                                      )}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded hover:opacity-90 transition-all duration-200"
                                    >
                                      <Eye size={14} />
                                      Xem trước
                                    </button>
                                    <a
                                      href={`/api/file-proxy?url=${encodeURIComponent(task.submissionUrl!)}&download=true`}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--secondary)] text-secondary-foreground text-xs font-medium rounded hover:opacity-90 transition-all duration-200 text-center"
                                    >
                                      <FileText size={14} />
                                      Tải xuống
                                    </a>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Mentor Note */}
                            {task.mentorNote && (
                              <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                                <div className="flex items-start gap-2 text-sm text-yellow-800">
                                  <MessageSquare size={16} className="flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="font-medium">Ghi chú từ mentor:</p>
                                    <p className="mt-1">{task.mentorNote}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex-shrink-0">
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'], task.title, task.mentorNote || '')}
                              disabled={updatingTaskId === task.id}
                              className="text-sm border border-input rounded px-3 py-1 bg-background focus:ring-2 focus:ring-ring focus:border-ring disabled:opacity-50"
                            >
                              <option value="PENDING">Chưa bắt đầu</option>
                              <option value="IN_PROGRESS">Đang thực hiện</option>
                              <option value="SUBMITTED">Đang review</option>
                              <option value="COMPLETED">Đã hoàn thành</option>
                              <option value="NEEDS_REVISION">Cần sửa lại</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Note Modal */}
      {noteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--overlay)]">
          <div className="bg-card border border-border rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Ghi chú cho task
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                <strong>{noteModal.taskTitle}</strong>
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Trạng thái mới: <span className="font-medium">{getStatusInfo(noteModal.newStatus).text}</span>
              </p>

              <textarea
                defaultValue={noteModal.currentNote}
                placeholder="Thêm ghi chú cho học viên (tùy chọn)..."
                className="w-full h-24 p-3 border border-input rounded-lg resize-none bg-background focus:ring-2 focus:ring-ring focus:border-ring"
                id="note-textarea"
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setNoteModal(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    const textarea = document.getElementById('note-textarea') as HTMLTextAreaElement;
                    handleNoteSubmit(textarea.value);
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={previewModal.isOpen}
        onClose={closePreviewModal}
        fileUrl={previewModal.fileUrl}
        fileName={previewModal.fileName}
      />
    </div>
  );
}
