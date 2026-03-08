"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  User,
  Target,
  ClipboardList,
  Sparkles,
  ArrowRight,
  Crown,
  Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHero } from "./DashboardHero";
import { QuickStatsGrid } from "./QuickStatsGrid";
import { TaskCompletionChart } from "./charts/TaskCompletionChart";
import { CurrentGoalCard } from "./CurrentGoalCard";
import { RecentActivityFeed } from "./RecentActivityFeed";
import { AIInsightsPanel } from "./AIInsightsPanel";
import { StudentUpcomingMeetings } from "./StudentUpcomingMeetings";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { mainFeatures, premiumFeatures } from "@/data/student-nav-features";
import { useSubscription } from "@/hooks/useSubscription";
import type { DashboardData } from "./types";

const STUDENT_BASE = "/student";

/** Liên kết nhanh theo navbar (Hồ sơ, Mục tiêu, Trắc nghiệm, Cải thiện) */
const QUICK_NAV = [
  { name: "Hồ sơ", href: `${STUDENT_BASE}/profile`, icon: User },
  { name: "Mục tiêu", href: `${STUDENT_BASE}/view-target`, icon: Target },
  { name: "Trắc nghiệm ngành", href: `${STUDENT_BASE}/tests`, icon: ClipboardList },
  { name: "Cải thiện hồ sơ", href: `${STUDENT_BASE}/improve`, icon: Sparkles },
] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.08 },
  },
};

const itemVariant = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

interface DashboardProps {
  userName: string;
  /** Từ GET /api/student/dashboard – chỉ hiển thị khi có dữ liệu thật, không mock */
  data: DashboardData | null;
  isLoading?: boolean;
}

function hasRealStats(data: DashboardData | null): boolean {
  return (data?.quickStats?.length ?? 0) > 0;
}

function hasRealTaskCompletion(data: DashboardData | null): boolean {
  return (data?.taskCompletion?.length ?? 0) > 0;
}

function hasCurrentGoal(data: DashboardData | null): boolean {
  return data?.currentGoal != null;
}

function hasRealActivity(data: DashboardData | null): boolean {
  return (data?.activity?.length ?? 0) > 0;
}

function hasRealAiInsights(data: DashboardData | null): boolean {
  return (data?.aiInsights?.length ?? 0) > 0;
}

export default function Dashboard({
  userName,
  data,
  isLoading,
}: DashboardProps) {
  const { isPaid } = useSubscription();

  if (isLoading) {
    return (
      <div className="px-6 py-8 sm:px-8 lg:px-8 max-w-[1600px] mx-auto">
        <DashboardSkeleton />
      </div>
    );
  }

  const showStats = hasRealStats(data);
  const showTaskChart = hasRealTaskCompletion(data);
  const showCurrentGoal = hasCurrentGoal(data);
  const showActivity = hasRealActivity(data);
  const showAiInsights = hasRealAiInsights(data);

  return (
    <div>
      <DashboardHero
        userName={userName}
        stats={data?.quickStats ?? []}
      />
      <div className="min-h-[60vh] mx-auto px-4 sm:px-6 py-6 max-w-[1600px] space-y-8">
        {/* Tiến độ / thống kê thật (chỉ khi API trả về) */}
        {showStats && data?.quickStats && (
          <section id="progress-section" className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground px-1">
              Tiến độ của bạn
            </h2>
            <QuickStatsGrid items={data.quickStats} />
          </section>
        )}

        {/* Bắt đầu nhanh — theo navbar */}
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
                Bắt đầu nhanh
              </CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Các mục chính trên thanh điều hướng — truy cập nhanh từ đây.
            </p>
          </CardHeader>
          <CardContent className="p-4">
            <nav
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
              aria-label="Bắt đầu nhanh"
            >
              {QUICK_NAV.map((link, i) => {
                const Icon = link.icon;
                return (
                  <motion.div key={link.name} variants={itemVariant}>
                    <Link
                      href={link.href}
                      className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-background p-4 text-center transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 hover:shadow-md"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium text-foreground">
                        {link.name}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </CardContent>
        </motion.section>

        {/* Tính năng chính — từ combobox "Tính năng" */}
        <motion.section
          initial="hidden"
          animate="show"
          variants={container}
          className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
          id="tinh-nang-chinh"
        >
          <CardHeader className="border-b border-border px-6 py-4 bg-muted/30 dark:bg-muted/20">
            <CardTitle className="font-heading text-base font-bold text-primary m-0">
              Tính năng chính
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Phân tích hồ sơ, trắc nghiệm ngành, ngành & trường phù hợp, cải thiện hồ sơ, danh sách trường, báo cáo.
            </p>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mainFeatures.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div key={item.name} variants={itemVariant}>
                    <Link
                      href={item.href}
                      className="group flex gap-4 rounded-xl border border-border bg-background p-4 transition-all duration-200 hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground group-hover:text-primary">
                          {item.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
                          Mở trang
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </motion.section>

        {/* Tính năng Premium — free user: làm mờ, link sang pricing */}
        <motion.section
          initial="hidden"
          animate="show"
          variants={container}
          className={`rounded-2xl border border-amber-500/20 bg-card shadow-sm overflow-hidden dark:border-amber-500/30 ${!isPaid ? "opacity-85" : ""}`}
          id="tinh-nang-premium"
        >
          <CardHeader className="border-b border-amber-500/10 px-6 py-4 bg-amber-500/5 dark:bg-amber-500/10">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <CardTitle className="font-heading text-base font-bold text-amber-700 dark:text-amber-300 m-0">
                Tính năng Premium
              </CardTitle>
              {!isPaid && (
                <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700 dark:text-amber-300">
                  Nâng cấp để mở khóa
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Chat với cố vấn, checklist, deadline, đặt lịch mentor — gói Premium (AI + All Advisors).
            </p>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {premiumFeatures.map((item, i) => {
                const Icon = item.icon;
                const isLocked = !isPaid;
                return (
                  <motion.div key={item.name} variants={itemVariant}>
                    <Link
                      href={isLocked ? `${STUDENT_BASE}/pricing` : item.href}
                      className={`group flex gap-4 rounded-xl border bg-background p-4 transition-all duration-200 ${
                        isLocked
                          ? "border-amber-500/15 opacity-75 hover:opacity-95 hover:border-amber-500/30 hover:bg-amber-500/5 dark:border-amber-500/20 dark:hover:bg-amber-500/10"
                          : "border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/5 dark:border-amber-500/30 dark:hover:bg-amber-500/10"
                      }`}
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-colors group-hover:bg-amber-500/20">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground flex items-center gap-1.5">
                          {item.name}
                          <Lock className="h-3.5 w-3.5 text-amber-500/70" aria-hidden />
                        </h3>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                          {isLocked ? "Nâng cấp để sử dụng" : "Xem tính năng"}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
            {!isPaid && (
              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/15 p-4 text-center">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Mở khóa Chat, Checklist, Deadline và Đặt lịch mentor với gói Premium.
                </p>
                <Link
                  href={`${STUDENT_BASE}/pricing`}
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-amber-600 transition-colors"
                >
                  <Crown className="h-4 w-4" />
                  Xem gói Premium
                </Link>
              </div>
            )}
          </CardContent>
        </motion.section>

        {/* Lịch tư vấn sắp tới — luôn hiển thị (dữ liệu từ API thật) */}
        <section>
          <StudentUpcomingMeetings />
        </section>

        {/* Khối dữ liệu thật từ GET /api/student/dashboard — chỉ khi có dữ liệu, không mock */}
        {(showTaskChart || showCurrentGoal || showActivity || showAiInsights) && data && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 space-y-6 lg:space-y-0">
            {showTaskChart && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:row-span-2"
              >
                <div className="card-holyann h-full">
                  <div className="mb-4">
                    <h2 className="font-heading text-base font-bold text-primary">
                      Tiến độ checklist
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Tỷ lệ hoàn thành các nhiệm vụ quan trọng
                    </p>
                  </div>
                  <TaskCompletionChart data={data.taskCompletion} />
                </div>
              </motion.div>
            )}

            {showCurrentGoal && data.currentGoal && (
              <div className="lg:col-span-2">
                <CurrentGoalCard currentGoal={data.currentGoal} />
              </div>
            )}

            {(showActivity || showAiInsights) && (
              <div className="lg:col-span-2 grid grid-cols-1 gap-6 md:grid-cols-2">
                {showActivity && (
                  <RecentActivityFeed items={data.activity} />
                )}
                {showAiInsights && (
                  <AIInsightsPanel items={data.aiInsights} />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
