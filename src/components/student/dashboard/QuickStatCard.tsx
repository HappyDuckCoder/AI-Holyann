"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  GraduationCap,
  BookOpen,
  CheckSquare,
  Clock,
  Calendar,
  UserCheck,
  Brain,
  LucideIcon,
} from "lucide-react";
import { QuickStatItem } from "./types";

const ICON_MAP: Record<string, LucideIcon> = {
  GraduationCap,
  BookOpen,
  CheckSquare,
  Clock,
  Calendar,
  UserCheck,
  Brain,
};

const ACCENT_STYLES: Record<
  QuickStatItem["accent"],
  { bg: string; icon: string; trendUp: string; trendDown: string }
> = {
  blue: {
    bg: "bg-blue-500/10 dark:bg-blue-500/15",
    icon: "text-blue-600 dark:text-blue-400",
    trendUp: "text-blue-600 dark:text-blue-400",
    trendDown: "text-red-500",
  },
  emerald: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    icon: "text-emerald-600 dark:text-emerald-400",
    trendUp: "text-emerald-600 dark:text-emerald-400",
    trendDown: "text-red-500",
  },
  amber: {
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    icon: "text-amber-600 dark:text-amber-400",
    trendUp: "text-amber-600 dark:text-amber-400",
    trendDown: "text-red-500",
  },
  violet: {
    bg: "bg-violet-500/10 dark:bg-violet-500/15",
    icon: "text-violet-600 dark:text-violet-400",
    trendUp: "text-violet-600 dark:text-violet-400",
    trendDown: "text-red-500",
  },
  rose: {
    bg: "bg-rose-500/10 dark:bg-rose-500/15",
    icon: "text-rose-600 dark:text-rose-400",
    trendUp: "text-rose-600 dark:text-rose-400",
    trendDown: "text-red-500",
  },
  sky: {
    bg: "bg-sky-500/10 dark:bg-sky-500/15",
    icon: "text-sky-600 dark:text-sky-400",
    trendUp: "text-sky-600 dark:text-sky-400",
    trendDown: "text-red-500",
  },
};

interface QuickStatCardProps {
  item: QuickStatItem;
  index: number;
}

export function QuickStatCard({ item, index }: QuickStatCardProps) {
  const Icon = ICON_MAP[item.icon] ?? GraduationCap;
  const style = ACCENT_STYLES[item.accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.bg} ${style.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
        {item.trend && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium ${
              item.trend.value >= 0 ? style.trendUp : style.trendDown
            }`}
          >
            {item.trend.value > 0 && <TrendingUp className="h-3.5 w-3.5" />}
            {item.trend.value < 0 && <TrendingDown className="h-3.5 w-3.5" />}
            {item.trend.value === 0 && <Minus className="h-3.5 w-3.5" />}
            {item.trend.label}
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-foreground tabular-nums">
        {item.value}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
    </motion.div>
  );
}
