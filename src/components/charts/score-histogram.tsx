"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const BUCKET_COLORS: Record<string, string> = {
  "0.0-0.2": "#059669",
  "0.2-0.4": "#10b981",
  "0.4-0.6": "#d97706",
  "0.6-0.8": "#ea580c",
  "0.8-1.0": "#dc2626",
};

export function ScoreHistogram({
  data,
}: {
  data: Record<string, number>;
}) {
  const chartData = Object.entries(data).map(([bucket, count]) => ({
    bucket,
    count,
    fill: BUCKET_COLORS[bucket] || "#94a3b8",
  }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-slate-700">
        Score Distribution
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                fontSize: 12,
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.bucket} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
