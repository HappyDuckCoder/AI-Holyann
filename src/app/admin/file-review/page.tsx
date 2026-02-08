'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Download,
  Eye,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import RoleGuard from '@/components/auth/RoleGuard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SubmittedFile {
  id: string;
  student_id: string;
  submission_url: string;
  status: 'SUBMITTED' | 'COMPLETED' | 'NEEDS_REVISION';
  completed_at: string;
  mentor_note?: string;
  student: {
    users: {
      full_name: string;
      email: string;
    };
  };
  task: {
    title: string;
    description?: string;
  };
}

export default function FileReviewPage() {
  const [submissions, setSubmissions] = useState<SubmittedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmittedFile | null>(null);
  const [mentorNote, setMentorNote] = useState('');
  const [filter, setFilter] = useState<'all' | 'submitted' | 'completed' | 'needs_revision'>('submitted');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const response = await fetch('/api/admin/submissions');
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions || []);
      } else {
        toast.error('Không thể tải danh sách file đã nộp');
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (
    submissionId: string,
    status: 'COMPLETED' | 'NEEDS_REVISION',
    note?: string
  ) => {
    setProcessingId(submissionId);
    try {
      const response = await fetch('/api/admin/submissions/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, status, mentorNote: note }),
      });

      if (response.ok) {
        toast.success(status === 'COMPLETED' ? 'Đã duyệt thành công!' : 'Đã gửi yêu cầu chỉnh sửa!');
        loadSubmissions();
        setSelectedSubmission(null);
        setMentorNote('');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error updating submission:', error);
      toast.error('Lỗi khi cập nhật trạng thái');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            <Clock size={12} /> Chờ review
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle size={12} /> Đã duyệt
          </span>
        );
      case 'NEEDS_REVISION':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <XCircle size={12} /> Cần sửa
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
            Chờ xử lý
          </span>
        );
    }
  };

  const filteredSubmissions = submissions.filter((submission) => {
    const matchFilter =
      filter === 'all' || submission.status.toLowerCase() === filter.replace('_', '').toLowerCase();
    const matchSearch =
      !searchTerm ||
      submission.student.users.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.student.users.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.task.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  if (loading) {
    return (
      <RoleGuard allowedRoles={['admin', 'ADMIN']}>
        <div className="w-full min-h-[300px] flex flex-col">
          <div className="flex-1 p-6 md:p-8 space-y-6">
            <h1 className="text-xl font-semibold text-foreground">File review</h1>
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading…</span>
            </div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin', 'ADMIN']}>
      <div className="w-full min-h-[300px] flex flex-col">
        <div className="flex-1 p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl font-semibold text-foreground">File review</h1>
            <span className="text-sm text-muted-foreground">
              {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Filter tabs + search */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'submitted', label: 'Chờ review', count: submissions.filter((s) => s.status === 'SUBMITTED').length },
                { key: 'completed', label: 'Đã duyệt', count: submissions.filter((s) => s.status === 'COMPLETED').length },
                { key: 'needs_revision', label: 'Cần sửa', count: submissions.filter((s) => s.status === 'NEEDS_REVISION').length },
                { key: 'all', label: 'Tất cả', count: submissions.length },
              ].map((tab) => (
                <Button
                  key={tab.key}
                  variant={filter === tab.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(tab.key as typeof filter)}
                >
                  {tab.label} ({tab.count})
                </Button>
              ))}
            </div>
            <div className="relative max-w-xs sm:ml-auto">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search student or task..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              />
            </div>
          </div>

          {/* Table */}
          {filteredSubmissions.length === 0 ? (
            <div className="border border-border rounded-xl overflow-hidden bg-muted/20 border-dashed">
              <div className="flex flex-col items-center justify-center py-16">
                <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium text-foreground">No submissions</h3>
                <p className="text-sm text-muted-foreground">
                  {filter === 'submitted' && 'Chưa có file nào cần review'}
                  {filter === 'completed' && 'Chưa có file nào được duyệt'}
                  {filter === 'needs_revision' && 'Chưa có file nào cần chỉnh sửa'}
                  {filter === 'all' && 'Chưa có file nào được nộp'}
                </p>
              </div>
            </div>
          ) : (
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Student</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground hidden md:table-cell">Task</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground hidden lg:table-cell">Submitted</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map((submission) => (
                      <tr
                        key={submission.id}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-semibold text-foreground">{submission.student.users.full_name}</div>
                            <div className="text-xs text-muted-foreground md:hidden">{submission.task.title}</div>
                            <div className="text-sm text-muted-foreground">{submission.student.users.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-foreground hidden md:table-cell max-w-[200px] truncate" title={submission.task.title}>
                          {submission.task.title}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground hidden lg:table-cell">
                          {new Date(submission.completed_at).toLocaleString('vi-VN')}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(submission.status)}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(submission.submission_url, '_blank')}
                              className="text-primary hover:text-primary/80"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {submission.status === 'SUBMITTED' && (
                              <Button
                                size="sm"
                                onClick={() => setSelectedSubmission(submission)}
                              >
                                Review
                              </Button>
                            )}
                            {submission.status === 'NEEDS_REVISION' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateSubmissionStatus(submission.id, 'COMPLETED')}
                                disabled={processingId === submission.id}
                              >
                                {processingId === submission.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Review modal */}
          <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && (setSelectedSubmission(null), setMentorNote(''))}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              {selectedSubmission && (
                <>
                  <DialogHeader>
                    <DialogTitle>
                      Review – {selectedSubmission.student.users.full_name}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">{selectedSubmission.task.title}</p>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => window.open(selectedSubmission.submission_url, '_blank')}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Open file
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = selectedSubmission.submission_url;
                          link.download = 'file';
                          link.click();
                        }}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Ghi chú cho học viên (tuỳ chọn)
                      </label>
                      <Textarea
                        value={mentorNote}
                        onChange={(e) => setMentorNote(e.target.value)}
                        placeholder="Nhập ghi chú hoặc góp ý cho học viên..."
                        rows={4}
                        className="resize-none"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => updateSubmissionStatus(selectedSubmission.id, 'COMPLETED', mentorNote)}
                        disabled={processingId === selectedSubmission.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {processingId === selectedSubmission.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Duyệt file
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() =>
                          updateSubmissionStatus(
                            selectedSubmission.id,
                            'NEEDS_REVISION',
                            mentorNote || 'Cần chỉnh sửa lại file'
                          )
                        }
                        disabled={processingId === selectedSubmission.id}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Yêu cầu sửa
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedSubmission(null);
                          setMentorNote('');
                        }}
                      >
                        Hủy
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </RoleGuard>
  );
}
