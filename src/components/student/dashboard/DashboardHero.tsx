"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { QuickStatItem } from "./types";
import { StudentHeroShell } from "../StudentHeroShell";

interface DashboardHeroProps {
  userName: string;
  stats: QuickStatItem[];
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Chào buổi sáng";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

export function DashboardHero({ userName, stats }: DashboardHeroProps) {
  const greeting = getGreeting();
  const displayName = userName?.trim() || "bạn";
  const topStats = stats.slice(0, 3);
  const trendSource = stats.find((s) => s.trend);
  const trendValue = trendSource?.trend?.value;
  const trendLabel = trendSource?.trend?.label;

  return (
    <StudentHeroShell
      ariaLabel="Chào mừng"
      left={
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">
            {greeting}, {displayName}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl leading-tight">
            Biến lộ trình du học thành kế hoạch rõ ràng
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Trang tổng quan giúp bạn nắm rõ tiến độ, nhiệm vụ quan trọng và mục
            tiêu dài hạn — để mỗi ngày học đều đưa bạn gần hơn tới ước mơ.
          </p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
            <Button
              asChild
              size="lg"
              className="h-11 px-6 font-semibold shadow-md shadow-primary/20"
            >
              <Link href="/student/checklist">Tiếp tục học</Link>
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="h-11 px-6 font-semibold border-border/70 bg-background/60 text-foreground hover:border-primary/70 hover:text-primary hover:bg-background transition-colors"
              onClick={() => {
                if (typeof document === "undefined") return;
                const target = document.getElementById("progress-section");
                if (target) {
                  target.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
            >
              Xem tiến độ
            </Button>
          </div>
        </>
      }
      right={
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-background/80 p-5 shadow-md backdrop-blur-sm">
          <div className="absolute inset-x-4 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-70" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Tuần này
              </p>
              {trendValue != null && trendValue !== 0 && (
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {trendValue > 0 ? "+" : ""}
                  {trendValue}% {trendLabel ?? "so với tuần trước"}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
              {topStats.map((stat) => (
                <div
                  key={stat.id}
                  className="space-y-1 rounded-xl border border-border/70 bg-card/80 p-3 shadow-sm"
                >
                  <p className="text-[11px] font-medium tracking-wide text-muted-foreground leading-tight wrap-break-word line-clamp-2">
                    {stat.label}
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {stat.value ?? "—"}
                  </p>
                </div>
              ))}
            </div>

            <p className="pt-1 text-xs text-muted-foreground">
              Hãy giữ nhịp độ này. Mỗi bước nhỏ hôm nay là một bước gần hơn
              tới mục tiêu du học của bạn.
            </p>
          </div>
        </div>
      }
    />
  );
}
