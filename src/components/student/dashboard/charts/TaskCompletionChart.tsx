"use client";

import React from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = [
  "#10b981", // Done - emerald (thành công)
  "#0ea5e9", // In progress - sky blue (đang làm)
  "#94a3b8", // Pending - slate (chờ)
];

const LABELS: Record<string, string> = {
  Done: "Hoàn thành",
  "In progress": "Đang làm",
  Pending: "Chờ",
  "Chưa có": "Chưa có",
};

interface TaskCompletionChartProps {
  data: { name: string; value: number }[];
}

export function TaskCompletionChart({ data }: TaskCompletionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[240px] w-full flex items-center justify-center rounded-lg bg-muted/30 text-muted-foreground text-sm">
        Chưa có dữ liệu tiến độ.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="h-[240px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={56}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--card)",
              color: "var(--card-foreground)",
            }}
            formatter={(value: number, name: string) => [`${value}%`, LABELS[name] ?? name]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-sm text-foreground">{LABELS[value] ?? value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
