"use client";

import React from "react";
import Link from "next/link";
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
import AchievementSection from "./sections/AchievementSection";
import MainFeaturesSection from "./sections/MainFeaturesSection";
import LatestNewsSection from "./sections/LatestNewsSection";
import ContactSection from "./sections/ContactSection";
import PersonalizedRecommendationsSection from "./sections/PersonalizedRecommendationsSection";

const STUDENT_BASE = "/student";

interface DashboardProps {
  userName: string;
}

export default function Dashboard({ userName }: DashboardProps) {
  const features = [
    {
      name: "Profile",
      href: `${STUDENT_BASE}/profile`,
      icon: User,
      description: "Hồ sơ cá nhân, học thuật, hoạt động và tài liệu",
    },
    {
      name: "Checklist",
      href: `${STUDENT_BASE}/checklist`,
      icon: CheckSquare,
      description: "Theo dõi tiến độ và nhiệm vụ du học",
    },
    {
      name: "Tests",
      href: `${STUDENT_BASE}/tests`,
      icon: ClipboardList,
      description: "MBTI, Grit, RIASEC – khám phá bản thân",
    },
    {
      name: "Improve",
      href: `${STUDENT_BASE}/improve`,
      icon: Sparkles,
      description: "Cải thiện CV và luận văn với AI",
    },
    {
      name: "Target",
      href: `${STUDENT_BASE}/target`,
      icon: GraduationCap,
      description: "Gợi ý trường Reach / Match / Safety và roadmap",
    },
    {
      name: "Discussion",
      href: `${STUDENT_BASE}/chat`,
      icon: MessageCircle,
      description: "Trao đổi với mentor",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header giống Profile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Xin chào, {userName}. Tổng quan và truy cập nhanh các tính năng.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Tính năng chính – 6 mục theo navbar */}
        <section className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border/60 flex items-center gap-2 bg-muted/30">
            <LayoutDashboard className="text-primary" size={18} />
            <h2 className="text-base font-semibold text-foreground">
              Tính năng chính
            </h2>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-start gap-4 rounded-xl border border-border/60 bg-muted/20 p-4 hover:bg-muted/40 transition-colors group"
                  >
                    <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Grid 2x2: Thành tựu, Tin mới, Liên hệ, Gợi ý */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border/60 flex items-center gap-2 bg-muted/30">
              <span className="text-base font-semibold text-foreground">
                Thành tựu nổi bật
              </span>
            </div>
            <div className="p-5">
              <AchievementSection />
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border/60 flex items-center gap-2 bg-muted/30">
              <span className="text-base font-semibold text-foreground">
                Thông tin mới nhất
              </span>
            </div>
            <div className="p-5">
              <LatestNewsSection />
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border/60 flex items-center gap-2 bg-muted/30">
              <span className="text-base font-semibold text-foreground">
                Kết nối với chúng tôi
              </span>
            </div>
            <div className="p-5">
              <ContactSection />
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border/60 flex items-center gap-2 bg-muted/30">
              <span className="text-base font-semibold text-foreground">
                Gợi ý dành cho bạn
              </span>
            </div>
            <div className="p-5">
              <PersonalizedRecommendationsSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
