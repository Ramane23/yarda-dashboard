"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Database,
  User,
  Bot,
  CircleDot,
  Tag,
  CheckCircle2,
  XCircle,
  Play,
  Loader2,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { KpiCard } from "@/components/ui/kpi-card";
import { DataTable } from "@/components/ui/data-table";
import { DecisionBadge } from "@/components/ui/score-badge";
import { Pagination } from "@/components/ui/pagination";
import { getTrainingData } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/useT";
import { cn } from "@/lib/utils";
import type { LabeledSample } from "@/types/api";

// --- API helpers (inline to avoid circular imports) ---
const BASE = "/api/v1/dashboard";

async function fetchTrainingTable(page: number, pageSize: number) {
  const url = new URL(`${BASE}/training-data/table`, window.location.origin);
  url.searchParams.set("page", String(page));
  url.searchParams.set("page_size", String(pageSize));
  const headers: Record<string, string> = {};
  const viewAs = typeof window !== "undefined" ? localStorage.getItem("view_as_client") : null;
  const clientId =
    viewAs || (typeof window !== "undefined" ? localStorage.getItem("client_id") : null);
  if (clientId) headers["X-Client-ID"] = clientId;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url.toString(), { headers });
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  return res.json() as Promise<{
    client_id: string;
    total: number;
    page: number;
    page_size: number;
    pages: number;
    feature_columns: string[];
    rows: Record<string, unknown>[];
  }>;
}

async function triggerTraining() {
  const url = new URL(`${BASE}/trigger-training`, window.location.origin);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const viewAs = typeof window !== "undefined" ? localStorage.getItem("view_as_client") : null;
  const clientId =
    viewAs || (typeof window !== "undefined" ? localStorage.getItem("client_id") : null);
  if (clientId) headers["X-Client-ID"] = clientId;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url.toString(), { method: "POST", headers });
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  return res.json();
}

// --- Tab type ---
type Tab = "overview" | "table";

export default function TrainingDataPage() {
  const t = useT();
  const viewAsClient = useAppStore((s) => s.viewAsClient);
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("overview");
  const [tablePage, setTablePage] = useState(1);

  const { data } = useQuery({
    queryKey: ["training-data", viewAsClient],
    queryFn: () => getTrainingData(1, 100),
    refetchInterval: 30_000,
  });

  const { data: tableData, isLoading: tableLoading } = useQuery({
    queryKey: ["training-table", viewAsClient, tablePage],
    queryFn: () => fetchTrainingTable(tablePage, 50),
    enabled: tab === "table",
  });

  const trainMutation = useMutation({
    mutationFn: triggerTraining,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-data"] });
    },
  });

  const recentColumns = [
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

  const maxCount = data?.class_distribution?.[0]?.count || 1;

  return (
    <>
      <Header title={t("training.title")} />
      <div className="flex-1 space-y-6 overflow-auto p-6">
        {/* KPI cards + Trigger training button */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
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
          <button
            onClick={() => trainMutation.mutate()}
            disabled={trainMutation.isPending || !data?.total_labeled}
            className="btn-primary flex shrink-0 items-center gap-2 self-start px-5 py-2.5 text-sm font-semibold disabled:opacity-40"
          >
            {trainMutation.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Play size={14} />
            )}
            {trainMutation.isPending
              ? t("training.trainingStarted")
              : t("training.triggerTraining")}
          </button>
        </div>

        {/* Training status message */}
        {trainMutation.isSuccess && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400">
            {(trainMutation.data as { message?: string })?.message || "Training started"}
          </div>
        )}
        {trainMutation.isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
            {(trainMutation.error as Error).message}
          </div>
        )}

        {/* Two columns: class distribution + label velocity */}
        <div className="grid gap-6 lg:grid-cols-2">
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

        {/* Tab switcher: Recent Labels vs Feature Matrix */}
        <div className="flex items-center gap-1 rounded-lg border border-surface-200 bg-surface-50 p-1 dark:border-surface-800 dark:bg-surface-900">
          <button
            onClick={() => setTab("overview")}
            className={cn(
              "rounded-md px-4 py-1.5 text-xs font-semibold transition-all",
              tab === "overview"
                ? "bg-white text-surface-900 shadow-sm dark:bg-surface-800 dark:text-white"
                : "text-surface-500 hover:text-surface-700 dark:text-surface-400",
            )}
          >
            {t("training.recentLabels")}
          </button>
          <button
            onClick={() => setTab("table")}
            className={cn(
              "rounded-md px-4 py-1.5 text-xs font-semibold transition-all",
              tab === "table"
                ? "bg-white text-surface-900 shadow-sm dark:bg-surface-800 dark:text-white"
                : "text-surface-500 hover:text-surface-700 dark:text-surface-400",
            )}
          >
            {t("training.featureMatrix")}
            {tableData && (
              <span className="ml-1.5 font-mono text-[10px] text-surface-400">
                {tableData.total} x {tableData.feature_columns.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab content — only one rendered at a time */}
        {tab === "overview" ? (
          <DataTable
            columns={recentColumns}
            data={data?.recent_labels ?? []}
            keyFn={(item) => item.request_id}
            emptyMessage={t("training.noData")}
          />
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-max text-left">
                <thead className="bg-surface-50 dark:bg-surface-800">
                  <tr>
                    {/* Meta columns */}
                    <th className="sticky left-0 z-10 bg-surface-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-surface-500 dark:bg-surface-800">
                      {t("training.label")}
                    </th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-surface-500">
                      {t("training.source")}
                    </th>
                    <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-surface-500">
                      {t("training.originalScore")}
                    </th>
                    {/* Feature columns */}
                    {tableData?.feature_columns.map((col) => (
                      <th
                        key={col}
                        className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-surface-400"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                  {tableLoading && !tableData && (
                    <tr>
                      <td colSpan={99} className="px-3 py-8 text-center text-xs text-surface-400">
                        <Loader2 size={16} className="mx-auto animate-spin" />
                      </td>
                    </tr>
                  )}
                  {tableData?.rows.map((row) => {
                    const label = String(row._label ?? "");
                    const isLegit = label === "legitimate";
                    return (
                      <tr
                        key={String(row._request_id)}
                        className="hover:bg-surface-50/50 dark:hover:bg-surface-800/30"
                      >
                        <td className="sticky left-0 z-10 bg-white px-3 py-1.5 dark:bg-surface-900">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold",
                              isLegit
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
                            )}
                          >
                            {isLegit ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                            {label}
                          </span>
                        </td>
                        <td className="px-3 py-1.5">
                          <span
                            className={cn(
                              "text-[10px] font-semibold uppercase",
                              row._source === "human"
                                ? "text-brand-600 dark:text-brand-400"
                                : "text-surface-400",
                            )}
                          >
                            {row._source === "human" ? "HUM" : "AUTO"}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 font-mono text-[10px] text-surface-500">
                          {Math.round(Number(row._score ?? 0) * 100)}%
                        </td>
                        {tableData?.feature_columns.map((col) => (
                          <td
                            key={col}
                            className="px-3 py-1.5 font-mono text-[10px] tabular-nums text-surface-500 dark:text-surface-400"
                          >
                            {row[col] != null ? String(row[col]) : ""}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                  {!tableLoading && tableData && tableData.rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={tableData.feature_columns.length + 3}
                        className="px-3 py-8 text-center text-xs italic text-surface-400"
                      >
                        {t("training.noData")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {tableData && tableData.pages > 1 && (
              <div className="border-t border-surface-100 px-4 py-3 dark:border-surface-800">
                <Pagination
                  page={tablePage}
                  pages={tableData.pages}
                  total={tableData.total}
                  onPageChange={setTablePage}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
