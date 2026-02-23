"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, AlertCircle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AIInsight } from "./types";

const TONE_CONFIG: Record<
  AIInsight["tone"],
  { icon: React.ElementType; bg: string; text: string }
> = {
  positive: {
    icon: TrendingUp,
    bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  warning: {
    icon: AlertCircle,
    bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    text: "text-amber-700 dark:text-amber-300",
  },
  neutral: {
    icon: Info,
    bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    text: "text-sky-700 dark:text-sky-300",
  },
};

interface AIInsightsPanelProps {
  items: AIInsight[];
}

export function AIInsightsPanel({ items }: AIInsightsPanelProps) {
  const list = items;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card className="rounded-2xl border border-border shadow-sm overflow-hidden bg-gradient-to-br from-primary/[0.03] to-transparent">
        <CardHeader className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold m-0">Gợi ý AI</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Cá nhân hóa cho bạn</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {list.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-muted-foreground">
              Chưa có gợi ý. Hoàn thành thêm hoạt động để nhận mẹo cá nhân hóa.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {list.map((item, i) => {
                const config = TONE_CONFIG[item.tone];
                const Icon = config.icon;
                return (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="flex gap-3 px-6 py-3 hover:bg-muted/20 transition-colors"
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.bg}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className={`text-sm ${config.text} leading-snug`}>{item.text}</p>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
