"use client";

import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  accent?: string;
}

export function KpiCard({ title, value, subtitle, icon: Icon, trend, accent }: KpiCardProps) {
  return (
    <div className="card group relative overflow-hidden p-5 transition-all duration-200 hover:shadow-card-hover dark:hover:shadow-glow">
      {/* Top accent */}
      <div className={cn("absolute inset-x-0 top-0 h-0.5", accent || "bg-brand-500")} />

      <div className="flex items-start justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-surface-400 dark:text-surface-500">
            {title}
          </p>
          <p className="font-mono text-2xl font-bold text-surface-900 dark:text-white">{value}</p>
          {subtitle && <p className="text-xs text-surface-500 dark:text-surface-400">{subtitle}</p>}
          {trend && (
            <div
              className={cn(
                "inline-flex items-center gap-1 text-xs font-semibold",
                trend.positive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400",
              )}
            >
              {trend.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trend.value}
            </div>
          )}
        </div>
        <div className="flex-shrink-0 rounded-xl bg-brand-50 p-2.5 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
