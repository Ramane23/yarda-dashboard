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
    allow: "text-risk-pass",
    review: "text-risk-review",
    alert: "text-risk-alert",
    block: "text-risk-block",
  };
  return map[decision] || "text-slate-500";
}

export function decisionBg(decision: string): string {
  const map: Record<string, string> = {
    allow: "bg-emerald-50 text-emerald-700 border-emerald-200",
    review: "bg-amber-50 text-amber-700 border-amber-200",
    alert: "bg-orange-50 text-orange-700 border-orange-200",
    block: "bg-red-50 text-red-700 border-red-200",
  };
  return map[decision] || "bg-slate-50 text-slate-600 border-slate-200";
}

export function scoreColor(score: number): string {
  if (score >= 0.8) return "text-red-600";
  if (score >= 0.6) return "text-orange-600";
  if (score >= 0.4) return "text-amber-600";
  return "text-emerald-600";
}
