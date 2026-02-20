"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function firstSentence(text: string, maxWords = 12): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const words = trimmed.split(/\s+/).slice(0, maxWords);
  return words.join(" ");
}

export interface ImproveHeroProps {
  /** Overall score 0–100; null = no data */
  overallScore: number | null;
  /** e.g. +5 or -2; null = no trend */
  trendValue?: number | null;
  /** Short insight (max 12 words) */
  insight?: string | null;
  loading?: boolean;
}

export function ImproveHero({
  overallScore,
  trendValue,
  insight,
  loading,
}: ImproveHeroProps) {
  const score = overallScore != null ? Math.round(Math.min(100, Math.max(0, overallScore))) : null;
  const trend = trendValue != null ? trendValue : null;
  const shortInsight = insight ? firstSentence(insight, 12) : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative w-full overflow-hidden border-b border-border bg-card"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,hsl(var(--primary)/0.12),transparent)]" />
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8 px-4 py-6 sm:px-6 sm:py-8 md:px-8">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Student Improvement Center
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Your Improvement Center
          </h1>
          {shortInsight && !loading && (
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              {shortInsight}
              {insight && insight.split(/\s+/).length > 12 ? "…" : ""}
            </p>
          )}
          {loading && (
            <div className="mt-2 h-5 w-64 rounded bg-muted/60 animate-pulse" />
          )}
        </div>

        <div className="flex items-center gap-6 shrink-0">
          {/* Radial progress */}
          <div className="relative h-24 w-24 sm:h-28 sm:w-28">
            {loading ? (
              <div className="h-full w-full rounded-full bg-muted/60 animate-pulse" />
            ) : (
              <>
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-muted/30"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="none"
                    d="M18 2.5 a 15.5 15.5 0 0 1 0 31 a 15.5 15.5 0 0 1 0 -31"
                  />
                  <motion.path
                    className="text-primary"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: score != null ? score / 100 : 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    d="M18 2.5 a 15.5 15.5 0 0 1 0 31 a 15.5 15.5 0 0 1 0 -31"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl sm:text-2xl font-bold tabular-nums text-foreground">
                    {score != null ? score : "—"}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Monthly trend */}
          {!loading && (
            <div className="text-center">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Trend
              </p>
              {trend != null ? (
                <p
                  className={cn(
                    "mt-0.5 text-lg font-semibold tabular-nums",
                    trend >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  )}
                >
                  {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
                </p>
              ) : (
                <p className="mt-0.5 text-sm text-muted-foreground">—</p>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
