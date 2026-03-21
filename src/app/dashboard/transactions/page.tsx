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
import type { TransactionItem, Decision, SortOrder } from "@/types/api";

export default function TransactionsPage() {
  const period = useAppStore((s) => s.period);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortOrder>("newest");
  const [decision, setDecision] = useState<Decision | "">("");
  const [labeled, setLabeled] = useState<"" | "true" | "false">("");

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", period, page, sort, decision, labeled],
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

  const selectClasses = "rounded-lg border bg-white px-3 py-2 text-xs font-medium text-surface-700 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:bg-surface-800 dark:text-surface-300 dark:border-surface-700";

  const columns = [
    {
      key: "id",
      header: "Transaction",
      render: (item: TransactionItem) => (
        <span className="font-mono text-xs text-surface-600 dark:text-surface-400">
          {item.transaction_id || item.request_id.slice(0, 12)}
        </span>
      ),
    },
    {
      key: "decision",
      header: "Decision",
      render: (item: TransactionItem) => <DecisionBadge decision={item.decision} />,
    },
    {
      key: "score",
      header: "Score",
      render: (item: TransactionItem) => <ScoreBadge score={item.score} />,
    },
    {
      key: "anomaly",
      header: "Anomaly",
      render: (item: TransactionItem) => (
        <span className="font-mono text-xs text-surface-500 dark:text-surface-400">{item.anomaly_score.toFixed(3)}</span>
      ),
    },
    {
      key: "ml",
      header: "ML Score",
      render: (item: TransactionItem) => (
        <span className="font-mono text-xs text-surface-500 dark:text-surface-400">{item.ml_score.toFixed(3)}</span>
      ),
    },
    {
      key: "latency",
      header: "Latency",
      render: (item: TransactionItem) => (
        <span className="font-mono text-xs text-surface-500 dark:text-surface-400">{formatMs(item.inference_time_ms)}</span>
      ),
    },
    {
      key: "phase",
      header: "Phase",
      render: (item: TransactionItem) => {
        if (!item.phase) return <span className="text-xs text-surface-400">--</span>;
        const p = phaseLabel(item.phase);
        return <span className={cn("badge text-[10px]", p.color)}>{p.label}</span>;
      },
    },
    {
      key: "labeled",
      header: "Label",
      render: (item: TransactionItem) => (
        item.ground_truth ? (
          <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400">Labeled</span>
        ) : (
          <span className="text-xs text-surface-400">--</span>
        )
      ),
    },
    {
      key: "time",
      header: "Time",
      render: (item: TransactionItem) => (
        <span className="text-xs text-surface-500 dark:text-surface-400">
          {item.timestamp ? format(new Date(item.timestamp), "MMM d, HH:mm:ss") : "--"}
        </span>
      ),
    },
  ];

  return (
    <>
      <Header title="Transactions" />
      <div className="flex-1 space-y-4 overflow-auto p-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-surface-400">
            <Filter size={14} />
            <span className="text-xs font-semibold uppercase tracking-wider">Filters</span>
          </div>
          <select
            value={decision}
            onChange={(e) => { setDecision(e.target.value as Decision | ""); setPage(1); }}
            className={selectClasses}
          >
            <option value="">All decisions</option>
            <option value="allow">Allow</option>
            <option value="review">Review</option>
            <option value="alert">Alert</option>
            <option value="block">Block</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOrder)}
            className={selectClasses}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="score_desc">Highest score</option>
            <option value="score_asc">Lowest score</option>
          </select>

          <select
            value={labeled}
            onChange={(e) => { setLabeled(e.target.value as "" | "true" | "false"); setPage(1); }}
            className={selectClasses}
          >
            <option value="">All labels</option>
            <option value="true">Labeled</option>
            <option value="false">Unlabeled</option>
          </select>

          {isLoading && (
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              <span className="text-xs text-surface-400">Loading...</span>
            </div>
          )}
        </div>

        <DataTable
          columns={columns}
          data={data?.items ?? []}
          keyFn={(item) => item.request_id}
          emptyMessage="No transactions found for this period"
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
