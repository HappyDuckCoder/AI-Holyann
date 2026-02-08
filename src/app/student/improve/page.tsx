'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { StudentPageContainer } from '@/components/student';
import { FileText, PenLine, Upload, Sparkles, Bold, Italic, List, ListOrdered, AlignLeft, Loader2, ExternalLink, BarChart3, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { sanitizeText } from '@/lib/utils/validation';

type TabId = 'cv' | 'essay';

/** Theo server-ai feature4: Essay giới hạn từ (mặc định 650) */
const ESSAY_LIMIT_WORDS = 650;
const ESSAY_MIN_WORDS = 10;

interface CvDoc {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
}

export default function ImprovePage() {
  const { data: session } = useSession();
  const studentId = session?.user?.id as string | undefined;

  const [activeTab, setActiveTab] = useState<TabId>('cv');
  const [essayContent, setEssayContent] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  const [cvList, setCvList] = useState<CvDoc[]>([]);
  const [cvLoading, setCvLoading] = useState(true);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvTaskId, setCvTaskId] = useState<string | null>(null);

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'cv', label: 'CV', icon: <FileText className="h-4 w-4" /> },
    { id: 'essay', label: 'Luận', icon: <PenLine className="h-4 w-4" /> },
  ];

  useEffect(() => {
    if (!studentId) return;
    const load = async () => {
      setCvLoading(true);
      try {
        const [docsRes, checklistRes] = await Promise.all([
          fetch(`/api/students/${studentId}/upload-cv`),
          fetch('/api/student/checklist'),
        ]);
        if (docsRes.ok) {
          const docs: CvDoc[] = await docsRes.json();
          setCvList(docs.filter((d) => d.type === 'transcript' || d.name.startsWith('cv_')));
        }
        if (checklistRes.ok) {
          const data = await checklistRes.json();
          const tasks = data.data?.tasks || [];
          const cvTask = tasks.find(
            (t: { title: string; link_to?: string }) =>
              t.title && (t.title.toLowerCase().includes('cv') || t.title.toLowerCase().includes('upload')) && !t.link_to
          );
          setCvTaskId(cvTask?.id ?? null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setCvLoading(false);
      }
    };
    load();
  }, [studentId]);

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !studentId) return;

    setCvUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', 'cv');

      const uploadRes = await fetch(`/api/students/${studentId}/upload-cv`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || 'Upload thất bại');
      }

      const result = await uploadRes.json();
      const fileUrl = result.fileUrl;
      if (!fileUrl) throw new Error('Không nhận được đường dẫn file');

      const newDoc: CvDoc = {
        id: fileUrl.split('/').pop() || file.name,
        name: file.name,
        type: 'transcript',
        uploadDate: new Date().toLocaleDateString('vi-VN'),
        size: file.size >= 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${file.size} B`,
      };
      setCvList((prev) => [newDoc, ...prev]);

      if (cvTaskId) {
        const submitRes = await fetch('/api/student/checklist/submit-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: cvTaskId, fileUrl, studentId }),
        });
        if (submitRes.ok) {
          toast.success('Đã tải CV lên và cập nhật Checklist.');
        } else {
          toast.success('Đã tải CV lên.');
        }
      } else {
        toast.success('Đã tải CV lên.');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi tải lên.');
    } finally {
      setCvUploading(false);
      e.target.value = '';
    }
  };

  const execCommand = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  const getEssayPlainText = (): string => {
    if (!editorRef.current) return '';
    const raw = editorRef.current.innerText || editorRef.current.textContent || '';
    return sanitizeText(raw);
  };

  const getEssayWordCount = (): number => {
    const text = getEssayPlainText();
    return text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  };

  const validateCV = (): boolean => {
    if (!cvList.length) {
      toast.error('Chưa có CV', {
        description: 'Vui lòng tải lên ít nhất một file CV trước khi phân tích hoặc nâng cấp.',
      });
      return false;
    }
    return true;
  };

  const validateEssay = (): boolean => {
    const text = getEssayPlainText();
    const wordCount = getEssayWordCount();
    if (!text || wordCount < ESSAY_MIN_WORDS) {
      toast.error('Nội dung bài luận quá ngắn', {
        description: `Vui lòng nhập ít nhất ${ESSAY_MIN_WORDS} từ trước khi phân tích hoặc nâng cấp.`,
      });
      return false;
    }
    if (wordCount > ESSAY_LIMIT_WORDS) {
      toast.warning(`Bài luận vượt giới hạn ${ESSAY_LIMIT_WORDS} từ`, {
        description: `Hiện tại: ${wordCount} từ. Server AI khuyến nghị tối đa ${ESSAY_LIMIT_WORDS} từ.`,
      });
    }
    return true;
  };

  const handleAnalysis = (source: 'cv' | 'essay') => {
    if (source === 'cv' && !validateCV()) return;
    if (source === 'essay' && !validateEssay()) return;
    toast.info(source === 'cv' ? 'Phân tích CV' : 'Phân tích bài luận', {
      description: 'Tính năng đang được phát triển.',
    });
  };

  const handleEnhance = (source: 'cv' | 'essay') => {
    if (source === 'cv' && !validateCV()) return;
    if (source === 'essay' && !validateEssay()) return;
    toast.info(source === 'cv' ? 'Nâng cấp CV' : 'Nâng cấp bài luận', {
      description: 'Tính năng đang được phát triển.',
    });
  };

  const ActionButtonsBottom = ({ source }: { source: 'cv' | 'essay' }) => (
    <div className="flex flex-wrap items-center gap-3 pt-4 mt-4 border-t border-border/60">
      <span className="text-sm text-muted-foreground mr-2">Hành động:</span>
      <button
        type="button"
        onClick={() => handleAnalysis(source)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border/60 bg-card text-foreground text-sm font-medium hover:bg-muted/50 hover:border-primary/40 transition-colors"
      >
        <BarChart3 className="h-4 w-4 text-primary" />
        Analysis
      </button>
      <button
        type="button"
        onClick={() => handleEnhance(source)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border/60 bg-card text-foreground text-sm font-medium hover:bg-muted/50 hover:border-primary/40 transition-colors"
      >
        <Wand2 className="h-4 w-4 text-primary" />
        Enhance
      </button>
    </div>
  );

  return (
    <StudentPageContainer>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" />
            Improve
          </h1>
          <p className="text-muted-foreground mt-1">Nâng cao CV và bài luận của bạn.</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <div className="flex border-b border-border/60 bg-muted/30">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary bg-card'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 min-h-[480px]">
            {activeTab === 'cv' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-border/60 bg-muted/20 p-6">
                  <h3 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Upload className="h-4 w-4 text-primary" />
                    CV của bạn
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Cùng một bộ file CV với trang Checklist. Tải lên tại đây sẽ tự động cập nhật Checklist.
                  </p>

                  {cvLoading ? (
                    <div className="flex items-center justify-center py-12 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin mr-2" />
                      Đang tải...
                    </div>
                  ) : cvList.length > 0 ? (
                    <div className="space-y-3 mb-4">
                      {cvList.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText className="h-5 w-5 text-primary shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.size} · {doc.uploadDate}
                              </p>
                            </div>
                          </div>
                          <a
                            href={`/uploads/cvs/${doc.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                          >
                            Mở file <ExternalLink size={12} />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 hover:bg-muted/30 transition-colors">
                    <input
                      id="improve-cv-upload"
                      type="file"
                      accept=".pdf,.doc,.docx,image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleCVUpload}
                      disabled={cvUploading}
                    />
                    <label htmlFor="improve-cv-upload" className="cursor-pointer block">
                      {cvUploading ? (
                        <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-3" />
                      ) : (
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      )}
                      <p className="text-sm font-medium text-foreground mb-1">
                        {cvUploading ? 'Đang tải lên...' : cvList.length > 0 ? 'Tải lên thêm CV' : 'Chọn file CV (PDF, DOC, DOCX hoặc ảnh)'}
                      </p>
                      <p className="text-xs text-muted-foreground">Tối đa 5MB. Sẽ đồng bộ với Checklist.</p>
                    </label>
                  </div>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Gợi ý cải thiện CV</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      Sử dụng động từ mạnh (Led, Developed, Achieved) cho từng mục.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      Thêm số liệu cụ thể (%, số người, quy mô dự án).
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      Ưu tiên thông tin liên quan đến ngành và trường mục tiêu.
                    </li>
                  </ul>
                </div>
                <ActionButtonsBottom source="cv" />
              </div>
            )}

            {activeTab === 'essay' && (
              <div className="flex flex-col h-[520px]">
                <div className="flex flex-wrap items-center gap-1 p-2 border border-border/60 rounded-t-xl bg-muted/30 border-b-0">
                  <button type="button" onClick={() => execCommand('bold')} className="p-2 rounded hover:bg-muted text-foreground" title="Đậm">
                    <Bold className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => execCommand('italic')} className="p-2 rounded hover:bg-muted text-foreground" title="Nghiêng">
                    <Italic className="h-4 w-4" />
                  </button>
                  <span className="w-px h-5 bg-border mx-1" />
                  <button type="button" onClick={() => execCommand('insertUnorderedList')} className="p-2 rounded hover:bg-muted text-foreground" title="Danh sách">
                    <List className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => execCommand('insertOrderedList')} className="p-2 rounded hover:bg-muted text-foreground" title="Đánh số">
                    <ListOrdered className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => execCommand('justifyLeft')} className="p-2 rounded hover:bg-muted text-foreground" title="Căn trái">
                    <AlignLeft className="h-4 w-4" />
                  </button>
                </div>
                <div className="relative flex-1 min-h-[400px]">
                  {!essayContent.trim() && (
                    <div
                      className="absolute inset-0 p-6 pt-8 pointer-events-none text-muted-foreground text-base leading-relaxed"
                      style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                    >
                      Bắt đầu viết bài luận của bạn...
                    </div>
                  )}
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    className="relative w-full h-full min-h-[400px] p-6 pt-8 border border-border/60 rounded-b-xl bg-background text-foreground text-base leading-relaxed overflow-y-auto focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-inset"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                    onInput={(e) => setEssayContent((e.target as HTMLDivElement).innerHTML)}
                  />
                </div>
                <ActionButtonsBottom source="essay" />
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentPageContainer>
  );
}
