"use client";

import { useChartTheme } from "@/components/charts/chart-theme";
import type { Decision } from "@/lib/tokens";
import { useFormat } from "@/lib/useFormat";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useT } from "@/lib/useT";
import type { DecisionBreakdown } from "@/types/api";
import type { TranslationKey } from "@/lib/i18n";

const LABEL_KEYS: Record<string, TranslationKey> = {
  allow: "legend.allowed",
  review: "legend.review",
  alert: "legend.alert",
  block: "legend.blocked",
};

export function DecisionDonut({ data }: { data: DecisionBreakdown }) {
  const theme = useChartTheme();
  const fmt = useFormat();
  const t = useT();

  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));
  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="card p-5">
      <h3 className="section-title mb-4">{t("chart.decisionBreakdown")}</h3>
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
                  <Cell
                    key={entry.name}
                    fill={theme.decision[entry.name as Decision] ?? theme.axis}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [
                  `${value.toLocaleString()} (${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)`,
                ]}
                {...theme.tooltip}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-2xl font-bold text-surface-900 dark:text-white">
              {total.toLocaleString()}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-surface-400">
              {t("chart.total")}
            </span>
          </div>
        </div>

        {/* Legend with bars */}
        <div className="flex-1 space-y-3">
          {chartData.map((d) => {
            const pct = total > 0 ? (d.value / total) * 100 : 0;
            const labelKey = LABEL_KEYS[d.name];
            return (
              <div key={d.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: theme.decision[d.name as Decision] ?? theme.axis }}
                    />
                    <span className="text-xs font-medium text-surface-600 dark:text-surface-300">
                      {labelKey ? t(labelKey) : d.name}
                    </span>
                  </div>
                  <span className="text-xs font-semibold tabular-nums">{fmt.number(d.value)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-100 dark:bg-surface-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: theme.decision[d.name as Decision] ?? theme.axis,
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
