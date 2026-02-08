"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";
import { StudentProfile } from "../../../types";

interface RadarChartCardProps {
  profile: StudentProfile;
  chartData: Array<{ subject: string; A: number; fullMark: number }>;
}

export const RadarChartCard: React.FC<RadarChartCardProps> = ({
  profile,
  chartData,
}) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const strokeFill = isDark ? "#60a5fa" : "#0f6093";
  const gridStroke = isDark ? "#475569" : "#e2e8f0";
  const tickFill = isDark ? "#94a3b8" : "#64748b";

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-5">
      <h3 className="text-base font-semibold text-foreground mb-4">
        Đánh giá tổng quan
      </h3>
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
            <PolarGrid stroke={gridStroke} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: tickFill, fontSize: 11, fontWeight: 500 }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name={profile.name}
              dataKey="A"
              stroke={strokeFill}
              strokeWidth={2}
              fill={strokeFill}
              fillOpacity={0.4}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload?.[0]) {
                  const v =
                    typeof payload[0].value === "number"
                      ? payload[0].value.toFixed(0)
                      : payload[0].value;
                  return (
                    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
                      <p className="text-sm font-medium text-foreground">
                        {payload[0].payload.subject}
                      </p>
                      <p className="text-sm text-primary font-medium">{v}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex gap-2">
        <Link
          href="/student/tests"
          className="flex-1 text-center py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Bài đánh giá
        </Link>
        <Link
          href="/student/swotCard"
          className="flex-1 text-center py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors"
        >
          SWOT
        </Link>
      </div>
    </div>
  );
};
