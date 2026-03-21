"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useT } from "@/lib/useT";
import type { TimeSeriesPoint } from "@/types/api";

export function VolumeChart({ data }: { data: TimeSeriesPoint[] }) {
  const t = useT();

  return (
    <div className="card p-5">
      <h3 className="section-title mb-4">{t("chart.transactionVolume")}</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradFlagged" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickFormatter={(v: string) => v.slice(5)}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid rgba(148, 163, 184, 0.2)",
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                color: "#e2e8f0",
                fontSize: 12,
                padding: "8px 12px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}
              itemStyle={{ color: "#e2e8f0" }}
              labelStyle={{ color: "#94a3b8", marginBottom: 4 }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#6366f1"
              fill="url(#gradTotal)"
              strokeWidth={2}
              name={t("chart.total")}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="flagged"
              stroke="#ef4444"
              fill="url(#gradFlagged)"
              strokeWidth={2}
              name={t("chart.flagged")}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
