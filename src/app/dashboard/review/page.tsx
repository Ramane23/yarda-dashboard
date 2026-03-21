"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ShieldAlert } from "lucide-react";
import { Header } from "@/components/layout/header";
import { DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { ScoreBadge, DecisionBadge } from "@/components/ui/score-badge";
import { getReviewQueue } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { cn, phaseLabel } from "@/lib/utils";
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
      header: "Transaction",
      render: (item: ReviewItem) => (
        <span className="font-mono text-xs text-surface-600 dark:text-surface-400">
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
      header: "Risk Score",
      render: (item: ReviewItem) => <ScoreBadge score={item.score} />,
    },
    {
      key: "features",
      header: "Top Risk Factors",
      render: (item: ReviewItem) => (
        <div className="flex flex-wrap gap-1">
          {item.top_features.length > 0 ? (
            item.top_features.map((f) => (
              <span
                key={f}
                className="rounded-md bg-surface-100 px-1.5 py-0.5 font-mono text-[10px] text-surface-600 dark:bg-surface-800 dark:text-surface-400"
              >
                {f}
              </span>
            ))
          ) : (
            <span className="text-xs text-surface-400">--</span>
          )}
        </div>
      ),
    },
    {
      key: "phase",
      header: "Phase",
      render: (item: ReviewItem) => {
        if (!item.phase) return <span className="text-xs text-surface-400">--</span>;
        const p = phaseLabel(item.phase);
        return <span className={cn("badge text-[10px]", p.color)}>{p.label}</span>;
      },
    },
    {
      key: "time",
      header: "Time",
      render: (item: ReviewItem) => (
        <span className="text-xs text-surface-500 dark:text-surface-400">
          {item.timestamp ? format(new Date(item.timestamp), "MMM d, HH:mm") : "--"}
        </span>
      ),
    },
  ];

  return (
    <>
      <Header title="Review Queue" />
      <div className="flex-1 space-y-4 overflow-auto p-6">
        {/* Status bar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950/30">
            <ShieldAlert size={14} className="text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              {isLoading ? "Loading..." : `${data?.total ?? 0} transactions pending review`}
            </span>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={data?.items ?? []}
          keyFn={(item) => item.request_id}
          emptyMessage="No pending reviews \u2014 all caught up!"
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
