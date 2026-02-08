"use client";

import { Clock } from "lucide-react";

export default function LatestNewsSection() {
  const newsItems = [
    "Deadline học bổng Mỹ - Fall 2024",
    "Sự kiện Triển lãm Du học Anh Quốc",
    "Kinh nghiệm phỏng vấn Visa J-1",
  ];

  return (
    <div className="flex flex-col gap-2">
      {newsItems.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-3 hover:bg-muted/30 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground flex-1">{item}</p>
        </div>
      ))}
    </div>
  );
}
