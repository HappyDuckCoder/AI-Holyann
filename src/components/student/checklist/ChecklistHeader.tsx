"use client";

import React from "react";
import { motion } from "framer-motion";

interface ChecklistHeaderProps {
  /** 0–100 overall completion */
  progressPercent: number;
  /** e.g. "68% completed this week" */
  subtitle?: string;
}

const CIRCLE_SIZE = 72;
const STROKE = 6;
const R = (CIRCLE_SIZE - STROKE) / 2;
const C = CIRCLE_SIZE / 2;
const circumference = 2 * Math.PI * R;

export function ChecklistHeader({
  progressPercent,
  subtitle = "Hoàn thành các đầu việc để tiến gần hơn tới hồ sơ du học.",
}: ChecklistHeaderProps) {
  const clamped = Math.min(100, Math.max(0, progressPercent));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <motion.header
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative rounded-2xl overflow-hidden border border-border/60 bg-card shadow-sm"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-primary/[0.04]" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/[0.08] to-transparent pointer-events-none" />
      <div className="relative flex flex-col sm:flex-row sm:items-center gap-6 px-6 py-6 sm:px-8 sm:py-8">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <svg
              width={CIRCLE_SIZE}
              height={CIRCLE_SIZE}
              className="rotate-[-90deg]"
              aria-hidden
            >
              <circle
                cx={C}
                cy={C}
                r={R}
                fill="none"
                stroke="currentColor"
                strokeWidth={STROKE}
                className="text-muted/50"
              />
              <motion.circle
                cx={C}
                cy={C}
                r={R}
                fill="none"
                stroke="currentColor"
                strokeWidth={STROKE}
                strokeLinecap="round"
                className="text-primary"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground tabular-nums">
              {Math.round(clamped)}%
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Checklist
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5 max-w-md">
              {subtitle}
            </p>
          </div>
        </div>
        <div className="flex-1 min-w-0 sm:pl-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tiến độ tổng thể
            </span>
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {Math.round(clamped)}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${clamped}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
