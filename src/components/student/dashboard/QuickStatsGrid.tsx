"use client";

import React from "react";
import { QuickStatCard } from "./QuickStatCard";
import type { QuickStatItem } from "./types";

interface QuickStatsGridProps {
  items: QuickStatItem[];
}

export function QuickStatsGrid({ items }: QuickStatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {items.map((item, index) => (
        <QuickStatCard key={item.id} item={item} index={index} />
      ))}
    </div>
  );
}
