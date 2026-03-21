"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyFn: (item: T) => string;
  emptyMessage?: string;
  renderExpandedRow?: (item: T) => React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  keyFn,
  emptyMessage = "No data",
  renderExpandedRow,
}: DataTableProps<T>) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-surface-50/80 dark:bg-surface-800/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500",
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-16 text-center text-sm text-surface-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, i) => (
                <React.Fragment key={keyFn(item)}>
                  <tr
                    className={cn(
                      "transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/50",
                      i % 2 === 1 && "bg-surface-50/40 dark:bg-surface-800/20",
                    )}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={cn("px-4 py-3", col.className)}>
                        {col.render(item)}
                      </td>
                    ))}
                  </tr>
                  {renderExpandedRow?.(item)}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
