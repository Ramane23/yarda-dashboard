import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function formatPercent(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

export function formatMs(ms: number): string {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}µs`;
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function decisionColor(decision: string): string {
  const map: Record<string, string> = {
    allow: "text-emerald-600 dark:text-emerald-400",
    review: "text-amber-600 dark:text-amber-400",
    alert: "text-orange-600 dark:text-orange-400",
    block: "text-red-600 dark:text-red-400",
  };
  return map[decision] || "text-surface-500";
}

export function decisionBg(decision: string): string {
  const map: Record<string, string> = {
    allow:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    review:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
    alert:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800",
    block:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
  };
  return (
    map[decision] ||
    "bg-surface-50 text-surface-600 border-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:border-surface-700"
  );
}

export function scoreColor(score: number): string {
  if (score >= 0.8) return "text-red-600 dark:text-red-400";
  if (score >= 0.6) return "text-orange-600 dark:text-orange-400";
  if (score >= 0.4) return "text-amber-600 dark:text-amber-400";
  return "text-emerald-600 dark:text-emerald-400";
}

export function scoreBgColor(score: number): string {
  if (score >= 0.8) return "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400";
  if (score >= 0.6)
    return "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400";
  if (score >= 0.4) return "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400";
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400";
}

import { t as translate, type Locale, type TranslationKey } from "@/lib/i18n";

const phaseColors: Record<string, string> = {
  cold_start: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400",
  early: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  stable: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  mature: "bg-brand-100 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400",
};

const phaseKeys: Record<string, TranslationKey> = {
  cold_start: "phase.cold_start",
  early: "phase.early",
  stable: "phase.stable",
  mature: "phase.mature",
};

export function phaseLabel(phase: string, locale: Locale = "en"): { label: string; color: string } {
  const key = phaseKeys[phase];
  const color =
    phaseColors[phase] ||
    "bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400";
  const label = key ? translate(key, locale) : phase;
  return { label, color };
}
