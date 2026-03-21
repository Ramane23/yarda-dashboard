"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { DecisionBreakdown } from "@/types/api";

const COLORS: Record<string, string> = {
  allow: "#059669",
  review: "#d97706",
  alert: "#ea580c",
  block: "#dc2626",
};

const LABELS: Record<string, string> = {
  allow: "Allowed",
  review: "Review",
  alert: "Alert",
  block: "Blocked",
};

export function DecisionDonut({ data }: { data: DecisionBreakdown }) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));
  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="card p-5">
      <h3 className="section-title mb-4">Decision Breakdown</h3>
      <div className="flex items-center gap-8">
        <div className="relative h-52 w-52 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name] || "#94a3b8"} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [
                  `${value.toLocaleString()} (${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)`,
                ]}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  color: "#e2e8f0",
                  fontSize: 12,
                  padding: "8px 12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-2xl font-bold text-surface-900 dark:text-white">
              {total.toLocaleString()}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-surface-400">
              Total
            </span>
          </div>
        </div>

        {/* Legend with bars */}
        <div className="flex-1 space-y-3">
          {chartData.map((d) => {
            const pct = total > 0 ? (d.value / total) * 100 : 0;
            return (
              <div key={d.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[d.name] }}
                    />
                    <span className="text-xs font-medium text-surface-600 dark:text-surface-300">
                      {LABELS[d.name] || d.name}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-semibold text-surface-900 dark:text-white">
                    {d.value.toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-100 dark:bg-surface-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: COLORS[d.name],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
