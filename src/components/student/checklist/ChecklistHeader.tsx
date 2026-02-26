"use client";

import React from "react";
import { motion } from "framer-motion";
import { StudentHeroShell } from "../StudentHeroShell";

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

  const progressCircle = (
    <div className="relative flex items-center justify-center">
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
          className="text-muted/40"
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
  );

  return (
    <StudentHeroShell
      ariaLabel="Checklist hồ sơ du học"
      left={
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">
            Lộ trình checklist
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl leading-tight">
            Checklist hồ sơ du học
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {subtitle}
          </p>
        </>
      }
      right={
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-background/80 p-5 shadow-md backdrop-blur-sm">
          <div className="absolute inset-x-4 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-70" />
          <div className="relative flex items-center gap-4">
            {progressCircle}
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Tiến độ tổng thể
              </p>
              <p className="text-sm text-muted-foreground">
                Bạn đã hoàn thành{" "}
                <span className="font-semibold text-foreground">
                  {Math.round(clamped)}%
                </span>{" "}
                checklist.
              </p>
            </div>
          </div>
        </div>
      }
    />
  );
}
