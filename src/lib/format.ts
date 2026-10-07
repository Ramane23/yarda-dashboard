/**
 * Locale-aware formatting of numbers, money, percentages, durations and dates
 * (plan item UX-05).
 *
 * Every value shown to a user goes through these helpers, built on `Intl`,
 * so French users see "1 234,5" and "7 oct. 2026" while English users see
 * "1,234.5" and "Oct 7, 2026". Invalid input renders an em dash instead of
 * throwing or showing "NaN".
 *
 * Formatters are cached per (locale, options) because `Intl` constructors
 * are comparatively expensive and these run inside large tables.
 */

import type { Locale } from "@/lib/i18n";

/** Shown in place of a missing or invalid value. */
export const EMPTY = "—";

const BCP47: Record<Locale, string> = { en: "en-GB", fr: "fr-FR" };

const numberFormats = new Map<string, Intl.NumberFormat>();
const dateFormats = new Map<string, Intl.DateTimeFormat>();

function numberFormat(locale: Locale, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${locale}|${JSON.stringify(options)}`;
  let format = numberFormats.get(key);
  if (!format) {
    format = new Intl.NumberFormat(BCP47[locale], options);
    numberFormats.set(key, format);
  }
  return format;
}

function dateFormat(locale: Locale, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale}|${JSON.stringify(options)}`;
  let format = dateFormats.get(key);
  if (!format) {
    format = new Intl.DateTimeFormat(BCP47[locale], options);
    dateFormats.set(key, format);
  }
  return format;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** Integer or decimal with grouping, e.g. `12 345` / `12,345`. */
export function formatNumber(
  value: number | null | undefined,
  locale: Locale,
  maximumFractionDigits = 0,
): string {
  return isFiniteNumber(value)
    ? numberFormat(locale, { maximumFractionDigits }).format(value)
    : EMPTY;
}

/** Compact number for KPIs, e.g. `12,3 k` / `12.3K`. */
export function formatCompact(value: number | null | undefined, locale: Locale): string {
  return isFiniteNumber(value)
    ? numberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(value)
    : EMPTY;
}

/**
 * Money with its currency, e.g. `1 250 000 F CFA` or `€1,250.00`.
 *
 * @param compact - Use compact notation (`1,3 M F CFA`) for KPIs.
 */
export function formatMoney(
  value: number | null | undefined,
  currency: string,
  locale: Locale,
  compact = false,
): string {
  if (!isFiniteNumber(value)) return EMPTY;
  const code = currency.toUpperCase();
  const zeroDecimal = ["XOF", "XAF", "GNF", "RWF", "UGX", "JPY"].includes(code);
  // "F CFA" is the French usage; English-speaking finance teams write the ISO code.
  const currencyDisplay = locale === "en" && (code === "XOF" || code === "XAF") ? "code" : "symbol";
  try {
    return numberFormat(locale, {
      style: "currency",
      currency: code,
      currencyDisplay,
      notation: compact ? "compact" : "standard",
      maximumFractionDigits: compact ? 1 : zeroDecimal ? 0 : 2,
    }).format(value);
  } catch {
    // Unknown ISO code: number plus the code as given.
    return `${formatNumber(value, locale, 2)} ${currency}`;
  }
}

/** Ratio (0–1) as a percentage, e.g. `12,5 %` / `12.5%`. */
export function formatPercent(
  ratio: number | null | undefined,
  locale: Locale,
  maximumFractionDigits = 1,
): string {
  return isFiniteNumber(ratio)
    ? numberFormat(locale, { style: "percent", maximumFractionDigits }).format(ratio)
    : EMPTY;
}

/** 0–1 risk score shown on a 0–100 scale, e.g. `87`. */
export function formatScore(score: number | null | undefined, locale: Locale): string {
  return isFiniteNumber(score) ? formatNumber(score * 100, locale, 0) : EMPTY;
}

/** Duration in milliseconds, e.g. `850 ms`, `1,2 s`. */
export function formatDuration(ms: number | null | undefined, locale: Locale): string {
  if (!isFiniteNumber(ms)) return EMPTY;
  if (ms < 1000) return `${formatNumber(ms, locale, ms < 10 ? 1 : 0)} ms`;
  return `${formatNumber(ms / 1000, locale, 1)} s`;
}

/** Parse an API timestamp; naive ISO strings are treated as UTC. */
export function parseTimestamp(value: string | number | Date | null | undefined): Date | null {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "number") return new Date(value);
  const iso = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

export interface DateOptions {
  /** IANA time zone to display in (default: the browser's). */
  timeZone?: string;
}

/** Date only, e.g. `7 oct. 2026` / `7 Oct 2026`. */
export function formatDate(
  value: string | number | Date | null | undefined,
  locale: Locale,
  options: DateOptions = {},
): string {
  const date = parseTimestamp(value);
  return date
    ? dateFormat(locale, { dateStyle: "medium", timeZone: options.timeZone }).format(date)
    : EMPTY;
}

/** Date and time, e.g. `7 oct. 2026, 14:05`. */
export function formatDateTime(
  value: string | number | Date | null | undefined,
  locale: Locale,
  options: DateOptions = {},
): string {
  const date = parseTimestamp(value);
  return date
    ? dateFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: options.timeZone,
      }).format(date)
    : EMPTY;
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
  ["second", 1],
];

/** Time relative to `now`, e.g. `il y a 3 heures` / `3 hours ago`. */
export function formatRelative(
  value: string | number | Date | null | undefined,
  locale: Locale,
  now: Date = new Date(),
): string {
  const date = parseTimestamp(value);
  if (!date) return EMPTY;
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const format = new Intl.RelativeTimeFormat(BCP47[locale], { numeric: "auto" });
  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= size || unit === "second") {
      return format.format(Math.round(seconds / size), unit);
    }
  }
  return EMPTY;
}

/** Short label of the user's time zone, e.g. `UTC+1`, shown next to times. */
export function timeZoneLabel(locale: Locale, timeZone?: string): string {
  const parts = dateFormat(locale, { timeZoneName: "short", timeZone }).formatToParts(new Date());
  return parts.find((part) => part.type === "timeZoneName")?.value ?? "UTC";
}
