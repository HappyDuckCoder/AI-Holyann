"use client";

import React from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(163 72% 40%)",
  "hsl(38 92% 50%)",
];

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
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
            }}
            formatter={(value: number, name: string) => [`${value}%`, name]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
