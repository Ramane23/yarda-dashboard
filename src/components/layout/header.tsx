"use client";

import { useAppStore } from "@/lib/store";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleToggle } from "@/components/locale-toggle";
import { useT } from "@/lib/useT";
import { cn } from "@/lib/utils";
import type { Period } from "@/types/api";
import type { TranslationKey } from "@/lib/i18n";

const periods: { value: Period; key: TranslationKey }[] = [
  { value: "24h", key: "period.24h" },
  { value: "7d", key: "period.7d" },
  { value: "30d", key: "period.30d" },
  { value: "90d", key: "period.90d" },
];

export function Header({ title }: { title: string }) {
  const { period, setPeriod, clientId } = useAppStore();
  const t = useT();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white/80 px-6 backdrop-blur-sm dark:bg-surface-900/80">
      <h1 className="text-lg font-semibold text-surface-900 dark:text-white">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Period selector */}
        <div className="flex rounded-lg border bg-surface-50 p-0.5 dark:bg-surface-800">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                period === p.value
                  ? "bg-white text-brand-700 shadow-sm dark:bg-surface-700 dark:text-brand-300"
                  : "text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200",
              )}
            >
              {t(p.key)}
            </button>
          ))}
        </div>

        <LocaleToggle />
        <ThemeToggle />

        {/* Client badge */}
        {clientId && (
          <div className="flex items-center gap-2 rounded-full border bg-surface-50 px-3 py-1.5 dark:bg-surface-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span className="text-xs font-semibold text-surface-700 dark:text-surface-300">
              {clientId.toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
