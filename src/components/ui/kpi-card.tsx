"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  accent?: string; // tailwind border-color class
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accent = "border-brand-500",
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border-l-4 bg-white p-5 shadow-sm",
        accent,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                trend.positive ? "text-emerald-600" : "text-red-600",
              )}
            >
              {trend.positive ? "+" : ""}{trend.value}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-slate-50 p-2.5 text-slate-400">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
