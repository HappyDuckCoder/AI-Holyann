"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { History, Loader2 } from "lucide-react";

const ACCENT = "#0052FF";
const ACCENT_SEC = "#4D7CFF";

type HistoryItem = {
  id: string;
  created_at: string | null;
  summary?: { student_score?: number; spike_score?: number } | null;
  faculties?: { reach?: unknown[]; match?: unknown[]; safe?: unknown[] } | null;
};

interface TargetHistorySectionProps {
  studentId: string | null;
}

function formatDate(d: string | null): string {
  if (!d) return "—";
  try {
    const date = new Date(d);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function TargetHistorySection({ studentId }: TargetHistorySectionProps) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<HistoryItem[]>([]);

  const fetchHistory = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/students/${studentId}/admission-chance/history`);
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.items ?? []);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (!studentId) return null;

  if (loading) {
    return (
      <motion.div
        className="mt-8 rounded-2xl border border-[#0052FF]/20 bg-gradient-to-br from-[#0052FF]/5 to-transparent p-6"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="inline-flex items-center gap-3 rounded-full border border-[#0052FF]/30 bg-[#0052FF]/5 px-4 py-2 mb-4">
          <History className="size-4 text-[#0052FF]" />
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-[#0052FF]">
            Lịch sử đánh giá cơ hội
          </span>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-card/50 p-4 border border-border">
          <Loader2 className="size-5 animate-spin text-[#0052FF]" />
          <span className="text-sm text-muted-foreground">Đang tải lịch sử...</span>
        </div>
      </motion.div>
    );
  }

  if (items.length === 0) {
    return (
      <motion.section
        className="mt-8 rounded-2xl border border-border bg-muted/5 p-6"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="inline-flex items-center gap-3 rounded-full border border-[#0052FF]/30 bg-[#0052FF]/5 px-4 py-2 mb-4">
          <History className="size-4 text-[#0052FF]" />
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-[#0052FF]">
            Lịch sử đánh giá cơ hội
          </span>
        </div>
        <p className="text-sm text-muted-foreground">Chưa có lịch sử đánh giá.</p>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-md"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className="inline-flex items-center gap-3 rounded-full border border-[#0052FF]/30 bg-[#0052FF]/5 px-4 py-2 mb-4">
        <span className="h-2 w-2 rounded-full bg-[#0052FF]" />
        <History className="size-4 text-[#0052FF]" />
        <span className="font-mono text-xs uppercase tracking-[0.15em] text-[#0052FF]">
          Lịch sử đánh giá cơ hội
        </span>
      </div>
      <p className="text-muted-foreground text-sm mb-5">
        Các lần chạy đánh giá Reach / Match / Safety trước đây.
      </p>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="group flex flex-wrap items-center gap-3 rounded-xl border border-border bg-background px-4 py-3.5 shadow-sm hover:shadow-lg hover:border-[#0052FF]/25 transition-all duration-300 border-l-4"
            style={{ borderLeftColor: ACCENT }}
          >
            <span className="text-sm font-semibold text-foreground tabular-nums shrink-0">
              {formatDate(item.created_at)}
            </span>
            {item.summary && (
              <span className="inline-flex gap-3 text-xs text-muted-foreground">
                {item.summary.student_score != null && (
                  <span>Điểm hồ sơ: {item.summary.student_score}</span>
                )}
                {item.summary.spike_score != null && (
                  <span>Spike: {item.summary.spike_score}</span>
                )}
              </span>
            )}
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}
