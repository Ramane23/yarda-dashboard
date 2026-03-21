"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Header } from "@/components/layout/header";
import { DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { ScoreBadge, DecisionBadge } from "@/components/ui/score-badge";
import { getReviewQueue } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import type { ReviewItem } from "@/types/api";

export default function ReviewQueuePage() {
  const period = useAppStore((s) => s.period);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["review-queue", period, page],
    queryFn: () => getReviewQueue({ period, page, page_size: 50 }),
  });

  const columns = [
    {
      key: "id",
      header: "Transaction ID",
      render: (item: ReviewItem) => (
        <span className="font-mono text-xs text-slate-600">
          {item.transaction_id || item.request_id.slice(0, 12)}
        </span>
      ),
    },
    {
      key: "decision",
      header: "Decision",
      render: (item: ReviewItem) => <DecisionBadge decision={item.decision} />,
    },
    {
      key: "score",
      header: "Score",
      render: (item: ReviewItem) => <ScoreBadge score={item.score} />,
    },
    {
      key: "features",
      header: "Top Features",
      render: (item: ReviewItem) => (
        <div className="flex flex-wrap gap-1">
          {item.top_features.map((f) => (
            <span
              key={f}
              className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600"
            >
              {f}
            </span>
          ))}
          {item.top_features.length === 0 && (
            <span className="text-xs text-slate-400">--</span>
          )}
        </div>
      ),
    },
    {
      key: "phase",
      header: "Phase",
      render: (item: ReviewItem) => (
        <span className="text-xs text-slate-500">{item.phase || "--"}</span>
      ),
    },
    {
      key: "time",
      header: "Time",
      render: (item: ReviewItem) => (
        <span className="text-xs text-slate-500">
          {item.timestamp ? format(new Date(item.timestamp), "MMM d, HH:mm") : "--"}
        </span>
      ),
    },
  ];

  return (
    <>
      <Header title="Review Queue" />
      <div className="flex-1 space-y-4 overflow-auto p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            {isLoading
              ? "Loading..."
              : `${data?.total ?? 0} transactions pending review`}
          </div>
        </div>

        <DataTable
          columns={columns}
          data={data?.items ?? []}
          keyFn={(item) => item.request_id}
          emptyMessage="No pending reviews — all caught up!"
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
