"use client";

import React from "react";
import { QuickStatCard } from "./QuickStatCard";
import type { QuickStatItem } from "./types";

interface QuickStatsGridProps {
  items: QuickStatItem[];
}

export function QuickStatsGrid({ items }: QuickStatsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-stretch">
      {items.map((item, index) => (
        <QuickStatCard key={item.id} item={item} index={index} />
      ))}
    </div>
  );
}
