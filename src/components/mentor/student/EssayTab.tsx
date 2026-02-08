'use client';

import { useEffect, useState } from 'react';
import { FileText, Loader2, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';

interface EssayTabProps {
  studentId: string;
}

interface EssayItem {
  id: string;
  title: string | null;
  content: string;
  updated_at: string;
  _count?: { comments: number };
}

interface CommentItem {
  id: string;
  content: string;
  author: { id: string; full_name: string | null; email: string };
  created_at: string;
}

export default function EssayTab({ studentId }: EssayTabProps) {
  const [essays, setEssays] = useState<EssayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [essayDetail, setEssayDetail] = useState<{ content: string; comments: CommentItem[] } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchEssays = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/mentor/students/${studentId}/essays`);
        if (res.ok) {
          const json = await res.json();
          setEssays(json.data || []);
          if (json.data?.length > 0 && !selectedId) setSelectedId(json.data[0].id);
        }
      } catch (e) {
        console.error(e);
        toast.error('Không tải được danh sách luận');
      } finally {
        setLoading(false);
      }
    };
    fetchEssays();
  }, [studentId]);

  useEffect(() => {
    if (!selectedId) {
      setEssayDetail(null);
      return;
    }
    setDetailLoading(true);
    fetch(`/api/mentor/students/${studentId}/essays/${selectedId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Không tải được bài luận');
        return res.json();
      })
      .then((json) => {
        const e = json.data;
        setEssayDetail({
          content: e.content || '',
          comments: (e.comments || []).map((c: CommentItem) => ({
            id: c.id,
            content: c.content,
            author: c.author,
            created_at: c.created_at,
          })),
        });
      })
      .catch(() => {
        setEssayDetail(null);
        toast.error('Không tải được bài luận');
      })
      .finally(() => setDetailLoading(false));
  }, [studentId, selectedId]);

  const handleAddComment = async () => {
    const text = commentText.trim();
    if (!text || !selectedId) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/student/essays/${selectedId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gửi comment thất bại');
      }
      const json = await res.json();
      const newComment = json.data;
      setEssayDetail((prev) =>
        prev
          ? { ...prev, comments: [...prev.comments, { id: newComment.id, content: newComment.content, author: newComment.author, created_at: newComment.created_at }] }
          : prev
      );
      setCommentText('');
      toast.success('Đã gửi nhận xét');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi gửi comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Đang tải...
      </div>
    );
  }

  if (essays.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-3 opacity-60" />
        <p>Học viên chưa có bài luận nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 p-3 border-b border-gray-200 bg-gray-50">
          <span className="text-sm text-gray-600">Chọn bài luận:</span>
          <select
            value={selectedId || ''}
            onChange={(e) => setSelectedId(e.target.value || null)}
            className="rounded-lg border border-gray-300 bg-white text-gray-900 text-sm px-3 py-1.5"
          >
            {essays.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title || `Luận ${new Date(e.updated_at).toLocaleDateString('vi-VN')}`}
                {e._count?.comments != null ? ` (${e._count.comments} nhận xét)` : ''}
              </option>
            ))}
          </select>
        </div>
        {detailLoading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : essayDetail ? (
          <>
            <div
              className="p-6 min-h-[200px] border-b border-gray-200 bg-gray-50/50 text-gray-900 prose prose-sm max-w-none"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              dangerouslySetInnerHTML={{ __html: essayDetail.content || '<p class="text-gray-500">(Trống)</p>' }}
            />
            <div className="p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#0f4c81]" />
                Nhận xét
              </h3>
              <ul className="space-y-3 mb-4">
                {essayDetail.comments.map((c) => (
                  <li key={c.id} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <p className="text-sm text-gray-900">{c.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {c.author?.full_name || c.author?.email} · {new Date(c.created_at).toLocaleString('vi-VN')}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Viết nhận xét cho học viên..."
                  className="flex-1 min-h-[80px] rounded-lg border border-gray-300 bg-white text-gray-900 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-[#0f4c81]/30"
                  rows={3}
                />
                <button
                  type="button"
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || submittingComment}
                  className="self-end inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-[#0f4c81]/50 disabled:opacity-50"
                >
                  {submittingComment ? <Loader2 className="h-4 w-4 animate-spin text-[#0f4c81]" /> : <Send className="h-4 w-4 text-[#0f4c81]" />}
                  Gửi
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
