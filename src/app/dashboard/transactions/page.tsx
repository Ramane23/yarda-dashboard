"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Filter } from "lucide-react";
import { Header } from "@/components/layout/header";
import { DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { ScoreBadge, DecisionBadge } from "@/components/ui/score-badge";
import { getTransactions } from "@/lib/api";
import { formatMs, cn, phaseLabel } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/useT";
import type { TransactionItem, Decision, SortOrder } from "@/types/api";

export default function TransactionsPage() {
  const period = useAppStore((s) => s.period);
  const locale = useAppStore((s) => s.locale);
  const viewAsClient = useAppStore((s) => s.viewAsClient);
  const t = useT();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortOrder>("newest");
  const [decision, setDecision] = useState<Decision | "">("");
  const [labeled, setLabeled] = useState<"" | "true" | "false">("");

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", period, page, sort, decision, labeled, viewAsClient],
    queryFn: () =>
      getTransactions({
        period,
        page,
        page_size: 50,
        sort,
        decision: decision || undefined,
        labeled: labeled === "" ? undefined : labeled === "true",
      }),
  });

  const selectClasses =
    "rounded-lg border bg-white px-3 py-2 text-xs font-medium text-surface-700 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:bg-surface-800 dark:text-surface-300 dark:border-surface-700";

  const columns = [
    {
      key: "id",
      header: t("transactions.transaction"),
      render: (item: TransactionItem) => (
        <span className="font-mono text-xs text-surface-600 dark:text-surface-400">
          {item.transaction_id || item.request_id.slice(0, 12)}
        </span>
      ),
    },
    {
      key: "decision",
      header: t("transactions.decision"),
      render: (item: TransactionItem) => <DecisionBadge decision={item.decision} />,
    },
    {
      key: "score",
      header: t("transactions.score"),
      render: (item: TransactionItem) => <ScoreBadge score={item.score} />,
    },
    {
      key: "anomaly",
      header: t("transactions.anomaly"),
      render: (item: TransactionItem) => (
        <span className="font-mono text-xs text-surface-500 dark:text-surface-400">
          {item.anomaly_score.toFixed(3)}
        </span>
      ),
    },
    {
      key: "ml",
      header: t("transactions.mlScore"),
      render: (item: TransactionItem) => (
        <span className="font-mono text-xs text-surface-500 dark:text-surface-400">
          {item.ml_score.toFixed(3)}
        </span>
      ),
    },
    {
      key: "latency",
      header: t("transactions.latency"),
      render: (item: TransactionItem) => (
        <span className="font-mono text-xs text-surface-500 dark:text-surface-400">
          {formatMs(item.inference_time_ms)}
        </span>
      ),
    },
    {
      key: "phase",
      header: t("transactions.phase"),
      render: (item: TransactionItem) => {
        if (!item.phase) return <span className="text-xs text-surface-400">--</span>;
        const p = phaseLabel(item.phase, locale);
        return <span className={cn("badge text-[10px]", p.color)}>{p.label}</span>;
      },
    },
    {
      key: "labeled",
      header: t("transactions.label"),
      render: (item: TransactionItem) =>
        item.ground_truth ? (
          <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400">
            {t("transactions.labeled")}
          </span>
        ) : (
          <span className="text-xs text-surface-400">--</span>
        ),
    },
    {
      key: "time",
      header: t("transactions.time"),
      render: (item: TransactionItem) => (
        <span className="text-xs text-surface-500 dark:text-surface-400">
          {item.timestamp ? format(new Date(item.timestamp), "MMM d, HH:mm:ss") : "--"}
        </span>
      ),
    },
  ];

  return (
    <>
      <Header title={t("transactions.title")} />
      <div className="flex-1 space-y-4 overflow-auto p-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-surface-400">
            <Filter size={14} />
            <span className="text-xs font-semibold uppercase tracking-wider">
              {t("transactions.filters")}
            </span>
          </div>
          <select
            value={decision}
            onChange={(e) => {
              setDecision(e.target.value as Decision | "");
              setPage(1);
            }}
            className={selectClasses}
          >
            <option value="">{t("decision.allDecisions")}</option>
            <option value="allow">{t("decision.allow")}</option>
            <option value="review">{t("decision.review")}</option>
            <option value="alert">{t("decision.alert")}</option>
            <option value="block">{t("decision.block")}</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOrder)}
            className={selectClasses}
          >
            <option value="newest">{t("sort.newest")}</option>
            <option value="oldest">{t("sort.oldest")}</option>
            <option value="score_desc">{t("sort.scoreDesc")}</option>
            <option value="score_asc">{t("sort.scoreAsc")}</option>
          </select>

          <select
            value={labeled}
            onChange={(e) => {
              setLabeled(e.target.value as "" | "true" | "false");
              setPage(1);
            }}
            className={selectClasses}
          >
            <option value="">{t("filter.allLabels")}</option>
            <option value="true">{t("filter.labeled")}</option>
            <option value="false">{t("filter.unlabeled")}</option>
          </select>

          {isLoading && (
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              <span className="text-xs text-surface-400">{t("transactions.loading")}</span>
            </div>
          )}
        </div>

        <DataTable
          columns={columns}
          data={data?.items ?? []}
          keyFn={(item) => item.request_id}
          emptyMessage={t("transactions.noData")}
        />

        {data && data.pages > 0 && (
          <Pagination
            page={data.page}
            pages={data.pages}
            total={data.total}
            onPageChange={setPage}
          />
        )}
      </div>
    </>
  );
}
