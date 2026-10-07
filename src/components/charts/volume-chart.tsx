"use client";

import { useChartTheme } from "@/components/charts/chart-theme";
import { parseTimestamp } from "@/lib/format";
import { useAppStore } from "@/lib/store";

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
  const theme = useChartTheme();
  const locale = useAppStore((state) => state.locale);
  // Buckets are dates ("2026-10-07") or hours ("2026-10-07T14:00"); label accordingly.
  const hourly = data.some((point) => point.date.includes("T"));
  const axisLabel = (value: string) => {
    const date = parseTimestamp(value);
    if (!date) return value;
    return new Intl.DateTimeFormat(
      locale === "fr" ? "fr-FR" : "en-GB",
      hourly ? { hour: "2-digit", minute: "2-digit" } : { day: "numeric", month: "short" },
    ).format(date);
  };
  const t = useT();

  return (
    <div className="card p-5">
      <h3 className="section-title mb-4">{t("chart.transactionVolume")}</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.series[0]} stopOpacity={0.2} />
                <stop offset="100%" stopColor={theme.series[0]} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradFlagged" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.decision.block} stopOpacity={0.2} />
                <stop offset="100%" stopColor={theme.decision.block} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
            <XAxis
              dataKey="date"
              tick={theme.tick}
              tickFormatter={axisLabel}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={theme.tick} axisLine={false} tickLine={false} />
            <Tooltip {...theme.tooltip} />
            <Area
              type="monotone"
              dataKey="count"
              stroke={theme.series[0]}
              fill="url(#gradTotal)"
              strokeWidth={2}
              name={t("chart.total")}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="flagged"
              stroke={theme.decision.block}
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
