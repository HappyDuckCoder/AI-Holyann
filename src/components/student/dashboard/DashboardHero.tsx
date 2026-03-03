"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { QuickStatItem } from "./types";

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

function getGreetingEmoji(): string {
  const h = new Date().getHours();
  if (h < 12) return "☀️";
  if (h < 18) return "👋";
  return "🌙";
}

export function DashboardHero({ userName, stats }: DashboardHeroProps) {
  const greeting = getGreeting();
  const emoji = getGreetingEmoji();
  const displayName = userName?.trim() || "bạn";

  // stats prop kept to avoid breaking the interface, unused visually
  void stats;

  return (
    <section
      aria-label="Chào mừng"
      className="relative mb-6 overflow-hidden text-white"
      style={{
        background:
          "linear-gradient(135deg, var(--primary) 0%, var(--brand-deep) 50%, var(--brand-cyan) 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-8 right-1/4 h-40 w-80 rounded-full bg-[var(--brand-cyan)]/20 blur-2xl" />

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative px-6 py-8 sm:px-10 sm:py-10">
        {/* Greeting label */}
        <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.22em] text-white/60">
          {greeting}, {displayName} {emoji}
        </p>

        {/* Main heading */}
        <h1 className="mt-2 font-heading text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
          Tổng quan hành trình du học
        </h1>

        {/* Subtitle */}
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/70">
          Nắm rõ tiến độ, nhiệm vụ quan trọng và mục tiêu dài hạn — để mỗi ngày
          học đều đưa bạn gần hơn tới ước mơ.
        </p>

        {/* CTAs */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            asChild
            size="sm"
            className="rounded-lg bg-white px-5 font-sans font-semibold text-[var(--primary)] shadow-md transition-all hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-lg"
          >
            <Link href="/student/checklist" className="whitespace-nowrap">
              Tiếp tục học →
            </Link>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="whitespace-nowrap rounded-lg border border-white/40 bg-white/10 px-5 font-sans font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            onClick={() => {
              if (typeof document === "undefined") return;
              const target = document.getElementById("progress-section");
              if (target)
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            Xem tiến độ
          </Button>
        </div>
      </div>
    </section>
  );
}
