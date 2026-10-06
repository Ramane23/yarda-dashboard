"use client";

import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { getClientOptions } from "@/lib/admin-api";
import { selectIsAdmin, useAppStore } from "@/lib/store";
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
  const period = useAppStore((s) => s.period);
  const setPeriod = useAppStore((s) => s.setPeriod);
  const viewAsClient = useAppStore((s) => s.viewAsClient);
  const setViewAsClient = useAppStore((s) => s.setViewAsClient);
  const user = useAppStore((s) => s.user);
  const isAdmin = useAppStore(selectIsAdmin);
  const t = useT();

  const { data: clients } = useQuery({
    queryKey: ["admin-client-options"],
    queryFn: getClientOptions,
    enabled: isAdmin,
    staleTime: 60_000,
  });

  const badgeLabel = isAdmin ? viewAsClient : (user?.clientId ?? "");

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white/80 px-6 backdrop-blur-sm dark:bg-surface-900/80">
      <h1 className="text-lg font-semibold text-surface-900 dark:text-white">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Admin client selector */}
        {isAdmin && clients && clients.length > 0 && (
          <div className="flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-2 py-1 dark:border-brand-800 dark:bg-brand-950/30">
            <Eye size={14} className="text-brand-500" />
            <select
              aria-label={t("system.filterByClient")}
              value={viewAsClient}
              onChange={(e) => setViewAsClient(e.target.value)}
              className="bg-transparent text-xs font-semibold text-brand-700 outline-none dark:text-brand-300"
            >
              <option value="">{t("system.allClients")}</option>
              {clients.map((c) => (
                <option key={c.client_id} value={c.client_id}>
                  {c.client_name}
                </option>
              ))}
            </select>
          </div>
        )}

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

        {/* Tenant badge: the tenant being viewed (admins) or the user's own tenant. */}
        {badgeLabel && (
          <div className="flex items-center gap-2 rounded-full border bg-surface-50 px-3 py-1.5 dark:bg-surface-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span className="text-xs font-semibold text-surface-700 dark:text-surface-300">
              {badgeLabel.toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
