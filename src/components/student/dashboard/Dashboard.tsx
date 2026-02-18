"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
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
  Trophy,
  Newspaper,
  Phone,
  Lightbulb,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AchievementSection from "./sections/AchievementSection";
import LatestNewsSection from "./sections/LatestNewsSection";
import ContactSection from "./sections/ContactSection";
import PersonalizedRecommendationsSection from "./sections/PersonalizedRecommendationsSection";

const STUDENT_BASE = "/student";

interface DashboardProps {
  userName: string;
}

const MAIN_FEATURES: ReadonlyArray<{
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  description: string;
  accent: string; // subtle educational color tint
}> = [
  {
    name: "Profile",
    href: `${STUDENT_BASE}/profile`,
    icon: User,
    description: "Hồ sơ cá nhân, học thuật, hoạt động và tài liệu",
    accent: "from-blue-500/15 to-cyan-500/10",
  },
  {
    name: "Checklist",
    href: `${STUDENT_BASE}/checklist`,
    icon: CheckSquare,
    description: "Theo dõi tiến độ và nhiệm vụ du học",
    accent: "from-emerald-500/15 to-teal-500/10",
  },
  {
    name: "Tests",
    href: `${STUDENT_BASE}/tests`,
    icon: ClipboardList,
    description: "MBTI, Grit, RIASEC – khám phá bản thân",
    accent: "from-violet-500/15 to-purple-500/10",
  },
  {
    name: "Improve",
    href: `${STUDENT_BASE}/improve`,
    icon: Sparkles,
    description: "Cải thiện CV và luận văn với AI",
    accent: "from-amber-500/15 to-orange-500/10",
  },
  {
    name: "Target",
    href: `${STUDENT_BASE}/target`,
    icon: GraduationCap,
    description: "Gợi ý trường Reach / Match / Safety và roadmap",
    accent: "from-sky-500/15 to-blue-500/10",
  },
  {
    name: "Discussion",
    href: `${STUDENT_BASE}/chat`,
    icon: MessageCircle,
    description: "Trao đổi với mentor",
    accent: "from-indigo-500/15 to-blue-500/10",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const listItemVariant = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard({ userName }: DashboardProps) {
  return (
    <div
      className="w-full max-w-6xl mx-auto pb-8 overflow-x-hidden"
      aria-label="Tổng quan dashboard học viên"
    >
      {/* Welcome banner – educational gradient, image, animation */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative rounded-2xl overflow-hidden mb-8 border border-primary/20 shadow-lg"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,var(--tw-gradient-from),transparent)] from-primary/25 to-transparent" />
        {/* Decorative education pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 4L4 20v20l26 16 26-16V20L30 4z' fill='none' stroke='%230f4c81' stroke-width='1'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6 px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex-1 min-w-0">
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="text-sm font-medium text-primary uppercase tracking-wider"
            >
              Dashboard của bạn
            </motion.p>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mt-1">
              Xin chào, {userName}
            </h1>
            <p className="text-muted-foreground mt-2 text-base sm:text-lg max-w-xl leading-relaxed">
              Tổng quan và truy cập nhanh các tính năng du học. Bắt đầu hành trình của bạn.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="relative w-full md:w-64 h-40 md:h-44 rounded-xl overflow-hidden border border-white/20 shadow-xl shrink-0"
          >
            <Image
              src="/images/auth/left.jpg"
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 16rem"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
          </motion.div>
        </div>
      </motion.header>

      <div className="space-y-8">
        {/* Main features – staggered animation, color accents */}
        <motion.section
          aria-labelledby="main-features-heading"
          initial="hidden"
          animate="show"
          variants={container}
          className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
        >
          <CardHeader className="border-b border-border bg-gradient-to-r from-primary/10 to-secondary/5 px-6 py-4 sm:px-6 sm:py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary shadow-sm">
                <LayoutDashboard className="size-5 shrink-0" aria-hidden />
              </div>
              <div>
                <CardTitle
                  id="main-features-heading"
                  className="text-lg font-semibold m-0 leading-tight"
                >
                  Tính năng chính
                </CardTitle>
                <CardDescription className="sr-only">
                  Truy cập nhanh: Hồ sơ, Checklist, Bài test, Cải thiện, Target, Thảo luận
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 sm:p-6">
            <nav
              aria-label="Tính năng chính"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {MAIN_FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <motion.div key={feature.name} variants={listItemVariant}>
                    <Link
                      href={feature.href}
                      className={`flex items-start gap-4 rounded-xl border border-border bg-gradient-to-br ${feature.accent} bg-muted/30 p-4 hover:shadow-md hover:border-primary/30 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
                    >
                      <span
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform"
                        aria-hidden
                      >
                        <Icon className="h-6 w-6" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors block">
                          {feature.name}
                        </span>
                        <span className="text-sm text-muted-foreground mt-0.5 line-clamp-2 block leading-snug">
                          {feature.description}
                        </span>
                      </span>
                      <ArrowRight
                        className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform"
                        aria-hidden
                      />
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </CardContent>
        </motion.section>

        {/* Grid: Achievements, News, Contact, Recommendations – educational tints + animation */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          role="region"
          aria-label="Thông tin bổ sung"
          initial="hidden"
          animate="show"
          variants={container}
        >
          <motion.div variants={listItemVariant}>
            <Card className="rounded-2xl border border-border shadow-sm overflow-hidden h-full border-l-4 border-l-amber-500/60 bg-gradient-to-br from-amber-500/5 to-transparent">
              <CardHeader className="px-5 py-4 border-b border-border bg-amber-500/5 flex flex-row items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400 shrink-0">
                  <Trophy className="size-4" aria-hidden />
                </div>
                <CardTitle
                  id="achievements-heading"
                  className="text-base font-semibold m-0"
                >
                  Thành tựu nổi bật
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <AchievementSection />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={listItemVariant}>
            <Card className="rounded-2xl border border-border shadow-sm overflow-hidden h-full border-l-4 border-l-emerald-500/60 bg-gradient-to-br from-emerald-500/5 to-transparent">
              <CardHeader className="px-5 py-4 border-b border-border bg-emerald-500/5 flex flex-row items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 shrink-0">
                  <Newspaper className="size-4" aria-hidden />
                </div>
                <CardTitle id="news-heading" className="text-base font-semibold m-0">
                  Thông tin mới nhất
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <LatestNewsSection />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={listItemVariant}>
            <Card className="rounded-2xl border border-border shadow-sm overflow-hidden h-full border-l-4 border-l-sky-500/60 bg-gradient-to-br from-sky-500/5 to-transparent">
              <CardHeader className="px-5 py-4 border-b border-border bg-sky-500/5 flex flex-row items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/20 text-sky-700 dark:text-sky-400 shrink-0">
                  <Phone className="size-4" aria-hidden />
                </div>
                <CardTitle id="contact-heading" className="text-base font-semibold m-0">
                  Kết nối với chúng tôi
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <ContactSection />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={listItemVariant}>
            <Card className="rounded-2xl border border-border shadow-sm overflow-hidden h-full border-l-4 border-l-violet-500/60 bg-gradient-to-br from-violet-500/5 to-transparent">
              <CardHeader className="px-5 py-4 border-b border-border bg-violet-500/5 flex flex-row items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/20 text-violet-700 dark:text-violet-400 shrink-0">
                  <Lightbulb className="size-4" aria-hidden />
                </div>
                <CardTitle
                  id="recommendations-heading"
                  className="text-base font-semibold m-0"
                >
                  Gợi ý dành cho bạn
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <PersonalizedRecommendationsSection />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
