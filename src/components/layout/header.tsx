"use client";

import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { getClientOptions } from "@/lib/admin-api";
import { selectIsAdmin, useAppStore } from "@/lib/store";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleToggle } from "@/components/locale-toggle";
import { useT } from "@/lib/useT";
import { SegmentedControl } from "@/components/ui/tabs";
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
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background/80 px-6 backdrop-blur">
      <h1 className="truncate text-base font-semibold tracking-tight">{title}</h1>

      <div className="flex items-center gap-2">
        {isAdmin && clients && clients.length > 0 && (
          <label className="flex h-8 items-center gap-1.5 rounded-md border bg-card pl-2.5 pr-1 shadow-xs">
            <Eye className="size-3.5 text-muted-foreground" aria-hidden />
            <span className="sr-only">{t("system.filterByClient")}</span>
            <select
              value={viewAsClient}
              onChange={(e) => setViewAsClient(e.target.value)}
              className="h-full cursor-pointer bg-transparent pr-1 text-xs font-medium outline-none"
            >
              <option value="">{t("system.allClients")}</option>
              {clients.map((c) => (
                <option key={c.client_id} value={c.client_id}>
                  {c.client_name}
                </option>
              ))}
            </select>
          </label>
        )}

        <SegmentedControl
          label={t("header.period")}
          value={period}
          onChange={setPeriod}
          options={periods.map((p) => ({ value: p.value, label: t(p.key) }))}
          size="sm"
        />
        <LocaleToggle />
        <ThemeToggle />

        {/* The tenant being viewed (admins) or the user's own tenant. */}
        {badgeLabel && (
          <span className="hidden items-center gap-1.5 rounded-md border bg-card px-2 py-1 text-xs font-medium shadow-xs sm:inline-flex">
            <span className="size-1.5 rounded-full bg-success" aria-hidden />
            {badgeLabel.toUpperCase()}
          </span>
        )}
      </div>
    </header>
  );
}
