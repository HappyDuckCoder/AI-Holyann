"use client";

import React from "react";
import { motion } from "framer-motion";
import { CalendarClock, CalendarX, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DashboardDeadline } from "./types";

function getDaysRemaining(iso: string): { label: string; days: number } {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return { label: "Quá hạn", days: diff };
  if (diff === 1) return { label: "Ngày mai", days: diff };
  if (diff <= 7) return { label: `Còn ${diff} ngày`, days: diff };
  return {
    label: d.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    days: diff,
  };
}

const PRIORITY_LABELS: Record<DashboardDeadline["priority"], string> = {
  high: "Cao",
  medium: "Trung bình",
  low: "Thấp",
};

function PriorityBadge({ priority }: { priority: DashboardDeadline["priority"] }) {
  const styles = {
    high: "bg-destructive/10 text-destructive border-destructive/30",
    medium: "bg-accent/10 text-accent border-accent/30",
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
      <Card className="card-holyann overflow-hidden">
        <CardHeader className="border-b border-border/80 bg-muted/30 px-6 py-4 dark:bg-muted/20">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            <CardTitle className="font-heading text-base font-bold text-primary m-0">
              Hạn nộp sắp tới
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
              <CalendarX className="mb-3 h-12 w-12 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                Chưa có hạn nộp sắp tới
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Các deadline sẽ hiển thị tại đây
              </p>
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
                  <div className="flex flex-1 items-center justify-between gap-4 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="h-2 w-2 rounded-full bg-accent" />
                      <div>
                        <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          {getDaysRemaining(item.dueDate).label}
                        </span>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.subject}
                        </p>
                      </div>
                    </div>
                    <div className="text-right min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      <div className="mt-1 flex items-center justify-end gap-2">
                        <PriorityBadge priority={item.priority} />
                      </div>
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
