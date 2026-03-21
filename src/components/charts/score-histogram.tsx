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
import { useT } from "@/lib/useT";

const BUCKET_COLORS: Record<string, string> = {
  "0.0-0.2": "#059669",
  "0.2-0.4": "#10b981",
  "0.4-0.6": "#d97706",
  "0.6-0.8": "#ea580c",
  "0.8-1.0": "#dc2626",
};

export function ScoreHistogram({ data }: { data: Record<string, number> }) {
  const t = useT();

  const chartData = Object.entries(data).map(([bucket, count]) => ({
    bucket,
    count,
    fill: BUCKET_COLORS[bucket] || "#94a3b8",
  }));

  return (
    <div className="card p-5">
      <h3 className="section-title mb-4">{t("chart.scoreDistribution")}</h3>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
            <XAxis
              dataKey="bucket"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid rgba(148, 163, 184, 0.2)",
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                color: "#e2e8f0",
                fontSize: 12,
                padding: "8px 12px",
              }}
              cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
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
