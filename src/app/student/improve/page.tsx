'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { StudentPageContainer } from '@/components/student';
import { FileText, PenLine, Upload, Bold, Italic, List, ListOrdered, AlignLeft, Loader2, ExternalLink, BarChart3, Wand2, UserCircle, MessageSquare, Save, Star, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { sanitizeText } from '@/lib/utils/validation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TabId, CvDoc, EssayComment } from './types';
import { ESSAY_LIMIT_WORDS, ESSAY_MIN_WORDS } from './types';
import { safeText } from './utils';
import {
  FormattedText,
  ModalSection,
  CollapsibleSection,
  ImproveDetailModal,
  ImproveBanner,
  ProfileTab,
} from './components';

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

  const [detailModal, setDetailModal] = useState<{ title: string; content: React.ReactNode } | null>(null);

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
      <ImproveDetailModal
        open={!!detailModal}
        onOpenChange={(open) => !open && setDetailModal(null)}
        title={detailModal?.title ?? ''}
        content={detailModal?.content ?? null}
      />

      <div className="max-w-6xl mx-auto pb-8">
        <ImproveBanner />

        <Card className="rounded-2xl border border-border shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border bg-gradient-to-r from-amber-500/10 via-primary/10 to-orange-500/10 px-6 py-0">
            <div className="flex border-b-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors -mb-px ${
                    activeTab === tab.id
                      ? 'text-primary border-b-2 border-primary bg-transparent'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-8 min-h-[520px]">
            {activeTab === 'profile' && (
              <ProfileTab
                profileData={profileData}
                profileDataLoading={profileDataLoading}
                resultsLoading={resultsLoading}
                profileAnalysis={profileAnalysis}
                profileEnhance={profileEnhance}
                profileAnalysisLoading={profileAnalysisLoading}
                profileEnhanceLoading={profileEnhanceLoading}
                analysisRating={analysisRating}
                enhanceRating={enhanceRating}
                onAnalysis={handleProfileAnalysis}
                onEnhance={handleProfileEnhance}
                setDetailModal={setDetailModal}
                saveRating={saveRating}
              />
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
                {cvAnalysis && typeof cvAnalysis === 'object' && (() => {
                  const overall = (cvAnalysis as { overall?: Record<string, unknown> }).overall;
                  const sections = (cvAnalysis as { sections?: Record<string, Record<string, unknown>> }).sections;
                  const sectionNames: Record<string, string> = { introduction: 'Giới thiệu', study: 'Học vấn', skills: 'Kỹ năng', information: 'Thông tin cá nhân', project: 'Dự án', experience: 'Kinh nghiệm' };
                  const openCvDetail = () => {
                    setDetailModal({
                      title: 'Kết quả phân tích CV',
                      content: (
                        <div className="space-y-4">
                          {overall && (
                            <>
                              <ModalSection title="Tổng quát" accent="violet">
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-500/10 p-3">
                                    <p className="text-xs text-muted-foreground">Điểm</p>
                                    <p className="text-lg font-semibold text-violet-600 dark:text-violet-400">{String(overall.overall_score ?? '—')}/10</p>
                                  </div>
                                  {overall.personal_fit_score != null && (
                                    <div className="rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-500/10 p-3">
                                      <p className="text-xs text-muted-foreground">Phù hợp</p>
                                      <p className="text-lg font-semibold text-violet-600 dark:text-violet-400">{Number(overall.personal_fit_score).toFixed(1)}/10</p>
                                    </div>
                                  )}
                                </div>
                              </ModalSection>
                              {(safeText(overall.feedback) || safeText(overall.summary) || safeText(overall.personal_fit_feedback)) && (
                                <CollapsibleSection title="Nhận xét & tóm tắt" summary="Bấm để xem" accent="violet">
                                  {safeText(overall.feedback) && <FormattedText text={safeText(overall.feedback)} />}
                                  {safeText(overall.personal_fit_feedback) && <p className="text-xs text-muted-foreground mt-2">Phù hợp: {safeText(overall.personal_fit_feedback)}</p>}
                                  {safeText(overall.summary) && <div className="mt-3 rounded-lg border border-border/40 bg-background/60 p-3"><FormattedText text={safeText(overall.summary)} /></div>}
                                </CollapsibleSection>
                              )}
                            </>
                          )}
                          {sections && Object.keys(sections).length > 0 && (
                            <CollapsibleSection title="Phân tích từng phần" summary={`${Object.keys(sections).length} phần · bảng điểm`} accent="emerald">
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                  <thead>
                                    <tr className="border-b border-border/60">
                                      <th className="py-2 pr-4 text-muted-foreground font-medium">Phần</th>
                                      <th className="py-2 text-emerald-600 dark:text-emerald-400 font-medium">Điểm</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {Object.entries(sections).map(([key, section]) => (
                                      <tr key={key} className="border-b border-border/60">
                                        <td className="py-2 pr-4 text-foreground">{sectionNames[key] || key}</td>
                                        <td className="py-2 text-emerald-600 dark:text-emerald-400">{section?.score != null ? Number(section.score).toFixed(1) : '—'}/10</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              <div className="mt-4 space-y-2">
                                {Object.entries(sections).map(([key, section]) => {
                                  const feedback = safeText(section?.feedback);
                                  const strengths = Array.isArray(section?.strengths) ? (section.strengths as unknown[]) : [];
                                  const weaknesses = Array.isArray(section?.weaknesses) ? (section.weaknesses as unknown[]) : [];
                                  const suggestions = Array.isArray(section?.suggestions) ? (section.suggestions as unknown[]) : [];
                                  return (
                                    <details key={key} className="group rounded-lg border border-border/40 bg-background/60 overflow-hidden mt-2">
                                      <summary className="p-3 cursor-pointer font-medium text-foreground list-none flex items-center gap-2">
                                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" /> {sectionNames[key] || key} — <span className="text-emerald-600 dark:text-emerald-400">{section?.score != null ? Number(section.score).toFixed(1) : '—'}/10</span>
                                      </summary>
                                      <div className="px-3 pb-3 pt-0 space-y-2 text-sm">
                                        {feedback && <FormattedText text={feedback} />}
                                        {strengths.length > 0 && <p className="text-emerald-700 dark:text-emerald-300">Điểm mạnh: {strengths.map((s: unknown) => safeText(s)).join(' • ')}</p>}
                                        {weaknesses.length > 0 && <p className="text-rose-600 dark:text-rose-400">Điểm yếu: {weaknesses.map((w: unknown) => safeText(w)).join(' • ')}</p>}
                                        {suggestions.length > 0 && <p className="text-amber-600 dark:text-amber-400">Gợi ý: {suggestions.map((g: unknown) => safeText(g)).join(' • ')}</p>}
                                      </div>
                                    </details>
                                  );
                                })}
                              </div>
                            </CollapsibleSection>
                          )}
                          {overall && ((Array.isArray(overall.quantification_suggestions) && overall.quantification_suggestions.length > 0) || (Array.isArray(overall.grammar_suggestions) && overall.grammar_suggestions.length > 0) || (Array.isArray(overall.priority_improvements) && overall.priority_improvements.length > 0)) ? (
                            <CollapsibleSection title="Gợi ý cải thiện" summary="Định lượng, ngữ pháp, ưu tiên" accent="amber">
                              {Array.isArray(overall.quantification_suggestions) && (overall.quantification_suggestions as unknown[]).length > 0 && (
                                <div className="mb-3">
                                  <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">Định lượng hóa</p>
                                  <ul className="list-disc list-inside text-sm space-y-0.5">
                                    {(overall.quantification_suggestions as unknown[]).map((q: unknown, i: number) => <li key={i}>{safeText(q)}</li>)}
                                  </ul>
                                </div>
                              )}
                              {Array.isArray(overall.grammar_suggestions) && (overall.grammar_suggestions as unknown[]).length > 0 && (
                                <div className="mb-3">
                                  <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">Ngữ pháp</p>
                                  <ul className="list-disc list-inside text-sm space-y-0.5">
                                    {(overall.grammar_suggestions as unknown[]).map((g: unknown, i: number) => <li key={i}>{safeText(g)}</li>)}
                                  </ul>
                                </div>
                              )}
                              {Array.isArray(overall.priority_improvements) && (overall.priority_improvements as unknown[]).length > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">Ưu tiên cải thiện</p>
                                  <ul className="list-disc list-inside text-sm space-y-0.5">
                                    {(overall.priority_improvements as unknown[]).map((p: unknown, i: number) => <li key={i}>{safeText(p)}</li>)}
                                  </ul>
                                </div>
                              )}
                            </CollapsibleSection>
                          ) : null}
                        </div>
                      ),
                    });
                  };
                  const feedbackLine = overall ? safeText(overall.feedback) : '';
                  return (
                    <Card className="rounded-2xl border border-border shadow-sm overflow-hidden mt-6">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-4">
                          <h3 className="text-base font-semibold text-foreground">Kết quả phân tích CV</h3>
                          <button type="button" onClick={openCvDetail} className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
                            Xem chi tiết <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-4">
                        {overall && (
                          <>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                                <p className="text-xs text-muted-foreground">Điểm tổng quát</p>
                                <p className="text-lg font-semibold text-primary">{String(overall.overall_score ?? '—')}/10</p>
                              </div>
                              {overall.personal_fit_score != null && (
                                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                                  <p className="text-xs text-muted-foreground">Phù hợp bản thân</p>
                                  <p className="text-lg font-semibold text-primary">{Number(overall.personal_fit_score).toFixed(1)}/10</p>
                                </div>
                              )}
                            </div>
                            {feedbackLine && <p className="text-sm text-muted-foreground line-clamp-2">{feedbackLine}</p>}
                          </>
                        )}
                        <div className="pt-4 border-t border-border/60 flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Đánh giá:</span>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button key={n} type="button" onClick={() => saveCvRating('analysis', n)} className="p-0.5 rounded hover:bg-muted/50">
                              <Star className={`h-5 w-5 ${cvAnalysisRating != null && n <= cvAnalysisRating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}
                {cvEnhance && typeof cvEnhance === 'object' && (() => {
                  const overall = (cvEnhance as { overall?: Record<string, unknown> }).overall;
                  const openCvEnhanceDetail = () => {
                    setDetailModal({
                      title: 'Đề xuất cải thiện CV',
                      content: (
                        <div className="space-y-4">
                          {overall && (
                            <>
                              {safeText(overall.feedback) && (
                                <CollapsibleSection title="Nhận xét" summary="Bấm để xem" accent="sky">
                                  <FormattedText text={safeText(overall.feedback)} />
                                </CollapsibleSection>
                              )}
                              {Array.isArray(overall.quantification_suggestions) && (overall.quantification_suggestions as unknown[]).length > 0 && (
                                <CollapsibleSection title="Gợi ý định lượng hóa" summary={`${(overall.quantification_suggestions as unknown[]).length} mục`} accent="amber">
                                  <ul className="list-disc list-inside text-sm space-y-0.5">
                                    {(overall.quantification_suggestions as unknown[]).map((q: unknown, i: number) => <li key={i}>{safeText(q)}</li>)}
                                  </ul>
                                </CollapsibleSection>
                              )}
                              {Array.isArray(overall.grammar_suggestions) && (overall.grammar_suggestions as unknown[]).length > 0 && (
                                <CollapsibleSection title="Gợi ý ngữ pháp" summary={`${(overall.grammar_suggestions as unknown[]).length} mục`} accent="violet">
                                  <ul className="list-disc list-inside text-sm space-y-0.5">
                                    {(overall.grammar_suggestions as unknown[]).map((g: unknown, i: number) => <li key={i}>{safeText(g)}</li>)}
                                  </ul>
                                </CollapsibleSection>
                              )}
                            </>
                          )}
                        </div>
                      ),
                    });
                  };
                  const feedbackLine = overall ? safeText(overall.feedback) : '';
                  return (
                    <Card className="rounded-2xl border border-border shadow-sm overflow-hidden mt-6">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-4">
                          <h3 className="text-base font-semibold text-foreground">Đề xuất cải thiện CV</h3>
                          <button type="button" onClick={openCvEnhanceDetail} className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
                            Xem chi tiết <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-4">
                        {feedbackLine && <p className="text-sm text-muted-foreground line-clamp-2">{feedbackLine}</p>}
                        <div className="pt-4 border-t border-border/60 flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Đánh giá:</span>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button key={n} type="button" onClick={() => saveCvRating('enhance', n)} className="p-0.5 rounded hover:bg-muted/50">
                              <Star className={`h-5 w-5 ${cvEnhanceRating != null && n <= cvEnhanceRating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}
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
                      {essayAnalysis && typeof essayAnalysis === 'object' && (() => {
                        const analysis = (essayAnalysis as { analysis?: Record<string, unknown> }).analysis;
                        const overall = analysis?.overall as Record<string, unknown> | undefined;
                        const assessment = analysis?.overall_assessment as Record<string, unknown> | undefined;
                        const aspectNames: Record<string, string> = { content: 'Nội dung', structure: 'Cấu trúc', language: 'Ngôn ngữ', grammar: 'Ngữ pháp', personal_fit: 'Phù hợp' };
                        const weakPoints = (essayAnalysis as { weak_points?: Record<string, unknown>[] }).weak_points ?? [];
                        const openEssayAnalysisDetail = () => {
                          setDetailModal({
                            title: 'Kết quả phân tích essay',
                            content: (
                              <div className="space-y-4">
                                {overall && (
                                  <ModalSection title="Điểm từng khía cạnh" accent="violet">
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                      {['content', 'structure', 'language', 'grammar', 'personal_fit'].map((key) => {
                                        const val = (overall[key] as Record<string, unknown>)?.score ?? (overall.aspect_scores as Record<string, unknown>)?.[key];
                                        const num = typeof val === 'number' ? val : null;
                                        return (
                                          <div key={key} className="rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-500/10 p-2">
                                            <p className="text-xs text-muted-foreground">{aspectNames[key] || key}</p>
                                            <p className="font-semibold text-violet-600 dark:text-violet-400">{num != null ? Number(num).toFixed(1) : '—'}/10</p>
                                          </div>
                                        );
                                      })}
                                      {overall.overall_score != null && (
                                        <div className="rounded-lg border-2 border-violet-400 dark:border-violet-500 bg-violet-500/20 p-2">
                                          <p className="text-xs text-muted-foreground">Tổng</p>
                                          <p className="font-semibold text-violet-600 dark:text-violet-400">{Number(overall.overall_score).toFixed(1)}/10</p>
                                        </div>
                                      )}
                                    </div>
                                  </ModalSection>
                                )}
                                {assessment && (safeText(assessment.summary) || safeText(assessment.essay_level_feedback) || (assessment.strengths_from_essay as unknown[])?.length || (assessment.weaknesses_from_essay as unknown[])?.length || (assessment.priority_improvements as unknown[])?.length) && (
                                  <CollapsibleSection title="Đánh giá toàn bài" summary="Tóm tắt, điểm mạnh/yếu" accent="emerald">
                                    <div className="space-y-3 text-sm">
                                      {safeText(assessment.summary) && <FormattedText text={safeText(assessment.summary)} />}
                                      {safeText(assessment.essay_level_feedback) && <FormattedText text={safeText(assessment.essay_level_feedback)} />}
                                      {Array.isArray(assessment.strengths_from_essay) && (assessment.strengths_from_essay as unknown[]).length > 0 && (
                                        <div>
                                          <p className="font-medium text-emerald-700 dark:text-emerald-300 mb-1">Điểm mạnh</p>
                                          <ul className="list-disc list-inside space-y-0.5">
                                            {(assessment.strengths_from_essay as unknown[]).map((s: unknown, i: number) => <li key={i}>{safeText(s)}</li>)}
                                          </ul>
                                        </div>
                                      )}
                                      {Array.isArray(assessment.weaknesses_from_essay) && (assessment.weaknesses_from_essay as unknown[]).length > 0 && (
                                        <div>
                                          <p className="font-medium text-rose-600 dark:text-rose-400 mb-1">Điểm yếu</p>
                                          <ul className="list-disc list-inside space-y-0.5">
                                            {(assessment.weaknesses_from_essay as unknown[]).map((w: unknown, i: number) => <li key={i}>{safeText(w)}</li>)}
                                          </ul>
                                        </div>
                                      )}
                                      {Array.isArray(assessment.priority_improvements) && (assessment.priority_improvements as unknown[]).length > 0 && (
                                        <div>
                                          <p className="font-medium text-amber-600 dark:text-amber-400 mb-1">Ưu tiên cải thiện</p>
                                          <ol className="list-decimal list-inside space-y-0.5">
                                            {(assessment.priority_improvements as unknown[]).map((imp: unknown, i: number) => (
                                              <li key={i}>{safeText(typeof imp === 'object' && imp && 'action' in imp ? (imp as { action?: unknown }).action : imp)}</li>
                                            ))}
                                          </ol>
                                        </div>
                                      )}
                                      {safeText(assessment.personal_fit_feedback) && <p className="text-muted-foreground">Phù hợp: {safeText(assessment.personal_fit_feedback)}</p>}
                                    </div>
                                  </CollapsibleSection>
                                )}
                                {Array.isArray(weakPoints) && weakPoints.length > 0 && (
                                  <CollapsibleSection title="Điểm yếu theo đoạn" summary={`${weakPoints.length} đoạn`} accent="rose">
                                    <ul className="space-y-2 text-sm">
                                      {weakPoints.map((wp: Record<string, unknown>, i: number) => {
                                        const paraIdx = wp.paragraph_index as number | undefined;
                                        const aspectName = aspectNames[String(wp.aspect || '')] || String(wp.aspect || '');
                                        const issue = safeText(wp.issue);
                                        const score = wp.score != null ? Number(wp.score).toFixed(1) : '—';
                                        const fix = safeText(wp.suggested_fix);
                                        return (
                                          <li key={i} className="rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-500/10 p-3">
                                            <p>{paraIdx != null ? `Đoạn ${paraIdx + 1} — ` : ''}<span className="font-medium text-rose-700 dark:text-rose-300">{aspectName}</span>: {issue || 'Cần cải thiện'} ({score})</p>
                                            {fix ? <p className="text-muted-foreground text-xs mt-1">Gợi ý: {fix}</p> : null}
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </CollapsibleSection>
                                )}
                              </div>
                            ),
                          });
                        };
                        const summaryLine = assessment ? safeText(assessment.summary) : '';
                        return (
                          <Card className="rounded-2xl border border-border shadow-sm overflow-hidden mt-6">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between gap-4">
                                <h3 className="text-base font-semibold text-foreground">Kết quả phân tích essay</h3>
                                <button type="button" onClick={openEssayAnalysisDetail} className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
                                  Xem chi tiết <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-4">
                              {overall && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {['content', 'structure', 'language', 'grammar'].map((key) => {
                                    const val = (overall[key] as Record<string, unknown>)?.score ?? (overall.aspect_scores as Record<string, unknown>)?.[key];
                                    const num = typeof val === 'number' ? val : null;
                                    return (
                                      <div key={key} className="rounded-lg border border-border/60 bg-muted/20 p-2">
                                        <p className="text-xs text-muted-foreground">{aspectNames[key] || key}</p>
                                        <p className="font-semibold text-primary">{num != null ? Number(num).toFixed(1) : '—'}/10</p>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                              {summaryLine && <p className="text-sm text-muted-foreground line-clamp-2">{summaryLine}</p>}
                              <div className="pt-4 border-t border-border/60 flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Đánh giá:</span>
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <button key={n} type="button" onClick={() => saveEssayRating('analysis', n)} className="p-0.5 rounded hover:bg-muted/50">
                                    <Star className={`h-5 w-5 ${essayAnalysisRating != null && n <= essayAnalysisRating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                                  </button>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })()}
                      {essayEnhance && typeof essayEnhance === 'object' && (() => {
                        const enh = essayEnhance as {
                          enhanced_essay?: string; original_essay?: string;
                          statistics?: { original_words?: number; enhanced_words?: number; limit_words?: number };
                          changes?: unknown[]; changes_log?: unknown[];
                          analysis?: { before?: Record<string, unknown>; after?: Record<string, unknown> };
                        };
                        const stats = enh.statistics ?? {};
                        const origWords = stats.original_words ?? (String(enh.original_essay || essayContent).split(/\s+/).filter(Boolean).length);
                        const enhWords = stats.enhanced_words ?? (String(enh.enhanced_essay).split(/\s+/).filter(Boolean).length);
                        const changesList = Array.isArray(enh.changes) ? enh.changes : Array.isArray(enh.changes_log) ? enh.changes_log : [];
                        const analysis = enh.analysis;
                        const afterData = analysis?.after;
                        const assessment = (afterData?.overall_assessment as Record<string, unknown>) ?? {};
                        const aspectNames: Record<string, string> = { content: 'Nội dung', structure: 'Cấu trúc', language: 'Ngôn ngữ', grammar: 'Ngữ pháp' };
                        const openEssayEnhanceDetail = () => {
                          setDetailModal({
                            title: 'Essay đã được cải thiện',
                            content: (
                              <div className="space-y-4">
                                {analysis?.before != null && analysis?.after != null && (
                                  <ModalSection title="So sánh điểm trước / sau" accent="amber">
                                    {(() => {
                                      const beforeOverall = (analysis.before as { overall?: Record<string, unknown> })?.overall ?? analysis.before ?? {};
                                      const afterOverall = (analysis.after as { overall?: Record<string, unknown> })?.overall ?? analysis.after ?? {};
                                      const aspects = ['content', 'structure', 'language', 'grammar'];
                                      return (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                          {aspects.map((aspect) => {
                                            const afterScore = typeof (afterOverall as Record<string, unknown>)[aspect] === 'object' && (afterOverall as Record<string, unknown>)[aspect] != null ? (afterOverall as Record<string, Record<string, unknown>>)[aspect]?.score : null;
                                            const beforeScore = typeof (beforeOverall as Record<string, unknown>)[aspect] === 'object' && (beforeOverall as Record<string, unknown>)[aspect] != null ? (beforeOverall as Record<string, Record<string, unknown>>)[aspect]?.score : null;
                                            const after = afterScore != null ? Number(afterScore) : 0;
                                            const orig = beforeScore != null ? Number(beforeScore) : 0;
                                            const delta = after - orig;
                                            return (
                                              <div key={aspect} className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-500/10 p-2">
                                                <p className="text-xs text-muted-foreground">{aspectNames[aspect] || aspect}</p>
                                                <p className="font-semibold text-amber-700 dark:text-amber-300">{after.toFixed(1)}/10 <span className="text-xs">{delta >= 0 ? '+' : ''}{delta.toFixed(1)}</span></p>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      );
                                    })()}
                                  </ModalSection>
                                )}
                                <CollapsibleSection title="So sánh essay (gốc vs đã cải thiện)" summary={`${origWords} → ${enhWords} từ`} accent="sky">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-xs font-medium text-sky-700 dark:text-sky-300 mb-1">Gốc</p>
                                      <ScrollArea className="h-40 rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-500/10 p-3">
                                        <FormattedText text={safeText(enh.original_essay || essayContent)} className="text-sm" />
                                      </ScrollArea>
                                      <p className="text-xs text-muted-foreground mt-1">{origWords} từ</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-1">Đã cải thiện</p>
                                      <ScrollArea className="h-40 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-500/10 p-3">
                                        <FormattedText text={safeText(enh.enhanced_essay)} className="text-sm" />
                                      </ScrollArea>
                                      <p className="text-xs text-muted-foreground mt-1">{enhWords} từ</p>
                                    </div>
                                  </div>
                                </CollapsibleSection>
                                {changesList.length > 0 && (
                                  <CollapsibleSection title="Các thay đổi theo đoạn" summary={`${changesList.length} mục`} accent="emerald">
                                    <div className="space-y-2">
                                      {(changesList as Record<string, unknown>[]).map((change: Record<string, unknown>, i: number) => {
                                        const paraIdx = change?.paragraph_index;
                                        const aspects = Array.isArray(change?.changes) ? (change.changes as Record<string, unknown>[]).map((c: Record<string, unknown>) => safeText(c?.aspect)).filter(Boolean) : [];
                                        const original = safeText(change?.original);
                                        const enhanced = safeText(change?.enhanced);
                                        if (paraIdx != null) {
                                          return (
                                            <details key={i} className="group rounded-lg border border-border/40 bg-background/60 overflow-hidden">
                                              <summary className="p-3 cursor-pointer font-medium text-foreground list-none flex items-center gap-2">
                                                <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" /> Đoạn {Number(paraIdx) + 1}
                                              </summary>
                                              <div className="px-3 pb-3 pt-0 space-y-2 text-sm">
                                                {aspects.length > 0 && <p className="text-emerald-700 dark:text-emerald-300 text-xs">{aspects.join(', ')}</p>}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                  <div><p className="text-xs text-muted-foreground mb-1">Trước</p><p className="whitespace-pre-wrap rounded border p-2 bg-muted/20 text-xs max-h-24 overflow-y-auto">{original || '—'}</p></div>
                                                  <div><p className="text-xs text-muted-foreground mb-1">Sau</p><p className="whitespace-pre-wrap rounded border p-2 bg-emerald-500/10 text-xs max-h-24 overflow-y-auto">{enhanced || '—'}</p></div>
                                                </div>
                                              </div>
                                            </details>
                                          );
                                        }
                                        return (
                                          <details key={i} className="rounded-lg border border-border/40 bg-background/60 overflow-hidden">
                                            <summary className="p-3 cursor-pointer font-medium text-foreground list-none">Cải thiện toàn diện</summary>
                                            <div className="px-3 pb-3 pt-0 text-sm text-muted-foreground">Đã cải thiện toàn bộ essay.</div>
                                          </details>
                                        );
                                      })}
                                    </div>
                                  </CollapsibleSection>
                                )}
                                {(safeText(assessment?.summary) || safeText(assessment?.essay_level_feedback)) && (
                                  <CollapsibleSection title="Đánh giá sau cải thiện" summary="Bấm để xem" accent="violet">
                                    {safeText(assessment.summary) && <FormattedText text={safeText(assessment.summary)} />}
                                    {safeText(assessment.essay_level_feedback) && <FormattedText text={safeText(assessment.essay_level_feedback)} />}
                                  </CollapsibleSection>
                                )}
                              </div>
                            ),
                          });
                        };
                        if (!enh.enhanced_essay) return null;
                        return (
                          <Card className="rounded-2xl border border-border shadow-sm overflow-hidden mt-6">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between gap-4">
                                <h3 className="text-base font-semibold text-foreground">Essay đã được cải thiện</h3>
                                <button type="button" onClick={openEssayEnhanceDetail} className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
                                  Xem chi tiết <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-4">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                                  <p className="text-xs text-muted-foreground">Từ gốc</p>
                                  <p className="text-lg font-semibold text-foreground">{origWords}</p>
                                </div>
                                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                                  <p className="text-xs text-muted-foreground">Từ sau</p>
                                  <p className="text-lg font-semibold text-foreground">{enhWords}</p>
                                </div>
                                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                                  <p className="text-xs text-muted-foreground">Chênh lệch</p>
                                  <p className="text-lg font-semibold text-primary">{enhWords - origWords >= 0 ? '+' : ''}{enhWords - origWords}</p>
                                </div>
                                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                                  <p className="text-xs text-muted-foreground">Giới hạn</p>
                                  <p className="text-sm font-medium">
                                    {stats.limit_words != null && enhWords <= stats.limit_words ? '✅ Trong giới hạn' : stats.limit_words != null ? '⚠️ Vượt' : '—'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 pt-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const text = safeText(enh.enhanced_essay);
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
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">Đánh giá:</span>
                                  {[1, 2, 3, 4, 5].map((n) => (
                                    <button key={n} type="button" onClick={() => saveEssayRating('enhance', n)} className="p-0.5 rounded hover:bg-muted/50">
                                      <Star className={`h-5 w-5 ${essayEnhanceRating != null && n <= essayEnhanceRating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })()}
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
          </CardContent>
        </Card>
      </div>
    </StudentPageContainer>
  );
}
