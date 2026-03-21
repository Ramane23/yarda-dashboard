"use client";

import { useAppStore } from "@/lib/store";
import type { Period } from "@/types/api";

const periods: { value: Period; label: string }[] = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
];

export function Header({ title }: { title: string }) {
  const { period, setPeriod, clientId } = useAppStore();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Period selector */}
        <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                period === p.value
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Client badge */}
        {clientId && (
          <div className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            {clientId.toUpperCase()}
          </div>
        )}
      </div>
    </header>
  );
}
