'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { StudentPageContainer } from '@/components/student';
import { FileText, PenLine, Upload, Sparkles, Bold, Italic, List, ListOrdered, AlignLeft, Loader2, ExternalLink, BarChart3, Wand2, UserCircle, MessageSquare, Save, Star, Target, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { sanitizeText } from '@/lib/utils/validation';

type TabId = 'profile' | 'cv' | 'essay';

/** Theo server-ai feature4: Essay giới hạn từ (mặc định 650) */
const ESSAY_LIMIT_WORDS = 650;
const ESSAY_MIN_WORDS = 10;

/** Trả về chuỗi an toàn để hiển thị (tránh render object làm React child) */
function safeText(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (typeof v === 'object' && v !== null) {
    const o = v as Record<string, unknown>;
    if (typeof o.description === 'string') return o.description;
    if (typeof o.text === 'string') return o.text;
    if (typeof o.summary === 'string') return o.summary;
    if (typeof o.feedback === 'string') return o.feedback;
    if (typeof o.specific_rec_name === 'string') return o.specific_rec_name;
    if (typeof o.reason === 'string') return o.reason;
    if (typeof o.priority === 'string') return o.priority;
    return JSON.stringify(v);
  }
  return String(v);
}

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
  const [profileData, setProfileData] = useState<{
    feature1_output?: { summary?: { total_pillar_scores?: Record<string, number>; main_spike?: string; sharpness?: string } };
    feature2_output?: { assessment?: { mbti?: { personality_type?: string }; grit?: { score?: number; level?: string }; riasec?: { code?: string } } };
    feature3_output?: {
      summary?: Record<string, unknown>;
      universities?: {
        REACH?: { universities?: { id?: string; name: string; country?: string; ranking?: number }[] };
        MATCH?: { universities?: { id?: string; name: string; country?: string; ranking?: number }[] };
        SAFETY?: { universities?: { id?: string; name: string; country?: string; ranking?: number }[] };
      };
    };
  } | null>(null);
  const [profileDataLoading, setProfileDataLoading] = useState(false);
  const [profileAnalysis, setProfileAnalysis] = useState<Record<string, unknown> | null>(null);
  const [profileEnhance, setProfileEnhance] = useState<Record<string, unknown> | null>(null);
  const [profileAnalysisLoading, setProfileAnalysisLoading] = useState(false);
  const [profileEnhanceLoading, setProfileEnhanceLoading] = useState(false);
  const [analysisRating, setAnalysisRating] = useState<number | null>(null);
  const [enhanceRating, setEnhanceRating] = useState<number | null>(null);
  const [resultsLoading, setResultsLoading] = useState(false);

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

  // Load profile data + saved improve results when opening Profile tab
  useEffect(() => {
    if (!studentId || activeTab !== 'profile') return;
    const load = async () => {
      setProfileDataLoading(true);
      setResultsLoading(true);
      try {
        const [dataRes, resultsRes] = await Promise.all([
          fetch('/api/student/improve/profile-data'),
          fetch('/api/student/improve/results'),
        ]);
        if (dataRes.ok) {
          const json = await dataRes.json();
          setProfileData({
            feature1_output: json.feature1_output,
            feature2_output: json.feature2_output,
            feature3_output: json.feature3_output,
          });
        } else {
          setProfileData(null);
        }
        if (resultsRes.ok) {
          const results = await resultsRes.json();
          setProfileAnalysis((results.analysis && typeof results.analysis === 'object') ? results.analysis : null);
          setProfileEnhance((results.enhance && typeof results.enhance === 'object') ? results.enhance : null);
          setAnalysisRating(results.analysis_rating ?? null);
          setEnhanceRating(results.enhance_rating ?? null);
        }
      } catch (e) {
        console.error(e);
        setProfileData(null);
      } finally {
        setProfileDataLoading(false);
        setResultsLoading(false);
      }
    };
    load();
  }, [studentId, activeTab]);

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
    if (cvList.length > 0) {
      toast.error('Bạn đã tải CV lên rồi. Không thể tải thêm.');
      e.target.value = '';
      return;
    }

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

  const getProfilePayload = async () => {
    if (profileData?.feature1_output && profileData?.feature2_output && profileData?.feature3_output) {
      return {
        feature1_output: profileData.feature1_output,
        feature2_output: profileData.feature2_output,
        feature3_output: profileData.feature3_output,
      };
    }
    const dataRes = await fetch('/api/student/improve/profile-data');
    if (!dataRes.ok) throw new Error('Không lấy được dữ liệu profile');
    const json = await dataRes.json();
    return {
      feature1_output: json.feature1_output,
      feature2_output: json.feature2_output,
      feature3_output: json.feature3_output,
    };
  };

  const POLL_INTERVAL_MS = 4000;
  const POLL_MAX_WAIT_MS = 300000; // 5 phút tối đa poll

  const pollJobResult = async (jobId: string, kind: 'analysis' | 'enhance'): Promise<Record<string, unknown>> => {
    const start = Date.now();
    while (Date.now() - start < POLL_MAX_WAIT_MS) {
      const res = await fetch(`/api/module4/profile-improver/result/${encodeURIComponent(jobId)}`);
      const data = (await res.json()) as { status: string; result?: Record<string, unknown>; error?: string };
      if (data.status === 'done' && data.result) return data.result;
      if (data.status === 'error') throw new Error(data.error || 'Xử lý thất bại');
      if (data.status === 'missing') throw new Error('Không tìm thấy kết quả. Vui lòng thử lại.');
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
    throw new Error('Hết thời gian chờ. Vui lòng thử lại.');
  };

  const handleProfileAnalysis = async () => {
    setProfileAnalysisLoading(true);
    toast.info('Đang bắt đầu phân tích... Kết quả sẽ hiển thị trong 1–2 phút.', { duration: 5000 });
    try {
      const payload = await getProfilePayload();
      const analysisRes = await fetch('/api/module4/profile-improver/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, use_nlp: true, async: true }),
      });
      if (!analysisRes.ok) {
        const errBody = await analysisRes.json().catch(() => ({}));
        throw new Error((errBody as { error?: string }).error || 'Phân tích thất bại');
      }
      const data = (await analysisRes.json()) as { job_id?: string } & Record<string, unknown>;
      let result: Record<string, unknown>;
      if (analysisRes.status === 202 && data.job_id) {
        result = await pollJobResult(data.job_id, 'analysis');
      } else {
        result = data;
      }
      setProfileAnalysis(result);
      try {
        await fetch('/api/student/improve/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analysis: result }),
        });
      } catch (_) {
        toast.warning('Đã phân tích nhưng chưa lưu được. Thử tải lại trang.');
      }
      toast.success('Phân tích profile thành công');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi phân tích profile');
    } finally {
      setProfileAnalysisLoading(false);
    }
  };

  const saveRating = async (kind: 'analysis' | 'enhance', value: number) => {
    try {
      const res = await fetch('/api/student/improve/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kind === 'analysis' ? { analysis_rating: value } : { enhance_rating: value }),
      });
      if (res.ok) {
        if (kind === 'analysis') setAnalysisRating(value);
        else setEnhanceRating(value);
        toast.success('Đã lưu đánh giá');
      }
    } catch {
      toast.error('Không lưu được đánh giá');
    }
  };

  const handleProfileEnhance = async () => {
    setProfileEnhanceLoading(true);
    toast.info('Đang bắt đầu tạo đề xuất... Kết quả sẽ hiển thị trong 1–2 phút.', { duration: 5000 });
    try {
      const payload = await getProfilePayload();
      const enhanceRes = await fetch('/api/module4/profile-improver/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, use_nlp: true, async: true }),
      });
      if (!enhanceRes.ok) {
        const errBody = await enhanceRes.json().catch(() => ({}));
        throw new Error((errBody as { error?: string }).error || 'Enhance thất bại');
      }
      const data = (await enhanceRes.json()) as { job_id?: string } & Record<string, unknown>;
      let result: Record<string, unknown>;
      if (enhanceRes.status === 202 && data.job_id) {
        result = await pollJobResult(data.job_id, 'enhance');
      } else {
        result = data;
      }
      setProfileEnhance(result);
      try {
        await fetch('/api/student/improve/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enhance: result }),
        });
      } catch (_) {
        toast.warning('Đã tạo đề xuất nhưng chưa lưu được. Thử tải lại trang.');
      }
      toast.success('Đề xuất cải thiện đã sẵn sàng');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi đề xuất cải thiện');
    } finally {
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
    <div className="flex flex-wrap items-center gap-4 pt-6 mt-6 border-t border-border/60">
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" />
            Improve
          </h1>
          <p className="text-muted-foreground mt-2">Nâng cao CV và bài luận của bạn.</p>
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

          <div className="p-8 min-h-[520px]">
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                    <UserCircle className="h-5 w-5 text-primary" />
                    Profile của bạn
                  </h3>
                  <p className="text-sm text-muted-foreground mb-8">
                      Dữ liệu từ Module 1, 2, 3 (phân tích hồ sơ, bài test, gợi ý trường). Hiển thị bên dưới trước khi Phân tích hoặc Đề xuất cải thiện.
                    </p>

                    {profileDataLoading ? (
                      <div className="flex items-center justify-center py-16 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin mr-2" />
                        Đang tải thông tin profile...
                      </div>
                    ) : profileData ? (
                      <div className="space-y-8">
                        {profileData.feature1_output?.summary?.total_pillar_scores && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-4">4 trụ điểm (từ phân tích hồ sơ)</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              {[
                                { key: 'aca', label: 'Học thuật' },
                                { key: 'lan', label: 'Ngôn ngữ' },
                                { key: 'hdnk', label: 'Hoạt động' },
                                { key: 'skill', label: 'Kỹ năng' },
                              ].map(({ key, label }) => {
                                const score = profileData.feature1_output?.summary?.total_pillar_scores?.[key];
                                return (
                                  <div key={key} className="rounded-2xl border border-border/60 bg-muted/20 p-5">
                                    <p className="text-sm text-muted-foreground mb-1">{label}</p>
                                    <p className="text-xl font-semibold text-primary">{score != null ? Number(score) : '—'}</p>
                                  </div>
                                );
                              })}
                            </div>
                            {(profileData.feature1_output.summary.main_spike || profileData.feature1_output.summary.sharpness) && (
                              <p className="text-sm text-muted-foreground mt-4">
                                Spike: {profileData.feature1_output.summary.main_spike ?? '—'} · Mức: {profileData.feature1_output.summary.sharpness ?? '—'}
                              </p>
                            )}
                          </div>
                        )}
                        {profileData.feature2_output?.assessment && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-4">Bài test (MBTI, Grit, RIASEC)</p>
                            <div className="flex flex-wrap gap-4">
                              {profileData.feature2_output.assessment.mbti?.personality_type && (
                                <div className="rounded-2xl border border-border/60 bg-muted/20 px-5 py-3">
                                  <span className="text-sm text-muted-foreground">MBTI </span>
                                  <span className="text-base font-medium text-foreground">{profileData.feature2_output.assessment.mbti.personality_type}</span>
                                </div>
                              )}
                              {(profileData.feature2_output.assessment.grit?.score != null || profileData.feature2_output.assessment.grit?.level) && (
                                <div className="rounded-2xl border border-border/60 bg-muted/20 px-5 py-3">
                                  <span className="text-sm text-muted-foreground">Grit </span>
                                  <span className="text-base font-medium text-foreground">
                                    {profileData.feature2_output.assessment.grit?.score ?? '—'} ({profileData.feature2_output.assessment.grit?.level ?? ''})
                                  </span>
                                </div>
                              )}
                              {profileData.feature2_output.assessment.riasec?.code && (
                                <div className="rounded-2xl border border-border/60 bg-muted/20 px-5 py-3">
                                  <span className="text-sm text-muted-foreground">RIASEC </span>
                                  <span className="text-base font-medium text-foreground">{profileData.feature2_output.assessment.riasec.code}</span>
                                </div>
                              )}
                              {!profileData.feature2_output.assessment.mbti?.personality_type &&
                                !profileData.feature2_output.assessment.grit?.score &&
                                !profileData.feature2_output.assessment.riasec?.code && (
                                  <p className="text-sm text-muted-foreground">Chưa có kết quả test (làm bài test trong trang đánh giá).</p>
                                )}
                            </div>
                          </div>
                        )}
                        {profileData.feature3_output && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-4">Gợi ý trường (Module 3)</p>
                            {profileData.feature3_output.universities && typeof profileData.feature3_output.universities === 'object' && Object.keys(profileData.feature3_output.universities as object).length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {[
                                  { key: 'REACH' as const, label: 'Reach', Icon: Star },
                                  { key: 'MATCH' as const, label: 'Match', Icon: Target },
                                  { key: 'SAFETY' as const, label: 'Safety', Icon: Shield },
                                ].map(({ key, label, Icon }) => {
                                  const block = profileData.feature3_output?.universities?.[key];
                                  const list = block?.universities ?? [];
                                  return (
                                    <div key={key} className="rounded-2xl border border-border/60 bg-muted/20 overflow-hidden border-l-4 border-l-primary">
                                      <div className="flex items-center gap-3 px-5 py-4 bg-card/80 border-b border-border/60">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                          <Icon className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                          <span className="text-base font-semibold text-foreground">{label}</span>
                                          <p className="text-xs text-muted-foreground">{list.length} trường</p>
                                        </div>
                                      </div>
                                      <ul className="p-5 space-y-3 max-h-44 overflow-y-auto">
                                        {list.length === 0 ? (
                                          <li className="text-sm text-muted-foreground py-2">—</li>
                                        ) : (
                                          list.map((uni, i) => (
                                            <li key={uni.id ?? i} className="text-sm text-foreground" title={[uni.name, uni.country].filter(Boolean).join(' · ')}>
                                              <span className="font-medium">{uni.name}</span>
                                              {(uni.country || uni.ranking != null) && (
                                                <span className="text-muted-foreground block text-xs mt-0.5">
                                                  {[uni.country, uni.ranking != null ? `#${uni.ranking}` : null].filter(Boolean).join(' · ')}
                                                </span>
                                              )}
                                            </li>
                                          ))
                                        )}
                                      </ul>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">Chưa có gợi ý trường. Hoàn thành gợi ý trường để dữ liệu đầy đủ hơn.</p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-border/60 bg-muted/20 p-6">
                        <p className="text-sm text-muted-foreground">Chưa có dữ liệu. Hoàn thành phân tích hồ sơ và bài test (MBTI, Grit, RIASEC) để xem thông tin profile tại đây.</p>
                      </div>
                    )}

                    {resultsLoading && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang tải kết quả đã lưu...
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 pt-8 mt-8 border-t border-border/60">
                      <span className="text-sm text-muted-foreground">Hành động:</span>
                      <button
                        type="button"
                        onClick={handleProfileAnalysis}
                        disabled={profileAnalysisLoading || profileEnhanceLoading}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/60 bg-card text-foreground text-sm font-medium hover:bg-muted/50 hover:border-primary/40 transition-colors disabled:opacity-50"
                      >
                        {profileAnalysisLoading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <BarChart3 className="h-4 w-4 text-primary" />}
                        {profileAnalysis ? 'Phân tích lại' : 'Phân tích profile'}
                      </button>
                      <button
                        type="button"
                        onClick={handleProfileEnhance}
                        disabled={profileEnhanceLoading || profileAnalysisLoading}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/60 bg-card text-foreground text-sm font-medium hover:bg-muted/50 hover:border-primary/40 transition-colors disabled:opacity-50"
                      >
                        {profileEnhanceLoading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Wand2 className="h-4 w-4 text-primary" />}
                        {profileEnhance ? 'Cải thiện lại' : 'Đề xuất cải thiện'}
                      </button>
                    </div>
                    {(profileAnalysisLoading || profileEnhanceLoading) && (
                      <p className="text-sm text-muted-foreground mt-4 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                        {profileAnalysisLoading ? 'Đang phân tích profile...' : 'Đang tạo đề xuất cải thiện...'} Có thể mất 1–2 phút, vui lòng không đóng trang.
                      </p>
                    )}
                </div>

                {profileAnalysis && typeof profileAnalysis === 'object' && (
                  <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-8 space-y-6">
                    <h3 className="text-base font-semibold text-foreground">Kết quả phân tích</h3>
                    {(() => {
                      const scores = (profileAnalysis.pillar_scores && typeof profileAnalysis.pillar_scores === 'object'
                        ? profileAnalysis.pillar_scores
                        : (profileAnalysis.feature1_output as Record<string, unknown>)?.summary && typeof (profileAnalysis.feature1_output as Record<string, unknown>).summary === 'object'
                          ? ((profileAnalysis.feature1_output as Record<string, unknown>).summary as Record<string, unknown>).total_pillar_scores
                          : null) as Record<string, number> | null;
                      const pillarLabels: Record<string, string> = { aca: 'Học thuật', lan: 'Ngôn ngữ', hdnk: 'Hoạt động', skill: 'Kỹ năng' };
                      if (scores && Object.keys(scores).length > 0) {
                        return (
                          <>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-2">Điểm 4 trụ (Pillar Scores)</p>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {['aca', 'lan', 'hdnk', 'skill'].map((key) => (
                                  <div key={key} className="rounded-2xl border border-border/60 bg-muted/20 p-5">
                                    <p className="text-sm text-muted-foreground">{pillarLabels[key] || key}</p>
                                    <p className="text-xl font-semibold text-primary mt-1">{scores[key] != null ? Number(scores[key]) : '—'}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            {profileAnalysis.pillars && typeof profileAnalysis.pillars === 'object' && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Chi tiết từng trụ</p>
                                <div className="space-y-3">
                                  {['aca', 'lan', 'hdnk', 'skill'].map((key) => {
                                    const data = (profileAnalysis.pillars as Record<string, unknown>)[key];
                                    if (!data || typeof data !== 'object') return null;
                                    const d = data as Record<string, unknown>;
                                    const score = typeof d.score === 'number' ? d.score : scores?.[key];
                                    const feedback = safeText(d.feedback);
                                    const strengths = Array.isArray(d.strengths) ? d.strengths : [];
                                    const weaknesses = Array.isArray(d.weaknesses) ? d.weaknesses : [];
                                    const suggestions = Array.isArray(d.suggestions) ? d.suggestions : [];
                                    return (
                                      <div key={key} className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                                        <p className="text-sm font-semibold text-foreground">{pillarLabels[key]} — {score != null ? Number(score) : '—'}/100</p>
                                        {feedback ? <p className="text-sm text-foreground mt-2">{feedback}</p> : null}
                                        {strengths.length > 0 && <p className="text-xs text-muted-foreground mt-2">Điểm mạnh: {strengths.map((s: unknown) => safeText(s)).join(' • ')}</p>}
                                        {weaknesses.length > 0 && <p className="text-xs text-muted-foreground mt-1">Điểm yếu: {weaknesses.map((w: unknown) => safeText(w)).join(' • ')}</p>}
                                        {suggestions.length > 0 && <p className="text-xs text-primary mt-1">Gợi ý: {suggestions.map((g: unknown) => safeText(g)).join(' • ')}</p>}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </>
                        );
                      }
                      return null;
                    })()}
                    {Boolean(profileAnalysis.overall && typeof profileAnalysis.overall === 'object') && (
                      <div className="rounded-2xl border border-border/60 bg-muted/20 p-6">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Tổng quát và ưu tiên cải thiện</p>
                        {(profileAnalysis.overall as { overall_score?: number }).overall_score != null && (
                          <p className="text-sm font-medium text-primary">Điểm tổng quát: {(profileAnalysis.overall as { overall_score?: number }).overall_score}/100</p>
                        )}
                        <p className="text-sm text-foreground leading-relaxed mt-2">
                          {String(safeText((profileAnalysis.overall as { feedback?: unknown }).feedback) || safeText((profileAnalysis.overall as { summary?: unknown }).summary) || 'Đã hoàn thành phân tích.')}
                        </p>
                        {Boolean((profileAnalysis.overall as { summary?: unknown }).summary && (profileAnalysis.overall as { feedback?: unknown }).feedback !== (profileAnalysis.overall as { summary?: unknown }).summary) && (
                          <p className="text-sm text-muted-foreground mt-2">{safeText((profileAnalysis.overall as { summary?: unknown }).summary)}</p>
                        )}
                        {((profileAnalysis.overall as { priority_suggestions?: unknown[] }).priority_suggestions?.length ?? 0) > 0 && (
                          <div className="mt-4">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Gợi ý ưu tiên</p>
                            <ul className="text-sm text-foreground space-y-1 list-disc list-inside">
                              {((profileAnalysis.overall as { priority_suggestions?: unknown[] }).priority_suggestions ?? []).slice(0, 6).map((p, i) => (
                                <li key={i}>{safeText(p)}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {(Boolean((profileAnalysis.overall as { personal_fit_score?: number }).personal_fit_score != null) || Boolean(safeText((profileAnalysis.overall as { personal_fit_feedback?: unknown }).personal_fit_feedback))) && (
                          <div className="mt-4 pt-4 border-t border-border/60">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Phù hợp với bản thân</p>
                            {(profileAnalysis.overall as { personal_fit_score?: number }).personal_fit_score != null && (
                              <p className="text-sm font-medium text-primary">Điểm: {(profileAnalysis.overall as { personal_fit_score?: number }).personal_fit_score}/100</p>
                            )}
                            {safeText((profileAnalysis.overall as { personal_fit_feedback?: unknown }).personal_fit_feedback) && (
                              <p className="text-sm text-muted-foreground mt-1">{safeText((profileAnalysis.overall as { personal_fit_feedback?: unknown }).personal_fit_feedback)}</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {!profileAnalysis.overall && !profileAnalysis.pillar_scores && (
                      <p className="text-sm text-muted-foreground">Đã nhận kết quả. Dữ liệu tổng quan đang được cập nhật.</p>
                    )}
                    <div className="pt-4 border-t border-border/60 flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Đánh giá kết quả phân tích:</span>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => saveRating('analysis', n)}
                          className="p-0.5 rounded hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                          title={`${n} sao`}
                        >
                          <Star className={`h-5 w-5 ${analysisRating != null && n <= analysisRating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                        </button>
                      ))}
                      {analysisRating != null && <span className="text-xs text-muted-foreground ml-1">{analysisRating}/5</span>}
                    </div>
                  </div>
                )}

                {profileEnhance && typeof profileEnhance === 'object' && (
                  <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-8 space-y-6">
                    <h3 className="text-base font-semibold text-foreground">Đề xuất cải thiện</h3>
                    {Boolean(profileEnhance.recommendations && Array.isArray(profileEnhance.recommendations) && profileEnhance.recommendations.length > 0) && (
                      <ul className="space-y-4">
                        {(profileEnhance.recommendations as Record<string, unknown>[]).slice(0, 10).map((r, i) => {
                          const priority = safeText(r.priority);
                          const name = safeText(r.specific_rec_name);
                          const type = safeText(r.type);
                          const reason = safeText(r.reason);
                          const resourceLink = safeText(r.resource_link);
                          const estimatedTime = safeText(r.estimated_time);
                          const actionPlan = Array.isArray(r.action_plan_details) ? (r.action_plan_details as unknown[]).map((a) => safeText(a)) : [];
                          return (
                            <li key={i} className="rounded-2xl border border-border/60 bg-muted/20 p-5">
                              <span className="text-sm font-medium text-primary">{priority || `#${i + 1}`}</span>
                              <p className="text-base font-medium text-foreground mt-2">{name || 'Khuyến nghị'}</p>
                              {type ? <p className="text-xs text-muted-foreground mt-1">Loại: {type}</p> : null}
                              {reason ? <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{reason}</p> : null}
                              {actionPlan.length > 0 && (
                                <ul className="text-sm text-foreground mt-2 list-disc list-inside space-y-0.5">
                                  {actionPlan.filter(Boolean).map((step, j) => <li key={j}>{step}</li>)}
                                </ul>
                              )}
                              {(resourceLink || estimatedTime) && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  {resourceLink ? <a href={resourceLink} target="_blank" rel="noopener noreferrer" className="text-primary underline">Tài liệu tham khảo</a> : null}
                                  {resourceLink && estimatedTime ? ' • ' : null}
                                  {estimatedTime ? `Thời gian ước tính: ${estimatedTime}` : null}
                                </p>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    {Boolean(profileEnhance.improvements && Array.isArray(profileEnhance.improvements) && profileEnhance.improvements.length > 0) && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Cải thiện theo trụ</p>
                        <ul className="space-y-2">
                          {(profileEnhance.improvements as Record<string, unknown>[]).slice(0, 8).map((imp, i) => (
                            <li key={i} className="text-sm text-foreground">
                              {safeText(imp.pillar)}: {safeText(imp.current_score)} → {safeText(imp.target_score)}
                              {safeText(imp.what_improved) ? ` — ${safeText(imp.what_improved)}` : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {Boolean(profileEnhance.target_pillar_scores && typeof profileEnhance.target_pillar_scores === 'object' && Object.keys(profileEnhance.target_pillar_scores as Record<string, unknown>).length > 0) && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Điểm trụ mục tiêu</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {['aca', 'lan', 'hdnk', 'skill'].map((key) => {
                            const v = (profileEnhance.target_pillar_scores as Record<string, unknown>)[key];
                            const num = typeof v === 'number' ? v : (typeof v === 'string' ? parseFloat(v) : null);
                            const labels: Record<string, string> = { aca: 'Học thuật', lan: 'Ngôn ngữ', hdnk: 'Hoạt động', skill: 'Kỹ năng' };
                            return <div key={key} className="rounded-xl border border-border/60 bg-muted/20 p-3"><span className="text-xs text-muted-foreground">{labels[key] || key}</span><p className="text-lg font-semibold text-primary">{num != null ? num : '—'}</p></div>;
                          })}
                        </div>
                      </div>
                    )}
                    {Boolean(profileEnhance.enhanced_summary) && (
                      <div className="rounded-2xl border border-border/60 bg-muted/20 p-6">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Tóm tắt cải thiện</p>
                        <p className="text-sm text-foreground leading-relaxed">{safeText(profileEnhance.enhanced_summary)}</p>
                      </div>
                    )}
                    {(!Array.isArray(profileEnhance.recommendations) || profileEnhance.recommendations.length === 0) && !profileEnhance.enhanced_summary && (!Array.isArray(profileEnhance.improvements) || profileEnhance.improvements.length === 0) && (
                      <p className="text-sm text-muted-foreground">Đã nhận kết quả. Nội dung gợi ý đang được cập nhật.</p>
                    )}
                    <div className="pt-4 border-t border-border/60 flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Đánh giá đề xuất cải thiện:</span>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => saveRating('enhance', n)}
                          className="p-0.5 rounded hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                          title={`${n} sao`}
                        >
                          <Star className={`h-5 w-5 ${enhanceRating != null && n <= enhanceRating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                        </button>
                      ))}
                      {enhanceRating != null && <span className="text-xs text-muted-foreground ml-1">{enhanceRating}/5</span>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'cv' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    CV của bạn
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Cùng một bộ file CV với trang Checklist. Tải lên tại đây sẽ tự động cập nhật Checklist.
                  </p>

                  {cvLoading ? (
                    <div className="flex items-center justify-center py-12 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin mr-2" />
                      Đang tải...
                    </div>
                  ) : cvList.length > 0 ? (
                    <div className="space-y-4 mb-6">
                      {cvList.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-muted/20"
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

                  {cvList.length === 0 ? (
                    <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/50 hover:bg-muted/30 transition-colors">
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
                          {cvUploading ? 'Đang tải lên...' : 'Chọn file CV (PDF, DOC, DOCX hoặc ảnh)'}
                        </p>
                        <p className="text-xs text-muted-foreground">Tối đa 5MB. Sẽ đồng bộ với Checklist.</p>
                      </label>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-border/60 bg-muted/20 p-6 text-center">
                      <p className="text-sm font-medium text-foreground">Bạn đã tải CV lên rồi. Không thể tải thêm.</p>
                      <p className="text-xs text-muted-foreground mt-2">CV hiển thị ở trên có thể dùng để phân tích hoặc nâng cấp.</p>
                    </div>
                  )}
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-6">
                  <h3 className="text-base font-semibold text-foreground mb-4">Gợi ý cải thiện CV</h3>
                  <ul className="text-sm text-muted-foreground space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      Sử dụng động từ mạnh (Led, Developed, Achieved) cho từng mục.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      Thêm số liệu cụ thể (%, số người, quy mô dự án).
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-0.5">•</span>
                      Ưu tiên thông tin liên quan đến ngành và trường mục tiêu.
                    </li>
                  </ul>
                </div>
                <ActionButtonsBottom source="cv" />
              </div>
            )}

            {activeTab === 'essay' && (
              <div className="space-y-8">
                <div>
                  {essayLoading ? (
                    <div className="flex items-center justify-center py-16 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin mr-2" />
                      Đang tải...
                    </div>
                  ) : (
                    <>
                      {essayList.length > 0 && (
                        <div className="flex flex-wrap items-center gap-4 pb-4 mb-4 border-b border-border/60">
                          <span className="text-sm text-muted-foreground">Bài luận:</span>
                          <select
                            value={currentEssayId || ''}
                            onChange={(e) => setCurrentEssayId(e.target.value || null)}
                            className="rounded-xl border border-border/60 bg-card text-foreground text-sm px-4 py-2"
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
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border/60 bg-card text-foreground text-sm font-medium hover:bg-muted/50 hover:border-primary/40 disabled:opacity-50"
                          >
                            {essaySaving ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Save className="h-4 w-4 text-primary" />}
                            Lưu
                          </button>
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-2 py-3 mb-4 border-b border-border/60">
                        <button type="button" onClick={() => execCommand('bold')} className="p-2.5 rounded-lg hover:bg-muted text-foreground" title="Đậm">
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
                            className="ml-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border/60 bg-card text-foreground text-sm font-medium hover:bg-muted/50 hover:border-primary/40 disabled:opacity-50"
                          >
                            {essaySaving ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Save className="h-4 w-4 text-primary" />}
                            Lưu bài luận
                          </button>
                        )}
                      </div>
                      <div className="relative min-h-[320px]">
                        {!essayContent.trim() && !currentEssayId && (
                          <div
                            className="absolute inset-0 p-8 pt-10 pointer-events-none text-muted-foreground text-base leading-relaxed"
                            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                          >
                            Bắt đầu viết bài luận của bạn... (bấm Lưu bài luận để tạo mới)
                          </div>
                        )}
                        <div
                          ref={editorRef}
                          contentEditable
                          suppressContentEditableWarning
                          className="relative w-full min-h-[320px] p-8 pt-10 rounded-2xl bg-muted/10 text-foreground text-base leading-relaxed overflow-y-auto focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-inset"
                          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                          onInput={(e) => setEssayContent((e.target as HTMLDivElement).innerHTML)}
                        />
                      </div>
                      <ActionButtonsBottom source="essay" />
                    </>
                  )}
                </div>
                {currentEssayId && essayComments.length > 0 && (
                  <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-8">
                    <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      Nhận xét từ mentor
                    </h3>
                    <ul className="space-y-4">
                      {essayComments.map((c) => (
                        <li key={c.id} className="rounded-2xl border border-border/60 bg-muted/20 p-5">
                          <p className="text-sm text-foreground">{safeText(c.content)}</p>
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
