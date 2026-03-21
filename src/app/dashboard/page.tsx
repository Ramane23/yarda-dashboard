"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeftRight,
  ShieldAlert,
  Timer,
  TrendingUp,
  Layers,
  AlertCircle,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { KpiCard } from "@/components/ui/kpi-card";
import { VolumeChart } from "@/components/charts/volume-chart";
import { DecisionDonut } from "@/components/charts/decision-donut";
import { ScoreHistogram } from "@/components/charts/score-histogram";
import { getStats, getAnalytics } from "@/lib/api";
import { formatNumber, formatPercent, formatMs, cn, phaseLabel } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/useT";
import type { TranslationKey } from "@/lib/i18n";

export default function DashboardOverview() {
  const period = useAppStore((s) => s.period);
  const locale = useAppStore((s) => s.locale);
  const t = useT();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["stats", period],
    queryFn: () => getStats(period),
  });

  const { data: analytics } = useQuery({
    queryKey: ["analytics", period],
    queryFn: () => getAnalytics(period),
  });

  const phase = stats ? phaseLabel(stats.phase, locale) : null;

  const decisionKeys: Record<string, TranslationKey> = {
    allow: "decision.allow",
    review: "decision.review",
    alert: "decision.alert",
    block: "decision.block",
  };

  return (
    <>
      <Header title={t("nav.overview")} />
      <div className="flex-1 space-y-6 overflow-auto p-6">
        {/* KPI Grid */}
        <div className="animate-fade-in grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KpiCard
            title={t("kpi.transactions")}
            value={statsLoading ? "\u2014" : formatNumber(stats?.total_transactions ?? 0)}
            icon={ArrowLeftRight}
            accent="bg-brand-500"
          />
          <KpiCard
            title={t("kpi.flagged")}
            value={statsLoading ? "\u2014" : formatNumber(stats?.total_flagged ?? 0)}
            subtitle={statsLoading ? "" : `${formatPercent(stats?.flagged_rate ?? 0)} ${t("kpi.ofTotal")}`}
            icon={ShieldAlert}
            accent="bg-red-500"
          />
          <KpiCard
            title={t("kpi.riskScore")}
            value={statsLoading ? "\u2014" : (stats?.avg_score ?? 0).toFixed(3)}
            subtitle={t("kpi.average")}
            icon={TrendingUp}
            accent="bg-amber-500"
          />
          <KpiCard
            title={t("kpi.latency")}
            value={statsLoading ? "\u2014" : formatMs(stats?.avg_inference_time_ms ?? 0)}
            subtitle={t("kpi.avgInference")}
            icon={Timer}
            accent="bg-emerald-500"
          />
          <KpiCard
            title={t("kpi.phase")}
            value={statsLoading ? "\u2014" : (phase?.label ?? "\u2014")}
            subtitle={`${stats?.labeled_count ?? 0} ${t("kpi.labels")}`}
            icon={Layers}
            accent="bg-violet-500"
          />
          <KpiCard
            title={t("kpi.pendingReview")}
            value={statsLoading ? "\u2014" : formatNumber(stats?.pending_review ?? 0)}
            icon={AlertCircle}
            accent="bg-orange-500"
          />
        </div>

        {/* Decision Quick Stats */}
        {stats && (
          <div className="animate-fade-in grid grid-cols-4 gap-3" style={{ animationDelay: "100ms" }}>
            {(["allow", "review", "alert", "block"] as const).map((key) => {
              const colorMap = {
                allow: "from-emerald-500 to-emerald-600",
                review: "from-amber-500 to-amber-600",
                alert: "from-orange-500 to-orange-600",
                block: "from-red-500 to-red-600",
              };
              const total = stats.total_transactions || 1;
              const count = stats.decisions[key];
              const pct = ((count / total) * 100).toFixed(1);
              return (
                <div key={key} className="card overflow-hidden p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">
                      {t(decisionKeys[key])}
                    </span>
                    <span className={cn("badge bg-gradient-to-r text-white text-[10px]", colorMap[key])}>
                      {pct}%
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-xl font-bold text-surface-900 dark:text-white">
                    {count.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Charts */}
        {analytics && (
          <>
            <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
              <VolumeChart data={analytics.time_series} />
            </div>
            <div className="animate-fade-in grid grid-cols-1 gap-6 lg:grid-cols-2" style={{ animationDelay: "300ms" }}>
              <DecisionDonut data={analytics.decision_breakdown} />
              <ScoreHistogram data={analytics.score_distribution} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
