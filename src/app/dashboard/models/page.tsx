"use client";

import { useQuery } from "@tanstack/react-query";
import { Box, Cpu, Calendar } from "lucide-react";
import { Header } from "@/components/layout/header";
import { getModels } from "@/lib/api";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function ModelsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["models"],
    queryFn: getModels,
  });

  const stageStyles: Record<string, string> = {
    production: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    staging: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    development: "bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400",
    archived: "bg-surface-100 text-surface-400 dark:bg-surface-800 dark:text-surface-500",
  };

  return (
    <>
      <Header title="Models" />
      <div className="flex-1 space-y-6 overflow-auto p-6">
        <div className="space-y-3">
          {data?.models.map((m) => (
            <div key={m.id} className="card-hover p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-brand-50 p-2.5 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
                    <Box size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-surface-900 dark:text-white">{m.model_name}</h4>
                      <span className="font-mono text-xs text-surface-400">v{m.version}</span>
                      {m.is_client_specific && (
                        <span className="badge bg-brand-100 text-brand-700 text-[10px] dark:bg-brand-950/40 dark:text-brand-400">
                          Client-specific
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-surface-500 dark:text-surface-400">
                      {m.framework && (
                        <span className="flex items-center gap-1">
                          <Cpu size={12} />
                          {m.framework}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {format(new Date(m.created_at), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>

                {m.stage && (
                  <span className={cn("badge", stageStyles[m.stage] || stageStyles.development)}>
                    {m.stage}
                  </span>
                )}
              </div>

              {/* Validation Metrics */}
              {m.validation_metrics && Object.keys(m.validation_metrics).length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {Object.entries(m.validation_metrics).map(([key, val]) => (
                    <div key={key} className="rounded-lg border bg-surface-50/50 p-3 dark:bg-surface-800/50">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-400">{key}</p>
                      <p className="mt-0.5 font-mono text-sm font-bold text-surface-900 dark:text-white">
                        {typeof val === "number" ? val.toFixed(4) : val}
                      </p>
                      {typeof val === "number" && val <= 1 && (
                        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-surface-200 dark:bg-surface-700">
                          <div
                            className="h-full rounded-full bg-brand-500 transition-all"
                            style={{ width: `${val * 100}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {(!data || data.models.length === 0) && !isLoading && (
            <div className="card flex flex-col items-center py-16">
              <Box size={40} className="text-surface-300 dark:text-surface-600" />
              <p className="mt-3 text-sm font-medium text-surface-400">No model versions found</p>
              <p className="text-xs text-surface-400">Models will appear here after training</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
