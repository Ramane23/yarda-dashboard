"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeftRight,
  ShieldAlert,
  Timer,
  TrendingUp,
  Layers,
  AlertCircle,
  Target,
  Brain,
  Gauge,
  Network,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { KpiCard } from "@/components/ui/kpi-card";
import { VolumeChart } from "@/components/charts/volume-chart";
import { DecisionDonut } from "@/components/charts/decision-donut";
import { ScoreHistogram } from "@/components/charts/score-histogram";
import { getStats, getAnalytics, getPhaseProgress, getScoringConfig } from "@/lib/api";
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

  const { data: phaseProgress } = useQuery({
    queryKey: ["phase-progress"],
    queryFn: () => getPhaseProgress(),
  });

  const { data: scoringConfig } = useQuery({
    queryKey: ["scoring-config"],
    queryFn: () => getScoringConfig(),
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
        {/* Cold Start Banner */}
        {stats?.phase === "detection" && (
          <div className="animate-fade-in rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50 to-brand-50 p-4 dark:border-sky-800 dark:from-sky-950/30 dark:to-brand-950/30">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-sky-100 p-2 dark:bg-sky-900/50">
                <Target size={18} className="text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-sky-800 dark:text-sky-300">
                  {t("review.detectionBanner")}
                </p>
                <p className="mt-0.5 text-xs text-sky-600 dark:text-sky-400">
                  {t("review.collectLabels")}
                </p>
              </div>
            </div>
          </div>
        )}

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
            subtitle={
              statsLoading ? "" : `${formatPercent(stats?.flagged_rate ?? 0)} ${t("kpi.ofTotal")}`
            }
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
          <div
            className="animate-fade-in grid grid-cols-4 gap-3"
            style={{ animationDelay: "100ms" }}
          >
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
                    <span
                      className={cn("badge bg-gradient-to-r text-white text-[10px]", colorMap[key])}
                    >
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

        {/* Phase Progression + Scoring Formula */}
        {phaseProgress && (
          <div
            className="animate-fade-in grid grid-cols-1 gap-6 lg:grid-cols-2"
            style={{ animationDelay: "150ms" }}
          >
            {/* Phase Progression */}
            <div className="card p-5">
              <h3 className="section-title mb-4">{t("phase.progressTitle")}</h3>

              {/* Phase steps */}
              <div className="mb-5 flex items-center gap-1">
                {phaseProgress.phases.map((p, i) => {
                  const isCurrent = p.phase === phaseProgress.current_phase;
                  const isPast =
                    phaseProgress.phases.findIndex((x) => x.phase === phaseProgress.current_phase) >
                    i;
                  const phaseInfo = phaseLabel(p.phase, locale);
                  return (
                    <div key={p.phase} className="flex flex-1 flex-col items-center">
                      <div
                        className={cn(
                          "mb-2 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all",
                          isCurrent
                            ? "bg-brand-500 text-white shadow-glow"
                            : isPast
                              ? "bg-emerald-500 text-white"
                              : "bg-surface-200 text-surface-500 dark:bg-surface-700 dark:text-surface-400",
                        )}
                      >
                        {i + 1}
                      </div>
                      <span
                        className={cn(
                          "text-center text-[10px] font-medium",
                          isCurrent
                            ? "text-brand-600 dark:text-brand-400"
                            : "text-surface-500 dark:text-surface-400",
                        )}
                      >
                        {phaseInfo.label}
                      </span>
                      {/* Connector line */}
                      {i < phaseProgress.phases.length - 1 && (
                        <div
                          className={cn(
                            "absolute mt-4 h-0.5 w-full",
                            isPast ? "bg-emerald-500" : "bg-surface-200 dark:bg-surface-700",
                          )}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-surface-600 dark:text-surface-400">
                    {t("phase.labelsCollected")}
                  </span>
                  <span className="font-mono font-semibold text-surface-900 dark:text-white">
                    {phaseProgress.labeled_count}
                    {phaseProgress.next_phase_threshold
                      ? ` / ${phaseProgress.next_phase_threshold}`
                      : ""}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-700"
                    style={{ width: `${Math.min(phaseProgress.progress_percent, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-surface-500 dark:text-surface-400">
                  {phaseProgress.labels_remaining > 0
                    ? `${phaseProgress.labels_remaining} ${t("phase.labelsRemaining")} ${t("phase.nextPhase")}: ${phaseProgress.next_phase ? phaseLabel(phaseProgress.next_phase, locale).label : ""}`
                    : t("phase.reachedFinal")}
                </p>
              </div>
            </div>

            {/* Scoring Formula */}
            <div className="card p-5">
              <h3 className="section-title mb-4">{t("scoring.title")}</h3>

              <div className="space-y-4">
                {/* Weight bars */}
                {[
                  {
                    key: "anomaly" as const,
                    label: t("config.anomalyDetector"),
                    color: "violet",
                    icon: <Gauge size={14} className="text-violet-500" />,
                  },
                  {
                    key: "ml" as const,
                    label: t("config.fraudClassifier"),
                    color: "brand",
                    icon: <Brain size={14} className="text-brand-500" />,
                  },
                  {
                    key: "gnn" as const,
                    label: t("config.networkDetector"),
                    color: "emerald",
                    icon: <Network size={14} className="text-emerald-500" />,
                  },
                ].map((item) => {
                  const value = phaseProgress.scoring_weights[item.key] ?? 0;
                  if (value === 0 && item.key === "gnn") return null;
                  const colorMap: Record<string, string> = {
                    violet: "text-violet-600 dark:text-violet-400",
                    brand: "text-brand-600 dark:text-brand-400",
                    emerald: "text-emerald-600 dark:text-emerald-400",
                  };
                  const bgMap: Record<string, string> = {
                    violet: "bg-violet-500",
                    brand: "bg-brand-500",
                    emerald: "bg-emerald-500",
                  };
                  return (
                    <div key={item.key} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {item.icon}
                          <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                            {item.label}
                          </span>
                        </div>
                        <span className={cn("font-mono text-sm font-bold", colorMap[item.color])}>
                          {Math.round(value * 100)}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-700",
                            bgMap[item.color],
                          )}
                          style={{ width: `${value * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Formula visualization */}
                <div className="rounded-lg border border-dashed border-surface-300 bg-surface-50/50 px-3 py-2.5 dark:border-surface-600 dark:bg-surface-800/30">
                  <p className="text-center font-mono text-[11px] leading-relaxed text-surface-600 dark:text-surface-400">
                    score ={" "}
                    <span className="font-semibold text-violet-600 dark:text-violet-400">
                      {Math.round(phaseProgress.scoring_weights.anomaly * 100)}% anomaly
                    </span>
                    {phaseProgress.scoring_weights.ml > 0 && (
                      <>
                        {" + "}
                        <span className="font-semibold text-brand-600 dark:text-brand-400">
                          {Math.round(phaseProgress.scoring_weights.ml * 100)}% classifier
                        </span>
                      </>
                    )}
                    {(phaseProgress.scoring_weights.gnn ?? 0) > 0 && (
                      <>
                        {" + "}
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {Math.round((phaseProgress.scoring_weights.gnn ?? 0) * 100)}% network
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scoring Configuration */}
        {scoringConfig && (
          <div
            className="animate-fade-in grid grid-cols-1 gap-6 lg:grid-cols-3"
            style={{ animationDelay: "180ms" }}
          >
            {/* Decision Thresholds */}
            <div className="card p-5">
              <h3 className="section-title mb-4">{t("config.decisionThresholds")}</h3>
              <div className="space-y-3">
                {[
                  {
                    key: "allow",
                    max: scoringConfig.thresholds.review,
                    color: "emerald",
                    translationKey: "config.threshold.allow" as const,
                  },
                  {
                    key: "review",
                    max: scoringConfig.thresholds.alert,
                    color: "amber",
                    translationKey: "config.threshold.review" as const,
                  },
                  {
                    key: "alert",
                    max: scoringConfig.thresholds.block,
                    color: "orange",
                    translationKey: "config.threshold.alert" as const,
                  },
                  {
                    key: "block",
                    max: 1.0,
                    color: "red",
                    translationKey: "config.threshold.block" as const,
                  },
                ].map((item) => {
                  const from = item.key === "allow" ? 0 : (scoringConfig.thresholds[item.key] ?? 0);
                  const colorMap: Record<string, string> = {
                    emerald: "bg-emerald-500",
                    amber: "bg-amber-500",
                    orange: "bg-orange-500",
                    red: "bg-red-500",
                  };
                  const textMap: Record<string, string> = {
                    emerald: "text-emerald-600 dark:text-emerald-400",
                    amber: "text-amber-600 dark:text-amber-400",
                    orange: "text-orange-600 dark:text-orange-400",
                    red: "text-red-600 dark:text-red-400",
                  };
                  return (
                    <div key={item.key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-surface-600 dark:text-surface-400">
                          {t(item.translationKey)}
                        </span>
                        <span className={cn("font-mono text-xs font-bold", textMap[item.color])}>
                          {from.toFixed(2)} — {item.max.toFixed(2)}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
                        <div
                          className={cn("h-full rounded-full", colorMap[item.color])}
                          style={{
                            marginLeft: `${from * 100}%`,
                            width: `${(item.max - from) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fraud Taxonomy */}
            <div className="card p-5">
              <h3 className="section-title mb-4">{t("config.fraudTaxonomy")}</h3>
              <div className="space-y-2">
                {scoringConfig.fraud_taxonomy.map((ft) => (
                  <div
                    key={ft.key}
                    className="flex items-start gap-2 rounded-lg border border-surface-100 bg-surface-50/50 px-3 py-2 dark:border-surface-800 dark:bg-surface-800/30"
                  >
                    <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-400" />
                    <div>
                      <p className="text-xs font-semibold text-surface-800 dark:text-surface-200">
                        {ft.label}
                      </p>
                      {ft.description && (
                        <p className="text-[10px] text-surface-500 dark:text-surface-400">
                          {ft.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weights by Phase */}
            <div className="card p-5">
              <h3 className="section-title mb-4">{t("config.weightsByPhase")}</h3>
              <div className="space-y-3">
                {scoringConfig.phases.map((p) => {
                  const w = scoringConfig.weights_by_phase[p.phase];
                  if (!w) return null;
                  const isCurrent = p.phase === scoringConfig.current_phase;
                  const pInfo = phaseLabel(p.phase, locale);
                  return (
                    <div
                      key={p.phase}
                      className={cn(
                        "rounded-lg border px-3 py-2.5",
                        isCurrent
                          ? "border-brand-300 bg-brand-50/50 dark:border-brand-700 dark:bg-brand-950/20"
                          : "border-surface-100 dark:border-surface-800",
                      )}
                    >
                      <div className="mb-1.5 flex items-center justify-between">
                        <span
                          className={cn(
                            "text-xs font-semibold",
                            isCurrent
                              ? "text-brand-700 dark:text-brand-400"
                              : "text-surface-600 dark:text-surface-400",
                          )}
                        >
                          {pInfo.label}
                          {isCurrent && " •"}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {w.anomaly > 0 && (
                          <div
                            className="h-2 rounded-full bg-violet-500"
                            style={{ width: `${w.anomaly * 100}%` }}
                            title={`${t("config.anomalyDetector")}: ${Math.round(w.anomaly * 100)}%`}
                          />
                        )}
                        {w.ml > 0 && (
                          <div
                            className="h-2 rounded-full bg-brand-500"
                            style={{ width: `${w.ml * 100}%` }}
                            title={`${t("config.fraudClassifier")}: ${Math.round(w.ml * 100)}%`}
                          />
                        )}
                        {w.gnn > 0 && (
                          <div
                            className="h-2 rounded-full bg-emerald-500"
                            style={{ width: `${w.gnn * 100}%` }}
                            title={`${t("config.networkDetector")}: ${Math.round(w.gnn * 100)}%`}
                          />
                        )}
                      </div>
                      <div className="mt-1 flex gap-3 text-[10px] text-surface-500 dark:text-surface-400">
                        {w.anomaly > 0 && <span>{Math.round(w.anomaly * 100)}% anomaly</span>}
                        {w.ml > 0 && <span>{Math.round(w.ml * 100)}% classifier</span>}
                        {w.gnn > 0 && <span>{Math.round(w.gnn * 100)}% network</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        {analytics && (
          <>
            <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
              <VolumeChart data={analytics.time_series} />
            </div>
            <div
              className="animate-fade-in grid grid-cols-1 gap-6 lg:grid-cols-2"
              style={{ animationDelay: "300ms" }}
            >
              <DecisionDonut data={analytics.decision_breakdown} />
              <ScoreHistogram data={analytics.score_distribution} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
