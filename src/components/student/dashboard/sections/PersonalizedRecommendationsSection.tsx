"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Award } from "lucide-react";

const STUDENT_BASE = "/student";

export default function PersonalizedRecommendationsSection() {
  const items = [
    {
      text: "Gợi ý lộ trình du học ngành Marketing",
      href: `${STUDENT_BASE}/target`,
      icon: BookOpen,
    },
    {
      text: "Top 5 học bổng cho sinh viên nghệ thuật",
      href: `${STUDENT_BASE}/improve`,
      icon: Award,
    },
    {
      text: "Ebook: Bí quyết săn học bổng toàn phần",
      href: `${STUDENT_BASE}/improve`,
      icon: BookOpen,
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <Link
            key={idx}
            href={item.href}
            className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-3 hover:bg-muted/30 transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground flex-1">
              {item.text}
            </span>
            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        );
      })}
    </div>
  );
}
