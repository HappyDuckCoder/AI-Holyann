'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star,
  Target,
  Shield,
  Loader2,
  Sparkles,
  ExternalLink,
  Award,
  FileText,
  DollarSign,
  MapPin,
  Calendar,
} from 'lucide-react';
import { TargetSkeleton } from './TargetSkeleton';

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

const CATEGORIES: Array<{ key: 'REACH' | 'MATCH' | 'SAFETY'; title: string; icon: typeof Star; color: string }> = [
  { key: 'REACH', title: 'Reach', icon: Star, color: 'violet' },
  { key: 'MATCH', title: 'Match', icon: Target, color: 'primary' },
  { key: 'SAFETY', title: 'Safety', icon: Shield, color: 'emerald' },
];

export default function TargetPage() {
  const [recommendation, setRecommendation] = useState<Module3Response | null>(null);
  const [loadingRec, setLoadingRec] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [recError, setRecError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'REACH' | 'MATCH' | 'SAFETY'>('MATCH');

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

  const roadmap = recommendation?.roadmap;
  const hasRoadmap = roadmap && (roadmap.overall_goals?.length || roadmap.key_milestones?.length || roadmap.monthly_plans?.length);

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      aria-label="Trang Target - gợi ý trường và roadmap"
    >
      {/* Hero - match dashboard style */}
      <header
        className="relative mb-6 overflow-hidden text-white"
        style={{
          background:
            'linear-gradient(135deg, var(--primary) 0%, var(--brand-deep) 50%, var(--brand-cyan) 100%)',
        }}
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 right-1/4 h-40 w-80 rounded-full bg-(--brand-cyan)/20 blur-2xl" />

        {/* Subtle grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative px-6 py-8 sm:px-10 sm:py-10">
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.22em] text-white/70">
            Mục tiêu du học
          </p>
          <h1 className="mt-2 font-heading text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
            Gợi ý trường & roadmap
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
            Khám phá danh sách trường QS và gợi ý Reach / Match / Safety được cá nhân hóa theo
            hồ sơ của bạn.
          </p>
        </div>
      </header>

      <div className="w-full px-4 py-6 sm:px-6 md:px-8">
        {/* Layout: 2 columns on large - left: CTA + stats, right: Gợi ý + tabs */}
        {loadingSaved && !recommendation && !recError ? (
          <TargetSkeleton />
        ) : (
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left column: Khám phá 100+ trường + Summary stats */}
            <aside className="space-y-4 lg:col-span-4">
            <Link
              href="/universities"
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-primary/5"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-3xl text-primary">🌍</span>
              <div className="min-w-0">
                <span className="font-semibold text-foreground">100+ trường hàng đầu</span>
                <p className="text-xs text-muted-foreground mt-0.5">QS World University Rankings 2024</p>
                <span className="mt-2 inline-block text-xs font-medium text-primary">Xem danh sách →</span>
              </div>
            </Link>

            {recommendation?.summary && (recommendation.summary.total_matched != null || recommendation.summary.reach_count != null) && (
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tổng quan gợi ý</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {recommendation.summary.total_matched != null && (
                    <div className="rounded-xl bg-muted/50 p-3 text-center">
                      <span className="text-xl font-bold text-foreground">{recommendation.summary.total_matched}</span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Tổng trường</p>
                    </div>
                  )}
                  {recommendation.summary.reach_count != null && (
                    <div className="rounded-xl bg-violet-500/15 p-3 text-center dark:bg-violet-950/40">
                      <span className="text-xl font-bold text-violet-700 dark:text-violet-300">{recommendation.summary.reach_count}</span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Reach</p>
                    </div>
                  )}
                  {recommendation.summary.match_count != null && (
                    <div className="rounded-xl bg-primary/15 p-3 text-center">
                      <span className="text-xl font-bold text-primary">{recommendation.summary.match_count}</span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Match</p>
                    </div>
                  )}
                  {recommendation.summary.safety_count != null && (
                    <div className="rounded-xl bg-emerald-500/15 p-3 text-center dark:bg-emerald-950/40">
                      <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{recommendation.summary.safety_count}</span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Safety</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            </aside>

            {/* Right column: Gợi ý trường (Module 3) - trigger + tabs + list */}
            <div className="lg:col-span-8">
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div>
                  <h2 className="font-semibold text-foreground">Gợi ý trường theo profile</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Reach / Match / Safety từ MBTI, Grit, RIASEC</p>
                </div>
                <button
                  type="button"
                  onClick={fetchRecommendation}
                  disabled={loadingRec}
                  className="shrink-0 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 inline-flex items-center gap-2"
                >
                  {loadingRec ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {loadingRec ? 'Đang xử lý...' : 'Lấy gợi ý trường'}
                </button>
              </div>

              <div className="p-4 sm:p-5">
                {loadingSaved && !recommendation && (
                  <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground justify-center">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Đang tải gợi ý đã lưu...
                  </div>
                )}

                {recError && (
                  <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    {recError}
                  </div>
                )}

                {recommendation?.universities && (
                  <>
                    {/* Tabs: Reach | Match | Safety */}
                    <div className="flex gap-2 rounded-xl bg-muted/40 p-1.5">
                      {CATEGORIES.map(({ key, title, icon: Icon, color }) => {
                        const block = recommendation.universities?.[key];
                        const count = block?.universities?.length ?? 0;
                        const isActive = activeCategory === key;
                        const colorClass =
                          color === 'violet'
                            ? 'bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-500/30'
                            : color === 'primary'
                              ? 'bg-primary/20 text-primary border-primary/30'
                              : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setActiveCategory(key)}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                              isActive ? colorClass : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            {title}
                            <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs dark:bg-white/10">{count}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* List for active category */}
                    <div className="mt-4 space-y-3">
                      {(recommendation.universities[activeCategory]?.universities ?? []).map((uni) => (
                        <div
                          key={uni.id}
                          className="rounded-xl border border-border bg-muted/20 p-4 transition-colors hover:bg-muted/30"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-foreground">{uni.name}</p>
                              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                {uni.country && (
                                  <span className="inline-flex items-center gap-1">
                                    <MapPin size={10} /> {uni.country}
                                  </span>
                                )}
                                {uni.ranking != null && <span>#Rank {uni.ranking}</span>}
                                {uni.match_score != null && (
                                  <span className="inline-flex items-center gap-1">
                                    <Award size={10} /> Match {uni.match_score}
                                  </span>
                                )}
                              </div>
                            </div>
                            {uni.website_url && (
                              <a
                                href={uni.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 text-xs text-primary hover:underline inline-flex items-center gap-1"
                              >
                                Website <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                          {uni.match_reasons && uni.match_reasons.length > 0 && (
                            <ul className="mt-2 text-xs text-muted-foreground list-disc list-inside space-y-0.5">
                              {uni.match_reasons.slice(0, 3).map((r, i) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          )}
                          {uni.essay_requirements && (
                            <div className="mt-2 flex gap-2 text-xs">
                              <FileText className="shrink-0 text-primary" size={12} />
                              <span className="text-muted-foreground">{uni.essay_requirements}</span>
                            </div>
                          )}
                          {uni.scholarship_info && typeof uni.scholarship_info === 'object' && Object.keys(uni.scholarship_info).length > 0 && (
                            <div className="mt-1 flex gap-2 text-xs">
                              <DollarSign className="shrink-0 text-primary" size={12} />
                              <span className="text-muted-foreground">
                                {typeof (uni.scholarship_info as Record<string, unknown>).amount_range === 'string'
                                  ? (uni.scholarship_info as Record<string, unknown>).amount_range as string
                                  : 'Xem chi tiết học bổng'}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            </div>
          </div>
        )}

        {/* Roadmap: Timeline chart */}
        {hasRoadmap && (
          <section className="mt-10">
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-primary/5 px-5 py-4">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
                    <Calendar className="h-4 w-4" />
                  </span>
                  Lộ trình phát triển
                </h2>
                {(roadmap!.start_date || roadmap!.duration_months) && (
                  <span className="text-sm text-muted-foreground">
                    {roadmap!.start_date && <span>Bắt đầu: {roadmap!.start_date}</span>}
                    {roadmap!.duration_months != null && (
                      <span>{roadmap!.start_date ? ' · ' : ''}{roadmap!.duration_months} tháng</span>
                    )}
                  </span>
                )}
              </div>

              <div className="p-5 sm:p-6">
                {roadmap!.overall_goals && roadmap!.overall_goals.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-foreground mb-2">Mục tiêu tổng thể</h3>
                    <ul className="flex flex-wrap gap-2">
                      {roadmap!.overall_goals.map((g, i) => (
                        <li
                          key={i}
                          className="rounded-full bg-primary/10 px-4 py-1.5 text-sm text-foreground border border-primary/20"
                        >
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Cột mốc quan trọng (nếu có, hiển thị trước timeline tháng) */}
                {roadmap!.key_milestones && roadmap!.key_milestones.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Cột mốc quan trọng</h3>
                    <div className="flex flex-wrap gap-3">
                      {roadmap!.key_milestones.map((m, i) => (
                        <div key={i} className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 min-w-[200px]">
                          <span className="text-xs font-bold text-primary">Tháng {m.month}</span>
                          <p className="font-medium text-foreground mt-1">{m.name}</p>
                          {m.description && <p className="text-sm text-muted-foreground mt-0.5">{m.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Kế hoạch theo từng tháng (các tháng phải làm gì) */}
                <h3 className="text-sm font-semibold text-foreground mb-4">Các tháng phải làm gì</h3>
                <div className="relative">
                  <div
                    className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-linear-to-b from-primary/60 via-primary/40 to-primary/20 sm:left-[19px]"
                    aria-hidden
                  />
                  <ul className="space-y-0">
                    {(roadmap!.monthly_plans && roadmap!.monthly_plans.length > 0
                      ? roadmap!.monthly_plans
                      : roadmap!.key_milestones?.map((m) => ({
                          month: m.month,
                          month_name: `Cột mốc T${m.month}: ${m.name}`,
                          focus_areas: [],
                          tasks: m.description ? [m.description] : [],
                          goals: [],
                        })) ?? []
                    ).map((plan: RoadmapMonth & { month_name?: string }, i: number) => (
                      <li key={i} className="relative flex gap-6 pb-8 last:pb-0">
                        <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background text-xs font-bold text-primary sm:h-10 sm:w-10">
                          {plan.month}
                        </div>
                        <div className="min-w-0 flex-1 rounded-xl border border-border bg-muted/30 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-medium text-foreground">{plan.month_name ?? `Tháng ${plan.month}`}</p>
                            {plan.priority && (
                              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                                {plan.priority}
                              </span>
                            )}
                          </div>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            {plan.focus_areas && plan.focus_areas.length > 0 && (
                              <div>
                                <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">Lĩnh vực tập trung</p>
                                <ul className="text-sm text-foreground space-y-0.5">
                                  {plan.focus_areas.map((f, j) => (
                                    <li key={j} className="flex items-start gap-1.5">
                                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                      {f}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {plan.tasks && plan.tasks.length > 0 && (
                              <div>
                                <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">Nhiệm vụ</p>
                                <ul className="text-sm text-muted-foreground space-y-0.5">
                                  {plan.tasks.map((t, j) => (
                                    <li key={j} className="flex items-start gap-1.5">
                                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                                      {t}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          {plan.goals && plan.goals.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border/60">
                              <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">Mục tiêu tháng</p>
                              <ul className="text-sm text-muted-foreground space-y-0.5">
                                {plan.goals.map((g, j) => (
                                  <li key={j} className="flex items-start gap-1.5">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                                    {g}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
