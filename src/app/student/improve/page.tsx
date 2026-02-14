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

  // Essay tab: DB + improve results
  const [essayList, setEssayList] = useState<{ id: string; title: string | null; content: string; updated_at: string }[]>([]);
  const [currentEssayId, setCurrentEssayId] = useState<string | null>(null);
  const [essayLoading, setEssayLoading] = useState(false);
  const [essaySaving, setEssaySaving] = useState(false);
  const [essayComments, setEssayComments] = useState<EssayComment[]>([]);
  const [essayAnalysis, setEssayAnalysis] = useState<Record<string, unknown> | null>(null);
  const [essayEnhance, setEssayEnhance] = useState<Record<string, unknown> | null>(null);
  const [essayAnalysisLoading, setEssayAnalysisLoading] = useState(false);
  const [essayEnhanceLoading, setEssayEnhanceLoading] = useState(false);
  const [essayAnalysisRating, setEssayAnalysisRating] = useState<number | null>(null);
  const [essayEnhanceRating, setEssayEnhanceRating] = useState<number | null>(null);

  // CV tab: improve results
  const [cvAnalysis, setCvAnalysis] = useState<Record<string, unknown> | null>(null);
  const [cvEnhance, setCvEnhance] = useState<Record<string, unknown> | null>(null);
  const [cvAnalysisLoading, setCvAnalysisLoading] = useState(false);
  const [cvEnhanceLoading, setCvEnhanceLoading] = useState(false);
  const [cvText, setCvText] = useState<string>('');
  const [cvTextLoading, setCvTextLoading] = useState(false);
  const [cvAnalysisRating, setCvAnalysisRating] = useState<number | null>(null);
  const [cvEnhanceRating, setCvEnhanceRating] = useState<number | null>(null);

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

  // Load essay detail + comments + improve results when currentEssayId changes
  useEffect(() => {
    if (!currentEssayId) {
      setEssayComments([]);
      setEssayAnalysis(null);
      setEssayEnhance(null);
      setEssayAnalysisRating(null);
      setEssayEnhanceRating(null);
      return;
    }
    const load = async () => {
      try {
        const [detailRes, resultsRes] = await Promise.all([
          fetch(`/api/student/essays/${currentEssayId}`),
          fetch(`/api/student/improve/essay-results?essay_id=${encodeURIComponent(currentEssayId)}`),
        ]);
        if (detailRes.ok) {
          const json = await detailRes.json();
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
        if (resultsRes.ok) {
          const results = await resultsRes.json();
          setEssayAnalysis((results.analysis && typeof results.analysis === 'object') ? results.analysis : null);
          setEssayEnhance((results.enhance && typeof results.enhance === 'object') ? results.enhance : null);
          setEssayAnalysisRating(results.analysis_rating ?? null);
          setEssayEnhanceRating(results.enhance_rating ?? null);
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [currentEssayId]);

  // Load CV results + CV text when opening CV tab
  useEffect(() => {
    if (!studentId || activeTab !== 'cv') return;
    const load = async () => {
      try {
        const [resultsRes, textRes] = await Promise.all([
          fetch('/api/student/improve/cv-results'),
          fetch('/api/student/improve/cv-text'),
        ]);
        if (resultsRes.ok) {
          const results = await resultsRes.json();
          setCvAnalysis((results.analysis && typeof results.analysis === 'object') ? results.analysis : null);
          setCvEnhance((results.enhance && typeof results.enhance === 'object') ? results.enhance : null);
          setCvAnalysisRating(results.analysis_rating ?? null);
          setCvEnhanceRating(results.enhance_rating ?? null);
        }
        if (textRes.ok) {
          const data = await textRes.json();
          setCvText((data.text || '').trim());
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [studentId, activeTab]);

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

  const handleEssayAnalysis = async () => {
    const plain = getEssayPlainText().trim();
    if (!plain) {
      toast.error('Chưa có nội dung essay để phân tích');
      return;
    }
    setEssayAnalysisLoading(true);
    toast.info('Đang phân tích essay... Có thể mất 1–2 phút.', { duration: 5000 });
    try {
      const res = await fetch('/api/module4/essay-improver/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essay_text: plain, use_nlp: true, async: true, limit_words: ESSAY_LIMIT_WORDS }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || 'Phân tích thất bại');
      }
      const data = (await res.json()) as { job_id?: string } & Record<string, unknown>;
      let result: Record<string, unknown>;
      if (res.status === 202 && data.job_id) {
        result = await pollJobResult(data.job_id, 'analysis');
      } else {
        result = data;
      }
      const analysisData = (result as { analysis?: Record<string, unknown>; weak_points?: unknown[] });
      setEssayAnalysis(analysisData);
      if (currentEssayId) {
        try {
          await fetch('/api/student/improve/essay-results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ essay_id: currentEssayId, analysis: analysisData }),
          });
        } catch (_) {}
      }
      toast.success('Phân tích essay thành công');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi phân tích essay');
    } finally {
      setEssayAnalysisLoading(false);
    }
  };

  const handleEssayEnhance = async () => {
    const plain = getEssayPlainText().trim();
    if (!plain) {
      toast.error('Chưa có nội dung essay để cải thiện');
      return;
    }
    setEssayEnhanceLoading(true);
    toast.info('Đang cải thiện essay... Có thể mất 1–2 phút.', { duration: 5000 });
    try {
      const res = await fetch('/api/module4/essay-improver/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essay_text: plain, use_nlp: true, async: true, limit_words: ESSAY_LIMIT_WORDS }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || 'Enhance thất bại');
      }
      const data = (await res.json()) as { job_id?: string } & Record<string, unknown>;
      let result: Record<string, unknown>;
      if (res.status === 202 && data.job_id) {
        result = await pollJobResult(data.job_id, 'enhance');
      } else {
        result = data;
      }
      setEssayEnhance(result);
      if (currentEssayId) {
        try {
          await fetch('/api/student/improve/essay-results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ essay_id: currentEssayId, enhance: result }),
          });
        } catch (_) {}
      }
      toast.success('Cải thiện essay thành công');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi cải thiện essay');
    } finally {
      setEssayEnhanceLoading(false);
    }
  };

  const handleCvAnalysis = async () => {
    let text = cvText.trim();
    if (!text) {
      setCvTextLoading(true);
      try {
        const textRes = await fetch('/api/student/improve/cv-text');
        if (textRes.ok) {
          const data = await textRes.json();
          text = (data.text || '').trim();
          setCvText(text);
        }
      } finally {
        setCvTextLoading(false);
      }
    }
    if (!text) {
      toast.error('Chưa có nội dung CV (chỉ hỗ trợ PDF). Hãy tải CV PDF lên.');
      return;
    }
    setCvAnalysisLoading(true);
    toast.info('Đang phân tích CV... Có thể mất 1–2 phút.', { duration: 5000 });
    try {
      const res = await fetch('/api/module4/cv-improver/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv_text: text, use_nlp: true, async: true }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || 'Phân tích thất bại');
      }
      const data = (await res.json()) as { job_id?: string } & Record<string, unknown>;
      let result: Record<string, unknown>;
      if (res.status === 202 && data.job_id) {
        result = await pollJobResult(data.job_id, 'analysis');
      } else {
        result = data;
      }
      setCvAnalysis(result);
      try {
        await fetch('/api/student/improve/cv-results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analysis: result }),
        });
      } catch (_) {}
      toast.success('Phân tích CV thành công');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi phân tích CV');
    } finally {
      setCvAnalysisLoading(false);
    }
  };

  const handleCvEnhance = async () => {
    let text = cvText.trim();
    if (!text) {
      setCvTextLoading(true);
      try {
        const textRes = await fetch('/api/student/improve/cv-text');
        if (textRes.ok) {
          const data = await textRes.json();
          text = (data.text || '').trim();
          setCvText(text);
        }
      } finally {
        setCvTextLoading(false);
      }
    }
    if (!text) {
      toast.error('Chưa có nội dung CV (chỉ hỗ trợ PDF). Hãy tải CV PDF lên.');
      return;
    }
    setCvEnhanceLoading(true);
    toast.info('Đang tạo đề xuất cải thiện CV... Có thể mất 1–2 phút.', { duration: 5000 });
    try {
      const res = await fetch('/api/module4/cv-improver/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv_text: text, use_nlp: true, async: true }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || 'Enhance thất bại');
      }
      const data = (await res.json()) as { job_id?: string } & Record<string, unknown>;
      let result: Record<string, unknown>;
      if (res.status === 202 && data.job_id) {
        result = await pollJobResult(data.job_id, 'enhance');
      } else {
        result = data;
      }
      setCvEnhance(result);
      try {
        await fetch('/api/student/improve/cv-results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enhance: result }),
        });
      } catch (_) {}
      toast.success('Đề xuất cải thiện CV đã sẵn sàng');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi đề xuất CV');
    } finally {
      setCvEnhanceLoading(false);
    }
  };

  const saveEssayRating = async (kind: 'analysis' | 'enhance', value: number) => {
    if (!currentEssayId) return;
    try {
      const res = await fetch('/api/student/improve/essay-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          essay_id: currentEssayId,
          ...(kind === 'analysis' ? { analysis_rating: value } : { enhance_rating: value }),
        }),
      });
      if (res.ok) {
        if (kind === 'analysis') setEssayAnalysisRating(value);
        else setEssayEnhanceRating(value);
        toast.success('Đã lưu đánh giá');
      }
    } catch {
      toast.error('Không lưu được đánh giá');
    }
  };

  const saveCvRating = async (kind: 'analysis' | 'enhance', value: number) => {
    try {
      const res = await fetch('/api/student/improve/cv-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kind === 'analysis' ? { analysis_rating: value } : { enhance_rating: value }),
      });
      if (res.ok) {
        if (kind === 'analysis') setCvAnalysisRating(value);
        else setCvEnhanceRating(value);
        toast.success('Đã lưu đánh giá');
      }
    } catch {
      toast.error('Không lưu được đánh giá');
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
                            <ol className="text-sm text-foreground space-y-1 list-decimal list-inside">
                              {((profileAnalysis.overall as { priority_suggestions?: unknown[] }).priority_suggestions ?? []).slice(0, 6).map((p, i) => (
                                <li key={i}>{safeText(p)}</li>
                              ))}
                            </ol>
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
                            href={(doc as { url?: string }).url || `/uploads/cvs/${doc.id}`}
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
                    <div className="relative border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/50 hover:bg-muted/30 transition-colors">
                      {cvUploading && (
                        <div className="absolute inset-0 bg-background/80 z-10 flex flex-col items-center justify-center rounded-2xl">
                          <Loader2 className="h-12 w-12 text-primary animate-spin mb-3" />
                          <p className="text-sm font-medium text-foreground">Đang tải lên...</p>
                          <p className="text-xs text-muted-foreground mt-1">Vui lòng đợi</p>
                        </div>
                      )}
                      <input
                        id="improve-cv-upload"
                        type="file"
                        accept=".pdf,.doc,.docx,image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleCVUpload}
                        disabled={cvUploading}
                      />
                      <label
                        htmlFor="improve-cv-upload"
                        className={`block ${cvUploading ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
                      >
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-sm font-medium text-foreground mb-1">
                          Chọn file CV (PDF, DOC, DOCX hoặc ảnh)
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
                <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-border/60">
                  <span className="text-sm text-muted-foreground">Phân tích &amp; cải thiện:</span>
                  <button
                    type="button"
                    onClick={handleCvAnalysis}
                    disabled={cvAnalysisLoading || cvEnhanceLoading || cvList.length === 0}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/60 bg-card text-foreground text-sm font-medium hover:bg-muted/50 disabled:opacity-50"
                  >
                    {cvTextLoading || cvAnalysisLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
                    {cvAnalysis ? 'Phân tích lại' : 'Phân tích CV'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCvEnhance}
                    disabled={cvEnhanceLoading || cvAnalysisLoading || cvList.length === 0}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/60 bg-card text-foreground text-sm font-medium hover:bg-muted/50 disabled:opacity-50"
                  >
                    {cvEnhanceLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                    {cvEnhance ? 'Cải thiện lại' : 'Đề xuất cải thiện CV'}
                  </button>
                </div>
                {(cvAnalysisLoading || cvEnhanceLoading) && (
                  <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang xử lý... Có thể mất 1–2 phút. (Chỉ hỗ trợ CV PDF)
                  </p>
                )}
                {cvAnalysis && typeof cvAnalysis === 'object' && (
                  <div className="rounded-2xl border border-border/60 bg-card p-6 mt-6 space-y-6">
                    <h3 className="text-base font-semibold text-foreground">Kết quả phân tích CV</h3>
                    {(cvAnalysis as { overall?: Record<string, unknown> }).overall && (
                      <>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Phân tích tổng quát</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                            <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                              <p className="text-xs text-muted-foreground">Điểm tổng quát</p>
                              <p className="text-lg font-semibold text-primary">{(cvAnalysis as { overall?: { overall_score?: number } }).overall?.overall_score ?? '—'}/10</p>
                            </div>
                            {(cvAnalysis as { overall?: { personal_fit_score?: number } }).overall?.personal_fit_score != null && (
                              <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                                <p className="text-xs text-muted-foreground">Phù hợp bản thân</p>
                                <p className="text-lg font-semibold text-primary">{Number((cvAnalysis as { overall: { personal_fit_score?: number } }).overall.personal_fit_score).toFixed(1)}/10</p>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-foreground">{safeText((cvAnalysis as { overall?: { feedback?: unknown } }).overall?.feedback)}</p>
                          {safeText((cvAnalysis as { overall?: { personal_fit_feedback?: unknown } }).overall?.personal_fit_feedback) && (
                            <p className="text-xs text-muted-foreground mt-1">Phù hợp bản thân: {safeText((cvAnalysis as { overall?: { personal_fit_feedback?: unknown } }).overall?.personal_fit_feedback)}</p>
                          )}
                        </div>
                        {safeText((cvAnalysis as { overall?: { summary?: unknown } }).overall?.summary) && (
                          <div className="rounded-xl border border-border/60 bg-primary/5 p-4">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Tóm tắt</p>
                            <p className="text-sm text-foreground">{safeText((cvAnalysis as { overall?: { summary?: unknown } }).overall?.summary)}</p>
                          </div>
                        )}
                      </>
                    )}
                    {(cvAnalysis as { sections?: Record<string, Record<string, unknown>> }).sections && Object.keys((cvAnalysis as { sections: Record<string, unknown> }).sections).length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Phân tích từng phần</p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead>
                              <tr className="border-b border-border/60">
                                <th className="py-2 pr-4 text-muted-foreground font-medium">Phần</th>
                                <th className="py-2 text-muted-foreground font-medium">Điểm</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries((cvAnalysis as { sections: Record<string, Record<string, unknown>> }).sections).map(([key, section]) => {
                                const names: Record<string, string> = { introduction: 'Giới thiệu', study: 'Học vấn', skills: 'Kỹ năng', information: 'Thông tin cá nhân', project: 'Dự án', experience: 'Kinh nghiệm' };
                                const score = section?.score != null ? Number(section.score).toFixed(1) : '—';
                                return (
                                  <tr key={key} className="border-b border-border/60">
                                    <td className="py-2 pr-4 text-foreground">{names[key] || key}</td>
                                    <td className="py-2 text-foreground">{score}/10</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-4 space-y-3">
                          {Object.entries((cvAnalysis as { sections: Record<string, Record<string, unknown>> }).sections).map(([key, section]) => {
                            const names: Record<string, string> = { introduction: 'Giới thiệu', study: 'Học vấn', skills: 'Kỹ năng', information: 'Thông tin cá nhân', project: 'Dự án', experience: 'Kinh nghiệm' };
                            const score = section?.score != null ? Number(section.score).toFixed(1) : '—';
                            const feedback = safeText(section?.feedback);
                            const strengths = Array.isArray(section?.strengths) ? (section.strengths as unknown[]) : [];
                            const weaknesses = Array.isArray(section?.weaknesses) ? (section.weaknesses as unknown[]) : [];
                            const suggestions = Array.isArray(section?.suggestions) ? (section.suggestions as unknown[]) : [];
                            const sectionText = safeText(section?.section_text);
                            return (
                              <details key={key} className="rounded-xl border border-border/60 bg-muted/10 overflow-hidden">
                                <summary className="p-3 cursor-pointer font-medium text-foreground list-none flex items-center gap-2">
                                  <span className="text-primary">📄</span> {names[key] || key} — {score}/10
                                </summary>
                                <div className="px-3 pb-3 pt-0 space-y-2 text-sm">
                                  {feedback ? <p><span className="text-muted-foreground">Nhận xét: </span>{feedback}</p> : null}
                                  {strengths.length > 0 && <p className="text-muted-foreground">Điểm mạnh: {strengths.map((s: unknown) => safeText(s)).join(' • ')}</p>}
                                  {weaknesses.length > 0 && <p className="text-muted-foreground">Điểm yếu: {weaknesses.map((w: unknown) => safeText(w)).join(' • ')}</p>}
                                  {suggestions.length > 0 && <p className="text-primary">Gợi ý: {suggestions.map((g: unknown) => safeText(g)).join(' • ')}</p>}
                                  {sectionText ? <p className="text-xs text-muted-foreground mt-2 border-t border-border/60 pt-2">Nội dung phần: {sectionText.slice(0, 300)}{sectionText.length > 300 ? '...' : ''}</p> : null}
                                </div>
                              </details>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {(cvAnalysis as { overall?: Record<string, unknown> }).overall && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Gợi ý cải thiện tổng quát</p>
                        {Array.isArray((cvAnalysis as { overall?: { quantification_suggestions?: unknown[] } }).overall?.quantification_suggestions) && ((cvAnalysis as { overall: { quantification_suggestions: unknown[] } }).overall.quantification_suggestions.length > 0) && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Gợi ý định lượng hóa</p>
                            <ul className="list-disc list-inside text-sm text-foreground space-y-0.5">
                              {((cvAnalysis as { overall: { quantification_suggestions: unknown[] } }).overall.quantification_suggestions).map((q: unknown, i: number) => <li key={i}>{safeText(q)}</li>)}
                            </ul>
                          </div>
                        )}
                        {Array.isArray((cvAnalysis as { overall?: { grammar_suggestions?: unknown[] } }).overall?.grammar_suggestions) && ((cvAnalysis as { overall: { grammar_suggestions: unknown[] } }).overall.grammar_suggestions.length > 0) && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Gợi ý cải thiện ngữ pháp</p>
                            <ul className="list-disc list-inside text-sm text-foreground space-y-0.5">
                              {((cvAnalysis as { overall: { grammar_suggestions: unknown[] } }).overall.grammar_suggestions).map((g: unknown, i: number) => <li key={i}>{safeText(g)}</li>)}
                            </ul>
                          </div>
                        )}
                        {Array.isArray((cvAnalysis as { overall?: { priority_improvements?: unknown[] } }).overall?.priority_improvements) && (
                          <ul className="list-disc list-inside text-sm text-foreground mt-2">
                            {((cvAnalysis as { overall: { priority_improvements: unknown[] } }).overall.priority_improvements).map((p: unknown, i: number) => <li key={i}>{safeText(p)}</li>)}
                          </ul>
                        )}
                      </div>
                    )}
                    <div className="pt-4 border-t border-border/60 flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Đánh giá:</span>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} type="button" onClick={() => saveCvRating('analysis', n)} className="p-0.5 rounded hover:bg-muted/50">
                          <Star className={`h-5 w-5 ${cvAnalysisRating != null && n <= cvAnalysisRating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {cvEnhance && typeof cvEnhance === 'object' && (
                  <div className="rounded-2xl border border-border/60 bg-card p-6 mt-6">
                    <h3 className="text-base font-semibold text-foreground mb-3">Đề xuất cải thiện CV</h3>
                    {(cvEnhance as { overall?: Record<string, unknown> }).overall && (
                      <div className="text-sm text-foreground space-y-2">
                        <p>{safeText((cvEnhance as { overall?: { feedback?: unknown } }).overall?.feedback)}</p>
                        {Array.isArray((cvEnhance as { overall?: { quantification_suggestions?: unknown[] } }).overall?.quantification_suggestions) && (
                          <>
                            <p className="text-xs font-medium text-muted-foreground mt-2">Gợi ý định lượng hóa:</p>
                            <ul className="list-disc list-inside">
                              {((cvEnhance as { overall: { quantification_suggestions: unknown[] } }).overall.quantification_suggestions.slice(0, 5)).map((q: unknown, i: number) => (
                                <li key={i}>{safeText(q)}</li>
                              ))}
                            </ul>
                          </>
                        )}
                        {Array.isArray((cvEnhance as { overall?: { grammar_suggestions?: unknown[] } }).overall?.grammar_suggestions) && (
                          <>
                            <p className="text-xs font-medium text-muted-foreground mt-2">Gợi ý ngữ pháp:</p>
                            <ul className="list-disc list-inside">
                              {((cvEnhance as { overall: { grammar_suggestions: unknown[] } }).overall.grammar_suggestions.slice(0, 5)).map((g: unknown, i: number) => (
                                <li key={i}>{safeText(g)}</li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    )}
                    <div className="pt-4 mt-4 border-t border-border/60 flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Đánh giá:</span>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} type="button" onClick={() => saveCvRating('enhance', n)} className="p-0.5 rounded hover:bg-muted/50">
                          <Star className={`h-5 w-5 ${cvEnhanceRating != null && n <= cvEnhanceRating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
                      <div className="flex flex-wrap items-center gap-4 pt-6 mt-6 border-t border-border/60">
                        <span className="text-sm text-muted-foreground">Phân tích &amp; cải thiện:</span>
                        <button
                          type="button"
                          onClick={handleEssayAnalysis}
                          disabled={essayAnalysisLoading || essayEnhanceLoading}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/60 bg-card text-foreground text-sm font-medium hover:bg-muted/50 disabled:opacity-50"
                        >
                          {essayAnalysisLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
                          {essayAnalysis ? 'Phân tích lại' : 'Phân tích essay'}
                        </button>
                        <button
                          type="button"
                          onClick={handleEssayEnhance}
                          disabled={essayEnhanceLoading || essayAnalysisLoading}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/60 bg-card text-foreground text-sm font-medium hover:bg-muted/50 disabled:opacity-50"
                        >
                          {essayEnhanceLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                          {essayEnhance ? 'Cải thiện lại' : 'Đề xuất cải thiện essay'}
                        </button>
                      </div>
                      {(essayAnalysisLoading || essayEnhanceLoading) && (
                        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Đang xử lý... Có thể mất 1–2 phút.
                        </p>
                      )}
                      {essayAnalysis && typeof essayAnalysis === 'object' && (
                        <div className="rounded-2xl border border-border/60 bg-card p-6 mt-6">
                          <h3 className="text-base font-semibold text-foreground mb-4">Kết quả phân tích essay</h3>
                          {(() => {
                            const analysis = (essayAnalysis as { analysis?: Record<string, unknown> }).analysis;
                            const overall = analysis?.overall as Record<string, unknown> | undefined;
                            const assessment = analysis?.overall_assessment as Record<string, unknown> | undefined;
                            const aspectNames: Record<string, string> = { content: 'Nội dung', structure: 'Cấu trúc', language: 'Ngôn ngữ', grammar: 'Ngữ pháp', personal_fit: 'Phù hợp' };
                            return (
                              <>
                                {overall && (
                                  <>
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                                      {['content', 'structure', 'language', 'grammar', 'personal_fit'].map((key) => {
                                        const val = (overall[key] as Record<string, unknown>)?.score ?? (overall.aspect_scores as Record<string, unknown>)?.[key];
                                        const num = typeof val === 'number' ? val : null;
                                        return (
                                          <div key={key} className="rounded-xl border border-border/60 bg-muted/20 p-3">
                                            <p className="text-xs text-muted-foreground">{aspectNames[key] || key}</p>
                                            <p className="text-lg font-semibold text-primary">{num != null ? `${Number(num).toFixed(1)}` : '—'}/10</p>
                                          </div>
                                        );
                                      })}
                                      {overall.overall_score != null && (
                                        <div className="rounded-xl border border-primary/40 bg-primary/5 p-3">
                                          <p className="text-xs text-muted-foreground">Điểm tổng</p>
                                          <p className="text-lg font-semibold text-primary">{Number(overall.overall_score).toFixed(1)}/10</p>
                                        </div>
                                      )}
                                    </div>
                                    {assessment && (
                                      <div className="space-y-3 text-sm border-t border-border/60 pt-4">
                                        {safeText(assessment.summary) && (
                                          <p className="text-foreground"><span className="font-medium text-muted-foreground">Tóm tắt: </span>{safeText(assessment.summary)}</p>
                                        )}
                                        {safeText(assessment.essay_level_feedback) && (
                                          <p className="text-foreground"><span className="font-medium text-muted-foreground">Nhận xét toàn bài: </span>{safeText(assessment.essay_level_feedback)}</p>
                                        )}
                                        {Array.isArray(assessment.strengths_from_essay) && assessment.strengths_from_essay.length > 0 && (
                                          <div>
                                            <p className="font-medium text-muted-foreground mb-1">Điểm mạnh toàn bài:</p>
                                            <ul className="list-disc list-inside text-foreground space-y-0.5">
                                              {(assessment.strengths_from_essay as unknown[]).slice(0, 6).map((s: unknown, i: number) => <li key={i}>{safeText(s)}</li>)}
                                            </ul>
                                          </div>
                                        )}
                                        {Array.isArray(assessment.weaknesses_from_essay) && assessment.weaknesses_from_essay.length > 0 && (
                                          <div>
                                            <p className="font-medium text-muted-foreground mb-1">Điểm yếu cần cải thiện:</p>
                                            <ul className="list-disc list-inside text-foreground space-y-0.5">
                                              {(assessment.weaknesses_from_essay as unknown[]).slice(0, 6).map((w: unknown, i: number) => <li key={i}>{safeText(w)}</li>)}
                                            </ul>
                                          </div>
                                        )}
                                        {Array.isArray(assessment.priority_improvements) && assessment.priority_improvements.length > 0 && (
                                          <div>
                                            <p className="font-medium text-muted-foreground mb-1">Ưu tiên cải thiện:</p>
                                            <ol className="list-decimal list-inside text-foreground space-y-0.5">
                                              {(assessment.priority_improvements as unknown[]).slice(0, 6).map((imp: unknown, i: number) => (
                                                <li key={i}>{safeText(typeof imp === 'object' && imp && 'action' in imp ? (imp as { action?: unknown }).action : imp)}</li>
                                              ))}
                                            </ol>
                                          </div>
                                        )}
                                        {safeText(assessment.personal_fit_feedback) && (
                                          <p className="text-muted-foreground"><span className="font-medium">Phù hợp bản thân: </span>{safeText(assessment.personal_fit_feedback)}</p>
                                        )}
                                      </div>
                                    )}
                                  </>
                                )}
                                {Array.isArray((essayAnalysis as { weak_points?: unknown[] }).weak_points) && ((essayAnalysis as { weak_points: unknown[] }).weak_points.length > 0) && (
                                  <div className="mt-4 pt-4 border-t border-border/60">
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Các điểm yếu cần cải thiện</p>
                                    <ul className="space-y-2 text-sm text-foreground">
                                      {((essayAnalysis as { weak_points: Record<string, unknown>[] }).weak_points).map((wp: Record<string, unknown>, i: number) => {
                                        const paraIdx = wp.paragraph_index as number | undefined;
                                        const aspectName = aspectNames[String(wp.aspect || '')] || String(wp.aspect || '');
                                        const issue = safeText(wp.issue);
                                        const score = wp.score != null ? Number(wp.score).toFixed(1) : '—';
                                        const fix = safeText(wp.suggested_fix);
                                        return (
                                          <li key={i} className="rounded-xl border border-border/60 bg-muted/10 p-3">
                                            <p>
                                              {paraIdx != null ? `Đoạn ${paraIdx + 1} — ` : ''}<span className="font-medium">{aspectName}</span>: {issue || 'Cần cải thiện'} (Điểm: {score})
                                            </p>
                                            {fix ? <p className="text-muted-foreground text-xs mt-1">💡 Gợi ý sửa: {fix}</p> : null}
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </div>
                                )}
                                {!(essayAnalysis as { weak_points?: unknown[] }).weak_points?.length && !overall?.overall_score && (
                                  <p className="text-sm text-muted-foreground">Đã nhận kết quả. Đang cập nhật hiển thị.</p>
                                )}
                              </>
                            );
                          })()}
                          <div className="pt-4 mt-4 border-t border-border/60 flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Đánh giá:</span>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button key={n} type="button" onClick={() => saveEssayRating('analysis', n)} className="p-0.5 rounded hover:bg-muted/50">
                                <Star className={`h-5 w-5 ${essayAnalysisRating != null && n <= essayAnalysisRating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {essayEnhance && typeof essayEnhance === 'object' && (
                        <div className="rounded-2xl border border-border/60 bg-card p-6 mt-6 space-y-6">
                          <h3 className="text-base font-semibold text-foreground">Essay đã được cải thiện</h3>
                          {(essayEnhance as { enhanced_essay?: string }).enhanced_essay && (
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-2">Essay gốc</p>
                                  <div className="rounded-xl border border-border/60 bg-muted/20 p-4 max-h-64 overflow-y-auto">
                                    <p className="text-sm text-foreground whitespace-pre-wrap">{safeText((essayEnhance as { original_essay?: string }).original_essay || essayContent)}</p>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">Độ dài: {(essayEnhance as { statistics?: { original_words?: number } }).statistics?.original_words ?? (String((essayEnhance as { original_essay?: string }).original_essay || essayContent).split(/\s+/).filter(Boolean).length)} từ</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-2">Essay đã cải thiện</p>
                                  <div className="rounded-xl border border-border/60 bg-muted/20 p-4 max-h-64 overflow-y-auto">
                                    <p className="text-sm text-foreground whitespace-pre-wrap">{safeText((essayEnhance as { enhanced_essay?: string }).enhanced_essay)}</p>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">Độ dài: {(essayEnhance as { statistics?: { enhanced_words?: number } }).statistics?.enhanced_words ?? (String((essayEnhance as { enhanced_essay?: string }).enhanced_essay).split(/\s+/).filter(Boolean).length)} từ</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Thống kê</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                                    <p className="text-xs text-muted-foreground">Từ gốc</p>
                                    <p className="text-lg font-semibold text-foreground">{(essayEnhance as { statistics?: { original_words?: number } }).statistics?.original_words ?? '—'}</p>
                                  </div>
                                  <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                                    <p className="text-xs text-muted-foreground">Từ sau enhance</p>
                                    <p className="text-lg font-semibold text-foreground">{(essayEnhance as { statistics?: { enhanced_words?: number } }).statistics?.enhanced_words ?? '—'}</p>
                                  </div>
                                  <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                                    <p className="text-xs text-muted-foreground">Chênh lệch</p>
                                    <p className="text-lg font-semibold text-primary">
                                      {((essayEnhance as { statistics?: { enhanced_words?: number; original_words?: number } }).statistics?.enhanced_words != null && (essayEnhance as { statistics?: { original_words?: number } }).statistics?.original_words != null)
                                        ? `${Number((essayEnhance as { statistics: { enhanced_words: number; original_words: number } }).statistics.enhanced_words - (essayEnhance as { statistics: { original_words: number } }).statistics.original_words) >= 0 ? '+' : ''}${(essayEnhance as { statistics: { enhanced_words: number; original_words: number } }).statistics.enhanced_words - (essayEnhance as { statistics: { original_words: number } }).statistics.original_words}`
                                        : '—'}
                                    </p>
                                  </div>
                                  <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                                    <p className="text-xs text-muted-foreground">Giới hạn</p>
                                    <p className="text-sm font-medium">
                                      {((essayEnhance as { statistics?: { enhanced_words?: number; limit_words?: number } }).statistics?.limit_words != null && (essayEnhance as { statistics?: { enhanced_words?: number } }).statistics?.enhanced_words != null)
                                        ? Number((essayEnhance as { statistics: { enhanced_words: number; limit_words: number } }).statistics.enhanced_words) <= Number((essayEnhance as { statistics: { limit_words: number } }).statistics.limit_words)
                                          ? '✅ Trong giới hạn'
                                          : '⚠️ Vượt giới hạn'
                                        : '—'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              {(() => {
                                const changesList = Array.isArray((essayEnhance as { changes?: unknown[] }).changes) ? (essayEnhance as { changes: unknown[] }).changes : Array.isArray((essayEnhance as { changes_log?: unknown[] }).changes_log) ? (essayEnhance as { changes_log: unknown[] }).changes_log : [];
                                return changesList.length > 0 ? (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-2">Các thay đổi đã thực hiện</p>
                                  <div className="space-y-2">
                                    {(changesList as Record<string, unknown>[]).map((change: Record<string, unknown>, i: number) => {
                                      const paraIdx = change?.paragraph_index;
                                      const aspects = Array.isArray(change?.changes) ? (change.changes as Record<string, unknown>[]).map((c: Record<string, unknown>) => safeText(c?.aspect)).filter(Boolean) : [];
                                      const original = safeText(change?.original);
                                      const enhanced = safeText(change?.enhanced);
                                      if (paraIdx != null) {
                                        return (
                                          <details key={i} className="rounded-xl border border-border/60 bg-muted/10 overflow-hidden">
                                            <summary className="p-3 cursor-pointer font-medium text-foreground list-none">Đoạn {Number(paraIdx) + 1} — Đã thay đổi</summary>
                                            <div className="px-3 pb-3 pt-0 space-y-2 text-sm">
                                              {aspects.length > 0 && <p className="text-muted-foreground">Các khía cạnh đã cải thiện: {aspects.join(', ')}</p>}
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                                <div><p className="text-xs font-medium text-muted-foreground mb-1">Trước</p><p className="text-foreground whitespace-pre-wrap rounded border border-border/60 p-2 bg-muted/20 max-h-32 overflow-y-auto">{original || '—'}</p></div>
                                                <div><p className="text-xs font-medium text-muted-foreground mb-1">Sau</p><p className="text-foreground whitespace-pre-wrap rounded border border-border/60 p-2 bg-muted/20 max-h-32 overflow-y-auto">{enhanced || '—'}</p></div>
                                              </div>
                                            </div>
                                          </details>
                                        );
                                      }
                                      return (
                                        <details key={i} className="rounded-xl border border-border/60 bg-muted/10 overflow-hidden">
                                          <summary className="p-3 cursor-pointer font-medium text-foreground list-none">Cải thiện toàn diện</summary>
                                          <div className="px-3 pb-3 pt-0 text-sm text-muted-foreground">Đã thực hiện cải thiện toàn diện cho toàn bộ essay.</div>
                                        </details>
                                      );
                                    })}
                                  </div>
                                </div>
                                ) : null;
                              })()}
                              {(essayEnhance as { analysis?: { before?: Record<string, unknown>; after?: Record<string, unknown> } }).analysis && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-2">So sánh phân tích trước và sau Enhance</p>
                                  {(() => {
                                    const analysis = (essayEnhance as { analysis: { before?: Record<string, unknown>; after?: Record<string, unknown> } }).analysis;
                                    const beforeOverall = (analysis?.before as { overall?: Record<string, unknown> })?.overall ?? analysis?.before ?? {};
                                    const afterOverall = (analysis?.after as { overall?: Record<string, unknown> })?.overall ?? analysis?.after ?? {};
                                    const aspectNames: Record<string, string> = { content: 'Nội dung', structure: 'Cấu trúc', language: 'Ngôn ngữ', grammar: 'Ngữ pháp' };
                                    const aspects = ['content', 'structure', 'language', 'grammar'];
                                    return (
                                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                        {aspects.map((aspect) => {
                                          const beforeScore = typeof (beforeOverall as Record<string, unknown>)[aspect] === 'object' && (beforeOverall as Record<string, unknown>)[aspect] != null ? (beforeOverall as Record<string, Record<string, unknown>>)[aspect]?.score : null;
                                          const afterScore = typeof (afterOverall as Record<string, unknown>)[aspect] === 'object' && (afterOverall as Record<string, unknown>)[aspect] != null ? (afterOverall as Record<string, Record<string, unknown>>)[aspect]?.score : null;
                                          const orig = beforeScore != null ? Number(beforeScore) : 0;
                                          const after = afterScore != null ? Number(afterScore) : 0;
                                          const delta = after - orig;
                                          return (
                                            <div key={aspect} className="rounded-xl border border-border/60 bg-muted/20 p-3">
                                              <p className="text-xs text-muted-foreground">{aspectNames[aspect] || aspect}</p>
                                              <p className="text-lg font-semibold text-foreground">{after.toFixed(1)}/10</p>
                                              <p className="text-xs text-primary">{delta >= 0 ? '+' : ''}{delta.toFixed(1)}</p>
                                            </div>
                                          );
                                        })}
                                        <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                                          <p className="text-xs text-muted-foreground">Điểm tổng</p>
                                          <p className="text-lg font-semibold text-foreground">{typeof (afterOverall as { overall_score?: number }).overall_score === 'number' ? (afterOverall as { overall_score: number }).overall_score.toFixed(1) : '—'}/10</p>
                                          {typeof (beforeOverall as { overall_score?: number }).overall_score === 'number' && typeof (afterOverall as { overall_score?: number }).overall_score === 'number' && (
                                            <p className="text-xs text-primary">{(Number((afterOverall as { overall_score: number }).overall_score) - Number((beforeOverall as { overall_score: number }).overall_score)) >= 0 ? '+' : ''}{(Number((afterOverall as { overall_score: number }).overall_score) - Number((beforeOverall as { overall_score: number }).overall_score)).toFixed(1)}</p>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              )}
                              {(essayEnhance as { analysis?: { after?: Record<string, unknown> } }).analysis?.after && (() => {
                                const afterData = (essayEnhance as { analysis: { after: Record<string, unknown> } }).analysis.after;
                                const assessment = (afterData?.overall_assessment as Record<string, unknown>) ?? {};
                                const summary = safeText(assessment?.summary);
                                const feedback = safeText(assessment?.essay_level_feedback);
                                if (!summary && !feedback) return null;
                                return (
                                  <details className="rounded-xl border border-border/60 bg-muted/10 overflow-hidden">
                                    <summary className="p-3 cursor-pointer font-medium text-foreground list-none">Đánh giá tổng thể (sau Enhance)</summary>
                                    <div className="px-3 pb-3 pt-0 space-y-2 text-sm">
                                      {summary && <p><span className="text-muted-foreground">Tóm tắt: </span>{summary}</p>}
                                      {feedback && <p><span className="text-muted-foreground">Nhận xét toàn bài: </span>{feedback}</p>}
                                    </div>
                                  </details>
                                );
                              })()}
                              <div className="flex flex-wrap items-center gap-4 pt-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const text = safeText((essayEnhance as { enhanced_essay?: string }).enhanced_essay);
                                    const blob = new Blob([text], { type: 'text/plain' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `enhanced_essay_${new Date().toISOString().slice(0, 10)}.txt`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                  }}
                                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border/60 bg-card text-foreground text-sm font-medium hover:bg-muted/50"
                                >
                                  Tải essay đã cải thiện
                                </button>
                              </div>
                            </>
                          )}
                          <div className="pt-4 border-t border-border/60 flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Đánh giá:</span>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button key={n} type="button" onClick={() => saveEssayRating('enhance', n)} className="p-0.5 rounded hover:bg-muted/50">
                                <Star className={`h-5 w-5 ${essayEnhanceRating != null && n <= essayEnhanceRating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
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
