"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  User,
  CheckSquare,
  ClipboardList,
  Sparkles,
  GraduationCap,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHero } from "./DashboardHero";
import { QuickStatsGrid } from "./QuickStatsGrid";
import { TaskCompletionChart } from "./charts/TaskCompletionChart";
import { UpcomingDeadlines } from "./UpcomingDeadlines";
import { RecentActivityFeed } from "./RecentActivityFeed";
import { AIInsightsPanel } from "./AIInsightsPanel";
import { DashboardSkeleton } from "./DashboardSkeleton";
import type { DashboardData } from "./types";

const STUDENT_BASE = "/student";

const QUICK_LINKS = [
  { name: "Profile", href: `${STUDENT_BASE}/profile`, icon: User },
  { name: "Checklist", href: `${STUDENT_BASE}/checklist`, icon: CheckSquare },
  { name: "Tests", href: `${STUDENT_BASE}/tests`, icon: ClipboardList },
  { name: "Improve", href: `${STUDENT_BASE}/improve`, icon: Sparkles },
  { name: "Target", href: `${STUDENT_BASE}/target`, icon: GraduationCap },
  { name: "Discussion", href: `${STUDENT_BASE}/chat`, icon: MessageCircle },
] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariant = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

interface DashboardProps {
  userName: string;
  /** Data from GET /api/student/dashboard – no mock, only real data */
  data: DashboardData | null;
  isLoading?: boolean;
  error?: string | null;
}

export default function Dashboard({ userName, data, isLoading, error }: DashboardProps) {
  if (isLoading) {
    return (
      <div className="px-6 py-8 sm:px-8 lg:px-8 max-w-[1600px] mx-auto">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="px-6 py-8 max-w-[1600px] mx-auto flex flex-col items-center justify-center min-h-[40vh]">
        <p className="text-muted-foreground">{error || "Không tải được dữ liệu dashboard."}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-[60vh] rounded-2xl bg-muted/20 dark:bg-muted/10 px-6 py-8 sm:px-8 lg:px-8 max-w-[1600px] mx-auto pb-12"
      style={{ paddingLeft: "clamp(24px, 5vw, 32px)", paddingRight: "clamp(24px, 5vw, 32px)" }}
    >
      <DashboardHero userName={userName} />

      <div className="mt-8">
        <QuickStatsGrid items={data.quickStats} />
      </div>

      {/* Quick access – compact feature links */}
      <motion.section
        initial="hidden"
        animate="show"
        variants={container}
        className="mt-8 rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
      >
        <CardHeader className="border-b border-border px-6 py-4 bg-muted/20">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base font-semibold m-0">Quick access</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2" aria-label="Quick links">
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <motion.div key={link.name} variants={itemVariant}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 hover:bg-muted/50 hover:border-primary/20 transition-all duration-200 group"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-foreground truncate">{link.name}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </CardContent>
      </motion.section>

      {/* Pie + Deadlines | Activity + AI */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:row-span-2"
        >
          <Card className="rounded-2xl border border-border shadow-sm overflow-hidden h-full">
            <CardHeader className="border-b border-border px-6 py-4">
              <CardTitle className="text-base font-semibold m-0">Task Completion</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Ratio</p>
            </CardHeader>
            <CardContent className="px-6 py-4">
              <TaskCompletionChart data={data.taskCompletion} />
            </CardContent>
          </Card>
        </motion.div>
        <div className="lg:col-span-2">
          <UpcomingDeadlines items={data.deadlines} />
        </div>
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <RecentActivityFeed items={data.activity} />
          <AIInsightsPanel items={data.aiInsights} />
        </div>
      </div>
    </div>
  );
}
