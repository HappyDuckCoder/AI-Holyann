"use client";

import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface StatusBadgeProps {
  isComplete: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ isComplete }) => (
  <div
    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
      isComplete
        ? "bg-primary/10 text-primary border border-primary/20"
        : "bg-muted text-muted-foreground border border-border"
    }`}
  >
    {isComplete ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
    {isComplete ? "Hoàn tất" : "Cần bổ sung"}
  </div>
);
