"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, Loader2, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";
import type { Feature1AnalysisInput, Feature1AnalysisOutput } from "@/lib/schemas/profile-analysis-v2.schema";

const PILLAR_LABELS: Record<keyof NonNullable<Feature1AnalysisOutput["pillar_scores"]>, string> = {
  academic: "Học thuật",
  language: "Ngoại ngữ",
  extracurricular: "Hoạt động ngoại khóa",
  skills: "Kỹ năng",
};

interface AnalysisFormSectionProps {
  studentId: string;
  latestAnalysis: { full_result: Feature1AnalysisOutput } | null;
  limits: { analysisLimit: number | null; analysisUsed: number };
  onSuccess: () => void;
}

export function AnalysisFormSection({
  studentId,
  latestAnalysis,
  limits,
  onSuccess,
}: AnalysisFormSectionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [profilePayload, setProfilePayload] = useState<Feature1AnalysisInput | null>(null);
  const [payloadLoading, setPayloadLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setPayloadLoading(true);
    fetch(`/api/students/${studentId}/profile-analysis/payload`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!cancelled) setProfilePayload(data ?? null);
      })
      .catch(() => { if (!cancelled) setProfilePayload(null); })
      .finally(() => { if (!cancelled) setPayloadLoading(false); });
    return () => { cancelled = true; };
  }, [studentId]);

  const runAnalyze = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/students/${studentId}/profile-analysis/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Phân tích thất bại");
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  }, [studentId, onSuccess]);

  const handleAnalyzeClick = () => {
    if (limits.analysisLimit !== null && limits.analysisUsed >= limits.analysisLimit) {
      setError("Bạn đã dùng hết số lần đánh giá. Vui lòng nâng cấp gói.");
      return;
    }
    setConfirmOpen(true);
  };

  const remaining =
    limits.analysisLimit == null ? "không giới hạn" : Math.max(0, limits.analysisLimit - limits.analysisUsed);

  const payload = profilePayload;
  const hasPayload = payload && (payload.gpa?.value_10 != null || (payload.subjects?.length ?? 0) > 0);

  return (
    <section className="space-y-5">
      <div className="inline-flex items-center gap-2 rounded-full border-2 border-sky-500/40 bg-gradient-to-r from-sky-500/15 to-blue-500/10 px-4 py-2 shadow-sm">
        <span className="h-2.5 w-2.5 rounded-full bg-sky-500 animate-pulse" />
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-sky-700 dark:text-sky-300">Đánh giá profile</span>
      </div>
      <h2 className="font-heading text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent">
        Đánh giá profile
      </h2>
      <p className="text-muted-foreground text-sm">
        Dữ liệu phân tích được lấy từ hồ sơ đã lưu. Hãy{" "}
        <Link href="/student/profile" className="text-sky-600 dark:text-sky-400 font-medium underline hover:no-underline">
          cập nhật hồ sơ
        </Link>{" "}
        nếu cần chỉnh sửa. Trước khi phân tích, xác nhận bạn đã chắc chắn với hồ sơ hiện tại.
      </p>

      {/* Thông tin hồ sơ (profile summary) */}
      <div className="rounded-2xl border-2 border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-card to-emerald-500/5 p-4 sm:p-6 shadow-md border-l-4 border-l-teal-500">
        <h3 className="text-sm font-semibold text-teal-800 dark:text-teal-200 flex items-center gap-2 mb-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/20">
            <FileText className="size-4 text-teal-600 dark:text-teal-400" />
          </span>
          Thông tin hồ sơ sẽ dùng để phân tích
        </h3>
        {payloadLoading ? (
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        ) : !hasPayload ? (
          <p className="text-sm text-muted-foreground">
            Chưa có đủ thông tin. Vui lòng{" "}
            <Link href="/student/profile" className="text-primary underline">cập nhật hồ sơ</Link> (GPA, môn học, ngoại ngữ, hoạt động, kỹ năng...).
          </p>
        ) : (
          <div className="space-y-4 text-sm">
            {payload?.gpa?.value_10 != null && (
              <div className="rounded-lg border-l-4 border-l-amber-500 bg-amber-500/10 dark:bg-amber-500/5 p-3">
                <p className="font-semibold text-amber-800 dark:text-amber-200 mb-1">GPA (thang 10)</p>
                <p className="text-amber-900/90 dark:text-amber-100/90 text-lg font-bold">{payload.gpa.value_10}</p>
              </div>
            )}
            {(payload?.subjects?.length ?? 0) > 0 && (
              <div className="rounded-lg border-l-4 border-l-violet-500 bg-violet-500/10 dark:bg-violet-500/5 p-3">
                <p className="font-semibold text-violet-800 dark:text-violet-200 mb-1">Môn học</p>
                <ul className="text-muted-foreground space-y-0.5 list-disc list-inside">
                  {payload.subjects!.map((s, i) => (
                    <li key={i}>
                      {s.name}: {s.score_10} — {s.group === "natural" ? "Tự nhiên" : s.group === "language" ? "Ngôn ngữ" : "Xã hội"}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(payload?.languages?.length ?? 0) > 0 && (
              <div className="rounded-lg border-l-4 border-l-sky-500 bg-sky-500/10 dark:bg-sky-500/5 p-3">
                <p className="font-semibold text-sky-800 dark:text-sky-200 mb-1">Ngoại ngữ</p>
                <ul className="text-muted-foreground space-y-0.5 list-disc list-inside">
                  {payload.languages!.map((l, i) => (
                    <li key={i}>{l.language_name} ({l.score_name}): {l.value}</li>
                  ))}
                </ul>
              </div>
            )}
            {(payload?.standardized_tests?.length ?? 0) > 0 && (
              <div className="rounded-lg border-l-4 border-l-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/5 p-3">
                <p className="font-semibold text-indigo-800 dark:text-indigo-200 mb-1">Bài chuẩn hóa</p>
                <ul className="text-muted-foreground space-y-0.5 list-disc list-inside">
                  {payload.standardized_tests!.map((t, i) => (
                    <li key={i}>{t.name}: {t.value}{t.max_value ? ` / ${t.max_value}` : ""} {t.group ? `(${t.group})` : ""}</li>
                  ))}
                </ul>
              </div>
            )}
            {(payload?.academic_awards?.length ?? 0) > 0 && (
              <div className="rounded-lg border-l-4 border-l-amber-500 bg-amber-500/10 dark:bg-amber-500/5 p-3">
                <p className="font-semibold text-amber-800 dark:text-amber-200 mb-1">Giải thưởng học thuật</p>
                <ul className="text-muted-foreground space-y-0.5 list-disc list-inside">
                  {payload.academic_awards!.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            )}
            {(payload?.other_awards?.length ?? 0) > 0 && (
              <div className="rounded-lg border-l-4 border-l-rose-500 bg-rose-500/10 dark:bg-rose-500/5 p-3">
                <p className="font-semibold text-rose-800 dark:text-rose-200 mb-1">Giải thưởng khác</p>
                <ul className="text-muted-foreground space-y-0.5 list-disc list-inside">
                  {payload.other_awards!.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            )}
            {(payload?.academic_extracurricular?.length ?? 0) > 0 && (
              <div className="rounded-lg border-l-4 border-l-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/5 p-3">
                <p className="font-semibold text-emerald-800 dark:text-emerald-200 mb-1">Hoạt động ngoại khóa học thuật</p>
                <ul className="text-muted-foreground space-y-0.5 list-disc list-inside">
                  {payload.academic_extracurricular!.map((e, i) => (
                    <li key={i}>{e.name} — {e.role || "—"} (mức ảnh hưởng: {e.impact_tier ?? "—"})</li>
                  ))}
                </ul>
              </div>
            )}
            {(payload?.experiments?.length ?? 0) > 0 && (
              <div className="rounded-lg border-l-4 border-l-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/5 p-3">
                <p className="font-semibold text-cyan-800 dark:text-cyan-200 mb-1">Thí nghiệm</p>
                <ul className="text-muted-foreground space-y-0.5 list-disc list-inside">
                  {payload.experiments!.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </div>
            )}
            {(payload?.projects?.length ?? 0) > 0 && (
              <div className="rounded-lg border-l-4 border-l-fuchsia-500 bg-fuchsia-500/10 dark:bg-fuchsia-500/5 p-3">
                <p className="font-semibold text-fuchsia-800 dark:text-fuchsia-200 mb-1">Dự án</p>
                <ul className="text-muted-foreground space-y-0.5 list-disc list-inside">
                  {payload.projects!.map((p, i) => (
                    <li key={i}>{p.name} — nhóm {p.group}, tier {p.tier}</li>
                  ))}
                </ul>
              </div>
            )}
            {(payload?.hard_skills?.length ?? 0) > 0 && (
              <div className="rounded-lg border-l-4 border-l-orange-500 bg-orange-500/10 dark:bg-orange-500/5 p-3">
                <p className="font-semibold text-orange-800 dark:text-orange-200 mb-1">Kỹ năng cứng</p>
                <ul className="text-muted-foreground space-y-0.5 list-disc list-inside">
                  {payload.hard_skills!.map((s, i) => (
                    <li key={i}>{s.name}{s.level ? ` (${s.level})` : ""}</li>
                  ))}
                </ul>
              </div>
            )}
            {(payload?.soft_skills?.length ?? 0) > 0 && (
              <div className="rounded-lg border-l-4 border-l-lime-500 bg-lime-500/10 dark:bg-lime-500/5 p-3">
                <p className="font-semibold text-lime-800 dark:text-lime-200 mb-1">Kỹ năng mềm</p>
                <ul className="text-muted-foreground space-y-0.5 list-disc list-inside">
                  {payload.soft_skills!.map((s, i) => (
                    <li key={i}>{s.name}{s.level ? ` (${s.level})` : ""}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Nút bên ngoài card */}
      {error && <p className="text-sm text-destructive font-medium">{error}</p>}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <Button
          onClick={handleAnalyzeClick}
          disabled={loading || !hasPayload}
          className="rounded-xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:from-sky-600 hover:via-blue-600 hover:to-indigo-600 transition-all"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          {latestAnalysis ? "Phân tích lại" : "Phân tích"}
        </Button>
        {limits.analysisLimit != null && (
          <span className="text-sm text-muted-foreground">Còn {remaining} lần đánh giá</span>
        )}
      </div>

      {/* Kết quả chi tiết */}
      {latestAnalysis?.full_result && (
        <div className="rounded-2xl border-2 border-sky-500/20 bg-gradient-to-b from-sky-500/5 to-transparent p-4 sm:p-6 shadow-lg space-y-6">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <span className="h-1 w-8 rounded-full bg-gradient-to-r from-sky-500 to-blue-500" />
            Kết quả đánh giá
          </h3>

          {/* Biểu đồ cột 4 trụ */}
          {latestAnalysis.full_result.pillar_scores && (
            <div className="rounded-xl border border-sky-500/20 bg-white/50 dark:bg-white/5 p-4">
              <h4 className="text-sm font-semibold text-sky-700 dark:text-sky-300 mb-3">Điểm 4 trụ cột (Pillars)</h4>
              <div className="h-40 w-full text-foreground [&_.recharts-text]:fill-foreground">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={(["academic", "language", "extracurricular", "skills"] as const).map((key) => {
                      const v = latestAnalysis!.full_result!.pillar_scores?.[key];
                      const num = typeof v === "number" ? (v <= 1 ? v * 100 : v) : 0;
                      return { name: PILLAR_LABELS[key], value: Math.round(num) };
                    })}
                    layout="vertical"
                    margin={{ top: 0, right: 32, left: 0, bottom: 0 }}
                  >
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: "var(--foreground)" }} />
                    <Tooltip
                      cursor={{ fill: "var(--muted)" }}
                      contentStyle={{
                        borderRadius: "0.75rem",
                        border: "1px solid var(--border)",
                        backgroundColor: "var(--card)",
                        padding: "0.5rem 0.75rem",
                        fontSize: "0.875rem",
                      }}
                      labelStyle={{ fontWeight: 600 }}
                      formatter={(value: number) => [`${value} điểm`, "Điểm"]}
                      labelFormatter={(label) => label}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20}>
                      {["#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b"].map((fill, i) => (
                        <Cell key={i} fill={fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {latestAnalysis.full_result.pillar_scores && (latestAnalysis.full_result.swot || latestAnalysis.full_result.areas || (latestAnalysis.full_result.spikes?.length ?? 0) > 0) && (
            <div className="border-t border-border my-2" role="separator" aria-hidden />
          )}

          {/* SWOT */}
          {latestAnalysis.full_result.swot && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Phân tích SWOT</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {(["S", "W", "O", "T"] as const).map((k) => {
                  const labels = { S: "Điểm mạnh", W: "Điểm yếu", O: "Cơ hội", T: "Thách thức" };
                  const colors = {
                    S: "border-l-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
                    W: "border-l-rose-500 bg-rose-500/10 dark:bg-rose-500/10 text-rose-800 dark:text-rose-200",
                    O: "border-l-sky-500 bg-sky-500/10 dark:bg-sky-500/10 text-sky-800 dark:text-sky-200",
                    T: "border-l-violet-500 bg-violet-500/10 dark:bg-violet-500/10 text-violet-800 dark:text-violet-200",
                  };
                  const list = latestAnalysis.full_result.swot[k] || [];
                  return (
                    <div key={k} className={`rounded-xl border-l-4 p-4 ${colors[k]}`}>
                      <p className="text-xs font-bold uppercase tracking-wider mb-2 opacity-90">
                        {labels[k]}
                      </p>
                      <ul className="list-disc list-inside text-sm text-foreground space-y-1">
                        {list.length > 0 ? list.map((t, i) => <li key={i}>{t}</li>) : <li className="opacity-60">—</li>}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {latestAnalysis.full_result.swot && (latestAnalysis.full_result.areas || (latestAnalysis.full_result.spikes?.length ?? 0) > 0) && (
            <div className="border-t border-border my-2" role="separator" aria-hidden />
          )}

          {/* Trường / vùng phù hợp */}
          {latestAnalysis.full_result.areas && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Vùng / trường phù hợp</h4>
              <div className="space-y-3">
                {(["A", "B", "C"] as const).map((key, idx) => {
                  const area = latestAnalysis!.full_result!.areas[key];
                  if (!area?.name) return null;
                  const areaColors = [
                    "border-l-blue-500 bg-blue-500/10 dark:bg-blue-500/10",
                    "border-l-amber-500 bg-amber-500/10 dark:bg-amber-500/10",
                    "border-l-teal-500 bg-teal-500/10 dark:bg-teal-500/10",
                  ];
                  return (
                    <div key={key} className={`rounded-xl border-l-4 p-4 ${areaColors[idx]}`}>
                      <p className="font-semibold text-foreground">{area.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Mức phù hợp: <span className="font-medium text-foreground">{area.suitability_level}</span>
                        {typeof area.suitability === "number" && ` (${area.suitability})`}
                      </p>
                      {area.reason && <p className="text-sm text-foreground mt-2">{area.reason}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {latestAnalysis.full_result.areas && (latestAnalysis.full_result.spikes?.length ?? 0) > 0 && (
            <div className="border-t border-border my-2" role="separator" aria-hidden />
          )}

          {/* Spikes */}
          {latestAnalysis.full_result.spikes && latestAnalysis.full_result.spikes.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Spikes (điểm nổi bật)</h4>
              <ul className="space-y-3">
                {latestAnalysis.full_result.spikes.map((s, i) => (
                  <li key={i} className="rounded-xl border-l-4 border-l-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/10 p-3">
                    <p className="font-semibold text-indigo-800 dark:text-indigo-200">{s.type} — {s.tier}</p>
                    {s.evidence && <p className="text-sm text-muted-foreground mt-1">{s.evidence}</p>}
                    {s.comment && <p className="text-sm text-foreground mt-1">{s.comment}</p>}
                    {s.score != null && <p className="text-xs text-muted-foreground mt-1">Điểm: {s.score}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="p-6 sm:p-6 gap-4">
          <DialogHeader>
            <DialogTitle>{latestAnalysis ? "Phân tích lại" : "Xác nhận trước khi phân tích"}</DialogTitle>
            <DialogDescription>
              Kết quả phân tích dựa trên hồ sơ hiện tại của bạn. Bạn đã chắc chắn với thông tin hồ sơ chưa? Nếu chưa, hãy cập nhật hồ sơ trước khi chạy phân tích.
              {limits.analysisLimit != null && (
                <span className="block mt-2">Bạn còn {remaining} lần đánh giá.</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Hủy
            </Button>
            <Button onClick={runAnalyze} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Đã chắc chắn, phân tích"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
