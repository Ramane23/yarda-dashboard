"use client";

import { useChartTheme } from "@/components/charts/chart-theme";
import type { Decision } from "@/lib/tokens";

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

const BUCKET_BANDS: Record<string, Decision> = {
  "0.0-0.2": "allow",
  "0.2-0.4": "allow",
  "0.4-0.6": "review",
  "0.6-0.8": "alert",
  "0.8-1.0": "block",
};

export function ScoreHistogram({ data }: { data: Record<string, number> }) {
  const theme = useChartTheme();
  const t = useT();

  const chartData = Object.entries(data).map(([bucket, count]) => ({
    bucket,
    count,
    fill: BUCKET_BANDS[bucket] ? theme.decision[BUCKET_BANDS[bucket]] : theme.axis,
  }));

  return (
    <div className="card p-5">
      <h3 className="section-title mb-4">{t("chart.scoreDistribution")}</h3>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
            <XAxis dataKey="bucket" tick={theme.tick} axisLine={false} tickLine={false} />
            <YAxis tick={theme.tick} axisLine={false} tickLine={false} />
            <Tooltip {...theme.tooltip} cursor={{ fill: theme.cursor }} />
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
