"use client";

import React from "react";
import { motion } from "framer-motion";

interface DashboardHeroProps {
  userName: string;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardHero({ userName }: DashboardHeroProps) {
  const greeting = getGreeting();
  const displayName = userName?.trim() || "there";

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative rounded-2xl overflow-hidden border border-border bg-card shadow-md dark:shadow-lg dark:shadow-black/20"
      aria-label="Welcome"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-primary/[0.04]" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/[0.08] to-transparent pointer-events-none" />
      <div className="relative px-6 py-8 sm:px-8 sm:py-10">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {greeting}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {displayName}
        </h1>
        <p className="mt-2 max-w-xl text-base text-muted-foreground leading-relaxed">
          Keep going. Your progress this week is ahead of last week — small steps add up.
        </p>
      </div>
    </motion.section>
  );
}
