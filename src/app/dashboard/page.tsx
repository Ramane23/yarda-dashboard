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
import { formatNumber, formatPercent, formatMs } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

export default function DashboardOverview() {
  const period = useAppStore((s) => s.period);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["stats", period],
    queryFn: () => getStats(period),
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["analytics", period],
    queryFn: () => getAnalytics(period),
  });

  return (
    <>
      <Header title="Overview" />
      <div className="flex-1 space-y-6 overflow-auto p-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KpiCard
            title="Transactions"
            value={statsLoading ? "..." : formatNumber(stats?.total_transactions ?? 0)}
            icon={ArrowLeftRight}
            accent="border-brand-500"
          />
          <KpiCard
            title="Flagged"
            value={statsLoading ? "..." : formatNumber(stats?.total_flagged ?? 0)}
            subtitle={statsLoading ? "" : formatPercent(stats?.flagged_rate ?? 0)}
            icon={ShieldAlert}
            accent="border-risk-block"
          />
          <KpiCard
            title="Avg Score"
            value={statsLoading ? "..." : (stats?.avg_score ?? 0).toFixed(3)}
            icon={TrendingUp}
            accent="border-risk-review"
          />
          <KpiCard
            title="Avg Latency"
            value={statsLoading ? "..." : formatMs(stats?.avg_inference_time_ms ?? 0)}
            icon={Timer}
            accent="border-emerald-500"
          />
          <KpiCard
            title="Phase"
            value={statsLoading ? "..." : (stats?.phase ?? "cold_start")}
            subtitle={`${stats?.labeled_count ?? 0} labels`}
            icon={Layers}
            accent="border-purple-500"
          />
          <KpiCard
            title="Pending Review"
            value={statsLoading ? "..." : formatNumber(stats?.pending_review ?? 0)}
            icon={AlertCircle}
            accent="border-amber-500"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {analytics && <VolumeChart data={analytics.time_series} />}
          {analytics && <DecisionDonut data={analytics.decision_breakdown} />}
        </div>

        {analytics && (
          <ScoreHistogram data={analytics.score_distribution} />
        )}
      </div>
    </>
  );
}
