"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Database, User, Bot, CircleDot, Tag, CheckCircle2, XCircle } from "lucide-react";
import { Header } from "@/components/layout/header";
import { KpiCard } from "@/components/ui/kpi-card";
import { DataTable } from "@/components/ui/data-table";
import { DecisionBadge } from "@/components/ui/score-badge";
import { getTrainingData } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/useT";
import { cn } from "@/lib/utils";
import type { LabeledSample } from "@/types/api";

export default function TrainingDataPage() {
  const t = useT();
  const viewAsClient = useAppStore((s) => s.viewAsClient);

  const { data } = useQuery({
    queryKey: ["training-data", viewAsClient],
    queryFn: () => getTrainingData(1, 100),
    refetchInterval: 30_000,
  });

  const columns = [
    {
      key: "transaction",
      header: t("transactions.transaction"),
      render: (item: LabeledSample) => (
        <span className="font-mono text-xs text-surface-600 dark:text-surface-300">
          {item.transaction_id || item.request_id.slice(0, 16)}
        </span>
      ),
    },
    {
      key: "label",
      header: t("training.label"),
      render: (item: LabeledSample) => {
        const isLegit = item.label === "legitimate";
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold",
              isLegit
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
            )}
          >
            {isLegit ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
            {item.label}
          </span>
        );
      },
    },
    {
      key: "source",
      header: t("training.source"),
      render: (item: LabeledSample) => (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase",
            item.source === "human"
              ? "bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-400"
              : "bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400",
          )}
        >
          {item.source === "human" ? <User size={10} /> : <Bot size={10} />}
          {item.source === "human" ? t("training.human") : t("training.auto")}
        </span>
      ),
    },
    {
      key: "score",
      header: t("training.originalScore"),
      render: (item: LabeledSample) => (
        <span className="font-mono text-xs text-surface-500 dark:text-surface-400">
          {Math.round(item.original_score * 100)}%
        </span>
      ),
    },
    {
      key: "decision",
      header: t("training.originalDecision"),
      render: (item: LabeledSample) =>
        item.original_decision ? (
          <DecisionBadge decision={item.original_decision} />
        ) : (
          <span className="text-xs text-surface-400">--</span>
        ),
    },
    {
      key: "time",
      header: t("training.labeledAt"),
      render: (item: LabeledSample) =>
        item.labeled_at ? (
          <span className="text-xs text-surface-500 dark:text-surface-400">
            {format(new Date(item.labeled_at), "MMM d, HH:mm")}
          </span>
        ) : (
          <span className="text-xs text-surface-400">--</span>
        ),
    },
  ];

  // Max bar width for class distribution
  const maxCount = data?.class_distribution?.[0]?.count || 1;

  return (
    <>
      <Header title={t("training.title")} />
      <div className="space-y-6 p-6">
        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <KpiCard
            title={t("training.totalLabeled")}
            value={data?.total_labeled?.toLocaleString() ?? "--"}
            icon={Database}
            accent="bg-brand-500"
          />
          <KpiCard
            title={t("training.humanLabeled")}
            value={data?.human_labeled?.toLocaleString() ?? "--"}
            icon={User}
            accent="bg-violet-500"
          />
          <KpiCard
            title={t("training.autoLabeled")}
            value={data?.auto_labeled?.toLocaleString() ?? "--"}
            icon={Bot}
            accent="bg-surface-400"
          />
          <KpiCard
            title={t("training.unlabeled")}
            value={data?.unlabeled?.toLocaleString() ?? "--"}
            icon={CircleDot}
            accent="bg-amber-500"
          />
          <KpiCard
            title={t("training.classesObserved")}
            value={data?.classes_observed?.toString() ?? "--"}
            icon={Tag}
            accent="bg-emerald-500"
          />
        </div>

        {/* Two columns: class distribution + label velocity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Class distribution */}
          <div className="rounded-xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
            <h3 className="mb-4 text-sm font-semibold text-surface-700 dark:text-surface-200">
              {t("training.classDistribution")}
            </h3>
            {data?.class_distribution && data.class_distribution.length > 0 ? (
              <div className="space-y-2.5">
                {data.class_distribution.map((cls) => {
                  const isLegit = cls.label === "legitimate";
                  const barColor = isLegit
                    ? "bg-emerald-400 dark:bg-emerald-500"
                    : "bg-red-400 dark:bg-red-500";
                  return (
                    <div key={cls.label} className="flex items-center gap-3">
                      <span className="w-36 truncate text-xs font-medium text-surface-600 dark:text-surface-300">
                        {cls.label}
                      </span>
                      <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
                        <div
                          className={cn("h-full rounded-full transition-all", barColor)}
                          style={{ width: `${(cls.count / maxCount) * 100}%` }}
                        />
                      </div>
                      <span className="w-16 text-right font-mono text-xs font-semibold text-surface-600 dark:text-surface-300">
                        {cls.count}
                      </span>
                      <span className="w-12 text-right font-mono text-[10px] text-surface-400">
                        {cls.percent}%
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs italic text-surface-400">{t("training.noData")}</p>
            )}
          </div>

          {/* Label velocity (last 7 days) */}
          <div className="rounded-xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900">
            <h3 className="mb-4 text-sm font-semibold text-surface-700 dark:text-surface-200">
              {t("training.labelVelocity")}
            </h3>
            {data?.daily_labels && data.daily_labels.length > 0 ? (
              <div className="flex h-40 items-end gap-2">
                {(() => {
                  const maxDay = Math.max(...data.daily_labels.map((d) => d.count), 1);
                  return data.daily_labels.map((day) => (
                    <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                      <span className="font-mono text-[10px] font-semibold text-surface-600 dark:text-surface-300">
                        {day.count || ""}
                      </span>
                      <div
                        className="w-full rounded-t bg-brand-400 dark:bg-brand-500"
                        style={{
                          height: `${Math.max((day.count / maxDay) * 100, day.count > 0 ? 4 : 0)}%`,
                          minHeight: day.count > 0 ? 4 : 0,
                        }}
                      />
                      <span className="text-[9px] text-surface-400">
                        {format(new Date(day.date), "EEE")}
                      </span>
                    </div>
                  ));
                })()}
              </div>
            ) : (
              <p className="text-xs italic text-surface-400">{t("training.noData")}</p>
            )}
          </div>
        </div>

        {/* Recent labels table */}
        <div className="rounded-xl border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900">
          <div className="border-b border-surface-100 px-5 py-4 dark:border-surface-800">
            <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-200">
              {t("training.recentLabels")}
            </h3>
          </div>
          <DataTable
            columns={columns}
            data={data?.recent_labels ?? []}
            keyFn={(item) => item.request_id}
            emptyMessage={t("training.noData")}
          />
        </div>
      </div>
    </>
  );
}
