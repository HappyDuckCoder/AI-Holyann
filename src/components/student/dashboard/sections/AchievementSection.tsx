"use client";

import { GraduationCap, Globe } from "lucide-react";

export default function AchievementSection() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-center">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
          <GraduationCap className="w-6 h-6 text-primary" />
        </div>
        <div className="text-2xl font-bold text-foreground">2,500+</div>
        <div className="text-xs text-muted-foreground mt-0.5">học viên trúng tuyển</div>
      </div>
      <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-center">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
          <Globe className="w-6 h-6 text-primary" />
        </div>
        <div className="text-2xl font-bold text-foreground">15+</div>
        <div className="text-xs text-muted-foreground mt-0.5">Quốc gia hỗ trợ</div>
      </div>
    </div>
  );
}
