"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuthSession } from "@/hooks/useAuthSession";
import { StudentPageContainer } from "@/components/student";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Target, Star, Shield, MapPin, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { TargetHistorySection } from "@/components/student/target/TargetHistorySection";
import { TargetGoalSection, type TargetGoalOption, type TargetGoalData } from "@/components/student/target/TargetGoalSection";
import { TargetPageSkeleton } from "@/components/student/target/TargetPageSkeleton";
import { Separator } from "@/components/ui/separator";

const ACCENT = "#0052FF";
const ACCENT_SEC = "#4D7CFF";
const REACH_COLOR = "#7C3AED";
const REACH_LIGHT = "#EDE9FE";
const MATCH_COLOR = "#0052FF";
const MATCH_LIGHT = "#EFF6FF";
const SAFE_COLOR = "#059669";
const SAFE_LIGHT = "#D1FAE5";

const easeOut = [0.16, 1, 0.3, 1] as const;
const stagger = { visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } } };
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
};

type StrongUniversity = {
  qs_rank?: number;
  name?: string;
  country?: string;
  city?: string;
  region?: string;
  university_id?: number;
};

type FacultyItem = {
  faculty_name?: string;
  major_score?: number;
  target_score?: number;
  delta?: number;
  category?: string;
  comment?: string;
  strong_universities?: StrongUniversity[];
};

type FacultiesResult = {
  reach?: FacultyItem[];
  match?: FacultyItem[];
  safe?: FacultyItem[];
};

type ResultData = {
  ok: boolean;
  summary?: {
    student_score?: number;
    spike_score?: number;
    region_fit_score?: number;
    personality_fit_score?: number;
  };
  faculties?: FacultiesResult;
  error?: string;
};

const CATEGORIES: Array<{
  key: keyof FacultiesResult;
  title: string;
  icon: typeof Star;
  color: string;
  light: string;
}> = [
  { key: "reach", title: "Reach", icon: Star, color: REACH_COLOR, light: REACH_LIGHT },
  { key: "match", title: "Match", icon: Target, color: MATCH_COLOR, light: MATCH_LIGHT },
  { key: "safe", title: "Safety", icon: Shield, color: SAFE_COLOR, light: SAFE_LIGHT },
];

function UniversitySubCard({
  u,
  accentColor,
}: {
  u: StrongUniversity;
  accentColor: string;
}) {
  const href = u.university_id != null ? `/student/universities/${u.university_id}` : null;
  const content = (
    <div className="flex flex-col gap-1.5 text-left">
      <p className="font-semibold text-foreground text-sm leading-tight line-clamp-2">
        {u.name ?? "—"}
      </p>
      {u.country && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="size-3.5 shrink-0" />
          {u.city ? `${u.city}, ` : ""}
          {u.country}
        </p>
      )}
      {u.region && (
        <p className="text-xs text-muted-foreground">{u.region}</p>
      )}
      {u.qs_rank != null && (
        <p className="text-xs font-medium mt-0.5" style={{ color: accentColor }}>
          QS Rank #{u.qs_rank}
        </p>
      )}
      {href && (
        <span className="text-xs font-medium mt-1 inline-flex items-center gap-0.5" style={{ color: accentColor }}>
          Xem chi tiết
          <ArrowRight className="size-3" />
        </span>
      )}
    </div>
  );
  const cardClass =
    "rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md flex-1 min-w-0 border-l-4";
  const borderStyle = { borderLeftColor: accentColor };
  if (href) {
    return (
      <Link href={href} className={cardClass} style={borderStyle}>
        {content}
      </Link>
    );
  }
  return (
    <div className={cardClass} style={borderStyle}>
      {content}
    </div>
  );
}

export default function TargetPage() {
  const { session } = useAuthSession();
  const studentId =
    session?.user && ((session.user as { id?: string }).id ?? (session.user as { user_id?: string }).user_id)
      ? String((session.user as { id?: string }).id ?? (session.user as { user_id?: string }).user_id)
      : null;

  const [sectionLoading, setSectionLoading] = useState(!!studentId);
  const [limits, setLimits] = useState<{
    limit: number | null;
    used: number;
    remaining: number | null;
    has_faculty_wishlist?: boolean;
    has_school_wishlist?: boolean;
  } | null>(null);
  const [latest, setLatest] = useState<ResultData | null>(null);
  const [runConfirmOpen, setRunConfirmOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<keyof FacultiesResult>("match");
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [targetGoal, setTargetGoal] = useState<TargetGoalData | null>(null);
  const [goalRefresh, setGoalRefresh] = useState(0);

  const fetchLimitsAndLatest = useCallback(async (sid: string) => {
    try {
      const [limRes, latRes, goalRes] = await Promise.all([
        fetch(`/api/students/${sid}/admission-chance/limits`),
        fetch(`/api/students/${sid}/admission-chance/latest`),
        fetch(`/api/students/${sid}/target-goal`),
      ]);
      if (limRes.ok) {
        const d = await limRes.json();
        setLimits({
          limit: d.limit ?? null,
          used: d.used ?? 0,
          remaining: d.remaining ?? null,
          has_faculty_wishlist: d.has_faculty_wishlist ?? false,
          has_school_wishlist: d.has_school_wishlist ?? false,
        });
      }
      if (latRes.ok) {
        const d = await latRes.json();
        if (d.result?.summary != null && d.result?.faculties != null) {
          setLatest({
            ok: true,
            summary: d.result.summary as ResultData["summary"],
            faculties: d.result.faculties as FacultiesResult,
          });
        } else {
          setLatest(null);
        }
      }
      if (goalRes.ok) {
        const d = await goalRes.json();
        setTargetGoal({
          target_faculty_name: d.target_faculty_name ?? null,
          target_university_id: d.target_university_id ?? null,
          target_university_name: d.target_university_name ?? null,
          target_set_at: d.target_set_at ?? null,
          already_set: d.already_set ?? false,
        });
      } else {
        setTargetGoal(null);
      }
    } catch {
      setLimits(null);
      setLatest(null);
      setTargetGoal(null);
    }
  }, []);

  useEffect(() => {
    if (!studentId) {
      setSectionLoading(false);
      return;
    }
    setSectionLoading(true);
    fetchLimitsAndLatest(studentId).finally(() => setSectionLoading(false));
  }, [studentId, fetchLimitsAndLatest, historyRefresh, goalRefresh]);

  const runAdmissionChance = useCallback(async () => {
    if (!studentId) return;
    setRunning(true);
    setError(null);
    setRunConfirmOpen(false);
    try {
      const res = await fetch(`/api/students/${studentId}/admission-chance`, { method: "POST" });
      const data: ResultData = await res.json();
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Đã xảy ra lỗi");
        return;
      }
      if (data.ok && data.faculties) {
        setLatest(data);
        setHistoryRefresh((r) => r + 1);
        const limRes = await fetch(`/api/students/${studentId}/admission-chance/limits`);
        if (limRes.ok) {
          const lim = await limRes.json();
          setLimits({
            limit: lim.limit ?? null,
            used: lim.used ?? 0,
            remaining: lim.remaining ?? null,
            has_faculty_wishlist: lim.has_faculty_wishlist ?? false,
            has_school_wishlist: lim.has_school_wishlist ?? false,
          });
        }
      } else {
        setError((data as { error?: string }).error ?? "Không nhận được kết quả");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi kết nối");
    } finally {
      setRunning(false);
    }
  }, [studentId]);

  const hasResult =
    latest?.ok &&
    latest?.faculties &&
    (latest.faculties.reach?.length || latest.faculties.match?.length || latest.faculties.safe?.length);

  const canRun =
    limits?.has_faculty_wishlist &&
    limits?.has_school_wishlist &&
    (limits.remaining === null || (limits.remaining ?? 0) > 0);

  if (!studentId) {
    return (
      <StudentPageContainer>
        <div className="py-12 text-center text-muted-foreground">
          Vui lòng đăng nhập để sử dụng tính năng này.
        </div>
      </StudentPageContainer>
    );
  }

  return (
    <StudentPageContainer noPadding className="min-h-[60vh]">
      <div>
        {/* Hero — no padding, full-bleed như Dashboard */}
        <section
          aria-label="Đánh giá cơ hội trúng tuyển"
          className="relative mb-6 overflow-hidden text-white"
          style={{
            background:
              "linear-gradient(135deg, var(--primary) 0%, var(--brand-deep) 50%, var(--brand-cyan) 100%)",
          }}
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-8 right-1/4 h-40 w-80 rounded-full bg-[var(--brand-cyan)]/20 blur-2xl" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="relative px-6 py-8 sm:px-10 sm:py-10">
            <div className="mx-auto max-w-6xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                Đánh giá cơ hội trúng tuyển
              </p>
              <h1 className="mt-3 font-university-display text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl lg:text-[2.6rem] lg:leading-[1.05]">
                <span className="block">Trường</span>
                <span className="relative mt-1 inline-block">
                  <span className="bg-gradient-to-r from-[#FFD56A] via-white to-[#8BE9FF] bg-clip-text text-transparent">
                    Reach / Match / Safety
                  </span>
                  <span className="gradient-underline pointer-events-none absolute -bottom-1 left-0 h-2 w-full rounded-full bg-gradient-to-r from-white/15 via-white/10 to-transparent" />
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/75">
                Dựa trên wishlist ngành, wishlist trường và điểm trụ cột hồ sơ — phân loại trường theo mức độ phù hợp.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  size="sm"
                  onClick={() => {
                    document.getElementById("admission-chance-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="group rounded-xl bg-gradient-to-r from-white to-white/90 px-5 font-sans font-semibold text-[var(--primary)] shadow-md shadow-black/10 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Xem danh sách Reach / Match / Safety
                  <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="rounded-xl border border-white/40 bg-white/5 px-5 font-sans font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/15"
                >
                  <Link href="/student/profile">Cập nhật wishlist</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {sectionLoading ? (
          <TargetPageSkeleton />
        ) : (
          <div id="admission-chance-section" className="mx-auto max-w-[1600px] px-4 sm:px-6 py-6 space-y-6 scroll-mt-4">
            {/* Nút chạy feature: Xem triển vọng các ngành */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-md">
              <p className="text-sm text-muted-foreground mb-4">
                Chạy đánh giá để phân loại ngành học theo mức độ phù hợp (Reach / Match / Safety) dựa trên wishlist và điểm trụ cột.
              </p>
              <Button
                onClick={() => setRunConfirmOpen(true)}
                disabled={!canRun || running}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[#4D7CFF] px-5 py-2.5 font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
              >
                {running ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Target className="size-4" />
                    Xem triển vọng các ngành
                  </>
                )}
              </Button>
            </div>

            {/* Gate: chưa chọn wishlist */}
            {(!limits?.has_faculty_wishlist || !limits?.has_school_wishlist) && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                className="rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-6"
              >
                <div className="inline-flex items-center gap-3 rounded-full border border-amber-300/50 bg-amber-100/50 dark:bg-amber-800/30 px-4 py-2 mb-3">
                  <span className="font-mono text-xs uppercase tracking-[0.15em] text-amber-800 dark:text-amber-200">
                    Cần hoàn thành
                  </span>
                </div>
                <p className="text-sm text-foreground mb-2">
                  Để chạy đánh giá cơ hội trúng tuyển, bạn cần:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
                  {!limits?.has_faculty_wishlist && <li>Chọn ít nhất 1 ngành trong wishlist ngành</li>}
                  {!limits?.has_school_wishlist && <li>Chọn ít nhất 1 trường trong wishlist trường</li>}
                </ul>
                <Button asChild size="sm" className="rounded-xl">
                  <Link href="/student/profile" className="inline-flex items-center gap-1">
                    Vào Hồ sơ để thêm
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </motion.div>
            )}

            {/* Hiển thị lỗi — luôn hiện khi có lỗi */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border-2 border-destructive/50 bg-destructive/15 px-5 py-4 text-sm text-destructive shadow-sm"
              >
                <p className="font-semibold text-destructive mb-0.5">Đã xảy ra lỗi</p>
                <p className="text-foreground/90">{error}</p>
              </div>
            )}

            {/* Kết quả */}
            {hasResult && (
              <motion.div
                className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg"
                initial="hidden"
                animate="visible"
                variants={stagger}
              >
                {latest?.summary && (
                  <div className="border-b border-border px-6 py-4 bg-muted/30 flex flex-wrap gap-6 text-sm">
                    {latest.summary.student_score != null && (
                      <span>
                        <strong className="text-foreground">Điểm hồ sơ:</strong>{" "}
                        <span className="text-foreground">{latest.summary.student_score}</span>
                      </span>
                    )}
                    {latest.summary.spike_score != null && (
                      <span>
                        <strong className="text-foreground">Điểm spike:</strong>{" "}
                        <span className="text-foreground">{latest.summary.spike_score}</span>
                      </span>
                    )}
                  </div>
                )}
                <div className="p-6">
                  <div className="flex gap-2 rounded-xl bg-muted/50 p-1.5 mb-4">
                    {CATEGORIES.map(({ key, title, icon: Icon, color, light }) => {
                      const list = latest?.faculties?.[key] ?? [];
                      const isActive = activeTab === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setActiveTab(key)}
                          className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-all ${
                            isActive
                              ? "shadow-sm text-white"
                              : "border-transparent text-muted-foreground hover:text-foreground"
                          }`}
                          style={
                            isActive
                              ? { backgroundColor: color, borderColor: color }
                              : undefined
                          }
                        >
                          <Icon className="size-4" />
                          {title}
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              isActive ? "bg-white/25" : "bg-black/10 dark:bg-white/10"
                            }`}
                          >
                            {list.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {(() => {
                    const activeCategory = CATEGORIES.find((c) => c.key === activeTab);
                    const accentColor = activeCategory?.color ?? ACCENT;
                    const list: FacultyItem[] = Array.isArray(latest?.faculties?.[activeTab])
                      ? latest.faculties[activeTab]
                      : [];
                    if (list.length === 0) {
                      return (
                        <p className="text-sm text-muted-foreground py-6">
                          Chưa có nhóm ngành nào trong mục này.
                        </p>
                      );
                    }
                    return (
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ul className="space-y-5">
                          {list.map((item, i) => (
                            <li
                              key={`${activeTab}-${i}-${String(item.faculty_name ?? "")}`}
                              className="rounded-2xl border border-border bg-card p-5 shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                              style={{
                                borderLeftWidth: "4px",
                                borderLeftColor: accentColor,
                                backgroundColor: `${accentColor}08`,
                              }}
                            >
                            <p className="font-semibold text-foreground text-lg" style={{ color: accentColor }}>
                              {item.faculty_name ?? "—"}
                            </p>
                            {item.comment && (
                              <p className="text-sm text-muted-foreground mt-1.5">{item.comment}</p>
                            )}
                            {item.delta != null && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Delta: <span className="font-semibold text-foreground">{item.delta}</span>
                              </p>
                            )}
                            {item.strong_universities && Array.isArray(item.strong_universities) && item.strong_universities.length > 0 && (
                              <div className="mt-4">
                                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                                  Trường gợi ý
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {item.strong_universities.map((u, j) => (
                                    <UniversitySubCard key={`${i}-${j}-${u.qs_rank ?? u.name ?? j}`} u={u} accentColor={accentColor} />
                                  ))}
                                </div>
                              </div>
                            )}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    );
                  })()}
                </div>
              </motion.div>
            )}

            <Separator className="my-8" />

            {/* Thiết lập mục tiêu (1 lần) */}
            <TargetGoalSection
              studentId={studentId}
              options={(() => {
                const opts: TargetGoalOption[] = [];
                const seen = new Set<string>();
                for (const key of ["reach", "match", "safe"] as const) {
                  const list = latest?.faculties?.[key] ?? [];
                  for (const item of list) {
                    const name = item.faculty_name ?? "—";
                    for (const u of item.strong_universities ?? []) {
                      const uid = u.university_id ?? null;
                      const uname = u.name ?? "—";
                      const value = `${name}::${uid ?? uname}`;
                      if (seen.has(value)) continue;
                      seen.add(value);
                      opts.push({
                        faculty_name: name,
                        university_id: uid,
                        university_name: uname,
                        value,
                      });
                    }
                  }
                }
                return opts;
              })()}
              currentGoal={targetGoal}
              onSaved={() => setGoalRefresh((r) => r + 1)}
            />

            <Separator className="my-8" />

            {/* Lịch sử */}
            <TargetHistorySection
              key={historyRefresh}
              studentId={studentId}
            />
          </div>
        )}

        {/* Modal — padding cố định, chỉ hiển thị số lần trong modal */}
        <Dialog open={runConfirmOpen} onOpenChange={setRunConfirmOpen}>
          <DialogContent className="gap-4 p-6 sm:p-6 max-w-lg">
            <DialogHeader className="space-y-2 text-left">
              <DialogTitle className="text-lg font-semibold leading-none tracking-tight">
                Chạy đánh giá cơ hội trúng tuyển
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Bạn sẽ dùng 1 lần. Kết quả phân loại trường theo Reach / Match / Safety sẽ được lưu và hiển thị ngay.
              </DialogDescription>
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 mt-2">
                <p className="text-sm font-medium text-foreground">
                  Số lần còn lại:{" "}
                  {limits?.remaining === null ? (
                    <span className="text-primary">Không giới hạn</span>
                  ) : (
                    <span className="text-primary">{limits?.remaining ?? 0}</span>
                  )}
                  {limits?.limit != null && (
                    <span className="text-muted-foreground"> / {limits.limit} (đã dùng {limits.used})</span>
                  )}
                </p>
              </div>
            </DialogHeader>
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setRunConfirmOpen(false)}>
                Hủy
              </Button>
              <Button onClick={runAdmissionChance} disabled={running}>
                {running ? <Loader2 className="size-4 animate-spin" /> : null}
                Chạy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </StudentPageContainer>
  );
}
