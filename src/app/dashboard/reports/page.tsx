"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText, Download } from "lucide-react";
import { Header } from "@/components/layout/header";
import { getModels } from "@/lib/api";
import { format } from "date-fns";

export default function ReportsPage() {
  const { data } = useQuery({
    queryKey: ["models"],
    queryFn: getModels,
  });

  return (
    <>
      <Header title="Reports" />
      <div className="flex-1 space-y-6 overflow-auto p-6">
        {/* Model versions */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">
            Model Versions
          </h3>
          <div className="space-y-3">
            {data?.models.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3 hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {m.model_name}{" "}
                      <span className="font-mono text-xs text-slate-500">
                        v{m.version}
                      </span>
                    </p>
                    <p className="text-xs text-slate-400">
                      {m.framework} &middot;{" "}
                      {format(new Date(m.created_at), "MMM d, yyyy")}
                      {m.is_client_specific && (
                        <span className="ml-2 rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-600">
                          Client-specific
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {m.stage && (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        m.stage === "production"
                          ? "bg-emerald-50 text-emerald-700"
                          : m.stage === "staging"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {m.stage}
                    </span>
                  )}
                  {m.validation_metrics && (
                    <div className="flex gap-2 text-xs text-slate-500">
                      {Object.entries(m.validation_metrics)
                        .slice(0, 3)
                        .map(([k, v]) => (
                          <span key={k} className="font-mono">
                            {k}: {typeof v === "number" ? v.toFixed(3) : v}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {(!data || data.models.length === 0) && (
              <p className="py-8 text-center text-sm text-slate-400">
                No model versions found
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
