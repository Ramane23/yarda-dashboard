"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useT } from "@/lib/useT";

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pages, total, onPageChange }: PaginationProps) {
  const t = useT();

  return (
    <div className="flex items-center justify-between py-3">
      <p className="text-xs text-surface-500 dark:text-surface-400">
        <span className="font-semibold text-surface-700 dark:text-surface-300">
          {total.toLocaleString()}
        </span>{" "}
        {total !== 1 ? t("pagination.results") : t("pagination.result")}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700 disabled:opacity-30 dark:hover:bg-surface-800 dark:hover:text-surface-200"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="min-w-[60px] text-center text-xs font-semibold text-surface-600 dark:text-surface-400">
          {page} / {pages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700 disabled:opacity-30 dark:hover:bg-surface-800 dark:hover:text-surface-200"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
