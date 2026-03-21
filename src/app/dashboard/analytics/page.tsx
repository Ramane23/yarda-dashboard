"use client";

import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { VolumeChart } from "@/components/charts/volume-chart";
import { DecisionDonut } from "@/components/charts/decision-donut";
import { ScoreHistogram } from "@/components/charts/score-histogram";
import { getAnalytics, getFeedbackSummary } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { formatPercent } from "@/lib/utils";

export default function AnalyticsPage() {
  const period = useAppStore((s) => s.period);

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
      <Header title="Analytics" />
      <div className="flex-1 space-y-6 overflow-auto p-6">
        {/* Charts */}
        {analytics && (
          <>
            <VolumeChart data={analytics.time_series} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <DecisionDonut data={analytics.decision_breakdown} />
              <ScoreHistogram data={analytics.score_distribution} />
            </div>

            {/* Peak hours */}
            {analytics.top_hours.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-4 text-sm font-semibold text-slate-700">
                  Peak Activity Hours (UTC)
                </h3>
                <div className="flex gap-3">
                  {analytics.top_hours.map((h) => (
                    <div
                      key={h.hour}
                      className="flex flex-col items-center rounded-lg bg-brand-50 px-4 py-3"
                    >
                      <span className="text-lg font-bold text-brand-700">
                        {String(h.hour).padStart(2, "0")}:00
                      </span>
                      <span className="text-xs text-brand-600">
                        {h.count.toLocaleString()} txn
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Model Performance */}
        {feedback && feedback.total_labeled > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-700">
              Model Performance (from labeled data)
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Precision", value: feedback.precision },
                { label: "Recall", value: feedback.recall },
                { label: "F1 Score", value: feedback.f1_score },
                { label: "Accuracy", value: feedback.accuracy },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-center"
                >
                  <p className="text-xs font-medium text-slate-400">
                    {m.label}
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {formatPercent(m.value)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="text-center text-xs">
                <span className="font-medium text-emerald-600">TP:</span>{" "}
                {feedback.true_positives}
              </div>
              <div className="text-center text-xs">
                <span className="font-medium text-red-600">FP:</span>{" "}
                {feedback.false_positives}
              </div>
              <div className="text-center text-xs">
                <span className="font-medium text-emerald-600">TN:</span>{" "}
                {feedback.true_negatives}
              </div>
              <div className="text-center text-xs">
                <span className="font-medium text-red-600">FN:</span>{" "}
                {feedback.false_negatives}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
