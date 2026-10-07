import { useMemo } from "react";
import * as format from "@/lib/format";
import { useAppStore } from "@/lib/store";

/**
 * Formatters bound to the user's current language.
 *
 * @example
 * const fmt = useFormat();
 * fmt.money(1250000, "XOF"); // "1 250 000 F CFA" in French
 */
export function useFormat() {
  const locale = useAppStore((state) => state.locale);
  return useMemo(
    () => ({
      locale,
      number: (value: number | null | undefined, digits = 0) =>
        format.formatNumber(value, locale, digits),
      compact: (value: number | null | undefined) => format.formatCompact(value, locale),
      money: (value: number | null | undefined, currency: string, compact = false) =>
        format.formatMoney(value, currency, locale, compact),
      percent: (ratio: number | null | undefined, digits = 1) =>
        format.formatPercent(ratio, locale, digits),
      score: (score: number | null | undefined) => format.formatScore(score, locale),
      duration: (ms: number | null | undefined) => format.formatDuration(ms, locale),
      date: (value: string | number | Date | null | undefined) => format.formatDate(value, locale),
      dateTime: (value: string | number | Date | null | undefined) =>
        format.formatDateTime(value, locale),
      relative: (value: string | number | Date | null | undefined) =>
        format.formatRelative(value, locale),
    }),
    [locale],
  );
}
