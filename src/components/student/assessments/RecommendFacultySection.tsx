"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Target,
  Heart,
  Lightbulb,
  Lock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RecommendFacultyHistorySection } from "./RecommendFacultyHistorySection";
import { useRouter } from "next/navigation";

type AssessmentSummary = {
  mbti_type?: string;
  mbti_confidence?: number;
  grit_score?: number;
  grit_level?: string;
  riasec_code?: string;
};

type FacultyItem = {
  faculty_name: string;
  match_score: number;
  reason?: string;
};

type RecommendationData = {
  assessment_summary?: AssessmentSummary | null;
  faculties?: FacultyItem[] | null;
  created_at?: string;
};

type Limits = {
  limit: number | null;
  used: number;
  remaining: number | null;
};

interface RecommendFacultySectionProps {
  studentId: string | null;
  allCompleted: boolean;
  id?: string;
}

const ACCENT = "#0052FF";
const ACCENT_SEC = "#4D7CFF";
const easeOut = [0.16, 1, 0.3, 1] as const;
const stagger = {
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
};

function ResultBlock({
  summary,
  faculties,
  title,
  isFree,
}: {
  summary: AssessmentSummary | null | undefined;
  faculties: FacultyItem[];
  title?: string;
  isFree?: boolean;
}) {
  const router = useRouter();
  
  return (
    <motion.div
      className="mt-10 space-y-8"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      {title && (
        <motion.div variants={fadeInUp} className="flex items-center gap-3">
          <span
            className="h-1 w-8 rounded-full flex-shrink-0"
            style={{
              background: `linear-gradient(to right, ${ACCENT}, ${ACCENT_SEC})`,
            }}
          />
          <h3 className="font-heading text-lg font-semibold text-foreground tracking-tight">
            {title}
          </h3>
        </motion.div>
      )}

      {summary && (
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {summary.mbti_type != null && (
            <div className="group rounded-xl border border-border bg-card p-5 shadow-md hover:shadow-xl hover:border-[#0052FF]/20 transition-all duration-300">
              <div
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl mb-3"
                style={{
                  background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SEC})`,
                  boxShadow: "0 4px 14px rgba(0,82,255,0.25)",
                }}
              >
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-0.5">
                MBTI
              </p>
              <p className="text-xl font-heading font-bold text-foreground">
                {summary.mbti_type}
              </p>
              {typeof summary.mbti_confidence === "number" && (
                <p className="text-sm text-muted-foreground mt-1">
                  Độ tin cậy {(summary.mbti_confidence * 100).toFixed(0)}%
                </p>
              )}
            </div>
          )}
          {summary.grit_score != null && (
            <div className="group rounded-xl border border-border bg-card p-5 shadow-md hover:shadow-xl hover:border-[#0052FF]/20 transition-all duration-300">
              <div
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl mb-3"
                style={{
                  background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SEC})`,
                  boxShadow: "0 4px 14px rgba(0,82,255,0.25)",
                }}
              >
                <Target className="h-5 w-5 text-white" />
              </div>
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-0.5">
                GRIT
              </p>
              <p className="text-xl font-heading font-bold text-foreground">
                {summary.grit_score.toFixed(2)}
              </p>
              {summary.grit_level && (
                <p className="text-sm text-muted-foreground mt-1 capitalize">
                  {summary.grit_level}
                </p>
              )}
            </div>
          )}
          {summary.riasec_code && (
            <div className="group rounded-xl border border-border bg-card p-5 shadow-md hover:shadow-xl hover:border-[#0052FF]/20 transition-all duration-300">
              <div
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl mb-3"
                style={{
                  background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SEC})`,
                  boxShadow: "0 4px 14px rgba(0,82,255,0.25)",
                }}
              >
                <Heart className="h-5 w-5 text-white" />
              </div>
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-0.5">
                RIASEC
              </p>
              <p className="text-xl font-heading font-bold text-foreground tracking-wide">
                {summary.riasec_code}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {faculties.length > 0 && (
        <motion.div variants={fadeInUp} className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-[#0052FF]" />
            Top ngành gợi ý
          </h4>
          <ul className="space-y-3">
            {faculties.slice(0, isFree ? 3 : faculties.length).map((f, i) => (
              <motion.li
                key={i}
                variants={fadeInUp}
                className={`group rounded-xl border bg-card p-4 shadow-md transition-all duration-300 hover:shadow-xl ${
                  i === 0
                    ? "border-[#0052FF]/40 bg-gradient-to-br from-[#0052FF]/5 to-transparent ring-1 ring-[#0052FF]/20"
                    : "border-border hover:border-[#0052FF]/20"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground group-hover:text-[#0052FF] transition-colors">
                      {f.faculty_name}
                    </p>
                    {f.reason && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">
                          Nghề gợi ý
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {f.reason
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean)
                            .map((job, j) => (
                              <span
                                key={j}
                                className="inline-flex rounded-md border border-[#0052FF]/25 bg-[#0052FF]/8 px-2 py-0.5 text-xs text-foreground"
                              >
                                {job}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div
                    className="flex-shrink-0 text-2xl font-heading font-bold tabular-nums bg-clip-text text-transparent"
                    style={{
                      backgroundImage: `linear-gradient(to right, ${ACCENT}, ${ACCENT_SEC})`,
                    }}
                  >
                    {(f.match_score ?? 0).toFixed(1)}%
                  </div>
                </div>
                {/* Match bar */}
                <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(to right, ${ACCENT}, ${ACCENT_SEC})`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, f.match_score ?? 0)}%` }}
                    transition={{
                      duration: 0.8,
                      ease: easeOut,
                      delay: i * 0.05,
                    }}
                  />
                </div>
              </motion.li>
            ))}

            {isFree && faculties.length > 3 && (
              <motion.div
                variants={fadeInUp}
                onClick={() => router.push("/student/pricing")}
                className="group relative rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-950/30 shadow-sm hover:shadow-md cursor-pointer overflow-hidden p-6 transition-colors"
              >
                {/* Simulated blurred content in background */}
                <div className="absolute inset-0 z-0 opacity-30 blur-[8px] pointer-events-none p-4">
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <div className="h-5 w-48 bg-amber-900/20 rounded mb-3"></div>
                       <div className="h-4 w-16 bg-amber-900/20 rounded mb-2"></div>
                       <div className="flex gap-2"><div className="h-6 w-20 bg-amber-900/15 rounded"></div><div className="h-6 w-24 bg-amber-900/15 rounded"></div></div>
                     </div>
                     <div className="h-8 w-16 bg-amber-900/20 rounded"></div>
                   </div>
                   <div className="h-2 w-full bg-amber-900/10 rounded-full"></div>
                </div>

                {/* Lock Overlay Content */}
                <div className="relative z-10 flex flex-col justify-center items-center h-full min-h-[140px] text-center">
                  <div className="bg-white/80 dark:bg-background/80 border border-amber-300 dark:border-amber-700 p-4 rounded-full mb-4 shadow-sm text-amber-600 dark:text-amber-500 group-hover:text-amber-700 group-hover:border-amber-400 group-hover:scale-105 transition-all duration-300">
                    <Lock className="h-7 w-7" />
                  </div>
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1.5">
                    Đã ẩn {faculties.length - 3} ngành học phù hợp
                  </h4>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200 bg-amber-100/60 dark:bg-amber-900/40 px-4 py-1.5 rounded-full border border-amber-200/60 dark:border-amber-800/60">
                    Nâng cấp Plus/Premium để mở khóa toàn bộ danh sách
                  </p>
                </div>
              </motion.div>
            )}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
}

function SkeletonBlock() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="h-6 w-32 rounded-full bg-muted/60 animate-pulse" />
      <div className="h-8 w-56 rounded bg-muted/50 animate-pulse" />
      <div
        className="h-1 w-24 rounded opacity-60"
        style={{
          background: `linear-gradient(to right, ${ACCENT}, ${ACCENT_SEC})`,
        }}
      />
      <div className="space-y-3 pt-2">
        <div className="h-4 w-full rounded bg-muted/40 animate-pulse" />
        <div className="h-4 w-4/5 rounded bg-muted/40 animate-pulse" />
      </div>
      <div className="flex flex-wrap gap-4">
        <div
          className="h-12 w-44 rounded-xl animate-pulse opacity-80"
          style={{
            background: `linear-gradient(90deg, ${ACCENT}20, ${ACCENT_SEC}15)`,
          }}
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-muted/30 animate-pulse"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      <div className="h-32 rounded-xl bg-muted/20 animate-pulse" />
      <p className="text-sm text-muted-foreground flex items-center gap-2">
        <Loader2 className="size-4 animate-spin" />
        Đang tải...
      </p>
    </div>
  );
}

import { useSubscription } from "@/hooks/useSubscription";

export default function RecommendFacultySection({
  studentId,
  allCompleted,
  id,
}: RecommendFacultySectionProps) {
  const { isFree } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [sectionLoading, setSectionLoading] = useState(true);
  const [limits, setLimits] = useState<Limits | null>(null);
  const [latest, setLatest] = useState<RecommendationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [runConfirmOpen, setRunConfirmOpen] = useState(false);

  const normalizeErrorMessage = (err: unknown): string => {
    if (!err) return "Không thể tải gợi ý ngành.";
    if (typeof err === "string") return err;
    if (
      typeof err === "object" &&
      err !== null &&
      "message" in err &&
      typeof (err as { message?: unknown }).message === "string"
    ) {
      return (err as { message: string }).message;
    }
    return "Không thể tải gợi ý ngành.";
  };

  const fetchLimitsAndLatest = useCallback(async (sid: string) => {
    try {
      const [limitsRes, latestRes] = await Promise.all([
        fetch(`/api/students/${sid}/recommend-faculty/limits`),
        fetch(`/api/students/${sid}/recommend-faculty/latest`),
      ]);
      if (limitsRes.ok) {
        const lim = await limitsRes.json();
        setLimits({
          limit: lim.limit,
          used: lim.used ?? 0,
          remaining: lim.remaining ?? null,
        });
      }
      if (latestRes.ok) {
        const lat = await latestRes.json();
        setLatest(
          lat.recommendation
            ? {
                assessment_summary: lat.recommendation.assessment_summary,
                faculties: lat.recommendation.faculties,
                created_at: lat.recommendation.created_at,
              }
            : null,
        );
      }
    } catch {
      setLimits(null);
      setLatest(null);
    }
  }, []);

  useEffect(() => {
    if (!studentId) {
      setSectionLoading(false);
      return;
    }
    setSectionLoading(true);
    fetchLimitsAndLatest(studentId).finally(() => setSectionLoading(false));
  }, [studentId, fetchLimitsAndLatest]);

  const handleRun = async () => {
    if (!studentId) return;
    if (limits != null && limits.remaining !== null && limits.remaining <= 0) {
      setError(
        "Bạn đã dùng hết số lần xem gợi ý ngành. Vui lòng nâng cấp gói.",
      );
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/students/${studentId}/recommend-faculty`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(normalizeErrorMessage((data as { error?: unknown }).error));
        return;
      }
      setLatest({
        assessment_summary: data.assessment_summary ?? null,
        faculties: data.faculties ?? null,
        created_at: data.created_at,
      });
      await fetchLimitsAndLatest(studentId);
      setHistoryRefresh((r) => r + 1);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Lỗi kết nối. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistoryItem = useCallback(
    (item: {
      assessment_summary?: unknown;
      faculties?: unknown;
      created_at?: string | null;
    }) => {
      setLatest({
        assessment_summary:
          item.assessment_summary as RecommendationData["assessment_summary"],
        faculties: item.faculties as RecommendationData["faculties"],
        created_at: item.created_at ?? undefined,
      });
    },
    [],
  );

  const summary = latest?.assessment_summary;
  const faculties = latest?.faculties ?? [];
  const hasQuota =
    limits?.remaining === null ||
    (typeof limits?.remaining === "number" && limits.remaining > 0);
  const remainingLabel =
    limits?.remaining === null
      ? "không giới hạn"
      : `${Math.max(0, limits?.remaining ?? 0)} lần`;
  const canRun = allCompleted && hasQuota && !loading;
  const hasResult = latest && (summary || faculties.length > 0);

  const ONET_URL = "https://www.onetonline.org/";

  if (sectionLoading && studentId) {
    return (
      <motion.section
        className="mt-12 relative"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div className="inline-flex items-center gap-3 rounded-full border border-[#0052FF]/30 bg-[#0052FF]/5 px-5 py-2 mb-5">
          <span className="h-2 w-2 rounded-full bg-[#0052FF] animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-[#0052FF]">
            Gợi ý ngành
          </span>
        </div>
        <SkeletonBlock />
      </motion.section>
    );
  }

  return (
    <motion.section
      id={id}
      className="mt-12 relative scroll-mt-4"
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
    >
      {/* Section label */}
      <div className="inline-flex items-center gap-3 rounded-full border border-[#0052FF]/30 bg-[#0052FF]/5 px-5 py-2 mb-5">
        <span className="h-2 w-2 rounded-full bg-[#0052FF] animate-pulse" />
        <span className="font-mono text-xs uppercase tracking-[0.15em] text-[#0052FF]">
          Gợi ý ngành
        </span>
      </div>

      {/* Headline + gradient underline */}
      <div className="relative mb-2">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(to right, ${ACCENT}, ${ACCENT_SEC})`,
            }}
          >
            Gợi ý ngành học
          </span>
        </h2>
        <span
          className="absolute bottom-0 left-0 h-2 w-20 rounded-full opacity-80"
          style={{
            background: `linear-gradient(to right, rgba(0,82,255,0.25), rgba(77,124,255,0.15))`,
          }}
        />
      </div>
      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8 max-w-2xl">
        Dự đoán nhóm ngành phù hợp dựa trên dữ liệu O*NET và kết quả 3 bài test
        (MBTI, GRIT, RIASEC).
      </p>

      {/* Subsection: Dự đoán ngành ONET */}
      <div
        className="rounded-xl border border-[#0052FF]/20 bg-gradient-to-br from-[#0052FF]/5 to-transparent p-5 sm:p-6 mb-8"
        style={{ boxShadow: "0 4px 14px rgba(0,82,255,0.08)" }}
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-[#0052FF]/30 bg-[#0052FF]/10 px-3 py-1.5 mb-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#0052FF]">
            Dataset O*NET
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          <strong className="text-foreground">O*NET</strong> (Occupational
          Information Network) là cơ sở dữ liệu nghề nghiệp do Bộ Lao động Hoa
          Kỳ (U.S. Department of Labor) duy trì, mô tả hàng trăm nghề qua các
          thuộc tính như kỹ năng, sở thích (RIASEC), kiểu tính cách và mức độ
          phù hợp. Hệ thống gợi ý ngành của chúng tôi dùng dữ liệu O*NET (mã
          nghề, điểm RIASEC, ánh xạ nghề – nhóm ngành) kết hợp với kết quả MBTI,
          GRIT và RIASEC của bạn để đưa ra top nhóm ngành phù hợp nhất. Bạn có
          thể tra cứu chi tiết từng nghề tại trang chính thức O*NET:{" "}
          <a
            href={ONET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#0052FF] hover:text-[#4D7CFF] underline underline-offset-2"
          >
            onetonline.org
          </a>
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Button
            onClick={() => canRun && setRunConfirmOpen(true)}
            disabled={!canRun}
            className="group bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] text-white rounded-xl h-12 px-6 font-semibold shadow-md hover:shadow-[0_8px_24px_rgba(0,82,255,0.35)] transition-all duration-200 -translate-y-0.5 hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:transform-none disabled:shadow-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Đang xử lý…
              </>
            ) : (
              <>
                Xem gợi ý ngành
                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </div>
      </div>

      <Dialog open={runConfirmOpen} onOpenChange={setRunConfirmOpen}>
        <DialogContent className="p-6 sm:p-6 gap-4">
          <DialogHeader>
            <DialogTitle>Xem gợi ý ngành</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Bạn chỉ xem được kết quả{" "}
                  <strong className="text-foreground">lần chạy gần nhất</strong>
                  . Mỗi lần bấm &quot;Xem gợi ý ngành&quot; sẽ tạo một kết quả
                  mới và trừ 1 lần trong quota.
                </p>
                <p className="flex items-center gap-2 pt-1">
                  <span>Số lần còn lại:</span>
                  <span className="font-semibold text-[#0052FF] tabular-nums">
                    {remainingLabel}
                  </span>
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRunConfirmOpen(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              onClick={() => handleRun()}
              disabled={loading}
              className="bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] text-white"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Xem gợi ý ngành"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!allCompleted && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mb-4 px-1">
          Hoàn thành đủ 3 bài test (MBTI, GRIT, RIASEC) để mở khóa gợi ý ngành.
        </p>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Gợi ý gần nhất — Featured block with gradient border */}
      {hasResult && (
        <div className="rounded-xl bg-gradient-to-br from-[#0052FF] via-[#4D7CFF] to-[#0052FF] p-[2px] shadow-[0_8px_24px_rgba(0,82,255,0.25)]">
          <div className="rounded-[10px] bg-card p-6 sm:p-8">
            <ResultBlock
              summary={summary ?? null}
              faculties={faculties}
              title="Gợi ý gần nhất"
              isFree={isFree}
            />
          </div>
        </div>
      )}

      {/* Divider */}
      <div
        className="my-10 h-px w-full rounded-full opacity-40"
        style={{
          background: `linear-gradient(to right, transparent, ${ACCENT}, ${ACCENT_SEC}, transparent)`,
        }}
      />

      {/* Lịch sử */}
      <RecommendFacultyHistorySection
        key={historyRefresh}
        studentId={studentId}
        onSelectItem={handleSelectHistoryItem}
      />
    </motion.section>
  );
}
