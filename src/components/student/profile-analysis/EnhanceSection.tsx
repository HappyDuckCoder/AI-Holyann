"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import type { Feature1AnalysisOutput } from "@/lib/schemas/profile-analysis-v2.schema";
import type { Feature1EnhanceOutput } from "@/lib/schemas/profile-analysis-v2.schema";

interface EnhanceSectionProps {
  studentId: string;
  latestAnalysis: { full_result: Feature1AnalysisOutput } | null;
  latestEnhance: { enhance_result: Feature1EnhanceOutput } | null;
  limits: {
    enhanceLimit: number | null;
    enhanceUsed: number;
    enhanceRemaining: number | null;
    analysisRemaining: number | null;
  };
  onSuccess: () => void;
}

export function EnhanceSection({
  studentId,
  latestAnalysis,
  latestEnhance,
  limits,
  onSuccess,
}: EnhanceSectionProps) {
  const [willingArea, setWillingArea] = useState<"A" | "B" | "C">("A");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingRun, setPendingRun] = useState(false);
  const [roadmapExpanded, setRoadmapExpanded] = useState(false);

  const PILLAR_LABELS: Record<string, string> = {
    academic: "Học thuật",
    language: "Ngoại ngữ",
    extracurricular: "Hoạt động ngoại khóa",
    skills: "Kỹ năng",
  };
  const formatPrior = (prior: string) =>
    prior === "need_now"
      ? "Cần thực hiện ngay bây giờ"
      : prior === "need_soon"
        ? "Cần sớm thực hiện"
        : prior;

  const runEnhance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/students/${studentId}/profile-analysis/enhance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ willing_area: willingArea }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cải thiện thất bại");
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setPendingRun(false);
    }
  }, [studentId, willingArea, onSuccess]);

  const handleEnhanceClick = () => {
    if (!latestAnalysis?.full_result) {
      setError("Vui lòng chạy Đánh giá profile trước.");
      return;
    }
    if (limits.enhanceLimit !== null && limits.enhanceUsed >= limits.enhanceLimit) {
      setError("Bạn đã dùng hết số lần cải thiện. Vui lòng nâng cấp gói.");
      return;
    }
    setPendingRun(true);
    setConfirmOpen(true);
  };

  const remaining = limits.enhanceLimit == null ? "không giới hạn" : Math.max(0, limits.enhanceLimit - limits.enhanceUsed);

  return (
    <section className="space-y-5">
      <div className="inline-flex items-center gap-2 rounded-full border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-500/15 to-teal-500/10 px-4 py-2 shadow-sm">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-emerald-700 dark:text-emerald-300">Cải thiện profile</span>
      </div>
      <h2 className="font-heading text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
        Cải thiện profile
      </h2>
      <p className="text-muted-foreground text-sm">
        Chọn vùng du học mong muốn để nhận gợi ý ưu tiên và lộ trình 6/12 tháng. Cần có kết quả Đánh giá profile trước.
        Phía dưới là phần gợi ý cải thiện — bạn tham khảo để phát triển tiềm năng của mình nhé, không ép bản thân làm theo từng bước này.
      </p>

      <div className="rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-card to-teal-500/5 p-4 sm:p-6 shadow-md border-l-4 border-l-emerald-500">
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label className="text-emerald-800 dark:text-emerald-200 font-medium">Vùng du học mong muốn</Label>
            <select
              value={willingArea}
              onChange={(e) => setWillingArea(e.target.value as "A" | "B" | "C")}
              className="h-11 rounded-lg border-2 border-emerald-500/30 bg-background px-4 text-sm focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="A">A — Mỹ (US / North America)</option>
              <option value="B">B — Châu Á</option>
              <option value="C">C — Châu Âu / Anh / Úc / Canada</option>
            </select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <Button
          onClick={handleEnhanceClick}
          disabled={loading || !latestAnalysis}
          className="rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 transition-all"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          {latestEnhance ? "Cải thiện lại" : "Cải thiện"}
        </Button>
        {limits.enhanceLimit != null && (
          <span className="text-sm text-muted-foreground">Còn {remaining} lần cải thiện</span>
        )}
      </div>

      {/* Skeleton khi đang cải thiện lại */}
      {loading && (
        <div className="rounded-2xl border-2 border-emerald-500/20 bg-gradient-to-b from-emerald-500/5 to-transparent p-6 sm:p-8 shadow-lg space-y-4">
          <div className="space-y-3">
            <div className="h-4 w-3/4 rounded bg-muted/60 animate-pulse" />
            <div className="h-4 w-full rounded bg-muted/40 animate-pulse" />
            <div className="h-4 w-4/5 rounded bg-muted/40 animate-pulse" />
            <div className="h-32 rounded-xl bg-muted/30 animate-pulse" />
          </div>
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <Loader2 className="size-4 animate-spin shrink-0" />
            Vui lòng đợi chút, hệ thống đang tính toán cho bạn.
          </p>
        </div>
      )}

      {!loading && latestEnhance?.enhance_result && (
        <div className="rounded-2xl border-2 border-emerald-500/20 bg-gradient-to-b from-emerald-500/5 to-transparent p-4 sm:p-6 shadow-lg mt-4 sm:mt-6">
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
            <span className="h-1 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
            Kết quả cải thiện
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Phía dưới là gợi ý cải thiện, bạn tham khảo để phát triển tiềm năng của mình nhé — không ép bản thân làm theo từng bước này.
          </p>

          {/* Biểu đồ cột: so sánh Trước / Sau cải thiện */}
          {latestEnhance.enhance_result.pillar_score_after_enhance && latestAnalysis?.full_result?.pillar_scores && (
            <div className="mb-6 rounded-xl border border-emerald-500/20 bg-white/50 dark:bg-white/5 p-4">
              <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-3">Điểm 4 trụ cột: trước và sau cải thiện</h4>
              <div className="h-44 w-full text-foreground [&_.recharts-text]:fill-foreground [&_.recharts-legend-item-text]:fill-foreground">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={(["academic", "language", "extracurricular", "skills"] as const).map((key) => {
                      const beforeRaw = latestAnalysis!.full_result!.pillar_scores?.[key];
                      const afterRaw = latestEnhance!.enhance_result!.pillar_score_after_enhance?.[key];
                      const to100 = (v: number | undefined) => {
                        if (v == null) return 0;
                        return typeof v === "number" ? (v <= 1 ? Math.round(v * 100) : Math.round(v)) : 0;
                      };
                      return {
                        name: PILLAR_LABELS[key],
                        trước: to100(beforeRaw),
                        sau: to100(afterRaw),
                      };
                    })}
                    layout="vertical"
                    margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
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
                      formatter={(value: number, name: string) => [`${value} điểm`, name === "trước" ? "Trước cải thiện" : "Sau cải thiện"]}
                      labelFormatter={(label) => label}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "0.75rem" }}
                      formatter={(value) => (value === "trước" ? "Trước cải thiện" : "Sau cải thiện")}
                    />
                    <Bar dataKey="trước" name="trước" fill="#94a3b8" radius={[0, 4, 4, 0]} maxBarSize={18} />
                    <Bar dataKey="sau" name="sau" fill="#10b981" radius={[0, 4, 4, 0]} maxBarSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {latestEnhance.enhance_result.list_suggestion?.length > 0 && (
            <div className="mb-4 rounded-xl border-l-4 border-l-amber-500 bg-amber-500/10 dark:bg-amber-500/10 p-4">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">Gợi ý ưu tiên</p>
              <ul className="list-disc list-inside text-sm text-foreground space-y-1">
                {latestEnhance.enhance_result.list_suggestion.slice(0, 5).map((s, i) => (
                  <li key={i}>
                    <span className="font-medium text-amber-900 dark:text-amber-100">{formatPrior(s.prior)}</span>: {s.what_to_do}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {latestEnhance.enhance_result.roadmap?.months?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 mb-2">Lộ trình ({latestEnhance.enhance_result.roadmap.type})</p>
              <div className="space-y-2">
                {(roadmapExpanded
                  ? latestEnhance.enhance_result.roadmap.months
                  : latestEnhance.enhance_result.roadmap.months.slice(0, 2)
                ).map((m, i) => (
                  <div key={i} className="rounded-xl border-l-4 border-l-teal-500 bg-teal-500/10 dark:bg-teal-500/10 p-3 text-sm">
                    <p className="font-semibold text-teal-800 dark:text-teal-200">Tháng {m.month}</p>
                    <p className="text-muted-foreground mt-1">{m.target}</p>
                    {m.tasks?.length > 0 && (
                      <ul className="mt-2 list-disc list-inside text-muted-foreground">
                        {(roadmapExpanded ? m.tasks : m.tasks.slice(0, 2)).map((t, j) => (
                          <li key={j}>{t}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
              {latestEnhance.enhance_result.roadmap.months.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
                  onClick={() => setRoadmapExpanded((e) => !e)}
                >
                  {roadmapExpanded ? (
                    <>
                      <ChevronUp className="size-4 mr-1" />
                      Thu gọn
                    </>
                  ) : (
                    <>
                      <ChevronDown className="size-4 mr-1" />
                      Xem thêm ({latestEnhance.enhance_result.roadmap.months.length - 2} tháng)
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
          {latestEnhance.enhance_result.pillar_score_after_enhance && (
            <div className="mt-4 grid gap-2 sm:grid-cols-4">
              {(["academic", "language", "extracurricular", "skills"] as const).map((key, i) => {
                const colors = ["border-l-sky-500 bg-sky-500/15", "border-l-violet-500 bg-violet-500/15", "border-l-emerald-500 bg-emerald-500/15", "border-l-amber-500 bg-amber-500/15"];
                return (
                  <div key={key} className={`rounded-xl border-l-4 p-3 ${colors[i]}`}>
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      {PILLAR_LABELS[key]} (sau cải thiện)
                    </p>
                    <p className="text-xl font-bold text-foreground">
                      {latestEnhance.enhance_result.pillar_score_after_enhance[key]}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) setPendingRun(false);
        }}
      >
        <DialogContent className="p-6 sm:p-6 gap-4">
          <DialogHeader>
            <DialogTitle>Cải thiện lại</DialogTitle>
            <DialogDescription>
              Chạy cải thiện lại sẽ lưu kết quả mới. Tiếp tục?
              <div className="mt-3 rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
                <p className="font-medium text-foreground mb-1">Số lần còn lại trong gói:</p>
                <ul className="space-y-0.5 text-muted-foreground">
                  <li>Phân tích lại: {limits.analysisRemaining != null ? `${limits.analysisRemaining} lần` : "không giới hạn"}</li>
                  <li>Cải thiện lại: {limits.enhanceRemaining != null ? `${limits.enhanceRemaining} lần` : "không giới hạn"}</li>
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Hủy</Button>
            <Button
            onClick={() => {
              setPendingRun(false);
              runEnhance();
            }}
            disabled={loading}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : "Tiếp tục"}
          </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
