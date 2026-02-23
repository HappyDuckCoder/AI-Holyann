"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DashboardDeadline } from "./types";

function formatDueDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return "Quá hạn";
  if (diff === 1) return "Ngày mai";
  if (diff <= 7) return `Còn ${diff} ngày`;
  return d.toLocaleDateString("vi-VN", { day: "numeric", month: "short", year: "numeric" });
}

const PRIORITY_LABELS: Record<DashboardDeadline["priority"], string> = {
  high: "Cao",
  medium: "Trung bình",
  low: "Thấp",
};

function PriorityBadge({ priority }: { priority: DashboardDeadline["priority"] }) {
  const styles = {
    high: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
    medium: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
    low: "bg-muted text-muted-foreground border-border",
  };
  return (
    <Badge variant="outline" className={`text-xs font-medium ${styles[priority]}`}>
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}

interface UpcomingDeadlinesProps {
  items: DashboardDeadline[];
  onMarkComplete?: (id: string) => void;
}

export function UpcomingDeadlines({ items, onMarkComplete }: UpcomingDeadlinesProps) {
  const list = items;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="rounded-2xl border border-border shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base font-semibold m-0">Hạn nộp sắp tới</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {list.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              Chưa có hạn nộp sắp tới.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {list.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="group flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{item.subject}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDueDate(item.dueDate)}
                      </span>
                      <PriorityBadge priority={item.priority} />
                    </div>
                  </div>
                  {onMarkComplete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={() => onMarkComplete(item.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Hoàn thành
                    </Button>
                  )}
                </motion.li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
