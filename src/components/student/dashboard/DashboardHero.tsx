"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
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

  const topStats = (stats ?? []).slice(0, 3);

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
        <div className="mx-auto flex max-w-6xl flex-col gap-8 md:grid md:grid-cols-[1.15fr_0.85fr] md:items-center">
          {/* Left: Greeting & CTAs */}
          <div>
            {/* Greeting label */}
            <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
              {greeting}, {displayName} {emoji}
            </p>

            {/* Main heading */}
            <h1 className="mt-3 font-university-display text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl lg:text-[2.6rem] lg:leading-[1.05]">
              <span className="block">Tổng quan</span>
              <span className="relative mt-1 inline-block">
                <span className="bg-gradient-to-r from-[#FFD56A] via-white to-[#8BE9FF] bg-clip-text text-transparent">
                  hành trình du học
                </span>
                <span className="gradient-underline pointer-events-none absolute -bottom-1 left-0 h-2 w-full rounded-full bg-gradient-to-r from-white/15 via-white/10 to-transparent" />
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/75">
              Nắm rõ tiến độ, nhiệm vụ quan trọng và mục tiêu dài hạn — để mỗi
              ngày học đều đưa bạn gần hơn tới ước mơ. Bắt đầu từ những bước nhỏ
              nhưng đều đặn hôm nay.
            </p>

            {/* CTAs */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                asChild
                size="sm"
                className="group rounded-xl bg-gradient-to-r from-white to-white/90 px-5 font-sans font-semibold text-[var(--primary)] shadow-md shadow-black/10 transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                <Link
                  href="#tinh-nang-chinh"
                  className="flex items-center gap-1 whitespace-nowrap"
                >
                  Khám phá tính năng
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="whitespace-nowrap rounded-xl border border-white/40 bg-white/5 px-5 font-sans font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/15"
              >
                <Link href="/student/tests">Làm trắc nghiệm ngành</Link>
              </Button>
            </div>
          </div>

          {/* Right: Holy illustration with gentle float animation */}
          <div className="mt-8 md:mt-0 flex justify-center md:justify-end">
            <motion.div
              className="relative h-40 w-40 sm:h-48 sm:w-48 md:h-56 md:w-56"
              animate={{ y: [-6, 4, -6] }}
              transition={{
                duration: 8,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
            >
              <Image
                src="/holy/3.png"
                alt="Holy đồng hành cùng hành trình du học của bạn"
                fill
                priority
                className="object-contain drop-shadow-xl"
                sizes="(min-width: 1024px) 224px, 176px"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
