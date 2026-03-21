"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Header } from "@/components/layout/header";
import { DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { ScoreBadge, DecisionBadge } from "@/components/ui/score-badge";
import { getTransactions } from "@/lib/api";
import { formatMs } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import type { TransactionItem, Decision, SortOrder } from "@/types/api";

export default function TransactionsPage() {
  const period = useAppStore((s) => s.period);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortOrder>("newest");
  const [decision, setDecision] = useState<Decision | "">("");

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", period, page, sort, decision],
    queryFn: () =>
      getTransactions({
        period,
        page,
        page_size: 50,
        sort,
        decision: decision || undefined,
      }),
  });

  const columns = [
    {
      key: "id",
      header: "Transaction ID",
      render: (item: TransactionItem) => (
        <span className="font-mono text-xs text-slate-600">
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
        <span className="font-mono text-xs">{item.anomaly_score.toFixed(3)}</span>
      ),
    },
    {
      key: "ml",
      header: "ML Score",
      render: (item: TransactionItem) => (
        <span className="font-mono text-xs">{item.ml_score.toFixed(3)}</span>
      ),
    },
    {
      key: "latency",
      header: "Latency",
      render: (item: TransactionItem) => (
        <span className="text-xs text-slate-500">{formatMs(item.inference_time_ms)}</span>
      ),
    },
    {
      key: "labeled",
      header: "Label",
      render: (item: TransactionItem) => (
        <span className="text-xs">
          {item.ground_truth ? (
            <span className="text-brand-600 font-medium">Labeled</span>
          ) : (
            <span className="text-slate-400">--</span>
          )}
        </span>
      ),
    },
    {
      key: "time",
      header: "Time",
      render: (item: TransactionItem) => (
        <span className="text-xs text-slate-500">
          {item.timestamp ? format(new Date(item.timestamp), "MMM d, HH:mm") : "--"}
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
          <select
            value={decision}
            onChange={(e) => { setDecision(e.target.value as Decision | ""); setPage(1); }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
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
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="score_desc">Highest score</option>
            <option value="score_asc">Lowest score</option>
          </select>

          {isLoading && (
            <span className="text-xs text-slate-400">Loading...</span>
          )}
        </div>

        <DataTable
          columns={columns}
          data={data?.items ?? []}
          keyFn={(item) => item.request_id}
          emptyMessage="No transactions found for this period"
        />

        {data && (
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
