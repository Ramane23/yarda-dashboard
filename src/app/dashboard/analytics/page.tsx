"use client";

import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { VolumeChart } from "@/components/charts/volume-chart";
import { DecisionDonut } from "@/components/charts/decision-donut";
import { ScoreHistogram } from "@/components/charts/score-histogram";
import { getAnalytics, getFeedbackSummary } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { formatPercent, cn } from "@/lib/utils";
import { useT } from "@/lib/useT";

export default function AnalyticsPage() {
  const period = useAppStore((s) => s.period);
  const t = useT();

  const { data: analytics } = useQuery({
    queryKey: ["analytics", period],
    queryFn: () => getAnalytics(period),
  });

  const { data: feedback } = useQuery({
    queryKey: ["feedback", period],
    queryFn: () => getFeedbackSummary(period),
  });

  return (
    <>
      <Header title={t("analytics.title")} />
      <div className="flex-1 space-y-6 overflow-auto p-6">
        {analytics && (
          <>
            <div className="animate-fade-in">
              <VolumeChart data={analytics.time_series} />
            </div>

            <div
              className="animate-fade-in grid grid-cols-1 gap-6 lg:grid-cols-2"
              style={{ animationDelay: "100ms" }}
            >
              <DecisionDonut data={analytics.decision_breakdown} />
              <ScoreHistogram data={analytics.score_distribution} />
            </div>

            {/* Peak Hours */}
            {analytics.top_hours.length > 0 && (
              <div className="card animate-fade-in p-5" style={{ animationDelay: "200ms" }}>
                <h3 className="section-title mb-4">{t("analytics.peakHours")}</h3>
                <div className="flex items-end gap-2">
                  {Array.from({ length: 24 }, (_, i) => {
                    const match = analytics.top_hours.find((h) => h.hour === i);
                    const maxCount = Math.max(...analytics.top_hours.map((h) => h.count), 1);
                    const heightPct = match ? (match.count / maxCount) * 100 : 5;
                    const isTop = match && match.count === maxCount;
                    return (
                      <div
                        key={i}
                        className="flex flex-1 flex-col items-center gap-1"
                        title={match ? `${match.count} txn` : "0 txn"}
                      >
                        <div
                          className={cn(
                            "w-full rounded-t transition-all duration-300",
                            match
                              ? isTop
                                ? "bg-brand-500"
                                : "bg-brand-400/60 dark:bg-brand-500/40"
                              : "bg-surface-200 dark:bg-surface-700",
                          )}
                          style={{ height: `${Math.max(heightPct, 4)}px`, maxHeight: 80 }}
                        />
                        <span className="text-[9px] font-medium text-surface-400">
                          {String(i).padStart(2, "0")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Model Performance */}
        {feedback && feedback.total_labeled > 0 && (
          <div className="animate-fade-in space-y-6" style={{ animationDelay: "300ms" }}>
            {/* Labels Overview */}
            <div className="card p-5">
              <h3 className="section-title mb-4">{t("analytics.labelDistribution")}</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="font-mono text-2xl font-bold text-surface-900 dark:text-white">
                    {feedback.total_labeled}
                  </p>
                  <p className="text-xs text-surface-400">{t("analytics.totalLabeled")}</p>
                </div>
                <div className="text-center">
                  <p className="font-mono text-2xl font-bold text-red-600 dark:text-red-400">
                    {feedback.fraud_count}
                  </p>
                  <p className="text-xs text-surface-400">{t("analytics.fraud")}</p>
                </div>
                <div className="text-center">
                  <p className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {feedback.legitimate_count}
                  </p>
                  <p className="text-xs text-surface-400">{t("analytics.legitimate")}</p>
                </div>
              </div>
              {/* Fraud/Legit bar */}
              <div className="mt-4 flex h-3 overflow-hidden rounded-full">
                <div
                  className="bg-red-500 transition-all duration-500"
                  style={{
                    width: `${feedback.total_labeled > 0 ? (feedback.fraud_count / feedback.total_labeled) * 100 : 0}%`,
                  }}
                />
                <div className="flex-1 bg-emerald-500" />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-surface-400">
                <span>
                  {t("analytics.fraud")}{" "}
                  {feedback.total_labeled > 0
                    ? ((feedback.fraud_count / feedback.total_labeled) * 100).toFixed(1)
                    : 0}
                  %
                </span>
                <span>
                  {t("analytics.legitimate")}{" "}
                  {feedback.total_labeled > 0
                    ? ((feedback.legitimate_count / feedback.total_labeled) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="card p-5">
              <h3 className="section-title mb-4">{t("analytics.modelPerformance")}</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  {
                    label: t("analytics.precision"),
                    value: feedback.precision,
                    color: "text-brand-600 dark:text-brand-400",
                  },
                  {
                    label: t("analytics.recall"),
                    value: feedback.recall,
                    color: "text-emerald-600 dark:text-emerald-400",
                  },
                  {
                    label: t("analytics.f1Score"),
                    value: feedback.f1_score,
                    color: "text-amber-600 dark:text-amber-400",
                  },
                  {
                    label: t("analytics.accuracy"),
                    value: feedback.accuracy,
                    color: "text-violet-600 dark:text-violet-400",
                  },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="rounded-xl border bg-surface-50/50 p-4 text-center dark:bg-surface-800/50"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-400">
                      {m.label}
                    </p>
                    <p className={cn("mt-1 font-mono text-2xl font-bold", m.color)}>
                      {formatPercent(m.value)}
                    </p>
                    {/* Mini progress bar */}
                    <div className="mx-auto mt-2 h-1 w-16 overflow-hidden rounded-full bg-surface-200 dark:bg-surface-700">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          m.color.replace("text-", "bg-"),
                        )}
                        style={{ width: `${m.value * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Confusion Matrix */}
            <div className="card p-5">
              <h3 className="section-title mb-4">{t("analytics.confusionMatrix")}</h3>
              <div className="mx-auto max-w-xs">
                <div className="mb-2 flex justify-end gap-1 pr-1">
                  <span className="w-[calc(50%-4px)] text-center text-[10px] font-semibold uppercase tracking-wider text-surface-400">
                    {t("analytics.predictedFraud")}
                  </span>
                  <span className="w-[calc(50%-4px)] text-center text-[10px] font-semibold uppercase tracking-wider text-surface-400">
                    {t("analytics.predictedLegit")}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-emerald-50 p-4 text-center dark:bg-emerald-950/30">
                    <p className="text-[10px] font-semibold uppercase text-emerald-600 dark:text-emerald-400">
                      {t("analytics.truePositive")}
                    </p>
                    <p className="font-mono text-xl font-bold text-emerald-700 dark:text-emerald-300">
                      {feedback.true_positives}
                    </p>
                  </div>
                  <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-950/30">
                    <p className="text-[10px] font-semibold uppercase text-red-600 dark:text-red-400">
                      {t("analytics.falseNegative")}
                    </p>
                    <p className="font-mono text-xl font-bold text-red-700 dark:text-red-300">
                      {feedback.false_negatives}
                    </p>
                  </div>
                  <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-950/30">
                    <p className="text-[10px] font-semibold uppercase text-red-600 dark:text-red-400">
                      {t("analytics.falsePositive")}
                    </p>
                    <p className="font-mono text-xl font-bold text-red-700 dark:text-red-300">
                      {feedback.false_positives}
                    </p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-4 text-center dark:bg-emerald-950/30">
                    <p className="text-[10px] font-semibold uppercase text-emerald-600 dark:text-emerald-400">
                      {t("analytics.trueNegative")}
                    </p>
                    <p className="font-mono text-xl font-bold text-emerald-700 dark:text-emerald-300">
                      {feedback.true_negatives}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex gap-1 pl-1">
                  <span className="w-[calc(50%-4px)] text-center text-[10px] font-semibold uppercase tracking-wider text-surface-400">
                    {t("analytics.actualFraud")}
                  </span>
                  <span className="w-[calc(50%-4px)] text-center text-[10px] font-semibold uppercase tracking-wider text-surface-400">
                    {t("analytics.actualLegit")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
