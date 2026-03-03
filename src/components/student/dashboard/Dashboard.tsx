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
  { name: "Hồ sơ", href: `${STUDENT_BASE}/profile`, icon: User },
  {
    name: "Danh sách công việc",
    href: `${STUDENT_BASE}/checklist`,
    icon: CheckSquare,
  },
  { name: "Bài kiểm tra", href: `${STUDENT_BASE}/tests`, icon: ClipboardList },
  { name: "Cải thiện", href: `${STUDENT_BASE}/improve`, icon: Sparkles },
  { name: "Mục tiêu", href: `${STUDENT_BASE}/target`, icon: GraduationCap },
  { name: "Trao đổi", href: `${STUDENT_BASE}/chat`, icon: MessageCircle },
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

export default function Dashboard({
  userName,
  data,
  isLoading,
  error,
}: DashboardProps) {
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
        <p className="text-muted-foreground">
          {error || "Không tải được dữ liệu dashboard."}
        </p>
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
    <div>
      <DashboardHero userName={userName} stats={data.quickStats} />
      <div className="min-h-[60vh] mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div id="progress-section">
          <QuickStatsGrid items={data.quickStats} />
        </div>

        <motion.section
          initial="hidden"
          animate="show"
          variants={container}
          className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
        >
          <CardHeader className="border-b border-border px-6 py-4 bg-muted/30 dark:bg-muted/20">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              <CardTitle className="font-heading text-base font-bold text-primary m-0">
                Truy cập nhanh
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <nav
              className="grid grid-cols-3 sm:grid-cols-6 gap-3"
              aria-label="Truy cập nhanh"
            >
              {QUICK_LINKS.map((link, i) => {
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.name}
                    variants={itemVariant}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link
                      href={link.href}
                      className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground hover:shadow-md"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-primary transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-sans font-medium text-foreground group-hover:text-primary-foreground">
                        {link.name}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </CardContent>
        </motion.section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:row-span-2"
          >
            <div className="card-holyann h-full">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                      ✓
                    </span>
                    <h2 className="font-heading text-base font-bold text-primary">
                      Tiến độ checklist
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tỷ lệ hoàn thành các nhiệm vụ quan trọng
                  </p>
                </div>
              </div>
              <TaskCompletionChart data={data.taskCompletion} />
            </div>
          </motion.div>

          <div className="lg:col-span-2">
            <UpcomingDeadlines items={data.deadlines} />
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 gap-6 md:grid-cols-2">
            <RecentActivityFeed items={data.activity} />
            <AIInsightsPanel items={data.aiInsights} />
          </div>
        </div>
      </div>
    </div>
  );
}
