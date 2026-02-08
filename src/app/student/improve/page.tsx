'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { StudentPageContainer } from '@/components/student';
import { FileText, PenLine, Upload, Sparkles, Bold, Italic, List, ListOrdered, AlignLeft, Loader2, ExternalLink, BarChart3, Wand2, UserCircle, MessageSquare, Save } from 'lucide-react';
import { toast } from 'sonner';
import { sanitizeText } from '@/lib/utils/validation';

type TabId = 'profile' | 'cv' | 'essay';

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

interface EssayComment {
  id: string;
  content: string;
  author: { id: string; full_name: string | null; email: string };
  created_at: string;
}

export default function ImprovePage() {
  const { data: session } = useSession();
  const studentId = session?.user?.id as string | undefined;

  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [essayContent, setEssayContent] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  const [cvList, setCvList] = useState<CvDoc[]>([]);
  const [cvLoading, setCvLoading] = useState(true);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvTaskId, setCvTaskId] = useState<string | null>(null);

  // Profile tab (Feature 4)
  const [profileDataLoading, setProfileDataLoading] = useState(false);
  const [profileAnalysis, setProfileAnalysis] = useState<Record<string, unknown> | null>(null);
  const [profileEnhance, setProfileEnhance] = useState<Record<string, unknown> | null>(null);
  const [profileAnalysisLoading, setProfileAnalysisLoading] = useState(false);
  const [profileEnhanceLoading, setProfileEnhanceLoading] = useState(false);

  // Essay tab: DB
  const [essayList, setEssayList] = useState<{ id: string; title: string | null; content: string; updated_at: string }[]>([]);
  const [currentEssayId, setCurrentEssayId] = useState<string | null>(null);
  const [essayLoading, setEssayLoading] = useState(false);
  const [essaySaving, setEssaySaving] = useState(false);
  const [essayComments, setEssayComments] = useState<EssayComment[]>([]);

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <UserCircle className="h-4 w-4" /> },
    { id: 'cv', label: 'CV', icon: <FileText className="h-4 w-4" /> },
    { id: 'essay', label: 'Essay', icon: <PenLine className="h-4 w-4" /> },
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

  // Load essay list when opening Essay tab
  useEffect(() => {
    if (!studentId || activeTab !== 'essay') return;
    const loadEssays = async () => {
      setEssayLoading(true);
      try {
        const res = await fetch('/api/student/essays');
        if (res.ok) {
          const json = await res.json();
          const list = json.data || [];
          setEssayList(list);
          if (list.length > 0 && !currentEssayId) setCurrentEssayId(list[0].id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setEssayLoading(false);
      }
    };
    loadEssays();
  }, [studentId, activeTab]);

  // Load essay detail + comments when currentEssayId changes
  useEffect(() => {
    if (!currentEssayId) {
      setEssayComments([]);
      return;
    }
    const load = async () => {
      try {
        const res = await fetch(`/api/student/essays/${currentEssayId}`);
        if (res.ok) {
          const json = await res.json();
          const essay = json.data;
          setEssayContent(essay.content || '');
          if (editorRef.current) editorRef.current.innerHTML = essay.content || '';
          setEssayComments((essay.comments || []).map((c: { id: string; content: string; author: unknown; created_at: string }) => ({
            id: c.id,
            content: c.content,
            author: (c as { author: { id: string; full_name: string | null; email: string } }).author,
            created_at: c.created_at,
          })));
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [currentEssayId]);

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

  const handleProfileAnalysis = async () => {
    setProfileDataLoading(true);
    setProfileAnalysisLoading(true);
    try {
      const dataRes = await fetch('/api/student/improve/profile-data');
      if (!dataRes.ok) throw new Error('Không lấy được dữ liệu profile');
      const { feature1_output, feature2_output, feature3_output } = await dataRes.json();
      const analysisRes = await fetch('/api/module4/profile-improver/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature1_output, feature2_output, feature3_output, use_nlp: true }),
      });
      if (!analysisRes.ok) throw new Error((await analysisRes.json()).error || 'Phân tích thất bại');
      const result = await analysisRes.json();
      setProfileAnalysis(result);
      toast.success('Phân tích profile thành công');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi phân tích profile');
    } finally {
      setProfileDataLoading(false);
      setProfileAnalysisLoading(false);
    }
  };

  const handleProfileEnhance = async () => {
    setProfileDataLoading(true);
    setProfileEnhanceLoading(true);
    try {
      const dataRes = await fetch('/api/student/improve/profile-data');
      if (!dataRes.ok) throw new Error('Không lấy được dữ liệu profile');
      const { feature1_output, feature2_output, feature3_output } = await dataRes.json();
      const enhanceRes = await fetch('/api/module4/profile-improver/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature1_output, feature2_output, feature3_output, use_nlp: true }),
      });
      if (!enhanceRes.ok) throw new Error((await enhanceRes.json()).error || 'Enhance thất bại');
      const result = await enhanceRes.json();
      setProfileEnhance(result);
      toast.success('Đề xuất cải thiện đã sẵn sàng');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi đề xuất cải thiện');
    } finally {
      setProfileDataLoading(false);
      setProfileEnhanceLoading(false);
    }
  };

  const handleSaveEssay = async () => {
    const content = editorRef.current?.innerHTML ?? '';
    const plain = getEssayPlainText();
    if (!plain.trim()) {
      toast.error('Chưa có nội dung để lưu');
      return;
    }
    setEssaySaving(true);
    try {
      if (currentEssayId) {
        const res = await fetch(`/api/student/essays/${currentEssayId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Lưu thất bại');
        toast.success('Đã cập nhật bài luận');
      } else {
        const res = await fetch('/api/student/essays', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Tạo bài luận thất bại');
        const json = await res.json();
        const newEssay = json.data;
        setCurrentEssayId(newEssay.id);
        setEssayList((prev) => [{ id: newEssay.id, title: newEssay.title, content: newEssay.content, updated_at: newEssay.updated_at }, ...prev]);
        toast.success('Đã tạo bài luận mới');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi lưu');
    } finally {
      setEssaySaving(false);
    }
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
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-6">
                  <h3 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2">
                    <UserCircle className="h-4 w-4 text-primary" />
                    Đánh giá profile (Feature 4)
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Dựa trên dữ liệu Module 1, 2, 3 (phân tích hồ sơ, bài test, gợi ý trường) để phân tích 4 trụ và đề xuất hành động cải thiện.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleProfileAnalysis}
                      disabled={profileDataLoading || profileAnalysisLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border/60 bg-card text-foreground text-sm font-medium hover:bg-muted/50 hover:border-primary/40 transition-colors disabled:opacity-50"
                    >
                      {profileAnalysisLoading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <BarChart3 className="h-4 w-4 text-primary" />}
                      Phân tích profile
                    </button>
                    <button
                      type="button"
                      onClick={handleProfileEnhance}
                      disabled={profileDataLoading || profileEnhanceLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border/60 bg-card text-foreground text-sm font-medium hover:bg-muted/50 hover:border-primary/40 transition-colors disabled:opacity-50"
                    >
                      {profileEnhanceLoading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Wand2 className="h-4 w-4 text-primary" />}
                      Đề xuất cải thiện
                    </button>
                  </div>
                </div>
                {profileAnalysis && (
                  <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-6 space-y-4">
                    <h3 className="text-base font-semibold text-foreground">Kết quả phân tích</h3>
                    {profileAnalysis.pillar_scores && typeof profileAnalysis.pillar_scores === 'object' && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {Object.entries(profileAnalysis.pillar_scores as Record<string, number>).map(([key, score]) => (
                          <div key={key} className="rounded-xl border border-border/60 bg-muted/20 p-3">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">{key}</p>
                            <p className="text-lg font-semibold text-primary">{Number(score)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {profileAnalysis.overall && typeof profileAnalysis.overall === 'object' && (
                      <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                        <p className="text-sm text-muted-foreground mb-1">Tổng quan</p>
                        <p className="text-sm text-foreground">{(profileAnalysis.overall as { summary?: string }).summary}</p>
                        <p className="text-sm font-medium text-primary mt-2">Điểm: {(profileAnalysis.overall as { overall_score?: number }).overall_score}</p>
                      </div>
                    )}
                  </div>
                )}
                {profileEnhance && (
                  <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-6 space-y-4">
                    <h3 className="text-base font-semibold text-foreground">Đề xuất cải thiện</h3>
                    {profileEnhance.recommendations && Array.isArray(profileEnhance.recommendations) && (
                      <ul className="space-y-3">
                        {(profileEnhance.recommendations as { priority?: string; specific_rec_name?: string; reason?: string }[]).slice(0, 5).map((r, i) => (
                          <li key={i} className="rounded-xl border border-border/60 bg-muted/20 p-3">
                            <span className="text-xs font-medium text-primary">{r.priority}</span>
                            <p className="text-sm font-medium text-foreground mt-1">{r.specific_rec_name}</p>
                            {r.reason && <p className="text-xs text-muted-foreground mt-1">{r.reason}</p>}
                          </li>
                        ))}
                      </ul>
                    )}
                    {profileEnhance.enhanced_summary && (
                      <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                        <p className="text-sm text-foreground">{String(profileEnhance.enhanced_summary)}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

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
              <div className="space-y-6">
                <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
                  {essayLoading ? (
                    <div className="flex items-center justify-center py-12 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin mr-2" />
                      Đang tải...
                    </div>
                  ) : (
                    <>
                      {essayList.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 p-3 border-b border-border/60 bg-muted/30">
                          <span className="text-sm text-muted-foreground">Bài luận:</span>
                          <select
                            value={currentEssayId || ''}
                            onChange={(e) => setCurrentEssayId(e.target.value || null)}
                            className="rounded-lg border border-border/60 bg-card text-foreground text-sm px-3 py-1.5"
                          >
                            {essayList.map((e) => (
                              <option key={e.id} value={e.id}>
                                {e.title || `Luận ${new Date(e.updated_at).toLocaleDateString('vi-VN')}`}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={handleSaveEssay}
                            disabled={essaySaving}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 bg-card text-foreground text-sm font-medium hover:bg-muted/50 hover:border-primary/40 disabled:opacity-50"
                          >
                            {essaySaving ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Save className="h-4 w-4 text-primary" />}
                            Lưu
                          </button>
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border/60 bg-muted/20">
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
                        {essayList.length === 0 && (
                          <button
                            type="button"
                            onClick={handleSaveEssay}
                            disabled={essaySaving}
                            className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 bg-card text-foreground text-sm font-medium hover:bg-muted/50 hover:border-primary/40 disabled:opacity-50"
                          >
                            {essaySaving ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Save className="h-4 w-4 text-primary" />}
                            Lưu bài luận
                          </button>
                        )}
                      </div>
                      <div className="relative min-h-[320px]">
                        {!essayContent.trim() && !currentEssayId && (
                          <div
                            className="absolute inset-0 p-6 pt-8 pointer-events-none text-muted-foreground text-base leading-relaxed"
                            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                          >
                            Bắt đầu viết bài luận của bạn... (bấm Lưu bài luận để tạo mới)
                          </div>
                        )}
                        <div
                          ref={editorRef}
                          contentEditable
                          suppressContentEditableWarning
                          className="relative w-full min-h-[320px] p-6 pt-8 border border-border/60 rounded-b-xl bg-background text-foreground text-base leading-relaxed overflow-y-auto focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-inset"
                          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                          onInput={(e) => setEssayContent((e.target as HTMLDivElement).innerHTML)}
                        />
                      </div>
                      <ActionButtonsBottom source="essay" />
                    </>
                  )}
                </div>
                {currentEssayId && essayComments.length > 0 && (
                  <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-6">
                    <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      Nhận xét từ mentor
                    </h3>
                    <ul className="space-y-3">
                      {essayComments.map((c) => (
                        <li key={c.id} className="rounded-xl border border-border/60 bg-muted/20 p-3">
                          <p className="text-sm text-foreground">{c.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {c.author?.full_name || c.author?.email} · {new Date(c.created_at).toLocaleString('vi-VN')}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentPageContainer>
  );
}
