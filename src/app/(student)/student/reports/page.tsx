"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useAuthSession } from "@/hooks/useAuthSession";
import { StudentPageContainer } from "@/components/student";
import { PageLoading } from "@/components/ui/PageLoading";
import RoleGuard from "@/components/auth/RoleGuard";
import {
  FileBarChart,
  Printer,
  User,
  Sparkles,
  Target,
  Award,
  BookOpen,
  Star,
  Shield,
  TrendingUp,
  Heart,
  Brain,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { StudentProfile } from "@/components/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";

const ACCENT = "#0052FF";
const ACCENT_SEC = "#4D7CFF";
const REACH_COLOR = "#7C3AED";
const MATCH_COLOR = "#0052FF";
const SAFE_COLOR = "#059669";

const PILLAR_CONFIG = [
  {
    key: "aca",
    label: "Học thuật",
    color: "#0ea5e9",
    light: "bg-sky-500/15",
    border: "border-l-sky-500",
  },
  {
    key: "lan",
    label: "Ngoại ngữ",
    color: "#8b5cf6",
    light: "bg-violet-500/15",
    border: "border-l-violet-500",
  },
  {
    key: "hdnk",
    label: "Hoạt động NK",
    color: "#10b981",
    light: "bg-emerald-500/15",
    border: "border-l-emerald-500",
  },
  {
    key: "skill",
    label: "Kỹ năng",
    color: "#f59e0b",
    light: "bg-amber-500/15",
    border: "border-l-amber-500",
  },
];

type ProfileData = {
  feature1_output?: {
    summary?: {
      total_pillar_scores?: Record<string, number>;
      main_spike?: string;
      sharpness?: string;
    };
    summaryText?: string;
    "B. Phân tích SWOT"?: {
      strengths?: string[];
      weaknesses?: string[];
      opportunities?: string[];
      threats?: string[];
    };
  };
  feature2_output?: {
    assessment?: {
      mbti?: {
        personality_type?: string;
        dimension_scores?: Record<string, number>;
      };
      grit?: {
        score?: number;
        level?: string;
        description?: string;
        passion_score?: number;
        perseverance_score?: number;
      };
      riasec?: {
        code?: string;
        scores?: Record<string, number>;
        top3?: [string, number][];
      };
    };
  };
  feature3_output?: {
    universities?: {
      REACH?: {
        universities?: {
          id?: string;
          name: string;
          country?: string;
          ranking?: number;
        }[];
      };
      MATCH?: {
        universities?: {
          id?: string;
          name: string;
          country?: string;
          ranking?: number;
        }[];
      };
      SAFETY?: {
        universities?: {
          id?: string;
          name: string;
          country?: string;
          ranking?: number;
        }[];
      };
      reach?:
        | { universities?: { name: string; country?: string }[] }[]
        | { name: string; country?: string }[];
      match?: unknown[];
      safety?: unknown[];
    };
    faculties?: {
      reach?: Array<{
        faculty_name?: string;
        strong_universities?: Array<{ name: string; country?: string }>;
      }>;
      match?: Array<{
        faculty_name?: string;
        strong_universities?: Array<{ name: string; country?: string }>;
      }>;
      safety?: Array<{
        faculty_name?: string;
        strong_universities?: Array<{ name: string; country?: string }>;
      }>;
      safe?: Array<{
        faculty_name?: string;
        strong_universities?: Array<{ name: string; country?: string }>;
      }>;
    };
    summary?: Record<string, unknown> | string;
    roadmap?: Record<string, unknown>;
  };
};

type ImproveResults = {
  analysis?: Record<string, unknown>;
  enhance?: Record<string, unknown>;
};

function safeStr(v: unknown): string {
  if (v == null) return "—";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (typeof v === "object" && v !== null) {
    const o = v as Record<string, unknown>;
    if (typeof o.description === "string") return o.description;
    if (typeof o.text === "string") return o.text;
    if (typeof o.summary === "string") return o.summary;
    if (typeof o.feedback === "string") return o.feedback;
    if (typeof o.suggestion === "string") return o.suggestion;
    if (typeof o.content === "string") return o.content;
    if (typeof o.name === "string") return o.name;
    if (typeof o.reason === "string") return o.reason;
    return JSON.stringify(o);
  }
  return String(v);
}

const easeOut = [0.16, 1, 0.3, 1] as const;
const stagger = {
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-[#0052FF]/30 bg-[#0052FF]/5 px-4 py-2 mb-4 print:mb-2">
      <span className="h-2 w-2 rounded-full bg-[#0052FF]" />
      <span className="font-mono text-xs uppercase tracking-[0.15em] text-[#0052FF]">
        {children}
      </span>
    </div>
  );
}

/** Chuẩn hóa SWOT: API/DB dùng "Strengths (Điểm mạnh)", "strengths", hoặc S/W/O/T. */
function normalizeSwot(swot: Record<string, unknown> | undefined): {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
} {
  if (!swot || typeof swot !== "object")
    return { strengths: [], weaknesses: [], opportunities: [], threats: [] };
  const arr = (v: unknown) =>
    Array.isArray(v)
      ? (v.filter((x) => typeof x === "string") as string[])
      : [];
  return {
    strengths: arr(swot["Strengths (Điểm mạnh)"] ?? swot.strengths ?? swot.S),
    weaknesses: arr(swot["Weaknesses (Điểm yếu)"] ?? swot.weaknesses ?? swot.W),
    opportunities: arr(
      swot["Opportunities (Cơ hội)"] ?? swot.opportunities ?? swot.O,
    ),
    threats: arr(swot["Threats (Thách thức)"] ?? swot.threats ?? swot.T),
  };
}

type UniItem = { name: string; country?: string };
/** Lấy danh sách trường theo nhóm từ feature3 (universities REACH/MATCH/SAFETY hoặc faculties reach/match/safety). */
function getFeature3Lists(f3: ProfileData["feature3_output"]): {
  reach: UniItem[];
  match: UniItem[];
  safety: UniItem[];
} {
  const empty: UniItem[] = [];
  if (!f3) return { reach: empty, match: empty, safety: empty };
  const unis = f3.universities;
  const faculties = f3.faculties;

  const fromUni = (key: "REACH" | "MATCH" | "SAFETY") => {
    const block = unis?.[key] as { universities?: UniItem[] } | undefined;
    const list = block?.universities;
    return Array.isArray(list)
      ? list
          .filter((u) => u && typeof u.name === "string")
          .map((u) => ({ name: u.name, country: u.country }))
      : empty;
  };
  const fromFaculties = (key: "reach" | "match" | "safety" | "safe") => {
    const arr =
      faculties?.[key] ?? (key === "safety" ? faculties?.safe : undefined);
    if (!Array.isArray(arr)) return empty;
    const out: UniItem[] = [];
    for (const item of arr) {
      const list = (item as { strong_universities?: UniItem[] })
        .strong_universities;
      if (Array.isArray(list))
        for (const u of list)
          if (u?.name) out.push({ name: u.name, country: u.country });
    }
    return out;
  };

  return {
    reach: fromUni("REACH").length ? fromUni("REACH") : fromFaculties("reach"),
    match: fromUni("MATCH").length ? fromUni("MATCH") : fromFaculties("match"),
    safety: fromUni("SAFETY").length
      ? fromUni("SAFETY")
      : fromFaculties("safety"),
  };
}

export default function ReportsPage() {
  const {
    session,
    isLoading: sessionLoading,
    isAuthenticated,
  } = useAuthSession();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [improveResults, setImproveResults] = useState<ImproveResults | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);

  const studentId = useMemo(() => {
    const id =
      (session?.user as { id?: string })?.id ??
      (session?.user as { user_id?: string })?.user_id ??
      (session?.user as { sub?: string })?.sub;
    if (id) return id as string;
    const email = session?.user?.email;
    if (email && !id) return `email:${email}`;
    return null;
  }, [session?.user]);

  useEffect(() => {
    if (sessionLoading || !studentId || !isAuthenticated) {
      if (!sessionLoading && !studentId) setLoading(false);
      return;
    }
    let actualId = studentId;
    const load = async () => {
      setLoading(true);
      try {
        if (studentId.startsWith("email:")) {
          const email = studentId.slice(6);
          const r = await fetch(
            `/api/users/by-email?email=${encodeURIComponent(email)}`,
          );
          if (r.ok) {
            const u = await r.json();
            actualId = u.id;
          }
        }
        const [profileRes, dataRes, resultsRes, latestRes] = await Promise.all([
          fetch(`/api/students/${actualId}/profile`),
          fetch("/api/student/improve/profile-data"),
          fetch("/api/student/improve/results"),
          fetch(`/api/students/${actualId}/profile-analysis/latest`),
        ]);
        if (profileRes.ok) {
          const data = await profileRes.json();
          const mapped: StudentProfile = {
            id: actualId.substring(0, 8).toUpperCase(),
            name: data.basicInfo?.full_name || "Chưa cập nhật",
            email: data.basicInfo?.email || "Chưa cập nhật",
            phone: data.basicInfo?.phone_number || "Chưa cập nhật",
            address: data.basicInfo?.current_address || "Chưa cập nhật",
            dob: data.basicInfo?.date_of_birth
              ? new Date(data.basicInfo.date_of_birth).toLocaleDateString(
                  "vi-VN",
                )
              : "Chưa cập nhật",
            avatarUrl: data.basicInfo?.avatar_url || "",
            gpa: 0,
            gpaScale: 10,
            englishLevel: Array.isArray(
              data.academicProfile?.english_certificates,
            )
              ? data.academicProfile.english_certificates
                  .map(
                    (c: { type?: string; score?: string; level?: string }) => {
                      const level = c.level
                        ? ` ${c.type === "JLPT" ? c.level : `cấp ${c.level}`}`
                        : "";
                      return `${c.type || ""}${level} ${c.score ?? ""}`.trim();
                    },
                  )
                  .filter(Boolean)
                  .join(", ") || "Chưa cập nhật"
              : "Chưa cập nhật",
            targetMajor:
              data.studentInfo?.target_faculty_name &&
              data.studentInfo?.target_university_name
                ? `${data.studentInfo.target_faculty_name} @ ${data.studentInfo.target_university_name}`
                : "Chưa xác định",
            targetCountry: "—",
            extracurriculars: [
              ...(data.background?.academic_extracurriculars?.map(
                (act: {
                  id: string;
                  activity_name?: string;
                  role?: string;
                  start_date?: string;
                  description?: string;
                }) => ({
                  id: act.id,
                  title: act.activity_name || "Hoạt động",
                  role: act.role || "Thành viên",
                  year: act.start_date
                    ? new Date(act.start_date).getFullYear().toString()
                    : "—",
                  description: act.description || "",
                  category: "academic" as const,
                }),
              ) || []),
              ...(data.background?.non_academic_extracurriculars?.map(
                (act: {
                  id: string;
                  activity_name?: string;
                  role?: string;
                  start_date?: string;
                  description?: string;
                }) => ({
                  id: act.id,
                  title: act.activity_name || "Hoạt động",
                  role: act.role || "Thành viên",
                  year: act.start_date
                    ? new Date(act.start_date).getFullYear().toString()
                    : "—",
                  description: act.description || "",
                  category: "non_academic" as const,
                }),
              ) || []),
            ],
            achievements: [
              ...(data.background?.academic_awards?.map(
                (a: {
                  id: string;
                  award_name?: string;
                  issuing_organization?: string;
                }) => ({
                  id: a.id,
                  text: `${a.award_name || ""} - ${a.issuing_organization || ""}`.trim(),
                  category: "academic" as const,
                }),
              ) || []),
              ...(data.background?.non_academic_awards?.map(
                (a: {
                  id: string;
                  award_name?: string;
                  issuing_organization?: string;
                }) => ({
                  id: a.id,
                  text: `${a.award_name || ""} - ${a.issuing_organization || ""}`.trim(),
                  category: "non_academic" as const,
                }),
              ) || []),
            ],
            documents: [],
          };
          const gpaDetails = data.academicProfile?.gpa_transcript_details;
          if (gpaDetails) {
            mapped.gpa =
              parseFloat(
                gpaDetails.grade12 ||
                  gpaDetails.grade11 ||
                  gpaDetails.grade10 ||
                  "0",
              ) || 0;
          }
          try {
            const docsRes = await fetch(`/api/students/${actualId}/upload-cv`);
            if (docsRes.ok) {
              const docs = await docsRes.json();
              mapped.documents = Array.isArray(docs) ? docs : [];
            }
          } catch (_) {}
          setProfile(mapped);
        }
        if (dataRes.ok) {
          const data = (await dataRes.json()) as ProfileData & {
            feature3_output?: ProfileData["feature3_output"];
          };
          let payload: ProfileData = data;
          try {
            const admRes = await fetch(
              `/api/students/${actualId}/admission-chance/latest`,
            );
            if (admRes.ok) {
              const adm = await admRes.json();
              if (
                adm?.result?.faculties != null ||
                adm?.result?.summary != null
              ) {
                payload = {
                  ...payload,
                  feature3_output: {
                    ...payload.feature3_output,
                    faculties:
                      adm.result.faculties ??
                      payload.feature3_output?.faculties,
                    summary:
                      adm.result.summary ?? payload.feature3_output?.summary,
                    roadmap: payload.feature3_output?.roadmap,
                  },
                };
              }
            }
          } catch (_) {}
          setProfileData(payload);
        }
        let improvePayload: ImproveResults = {};
        if (resultsRes.ok) {
          const data = await resultsRes.json();
          improvePayload = {
            analysis: data.analysis ?? undefined,
            enhance: data.enhance ?? undefined,
          };
        }
        if (
          !improvePayload.analysis &&
          !improvePayload.enhance &&
          latestRes.ok
        ) {
          const latest = await latestRes.json();
          const enhanceResult = latest.enhance?.enhance_result;
          const fullResult = latest.analysis?.full_result;
          if (enhanceResult != null && typeof enhanceResult === "object")
            improvePayload.enhance = enhanceResult as Record<string, unknown>;
          if (fullResult != null && typeof fullResult === "object") {
            const fr = fullResult as Record<string, unknown>;
            improvePayload.analysis = {
              overall: fr.summary ?? {
                feedback: undefined,
                summary: undefined,
                overall_score: undefined,
                personal_fit_score: undefined,
                priority_suggestions: [],
              },
              pillar_scores:
                (fr["D. Điểm số gốc (Pillar Scores)"] as Record<
                  string,
                  number
                >) ??
                (fr.summary as Record<string, unknown>)?.total_pillar_scores,
              feature1_output: {
                summary: fr.summary as Record<string, unknown>,
              },
            };
          }
        }
        setImproveResults(improvePayload);
      } catch (e) {
        console.error(e);
        toast.error("Không tải được dữ liệu báo cáo");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentId, sessionLoading, isAuthenticated]);

  const handlePrint = () => window.print();

  if (loading || sessionLoading) {
    return (
      <RoleGuard allowedRoles={["user", "student", "STUDENT"]}>
        <StudentPageContainer>
          <PageLoading fullPage={false} message="Đang tải báo cáo..." />
        </StudentPageContainer>
      </RoleGuard>
    );
  }

  const hasAnyData =
    profile ||
    profileData?.feature1_output ||
    profileData?.feature2_output ||
    profileData?.feature3_output ||
    improveResults?.analysis ||
    improveResults?.enhance;

  return (
    <RoleGuard allowedRoles={["user", "student", "STUDENT"]}>
      <StudentPageContainer noPadding className="min-h-[60vh]">
        {/* Hero — no padding, full-bleed như trang Target / Dashboard */}
        <section
          aria-label="Báo cáo"
          className="relative mb-6 overflow-hidden text-white print:mb-4"
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
          <div className="relative px-6 py-8 sm:px-10 sm:py-10 print:py-4">
            <div className="mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-white/80 print:text-[9px]">
                  <FileBarChart className="size-3.5" />
                  Báo cáo tổng hợp
                </p>
                <h1 className="mt-3 font-university-display text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl print:text-2xl">
                  Báo cáo hồ sơ & AI
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/80 print:text-xs">
                  Tổng hợp Feature 1 (trụ cột & SWOT), Feature 2 (MBTI, Grit,
                  RIASEC), Feature 3 (Reach / Match / Safety) và đề xuất cải
                  thiện.
                </p>
              </div>
              <div className="flex items-center gap-3 print:hidden">
                <Button
                  onClick={handlePrint}
                  variant="secondary"
                  className="rounded-xl border border-white/40 bg-white/15 font-semibold text-white backdrop-blur-sm hover:bg-white/25"
                >
                  <Printer className="mr-2 size-4" />
                  In báo cáo
                </Button>
                <Button
                  asChild
                  className="rounded-xl bg-white font-semibold text-[#0052FF] hover:bg-white/90"
                >
                  <Link href="/student/target">Trang Target</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div
          id="report-print"
          ref={reportRef}
          className="mx-auto px-4 sm:px-6 pb-12 space-y-10 print:space-y-6 print:px-0"
        >
          {!hasAnyData ? (
            <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
              <Card className="rounded-2xl border-2 border-dashed border-border bg-muted/20 py-16 text-center">
                <Award className="mx-auto size-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  Chưa có dữ liệu module AI.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Hoàn thành hồ sơ, bài test và trang Target / Improve.
                </p>
                <Button
                  asChild
                  className="mt-6 rounded-xl bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] text-white"
                >
                  <Link href="/student/profile">Cập nhật hồ sơ</Link>
                </Button>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              className="space-y-10 print:space-y-6"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              {/* 1. Thông tin cá nhân */}
              {profile && (
                <motion.section
                  variants={fadeInUp}
                  className="rounded-2xl border border-border bg-card p-6 shadow-lg print:shadow-none print:p-4"
                >
                  <SectionLabel>Thông tin cá nhân</SectionLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-xl border border-border bg-muted/30 p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Họ tên
                      </p>
                      <p className="mt-1 font-semibold text-foreground">
                        {profile.name}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/30 p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Email
                      </p>
                      <p className="mt-1 font-semibold text-foreground truncate">
                        {profile.email}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/30 p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        GPA
                      </p>
                      <p className="mt-1 font-semibold text-foreground">
                        {profile.gpa
                          ? `${profile.gpa} / ${profile.gpaScale}`
                          : "—"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/30 p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Mục tiêu
                      </p>
                      <p className="mt-1 font-semibold text-foreground line-clamp-2">
                        {profile.targetMajor ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <span>Ngoại ngữ: {profile.englishLevel ?? "—"}</span>
                    <span>·</span>
                    <span>
                      Hoạt động: {profile.extracurriculars?.length ?? 0}
                    </span>
                    <span>·</span>
                    <span>Thành tích: {profile.achievements?.length ?? 0}</span>
                    {profile.documents?.length ? (
                      <>
                        <span>·</span>
                        <span>Tài liệu: {profile.documents.length}</span>
                      </>
                    ) : null}
                  </div>
                </motion.section>
              )}

              {/* 2. Feature 1 – Điểm trụ cột & SWOT (chỉ hiện khi có dữ liệu) */}
              {profileData?.feature1_output &&
                (() => {
                  const f1 = profileData.feature1_output;
                  const hasPillar = Boolean(f1.summary?.total_pillar_scores);
                  const hasSummaryText = Boolean(f1.summaryText);
                  const swotRaw = f1["B. Phân tích SWOT"] as
                    | Record<string, unknown>
                    | undefined;
                  const swot = normalizeSwot(swotRaw);
                  const hasSwot =
                    swot.strengths.length +
                      swot.weaknesses.length +
                      swot.opportunities.length +
                      swot.threats.length >
                    0;
                  if (!hasPillar && !hasSummaryText && !hasSwot) return null;
                  return (
                    <motion.section variants={fadeInUp} className="space-y-6">
                      <SectionLabel>
                        Feature 1 — Phân tích hồ sơ & SWOT
                      </SectionLabel>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pillars + Chart */}
                        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg print:shadow-none">
                          <div className="border-b border-border bg-gradient-to-r from-[#0052FF]/10 to-[#4D7CFF]/5 px-6 py-4">
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="font-university-display text-lg font-bold text-foreground">
                                Điểm trụ cột
                              </h3>
                              {(profileData.feature1_output.summary
                                ?.main_spike ||
                                profileData.feature1_output.summary
                                  ?.sharpness) && (
                                <Badge className="bg-[#0052FF]/20 text-[#0052FF] border-[#0052FF]/30">
                                  {safeStr(
                                    profileData.feature1_output.summary
                                      .main_spike,
                                  )}{" "}
                                  ·{" "}
                                  {safeStr(
                                    profileData.feature1_output.summary
                                      .sharpness,
                                  )}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <CardContent className="p-6">
                            {profileData.feature1_output.summary
                              ?.total_pillar_scores && (
                              <>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                                  {PILLAR_CONFIG.map(
                                    ({ key, label, color, light, border }) => {
                                      const value =
                                        profileData.feature1_output!.summary!
                                          .total_pillar_scores?.[key] ?? 0;
                                      return (
                                        <div
                                          key={key}
                                          className={`rounded-xl border-l-4 ${border} ${light} p-4`}
                                        >
                                          <p className="text-xs font-medium text-muted-foreground">
                                            {label}
                                          </p>
                                          <p
                                            className="text-2xl font-bold"
                                            style={{ color }}
                                          >
                                            {value}
                                          </p>
                                        </div>
                                      );
                                    },
                                  )}
                                </div>
                                <div
                                  className="h-48 w-full [&_.recharts-text]:fill-foreground"
                                  data-pdf-chart-wrap
                                >
                                  <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                  >
                                    <BarChart
                                      data={PILLAR_CONFIG.map(
                                        ({ key, label }) => ({
                                          name: label,
                                          value:
                                            profileData.feature1_output!
                                              .summary!.total_pillar_scores?.[
                                              key
                                            ] ?? 0,
                                        }),
                                      )}
                                      layout="vertical"
                                      margin={{
                                        top: 0,
                                        right: 24,
                                        left: 0,
                                        bottom: 0,
                                      }}
                                    >
                                      <XAxis
                                        type="number"
                                        domain={[0, 100]}
                                        hide
                                      />
                                      <YAxis
                                        type="category"
                                        dataKey="name"
                                        width={80}
                                        tick={{
                                          fontSize: 12,
                                          fill: "var(--foreground)",
                                        }}
                                      />
                                      <Bar
                                        dataKey="value"
                                        radius={[0, 6, 6, 0]}
                                        maxBarSize={24}
                                      >
                                        {PILLAR_CONFIG.map((_, i) => (
                                          <Cell
                                            key={i}
                                            fill={PILLAR_CONFIG[i].color}
                                          />
                                        ))}
                                      </Bar>
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              </>
                            )}
                            {profileData.feature1_output.summaryText && (
                              <p className="text-sm text-foreground mt-4 pt-4 border-t border-border">
                                {safeStr(
                                  profileData.feature1_output.summaryText,
                                )}
                              </p>
                            )}
                          </CardContent>
                        </div>

                        {/* SWOT chi tiết (đã chuẩn hóa key Strengths/strengths) */}
                        {hasSwot && (
                          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg print:shadow-none">
                            <div className="border-b border-border bg-muted/50 px-6 py-3">
                              <h3 className="font-university-display text-lg font-bold text-foreground">
                                Phân tích SWOT
                              </h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                              {[
                                {
                                  key: "strengths",
                                  label: "Điểm mạnh",
                                  items: swot.strengths,
                                  icon: Zap,
                                  bg: "bg-emerald-500/10",
                                  border: "border-emerald-500/40",
                                  text: "text-emerald-800 dark:text-emerald-200",
                                },
                                {
                                  key: "weaknesses",
                                  label: "Điểm yếu",
                                  items: swot.weaknesses,
                                  icon: TrendingUp,
                                  bg: "bg-rose-500/10",
                                  border: "border-rose-500/40",
                                  text: "text-rose-800 dark:text-rose-200",
                                },
                                {
                                  key: "opportunities",
                                  label: "Cơ hội",
                                  items: swot.opportunities,
                                  icon: Star,
                                  bg: "bg-sky-500/10",
                                  border: "border-sky-500/40",
                                  text: "text-sky-800 dark:text-sky-200",
                                },
                                {
                                  key: "threats",
                                  label: "Thách thức",
                                  items: swot.threats,
                                  icon: Shield,
                                  bg: "bg-amber-500/10",
                                  border: "border-amber-500/40",
                                  text: "text-amber-800 dark:text-amber-200",
                                },
                              ].map(
                                ({
                                  key,
                                  label,
                                  items,
                                  icon: Icon,
                                  bg,
                                  border,
                                  text,
                                }) => (
                                  <div
                                    key={key}
                                    className={`p-4 border-b border-border last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 ${bg} ${border} border-l-4`}
                                  >
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-2">
                                      <Icon className="size-3.5" />
                                      {label}
                                    </p>
                                    <ul className="space-y-1.5">
                                      {(items.length ? items : ["—"])
                                        .slice(0, 6)
                                        .map((item, i) => (
                                          <li
                                            key={i}
                                            className={`text-sm ${items.length ? text : "text-muted-foreground"}`}
                                          >
                                            · {safeStr(item)}
                                          </li>
                                        ))}
                                      {items.length > 6 && (
                                        <li className="text-xs text-muted-foreground">
                                          +{items.length - 6} mục
                                        </li>
                                      )}
                                    </ul>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.section>
                  );
                })()}

              {/* 3. Feature 2 – MBTI, Grit, RIASEC */}
              {profileData?.feature2_output?.assessment && (
                <motion.section variants={fadeInUp}>
                  <SectionLabel>
                    Feature 2 — Đánh giá tính cách & nghị lực
                  </SectionLabel>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {profileData.feature2_output.assessment.mbti && (
                      <Card className="rounded-2xl border-2 border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-purple-500/5 shadow-lg overflow-hidden print:border print:shadow-none">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-600 dark:text-violet-400">
                              <Brain className="size-5" />
                            </div>
                            <CardTitle className="text-base m-0">
                              MBTI
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                            {profileData.feature2_output.assessment.mbti
                              .personality_type ?? "—"}
                          </p>
                          {profileData.feature2_output.assessment.mbti
                            .dimension_scores && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {Object.entries(
                                profileData.feature2_output.assessment.mbti
                                  .dimension_scores,
                              ).map(([dim, val]) => (
                                <Badge
                                  key={dim}
                                  variant="secondary"
                                  className="text-xs font-mono"
                                >
                                  {dim}:{" "}
                                  {typeof val === "number"
                                    ? Math.round(val * 100)
                                    : val}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                    {profileData.feature2_output.assessment.grit && (
                      <Card className="rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 shadow-lg overflow-hidden print:border print:shadow-none">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                              <Heart className="size-5" />
                            </div>
                            <CardTitle className="text-base m-0">
                              Grit
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                            {safeStr(
                              profileData.feature2_output.assessment.grit.score,
                            )}{" "}
                            <span className="text-lg font-normal text-muted-foreground">
                              ·{" "}
                              {safeStr(
                                profileData.feature2_output.assessment.grit
                                  .level,
                              )}
                            </span>
                          </p>
                          {profileData.feature2_output.assessment.grit
                            .description && (
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                              {safeStr(
                                profileData.feature2_output.assessment.grit
                                  .description,
                              )}
                            </p>
                          )}
                          {(profileData.feature2_output.assessment.grit
                            .passion_score != null ||
                            profileData.feature2_output.assessment.grit
                              .perseverance_score != null) && (
                            <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                              {profileData.feature2_output.assessment.grit
                                .passion_score != null && (
                                <span>
                                  Đam mê:{" "}
                                  {
                                    profileData.feature2_output.assessment.grit
                                      .passion_score
                                  }
                                </span>
                              )}
                              {profileData.feature2_output.assessment.grit
                                .perseverance_score != null && (
                                <span>
                                  Kiên trì:{" "}
                                  {
                                    profileData.feature2_output.assessment.grit
                                      .perseverance_score
                                  }
                                </span>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                    {profileData.feature2_output.assessment.riasec && (
                      <Card className="rounded-2xl border-2 border-sky-500/30 bg-gradient-to-br from-sky-500/10 to-cyan-500/5 shadow-lg overflow-hidden print:border print:shadow-none">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-400">
                              <Target className="size-5" />
                            </div>
                            <CardTitle className="text-base m-0">
                              RIASEC
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-2xl font-bold text-sky-600 dark:text-sky-400 font-mono">
                            {profileData.feature2_output.assessment.riasec
                              .code ?? "—"}
                          </p>
                          {profileData.feature2_output.assessment.riasec.top3
                            ?.length ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {profileData.feature2_output.assessment.riasec.top3.map(
                                ([name, score], i) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {name} (
                                    {typeof score === "number" ? score : "—"})
                                  </Badge>
                                ),
                              )}
                            </div>
                          ) : null}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </motion.section>
              )}

              {/* 4. Feature 3 – Reach / Match / Safety (chỉ hiện khi có dữ liệu) */}
              {profileData?.feature3_output &&
                (() => {
                  const lists = getFeature3Lists(profileData.feature3_output);
                  const reach = lists.reach;
                  const match = lists.match;
                  const safety = lists.safety;
                  const summary = profileData.feature3_output.summary;
                  const summaryStr = typeof summary === "string" ? summary : "";
                  const roadmap = profileData.feature3_output.roadmap as
                    | {
                        start_date?: string;
                        monthly_plans?: Array<{
                          month_name?: string;
                          priority?: string;
                          focus_areas?: string[];
                          goals?: string[];
                        }>;
                      }
                    | undefined;
                  const plans = Array.isArray(roadmap?.monthly_plans)
                    ? (roadmap?.monthly_plans ?? [])
                    : [];
                  const hasUnis =
                    reach.length > 0 || match.length > 0 || safety.length > 0;
                  const hasContent =
                    hasUnis || summaryStr.length > 0 || plans.length > 0;
                  if (!hasContent) return null;
                  return (
                    <motion.section variants={fadeInUp} className="space-y-6">
                      <SectionLabel>
                        Feature 3 — Gợi ý trường & lộ trình
                      </SectionLabel>
                      {summaryStr && (
                        <p className="text-sm text-foreground rounded-xl border border-border bg-muted/30 p-4">
                          {summaryStr}
                        </p>
                      )}
                      {hasUnis && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {[
                            {
                              key: "reach",
                              title: "Reach",
                              list: reach,
                              color: REACH_COLOR,
                              light: "bg-violet-500/10",
                              icon: Star,
                            },
                            {
                              key: "match",
                              title: "Match",
                              list: match,
                              color: MATCH_COLOR,
                              light: "bg-[#0052FF]/10",
                              icon: Target,
                            },
                            {
                              key: "safe",
                              title: "Safety",
                              list: safety,
                              color: SAFE_COLOR,
                              light: "bg-emerald-500/10",
                              icon: Shield,
                            },
                          ].map(
                            ({
                              key,
                              title,
                              list,
                              color,
                              light,
                              icon: Icon,
                            }) => (
                              <Card
                                key={key}
                                className={`rounded-2xl border-2 overflow-hidden shadow-lg print:shadow-none ${light}`}
                                style={{ borderColor: `${color}40` }}
                              >
                                <CardHeader className="py-3 px-4 flex flex-row items-center gap-2">
                                  <div
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
                                    style={{ backgroundColor: color }}
                                  >
                                    <Icon className="size-4" />
                                  </div>
                                  <CardTitle
                                    className="text-base m-0"
                                    style={{ color }}
                                  >
                                    {title}
                                  </CardTitle>
                                  <Badge
                                    variant="secondary"
                                    className="ml-auto text-xs"
                                  >
                                    {list.length}
                                  </Badge>
                                </CardHeader>
                                <CardContent className="pt-0 px-4 pb-4">
                                  <ul className="space-y-2">
                                    {list.slice(0, 8).map((u, i) => (
                                      <li
                                        key={i}
                                        className="text-sm font-medium text-foreground truncate"
                                        title={u.name}
                                      >
                                        {u.name}
                                        {u.country && (
                                          <span className="text-muted-foreground font-normal">
                                            {" "}
                                            · {u.country}
                                          </span>
                                        )}
                                      </li>
                                    ))}
                                    {list.length > 8 && (
                                      <li className="text-xs text-muted-foreground">
                                        +{list.length - 8} trường
                                      </li>
                                    )}
                                  </ul>
                                </CardContent>
                              </Card>
                            ),
                          )}
                        </div>
                      )}
                      {plans.length > 0 && (
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg print:shadow-none">
                          <h3 className="font-university-display text-lg font-bold text-foreground mb-4">
                            Lộ trình{" "}
                            {roadmap?.start_date
                              ? `từ ${roadmap?.start_date}`
                              : ""}
                          </h3>
                          <div className="space-y-4">
                            {plans.slice(0, 6).map((plan, idx) => (
                              <div
                                key={idx}
                                className="rounded-xl border border-border bg-muted/20 p-4"
                              >
                                <p className="font-semibold text-foreground">
                                  {plan.month_name ?? `Tháng ${idx + 1}`}
                                </p>
                                {plan.priority && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    Ưu tiên: {plan.priority}
                                  </p>
                                )}
                                {plan.focus_areas?.length ? (
                                  <p className="text-sm text-foreground mt-2">
                                    Trọng tâm: {plan.focus_areas.join(", ")}
                                  </p>
                                ) : null}
                                {plan.goals?.length ? (
                                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                                    {plan.goals.slice(0, 3).map((g, i) => (
                                      <li key={i}>· {safeStr(g)}</li>
                                    ))}
                                  </ul>
                                ) : null}
                              </div>
                            ))}
                            {plans.length > 6 && (
                              <p className="text-sm text-muted-foreground">
                                +{plans.length - 6} tháng khác
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.section>
                  );
                })()}

              {/* 5. Improve */}
              {(improveResults?.analysis || improveResults?.enhance) && (
                <motion.section
                  variants={fadeInUp}
                  className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg print:shadow-none"
                >
                  <SectionLabel>Phân tích & Đề xuất cải thiện</SectionLabel>
                  <div className="p-6 pt-0 space-y-6">
                    {improveResults.analysis &&
                      typeof improveResults.analysis === "object" &&
                      (() => {
                        const a = improveResults.analysis as Record<
                          string,
                          unknown
                        >;
                        const overall = a.overall as
                          | Record<string, unknown>
                          | undefined;
                        const f1 = a.feature1_output as
                          | Record<string, unknown>
                          | undefined;
                        const sum = f1?.summary as
                          | Record<string, unknown>
                          | undefined;
                        const scores =
                          (a.pillar_scores as Record<string, number>) ??
                          (sum?.total_pillar_scores as Record<string, number>);
                        const feedbackText = overall
                          ? safeStr(overall.feedback) ||
                            safeStr(overall.summary)
                          : "—";
                        const prio = Array.isArray(
                          overall?.priority_suggestions,
                        )
                          ? (overall!.priority_suggestions as unknown[])
                          : [];
                        return (
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                              {overall?.overall_score != null && (
                                <Badge className="bg-[#0052FF]/20 text-[#0052FF] border-[#0052FF]/30">
                                  Tổng: {Number(overall.overall_score)}/100
                                </Badge>
                              )}
                              {overall?.personal_fit_score != null && (
                                <Badge variant="secondary">
                                  Phù hợp: {Number(overall.personal_fit_score)}
                                  /100
                                </Badge>
                              )}
                              {scores &&
                                ["aca", "lan", "hdnk", "skill"].map((k) => (
                                  <Badge key={k} variant="outline">
                                    {k}: {scores[k] ?? "—"}
                                  </Badge>
                                ))}
                            </div>
                            {feedbackText !== "—" && (
                              <p className="text-foreground">{feedbackText}</p>
                            )}
                            {prio.length > 0 && (
                              <div>
                                <p className="text-sm font-semibold text-foreground mb-2">
                                  Gợi ý ưu tiên
                                </p>
                                <ul className="space-y-2">
                                  {prio.slice(0, 8).map((p, i) => {
                                    const raw = safeStr(p);
                                    const match = raw.match(
                                      /^\s*\*{0,2}(\d+)\.\s*(.+?)\*{0,2}:\s*([\s\S]*)/,
                                    );
                                    const title = match
                                      ? match[2].replace(/\*+/g, "").trim()
                                      : null;
                                    const body = match ? match[3].trim() : raw;
                                    return (
                                      <li
                                        key={i}
                                        className="flex gap-3 rounded-xl border border-border bg-amber-500/5 border-l-4 border-l-amber-500/60 px-4 py-3"
                                      >
                                        <span className="shrink-0 font-bold text-amber-600 dark:text-amber-400">
                                          {i + 1}.
                                        </span>
                                        <span className="text-sm text-foreground">
                                          {title && (
                                            <span className="font-medium">
                                              {title}:{" "}
                                            </span>
                                          )}
                                          <span className="text-muted-foreground">
                                            {body}
                                          </span>
                                        </span>
                                      </li>
                                    );
                                  })}
                                  {prio.length > 8 && (
                                    <li className="text-xs text-muted-foreground pl-7">
                                      +{prio.length - 8} gợi ý
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    {improveResults.enhance &&
                      typeof improveResults.enhance === "object" &&
                      (() => {
                        const e = improveResults.enhance as Record<
                          string,
                          unknown
                        >;
                        const recs = Array.isArray(e.recommendations)
                          ? (e.recommendations as Record<string, unknown>[])
                          : [];
                        const improvements = Array.isArray(e.improvements)
                          ? (e.improvements as Record<string, unknown>[])
                          : [];
                        const sumText = safeStr(e.enhanced_summary);
                        const listSuggestion = Array.isArray(e.list_suggestion)
                          ? (e.list_suggestion as Array<{
                              prior?: string;
                              what_to_do?: string;
                            }>)
                          : [];
                        const pillarAfter = e.pillar_score_after_enhance as
                          | Record<string, number>
                          | undefined;
                        const roadmapEnhance = e.roadmap as
                          | {
                              type?: string;
                              months?: Array<{
                                month?: number;
                                tasks?: string[];
                                target?: string;
                              }>;
                            }
                          | undefined;
                        const hasProfileImprover =
                          sumText !== "—" ||
                          recs.length > 0 ||
                          improvements.length > 0;
                        const hasEnhanceOutput =
                          listSuggestion.length > 0 ||
                          (pillarAfter &&
                            Object.keys(pillarAfter).length > 0) ||
                          (roadmapEnhance?.months?.length ?? 0) > 0;
                        if (!hasProfileImprover && !hasEnhanceOutput)
                          return null;
                        return (
                          <div className="border-t border-border pt-4 space-y-4">
                            {sumText !== "—" && (
                              <p className="text-foreground">{sumText}</p>
                            )}
                            {recs.length > 0 && (
                              <p className="text-sm text-muted-foreground">
                                Khuyến nghị:{" "}
                                {recs
                                  .slice(0, 4)
                                  .map((r) => safeStr(r.specific_rec_name))
                                  .filter(Boolean)
                                  .join(" · ") || `${recs.length} mục`}
                              </p>
                            )}
                            {improvements.length > 0 && (
                              <p className="text-sm text-muted-foreground">
                                Cải thiện trụ:{" "}
                                {improvements
                                  .map(
                                    (imp) =>
                                      `${safeStr(imp.pillar)}→${safeStr(imp.target_score)}`,
                                  )
                                  .join(", ")}
                              </p>
                            )}
                            {listSuggestion.length > 0 && (
                              <div>
                                <p className="text-sm font-semibold text-foreground mb-2">
                                  Gợi ý ưu tiên
                                </p>
                                <ul className="space-y-2">
                                  {listSuggestion.slice(0, 8).map((s, i) => (
                                    <li
                                      key={i}
                                      className="flex gap-3 rounded-xl border border-border bg-amber-500/5 border-l-4 border-l-amber-500/60 px-4 py-3"
                                    >
                                      {s.prior && (
                                        <span className="shrink-0 font-bold text-amber-600 dark:text-amber-400">
                                          {s.prior}
                                        </span>
                                      )}
                                      <span className="text-sm text-foreground">
                                        {safeStr(s.what_to_do)}
                                      </span>
                                    </li>
                                  ))}
                                  {listSuggestion.length > 8 && (
                                    <li className="text-xs text-muted-foreground pl-4">
                                      +{listSuggestion.length - 8} gợi ý
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                            {pillarAfter &&
                              Object.keys(pillarAfter).length > 0 && (
                                <div className="flex flex-wrap gap-2 items-center">
                                  <span className="text-xs font-medium text-muted-foreground">
                                    Điểm sau cải thiện:
                                  </span>
                                  {[
                                    "academic",
                                    "language",
                                    "extracurricular",
                                    "skills",
                                  ]
                                    .filter((k) => pillarAfter[k] != null)
                                    .map((k) => (
                                      <Badge key={k} variant="secondary">
                                        {k}: {Number(pillarAfter[k])}
                                      </Badge>
                                    ))}
                                </div>
                              )}
                            {roadmapEnhance?.months?.length ? (
                              <div>
                                <p className="text-sm font-semibold text-foreground mb-2">
                                  Lộ trình{" "}
                                  {roadmapEnhance.type
                                    ? `(${roadmapEnhance.type})`
                                    : ""}
                                </p>
                                <div className="space-y-2">
                                  {roadmapEnhance.months
                                    .slice(0, 4)
                                    .map((m, i) => (
                                      <div
                                        key={i}
                                        className="rounded-xl border border-border bg-muted/20 p-3 text-sm"
                                      >
                                        <p className="font-medium text-foreground">
                                          Tháng {m.month ?? i + 1}
                                        </p>
                                        {m.target && (
                                          <p className="text-muted-foreground text-xs mt-0.5">
                                            Mục tiêu: {m.target}
                                          </p>
                                        )}
                                        {m.tasks?.length ? (
                                          <ul className="mt-1 space-y-0.5 text-muted-foreground">
                                            {m.tasks.slice(0, 3).map((t, j) => (
                                              <li key={j}>· {safeStr(t)}</li>
                                            ))}
                                          </ul>
                                        ) : null}
                                      </div>
                                    ))}
                                  {roadmapEnhance.months.length > 4 && (
                                    <p className="text-xs text-muted-foreground">
                                      +{roadmapEnhance.months.length - 4} tháng
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        );
                      })()}
                  </div>
                </motion.section>
              )}
            </motion.div>
          )}
        </div>
      </StudentPageContainer>
    </RoleGuard>
  );
}
