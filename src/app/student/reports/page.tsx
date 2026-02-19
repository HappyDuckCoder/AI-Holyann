"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { StudentPageContainer } from "@/components/student";
import { PageLoading } from "@/components/ui/PageLoading";
import RoleGuard from "@/components/auth/RoleGuard";
import {
  FileBarChart,
  Download,
  Printer,
  User,
  Sparkles,
  Target,
  Loader2,
  Award,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { StudentProfile } from "@/components/types";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

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
      REACH?: { universities?: { id?: string; name: string; country?: string; ranking?: number }[] };
      MATCH?: { universities?: { id?: string; name: string; country?: string; ranking?: number }[] };
      SAFETY?: { universities?: { id?: string; name: string; country?: string; ranking?: number }[] };
    };
    summary?: Record<string, unknown> | string;
    roadmap?: Record<string, unknown>;
  };
};

type ImproveResults = {
  analysis?: Record<string, unknown>;
  enhance?: Record<string, unknown>;
};

const ACCENT_CARDS = [
  { key: "aca", label: "Học thuật", color: "sky", from: "from-sky-500/15", to: "to-cyan-500/10", border: "border-l-sky-500/60", icon: "text-sky-600 dark:text-sky-400", bg: "bg-sky-500/20" },
  { key: "lan", label: "Ngoại ngữ", color: "violet", from: "from-violet-500/15", to: "to-purple-500/10", border: "border-l-violet-500/60", icon: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/20" },
  { key: "hdnk", label: "Hoạt động NK", color: "emerald", from: "from-emerald-500/15", to: "to-teal-500/10", border: "border-l-emerald-500/60", icon: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/20" },
  { key: "skill", label: "Kỹ năng", color: "amber", from: "from-amber-500/15", to: "to-orange-500/10", border: "border-l-amber-500/60", icon: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/20" },
];

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

export default function ReportsPage() {
  const { session, isLoading: sessionLoading, isAuthenticated } = useAuthSession();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [improveResults, setImproveResults] = useState<ImproveResults | null>(null);
  const [loading, setLoading] = useState(true);
  // const [pdfLoading, setPdfLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const studentId = useMemo(() => {
    const id = (session?.user as { id?: string })?.id ?? (session?.user as { user_id?: string })?.user_id ?? (session?.user as { sub?: string })?.sub;
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
          const r = await fetch(`/api/users/by-email?email=${encodeURIComponent(email)}`);
          if (r.ok) {
            const u = await r.json();
            actualId = u.id;
          }
        }

        const [profileRes, dataRes, resultsRes] = await Promise.all([
          fetch(`/api/students/${actualId}/profile`),
          fetch("/api/student/improve/profile-data"),
          fetch("/api/student/improve/results"),
        ]);

        if (profileRes.ok) {
          const data = await profileRes.json();
          const mapped: StudentProfile = {
            id: actualId.substring(0, 8).toUpperCase(),
            name: data.basicInfo?.full_name || "Chưa cập nhật",
            email: data.basicInfo?.email || "Chưa cập nhật",
            phone: data.basicInfo?.phone_number || "Chưa cập nhật",
            address: data.basicInfo?.current_address || "Chưa cập nhật",
            dob: data.basicInfo?.date_of_birth ? new Date(data.basicInfo.date_of_birth).toLocaleDateString("vi-VN") : "Chưa cập nhật",
            avatarUrl: data.basicInfo?.avatar_url || "",
            gpa: 0,
            gpaScale: 10,
            englishLevel: Array.isArray(data.academicProfile?.english_certificates)
              ? data.academicProfile.english_certificates.map((c: { type?: string; score?: string }) => `${c.type || ""} ${c.score ?? ""}`.trim()).filter(Boolean).join(", ") || "Chưa cập nhật"
              : "Chưa cập nhật",
            targetMajor: data.studentInfo?.intended_major || "Chưa xác định",
            targetCountry: data.studentInfo?.target_country || "Chưa xác định",
            extracurriculars: [
              ...(data.background?.academic_extracurriculars?.map((act: { id: string; activity_name?: string; role?: string; start_date?: string; description?: string }) => ({
                id: act.id,
                title: act.activity_name || "Hoạt động",
                role: act.role || "Thành viên",
                year: act.start_date ? new Date(act.start_date).getFullYear().toString() : "—",
                description: act.description || "",
                category: "academic" as const,
              })) || []),
              ...(data.background?.non_academic_extracurriculars?.map((act: { id: string; activity_name?: string; role?: string; start_date?: string; description?: string }) => ({
                id: act.id,
                title: act.activity_name || "Hoạt động",
                role: act.role || "Thành viên",
                year: act.start_date ? new Date(act.start_date).getFullYear().toString() : "—",
                description: act.description || "",
                category: "non_academic" as const,
              })) || []),
            ],
            achievements: [
              ...(data.background?.academic_awards?.map((a: { id: string; award_name?: string; issuing_organization?: string }) => ({
                id: a.id,
                text: `${a.award_name || ""} - ${a.issuing_organization || ""}`.trim(),
                category: "academic" as const,
              })) || []),
              ...(data.background?.non_academic_awards?.map((a: { id: string; award_name?: string; issuing_organization?: string }) => ({
                id: a.id,
                text: `${a.award_name || ""} - ${a.issuing_organization || ""}`.trim(),
                category: "non_academic" as const,
              })) || []),
            ],
            documents: [],
          };
          const gpaDetails = data.academicProfile?.gpa_transcript_details;
          if (gpaDetails) {
            mapped.gpa = parseFloat(gpaDetails.grade12 || gpaDetails.grade11 || gpaDetails.grade10 || "0") || 0;
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
          const data = await dataRes.json();
          setProfileData(data as ProfileData);
        }

        if (resultsRes.ok) {
          const data = await resultsRes.json();
          setImproveResults({ analysis: data.analysis ?? undefined, enhance: data.enhance ?? undefined });
        }
      } catch (e) {
        console.error(e);
        toast.error("Không tải được dữ liệu báo cáo");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [studentId, sessionLoading, isAuthenticated]);

  const handlePrint = () => {
    window.print();
  };

  // Nút Tải PDF và logic export PDF tạm tắt
  // const handleDownloadPdf = async () => {
  //   const el = reportRef.current;
  //   if (!el) {
  //     toast.error("Không tìm thấy nội dung báo cáo");
  //     return;
  //   }
  //   setPdfLoading(true);
  //   const chartWrap = el.querySelector("[data-pdf-chart-wrap]");
  //   const pillarScores = profileData?.feature1_output?.summary?.total_pillar_scores;
  //   let originalChartHTML = "";
  //   try {
  //     const html2canvas = (await import("html2canvas")).default;
  //     const { jsPDF } = await import("jspdf");
  //     if (chartWrap && pillarScores) {
  //       originalChartHTML = chartWrap.innerHTML;
  //       const labels = ACCENT_CARDS.map((c) => c.label);
  //       const colors = ["#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b"];
  //       chartWrap.innerHTML = `...`;
  //     }
  //     const canvas = await html2canvas(el, { ... });
  //     const pdf = new jsPDF("p", "mm", "a4");
  //     pdf.save(`Bao-cao-ho-so-...`);
  //     toast.success("Đã tải PDF thành công");
  //   } catch (e) { ... } finally {
  //     if (chartWrap && originalChartHTML) chartWrap.innerHTML = originalChartHTML;
  //     setPdfLoading(false);
  //   }
  // };

  if (loading || sessionLoading) {
    return (
      <RoleGuard allowedRoles={["user", "student", "STUDENT"]}>
        <StudentPageContainer>
          <PageLoading fullPage={false} message="Đang tải báo cáo..." />
        </StudentPageContainer>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["user", "student", "STUDENT"]}>
      <StudentPageContainer>
        <div className="max-w-6xl mx-auto pb-8">
          {/* Header + actions - hidden when printing */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 print:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <FileBarChart className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Reports</h1>
                <p className="text-sm text-muted-foreground">Phiên bản in & tải báo cáo tổng hợp hồ sơ và module AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                <Printer className="h-4 w-4" />
                In báo cáo
              </button>
              {/* Nút Tải PDF tạm tắt
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={pdfLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {pdfLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Tải PDF
              </button>
              */}
            </div>
          </div>

          {/* Report content - printable, compact */}
          <div
            id="report-print"
            ref={reportRef}
            className="rounded-xl border border-border bg-card overflow-hidden print:border-0 print:shadow-none print:text-black print:bg-white"
          >
            <div className="px-4 py-3 border-b border-border bg-muted/30 print:py-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-bold text-foreground">Báo cáo tổng hợp hồ sơ & Module AI</h2>
                <span className="text-xs text-muted-foreground">{profile?.name ?? "—"} · {new Date().toLocaleDateString("vi-VN")}</span>
              </div>
            </div>

            <div className="p-4 space-y-4 print:p-3 print:space-y-3">
              {/* Row 1: Profile (compact) + Pillars chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">
                <Card className="border border-border print:shadow-none">
                  <CardHeader className="py-2 px-3 flex flex-row items-center gap-2">
                    <User className="h-4 w-4 text-primary shrink-0" />
                    <CardTitle className="text-sm font-semibold m-0">1. Thông tin cá nhân</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3 pt-0 text-xs space-y-1">
                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                      <span className="text-muted-foreground">Họ tên</span><span className="truncate">{profile?.name ?? "—"}</span>
                      <span className="text-muted-foreground">Email</span><span className="truncate">{profile?.email ?? "—"}</span>
                      <span className="text-muted-foreground">GPA</span><span>{profile?.gpa ? `${profile.gpa}/${profile.gpaScale}` : "—"}</span>
                      <span className="text-muted-foreground">Ngoại ngữ</span><span className="truncate">{profile?.englishLevel ?? "—"}</span>
                      <span className="text-muted-foreground">Ngành</span><span className="truncate">{profile?.targetMajor ?? "—"}</span>
                      <span className="text-muted-foreground">Quốc gia</span><span className="truncate">{profile?.targetCountry ?? "—"}</span>
                    </div>
                    {profile && (profile.extracurriculars?.length > 0 || profile.achievements?.length > 0) && (
                      <p className="text-muted-foreground pt-1 border-t border-border mt-1">
                        Hoạt động: {profile.extracurriculars?.length ?? 0} · Thành tích: {profile.achievements?.length ?? 0}
                        {profile.documents?.length ? ` · Tài liệu: ${profile.documents.length}` : ""}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Module 1 – Pillars bar chart (compact) */}
                {(profileData?.feature1_output?.summary?.total_pillar_scores) && (() => {
                  const scores = profileData.feature1_output.summary.total_pillar_scores;
                  const chartData = ACCENT_CARDS.map(({ key, label }) => ({ name: label, value: scores?.[key] ?? 0 }));
                  return (
                    <Card className="border border-border print:shadow-none">
                      <CardHeader className="py-2 px-3 flex flex-row items-center gap-2">
                        <BookOpen className="h-4 w-4 text-emerald-600 shrink-0" />
                        <CardTitle className="text-sm font-semibold m-0">2. Điểm trụ cột</CardTitle>
                        {(profileData.feature1_output.summary.main_spike || profileData.feature1_output.summary.sharpness) && (
                          <Badge variant="secondary" className="text-[10px] ml-auto">
                            {safeStr(profileData.feature1_output.summary.main_spike)} · {safeStr(profileData.feature1_output.summary.sharpness)}
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent className="px-3 pb-3 pt-0">
                        <div className="h-24 w-full" data-pdf-chart-wrap>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                              <XAxis type="number" domain={[0, 100]} hide />
                              <YAxis type="category" dataKey="name" width={72} tick={{ fontSize: 10 }} />
                              <Bar dataKey="value" radius={[0, 2, 2, 0]} maxBarSize={14}>
                                {chartData.map((_, i) => (
                                  <Cell key={i} fill={["#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b"][i]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}
              </div>

              {/* SWOT + summary text (compact, only if no pillar chart above then show as row) */}
              {(profileData?.feature1_output?.summaryText || profileData?.feature1_output?.["B. Phân tích SWOT"]) && (
                <Card className="border border-border print:shadow-none">
                  <CardContent className="px-3 py-2 text-xs">
                    {profileData.feature1_output?.summaryText && (
                      <p className="text-foreground line-clamp-2 mb-2">{safeStr(profileData.feature1_output.summaryText)}</p>
                    )}
                    {profileData.feature1_output?.["B. Phân tích SWOT"] && (() => {
                      const swot = profileData.feature1_output["B. Phân tích SWOT"] as { strengths?: string[]; weaknesses?: string[]; opportunities?: string[]; threats?: string[] };
                      const S = swot.strengths?.length ?? 0, W = swot.weaknesses?.length ?? 0, O = swot.opportunities?.length ?? 0, T = swot.threats?.length ?? 0;
                      if (S + W + O + T === 0) return null;
                      return (
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-[10px]">Mạnh: {S}</Badge>
                          <Badge variant="secondary" className="bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 text-[10px]">Yếu: {W}</Badge>
                          <Badge variant="secondary" className="bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 text-[10px]">Cơ hội: {O}</Badge>
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-[10px]">Thách thức: {T}</Badge>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* 3. Module 2 – MBTI, Grit, RIASEC (3 compact cards) */}
              {profileData?.feature2_output?.assessment && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print:grid-cols-3">
                  {profileData.feature2_output.assessment.mbti && (
                    <Card className="border border-border print:shadow-none">
                      <CardContent className="px-3 py-2">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">MBTI</p>
                        <p className="text-base font-bold text-violet-600 dark:text-violet-400">{profileData.feature2_output.assessment.mbti.personality_type ?? "—"}</p>
                      </CardContent>
                    </Card>
                  )}
                  {profileData.feature2_output.assessment.grit && (
                    <Card className="border border-border print:shadow-none">
                      <CardContent className="px-3 py-2">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Grit</p>
                        <p className="text-base font-bold text-amber-600 dark:text-amber-400">{safeStr(profileData.feature2_output.assessment.grit.score)} · {safeStr(profileData.feature2_output.assessment.grit.level)}</p>
                      </CardContent>
                    </Card>
                  )}
                  {profileData.feature2_output.assessment.riasec && (
                    <Card className="border border-border print:shadow-none">
                      <CardContent className="px-3 py-2">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">RIASEC</p>
                        <p className="text-base font-bold text-sky-600 dark:text-sky-400">{profileData.feature2_output.assessment.riasec.code ?? "—"}</p>
                        {profileData.feature2_output.assessment.riasec.top3?.length ? (
                          <p className="text-[10px] text-muted-foreground mt-0.5">{profileData.feature2_output.assessment.riasec.top3.map(([n]) => n).join(", ")}</p>
                        ) : null}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* 4. Module 3 – Trường + Roadmap (compact) */}
              {(profileData?.feature3_output?.universities || profileData?.feature3_output?.summary || profileData?.feature3_output?.roadmap) && (() => {
                const unis = profileData.feature3_output?.universities;
                const reach = unis?.REACH?.universities ?? [];
                const match = unis?.MATCH?.universities ?? [];
                const safety = unis?.SAFETY?.universities ?? [];
                const summary = profileData.feature3_output?.summary;
                const roadmap = profileData.feature3_output?.roadmap;
                const hasUnis = reach.length > 0 || match.length > 0 || safety.length > 0;
                const hasSummary = summary && (typeof summary === "string" ? summary : Object.keys(summary as object).length > 0);
                const hasRoadmap = roadmap && typeof roadmap === "object" && Object.keys(roadmap).length > 0;
                if (!hasUnis && !hasSummary && !hasRoadmap) return null;
                const r = roadmap as { start_date?: string; monthly_plans?: Array<{ month_name?: string; priority?: string; focus_areas?: string[]; goals?: string[]; tasks?: string[] }> };
                const plans = hasRoadmap && Array.isArray(r.monthly_plans) ? r.monthly_plans : [];
                return (
                  <Card className="border border-border print:shadow-none">
                    <CardHeader className="py-2 px-3 flex flex-row items-center gap-2">
                      <Target className="h-4 w-4 text-sky-600 shrink-0" />
                      <CardTitle className="text-sm font-semibold m-0">4. Gợi ý trường & Lộ trình</CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 pt-0 space-y-3 text-xs">
                      {hasSummary && typeof summary === "string" && <p className="line-clamp-2 text-foreground">{summary}</p>}
                      {hasSummary && typeof summary === "object" && ("total_matched" in summary || "reach_count" in summary) && (
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-[10px]">Tổng: {Number((summary as Record<string, unknown>).total_matched) || 0}</Badge>
                          <Badge variant="outline" className="text-violet-600 border-violet-300 text-[10px]">Reach: {Number((summary as Record<string, unknown>).reach_count) || 0}</Badge>
                          <Badge variant="outline" className="text-emerald-600 border-emerald-300 text-[10px]">Match: {Number((summary as Record<string, unknown>).match_count) || 0}</Badge>
                          <Badge variant="outline" className="text-amber-600 border-amber-300 text-[10px]">Safety: {Number((summary as Record<string, unknown>).safety_count) || 0}</Badge>
                        </div>
                      )}
                      {hasUnis && (
                        <div className="grid grid-cols-3 gap-2">
                          {reach.length > 0 && <div><p className="font-medium text-violet-600 text-[10px] mb-0.5">Reach</p><ul className="space-y-0.5">{reach.slice(0, 3).map((u, i) => <li key={i} className="truncate">{u.name}</li>)}{reach.length > 3 ? <li className="text-muted-foreground">+{reach.length - 3}</li> : null}</ul></div>}
                          {match.length > 0 && <div><p className="font-medium text-emerald-600 text-[10px] mb-0.5">Match</p><ul className="space-y-0.5">{match.slice(0, 3).map((u, i) => <li key={i} className="truncate">{u.name}</li>)}{match.length > 3 ? <li className="text-muted-foreground">+{match.length - 3}</li> : null}</ul></div>}
                          {safety.length > 0 && <div><p className="font-medium text-amber-600 text-[10px] mb-0.5">Safety</p><ul className="space-y-0.5">{safety.slice(0, 3).map((u, i) => <li key={i} className="truncate">{u.name}</li>)}{safety.length > 3 ? <li className="text-muted-foreground">+{safety.length - 3}</li> : null}</ul></div>}
                        </div>
                      )}
                      {plans.length > 0 && (
                        <div className="border-t border-border pt-2">
                          <p className="text-[10px] text-muted-foreground mb-1">Lộ trình{r.start_date ? ` từ ${r.start_date}` : ""}</p>
                          <div className="flex flex-wrap gap-1">
                            {plans.slice(0, 6).map((plan, idx) => (
                              <Badge key={idx} variant="secondary" className="text-[10px] font-normal">
                                {plan.month_name ?? `T${idx + 1}`}{plan.priority ? ` · ${plan.priority}` : ""}
                              </Badge>
                            ))}
                            {plans.length > 6 && <span className="text-muted-foreground text-[10px]">+{plans.length - 6} tháng</span>}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })()}

              {/* 5. Module 4 – Improve (compact) */}
              {(improveResults?.analysis || improveResults?.enhance) && (
                <Card className="border border-border print:shadow-none">
                  <CardHeader className="py-2 px-3 flex flex-row items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
                    <CardTitle className="text-sm font-semibold m-0">5. Phân tích & Đề xuất (Improve)</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3 pt-0 space-y-3 text-xs">
                    {improveResults.analysis && typeof improveResults.analysis === "object" && (() => {
                      const a = improveResults.analysis as Record<string, unknown>;
                      const overall = a.overall as Record<string, unknown> | undefined;
                      const f1 = a.feature1_output as Record<string, unknown> | undefined;
                      const sum = f1?.summary as Record<string, unknown> | undefined;
                      const scores = (a.pillar_scores as Record<string, number> | undefined) ?? (sum?.total_pillar_scores as Record<string, number> | undefined);
                      const feedbackText = overall ? (safeStr(overall.feedback) || safeStr(overall.summary)) : "—";
                      const prio = Array.isArray(overall?.priority_suggestions) ? (overall!.priority_suggestions as unknown[]) : [];
                      return (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {overall?.overall_score != null && <Badge variant="secondary" className="text-[10px]">Tổng: {Number(overall.overall_score)}/100</Badge>}
                            {overall?.personal_fit_score != null && <Badge variant="secondary" className="text-[10px]">Phù hợp: {Number(overall.personal_fit_score)}/100</Badge>}
                            {scores && ["aca", "lan", "hdnk", "skill"].map((k) => <Badge key={k} variant="outline" className="text-[10px]">{k}: {scores[k] ?? "—"}</Badge>)}
                          </div>
                          {feedbackText !== "—" && <p className="text-foreground line-clamp-2">{feedbackText}</p>}
                          {prio.length > 0 && (
                            <ul className="space-y-2">
                              {prio.slice(0, 5).map((p, i) => {
                                const raw = safeStr(p);
                                const match = raw.match(/^\s*\*{0,2}(\d+)\.\s*(.+?)\*{0,2}:\s*([\s\S]*)/);
                                const num = match ? match[1] : String(i + 1);
                                const title = match ? match[2].replace(/\*+/g, '').trim() : null;
                                const body = match ? match[3].trim() : raw;
                                return (
                                  <li key={i} className="flex gap-2 rounded-lg border border-border/60 bg-muted/20 px-2.5 py-1.5">
                                    <span className="shrink-0 font-semibold text-amber-600 dark:text-amber-400 text-[10px]">{num}.</span>
                                    <span className="min-w-0 text-foreground">
                                      {title && <span className="font-medium">{title}: </span>}
                                      <span className="text-muted-foreground">{body}</span>
                                    </span>
                                  </li>
                                );
                              })}
                              {prio.length > 5 && <li className="text-muted-foreground text-[10px] pl-4">+{prio.length - 5} gợi ý</li>}
                            </ul>
                          )}
                        </div>
                      );
                    })()}
                    {improveResults.enhance && typeof improveResults.enhance === "object" && (() => {
                      const e = improveResults.enhance as Record<string, unknown>;
                      const recs = Array.isArray(e.recommendations) ? (e.recommendations as Record<string, unknown>[]) : [];
                      const improvements = Array.isArray(e.improvements) ? (e.improvements as Record<string, unknown>[]) : [];
                      const sumText = safeStr(e.enhanced_summary);
                      return (
                        <div className="border-t border-border pt-2 space-y-1">
                          {sumText !== "—" && <p className="line-clamp-2 text-foreground">{sumText}</p>}
                          {recs.length > 0 && <p className="text-muted-foreground">Khuyến nghị: {recs.slice(0, 3).map((r) => safeStr(r.specific_rec_name)).filter(Boolean).join(" · ") || recs.length + " mục"}{recs.length > 3 ? ` (+${recs.length - 3})` : ""}</p>}
                          {improvements.length > 0 && <p className="text-muted-foreground">Cải thiện: {improvements.slice(0, 2).map((imp) => `${safeStr(imp.pillar)}→${safeStr(imp.target_score)}`).join(", ")}{improvements.length > 2 ? ` +${improvements.length - 2}` : ""}</p>}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              {!profileData?.feature1_output?.summary?.total_pillar_scores && !profileData?.feature1_output?.summaryText && !profileData?.feature1_output?.["B. Phân tích SWOT"] && !profileData?.feature2_output?.assessment && !profileData?.feature3_output?.universities && !profileData?.feature3_output?.summary && !profileData?.feature3_output?.roadmap && !improveResults?.analysis && !improveResults?.enhance && (
                <Card className="border border-dashed border-border print:shadow-none">
                  <CardContent className="py-4 text-center text-muted-foreground text-xs">
                    <Award className="h-6 w-6 mx-auto mb-1 opacity-50" />
                    Chưa có dữ liệu module AI. Hoàn thành hồ sơ, bài test và trang Improve.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

      </StudentPageContainer>
    </RoleGuard>
  );
}
