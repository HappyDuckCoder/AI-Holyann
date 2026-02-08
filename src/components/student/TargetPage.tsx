'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  MapPin,
  Star,
  Target,
  Shield,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  ExternalLink,
  Award,
  Calendar,
  ListTodo,
  Flag,
  FileText,
  DollarSign,
} from 'lucide-react';

type UniversityFromDb = {
  id: number;
  name: string;
  country: string | null;
  state: string | null;
  current_ranking: number | null;
  website_url: string | null;
  logo_url: string | null;
  essay_requirements: string | null;
  scholarship_info: unknown;
};

type UniRecItem = {
  id: number;
  name: string;
  country?: string;
  state?: string;
  ranking?: number;
  match_score?: number;
  match_reasons?: string[];
  website_url?: string;
  logo_url?: string;
  essay_requirements?: string;
  scholarship_info?: Record<string, unknown>;
};

type CategoryBlock = {
  count: number;
  description?: string;
  universities: UniRecItem[];
};

// Khớp response từ server-ai (feature3)
type RoadmapMonth = {
  month: number;
  month_name: string;
  focus_areas: string[];
  tasks: string[];
  goals: string[];
  priority?: string;
};
type KeyMilestone = { month: number; name: string; description?: string };
type Module3Response = {
  success: boolean;
  universities?: {
    REACH?: CategoryBlock;
    MATCH?: CategoryBlock;
    SAFETY?: CategoryBlock;
  };
  roadmap?: {
    start_date?: string;
    duration_months?: number;
    overall_goals?: string[];
    key_milestones?: KeyMilestone[];
    monthly_plans?: RoadmapMonth[];
  };
  summary?: {
    total_matched?: number;
    reach_count?: number;
    match_count?: number;
    safety_count?: number;
  };
  error?: string;
};

export default function TargetPage() {
  const [universities, setUniversities] = useState<UniversityFromDb[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [recommendation, setRecommendation] = useState<Module3Response | null>(null);
  const [loadingRec, setLoadingRec] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [recError, setRecError] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<'REACH' | 'MATCH' | 'SAFETY' | null>('REACH');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/universities')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success && Array.isArray(data.universities)) {
          setUniversities(data.universities);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingList(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/student/university-recommendation')
      .then((res) => res.json())
      .then((data: { success?: boolean; saved?: { summary?: unknown; roadmap?: unknown; universities?: unknown } | null }) => {
        if (cancelled || !data.success || !data.saved) return;
        const s = data.saved;
        setRecommendation({
          success: true,
          summary: (s.summary as Module3Response['summary']) ?? undefined,
          roadmap: (s.roadmap as Module3Response['roadmap']) ?? undefined,
          universities: (s.universities as Module3Response['universities']) ?? undefined,
        });
      })
      .finally(() => {
        if (!cancelled) setLoadingSaved(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchRecommendation = () => {
    setLoadingRec(true);
    setRecError(null);
    setRecommendation(null);
    fetch('/api/student/university-recommendation', { method: 'POST' })
      .then((res) => res.json())
      .then((data: Module3Response) => {
        setRecommendation(data);
        if (!data.success && data.error) setRecError(data.error);
      })
      .catch((err) => {
        setRecError(err?.message || 'Không thể tải gợi ý');
      })
      .finally(() => setLoadingRec(false));
  };

  const categories: Array<{ key: 'REACH' | 'MATCH' | 'SAFETY'; title: string; icon: typeof Star; borderClass: string; iconClass: string }> = [
    { key: 'REACH', title: 'Reach', icon: Star, borderClass: 'border-l-violet-500', iconClass: 'text-violet-600 dark:text-violet-400' },
    { key: 'MATCH', title: 'Match', icon: Target, borderClass: 'border-l-primary', iconClass: 'text-primary' },
    { key: 'SAFETY', title: 'Safety', icon: Shield, borderClass: 'border-l-emerald-500', iconClass: 'text-emerald-600 dark:text-emerald-400' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header - giống ProfileHeader */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Target
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Danh sách trường trong hệ thống và gợi ý trường phù hợp với profile (Module 3)
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 1. Danh sách trường trong DB - card giống profile */}
        <section className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border/60 flex items-center gap-2 bg-muted/30">
            <GraduationCap className="text-primary" size={18} />
            <h2 className="text-base font-semibold text-foreground">
              Danh sách trường trong hệ thống
            </h2>
          </div>
          <div className="p-0">
          {loadingList ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : universities.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Chưa có trường nào trong cơ sở dữ liệu.
            </div>
          ) : (
            <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border/60 bg-muted/30">
                    <tr>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">#</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trường</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quốc gia / Khu vực</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ranking</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Website</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {universities.map((u, i) => (
                      <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-3.5 text-sm text-muted-foreground">{i + 1}</td>
                        <td className="px-5 py-3.5">
                          <span className="font-medium text-foreground">{u.name}</span>
                          {u.state && (
                            <span className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <MapPin size={12} /> {u.state}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-foreground">{u.country ?? '—'}</td>
                        <td className="px-5 py-3.5 text-sm text-foreground">{u.current_ranking != null ? `#${u.current_ranking}` : '—'}</td>
                        <td className="px-5 py-3.5">
                          {u.website_url ? (
                            <a
                              href={u.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                              Link <ExternalLink size={14} />
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          )}
          </div>
        </section>

        {/* 2. Module 3: Gợi ý trường theo profile - card giống profile */}
        <section className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-muted/30">
            <div className="flex items-center gap-2">
              <Sparkles className="text-primary" size={18} />
              <h2 className="text-base font-semibold text-foreground">
                Gợi ý trường theo profile (Module 3)
              </h2>
            </div>
            <button
              type="button"
              onClick={fetchRecommendation}
              disabled={loadingRec}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {loadingRec ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loadingRec ? 'Đang xử lý...' : 'Lấy gợi ý trường'}
            </button>
          </div>
          <div className="p-5">
          <p className="text-sm text-muted-foreground mb-4">
            Dựa trên hồ sơ (Feature 1) và bài test MBTI, Grit, RIASEC (Feature 2), hệ thống gợi ý các trường phân loại Reach / Match / Safety và roadmap phát triển.
          </p>

          {loadingSaved && !recommendation && (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải gợi ý đã lưu...
            </div>
          )}

          {recError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive mb-4">
              {recError}
            </div>
          )}

          {recommendation && recommendation.success && (
            <div className="space-y-6">
              {/* Summary từ server-ai */}
              {recommendation.summary && (recommendation.summary.total_matched != null || recommendation.summary.reach_count != null) && (
                <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-border/60 bg-muted/30">
                    <h3 className="text-sm font-semibold text-foreground">Tổng quan gợi ý</h3>
                  </div>
                  <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {recommendation.summary.total_matched != null && (
                      <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-center">
                        <p className="text-2xl font-bold text-foreground">{recommendation.summary.total_matched}</p>
                        <p className="text-xs text-muted-foreground mt-1">Tổng trường khớp</p>
                      </div>
                    )}
                    {recommendation.summary.reach_count != null && (
                      <div className="rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/30 p-3 text-center">
                        <p className="text-2xl font-bold text-violet-700 dark:text-violet-300">{recommendation.summary.reach_count}</p>
                        <p className="text-xs text-muted-foreground mt-1">Reach</p>
                      </div>
                    )}
                    {recommendation.summary.match_count != null && (
                      <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-center">
                        <p className="text-2xl font-bold text-primary">{recommendation.summary.match_count}</p>
                        <p className="text-xs text-muted-foreground mt-1">Match</p>
                      </div>
                    )}
                    {recommendation.summary.safety_count != null && (
                      <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 p-3 text-center">
                        <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{recommendation.summary.safety_count}</p>
                        <p className="text-xs text-muted-foreground mt-1">Safety</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {recommendation.universities && categories.map(({ key, title, icon: Icon, borderClass, iconClass }) => {
                const block = recommendation.universities?.[key];
                const list = block?.universities ?? [];
                const isExpanded = expandedCategory === key;
                return (
                  <div
                    key={key}
                    className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden"
                  >
                    <button
                      type="button"
                      className={`w-full flex items-center justify-between h-16 px-5 border-b border-border/60 bg-muted/30 hover:bg-muted/50 transition-colors border-l-4 ${borderClass}`}
                      onClick={() => setExpandedCategory(isExpanded ? null : key)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-background border border-border/60 flex items-center justify-center ${iconClass}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-foreground">{title}</h3>
                          <p className="text-sm text-muted-foreground">{block?.description ?? `${list.length} trường`}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground bg-muted/80 px-3 py-1 rounded-full">{list.length} trường</span>
                      <span className="text-muted-foreground">{isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}</span>
                    </button>
                    {isExpanded && list.length > 0 && (
                      <div className="p-5 border-t border-border/60 bg-card">
                        <ul className="space-y-4">
                          {list.map((uni) => (
                            <li
                              key={uni.id}
                              className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                  <p className="font-semibold text-foreground">{uni.name}</p>
                                  <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                                    {uni.country && <span>{uni.country}</span>}
                                    {uni.ranking != null && <span>#Rank {uni.ranking}</span>}
                                    {uni.match_score != null && (
                                      <span className="inline-flex items-center gap-1">
                                        <Award size={12} /> Match {uni.match_score}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {uni.website_url && (
                                  <a
                                    href={uni.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline shrink-0"
                                  >
                                    Website <ExternalLink size={14} />
                                  </a>
                                )}
                              </div>
                              {uni.match_reasons && uni.match_reasons.length > 0 && (
                                <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
                                  {uni.match_reasons.map((r, i) => (
                                    <li key={i}>{r}</li>
                                  ))}
                                </ul>
                              )}
                              {uni.essay_requirements && (
                                <div className="flex gap-2 text-sm">
                                  <FileText className="text-primary shrink-0 mt-0.5" size={14} />
                                  <p className="text-muted-foreground"><span className="font-medium text-foreground">Yêu cầu luận:</span> {uni.essay_requirements}</p>
                                </div>
                              )}
                              {uni.scholarship_info && typeof uni.scholarship_info === 'object' && Object.keys(uni.scholarship_info as object).length > 0 && (
                                <div className="flex gap-2 text-sm">
                                  <DollarSign className="text-primary shrink-0 mt-0.5" size={14} />
                                  <div className="text-muted-foreground">
                                    <span className="font-medium text-foreground">Học bổng:</span>{' '}
                                    {typeof (uni.scholarship_info as Record<string, unknown>).amount_range === 'string'
                                      ? (uni.scholarship_info as Record<string, unknown>).amount_range as string
                                      : JSON.stringify(uni.scholarship_info)}
                                  </div>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Roadmap đầy đủ từ server-ai */}
              {recommendation.roadmap && (recommendation.roadmap.overall_goals?.length || recommendation.roadmap.key_milestones?.length || recommendation.roadmap.monthly_plans?.length) ? (
                <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
                  <div className="h-14 px-5 flex items-center justify-between border-b border-border/60 bg-muted/40">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground">Roadmap phát triển</h3>
                    </div>
                    {(recommendation.roadmap.start_date || recommendation.roadmap.duration_months) && (
                      <span className="text-sm text-muted-foreground">
                        {recommendation.roadmap.start_date && <span>Bắt đầu: {recommendation.roadmap.start_date}</span>}
                        {recommendation.roadmap.duration_months != null && (
                          <span>{recommendation.roadmap.start_date ? ' • ' : ''}{recommendation.roadmap.duration_months} tháng</span>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="p-5 border-t border-border/60 space-y-6">
                    {recommendation.roadmap.overall_goals && recommendation.roadmap.overall_goals.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                          <Flag size={16} className="text-primary" />
                          Mục tiêu tổng thể
                        </h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          {recommendation.roadmap.overall_goals.map((g, i) => (
                            <li key={i}>{g}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {recommendation.roadmap.key_milestones && recommendation.roadmap.key_milestones.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                          <Flag size={16} className="text-primary" />
                          Cột mốc quan trọng
                        </h4>
                        <ul className="space-y-3">
                          {recommendation.roadmap.key_milestones.map((m, i) => (
                            <li key={i} className="flex gap-3 rounded-lg bg-muted/40 p-3">
                              <span className="shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                                T{m.month}
                              </span>
                              <div>
                                <p className="font-medium text-foreground">{m.name}</p>
                                {m.description && <p className="text-sm text-muted-foreground mt-0.5">{m.description}</p>}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {recommendation.roadmap.monthly_plans && recommendation.roadmap.monthly_plans.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                          <ListTodo size={16} className="text-primary" />
                          Kế hoạch theo tháng
                        </h4>
                        <div className="space-y-3">
                          {recommendation.roadmap.monthly_plans.map((plan, i) => (
                            <details
                              key={i}
                              className="rounded-xl border border-border/60 bg-muted/20 overflow-hidden group"
                            >
                              <summary className="px-4 py-3 cursor-pointer list-none flex items-center justify-between gap-2 hover:bg-muted/30">
                                <span className="font-medium text-foreground">{plan.month_name}</span>
                                {plan.priority && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">{plan.priority}</span>
                                )}
                                <ChevronDown className="h-4 w-4 text-muted-foreground group-open:rotate-180 transition-transform" />
                              </summary>
                              <div className="px-4 pb-4 pt-1 space-y-3 border-t border-border/60">
                                {plan.focus_areas && plan.focus_areas.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Lĩnh vực tập trung</p>
                                    <ul className="text-sm text-foreground list-disc list-inside">{plan.focus_areas.map((f, j) => <li key={j}>{f}</li>)}</ul>
                                  </div>
                                )}
                                {plan.tasks && plan.tasks.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Nhiệm vụ</p>
                                    <ul className="text-sm text-muted-foreground list-disc list-inside">{plan.tasks.map((t, j) => <li key={j}>{t}</li>)}</ul>
                                  </div>
                                )}
                                {plan.goals && plan.goals.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Mục tiêu tháng</p>
                                    <ul className="text-sm text-muted-foreground list-disc list-inside">{plan.goals.map((g, j) => <li key={j}>{g}</li>)}</ul>
                                  </div>
                                )}
                              </div>
                            </details>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}
          </div>
        </section>
      </div>
    </div>
  );
}
