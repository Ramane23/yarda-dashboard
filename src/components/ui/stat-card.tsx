import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/states";
import { cn } from "@/lib/utils";

/** Change versus the previous period. */
export interface StatTrend {
  /** Formatted change, e.g. `+12 %`. */
  label: string;
  direction: "up" | "down" | "flat";
  /**
   * Whether "up" is good for this metric. Fraud rate going up is bad; money
   * blocked going up is good. Colour follows meaning, not direction.
   */
  upIsGood: boolean;
  /** Accessible sentence, e.g. "up 12 % versus the previous 7 days". */
  description: string;
}

export interface StatCardProps {
  label: string;
  /** Already formatted value (see `lib/format`). */
  value: string;
  icon?: LucideIcon;
  /** Secondary line under the value. */
  hint?: ReactNode;
  trend?: StatTrend;
  /** Colour of the value, from `lib/tokens` (e.g. `decisionTone("block").text`). */
  valueClassName?: string;
  loading?: boolean;
  className?: string;
}

/**
 * The single KPI card of the app (replaces KpiCard, MetricCard, Stat and the
 * inline impact cards).
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  trend,
  valueClassName,
  loading,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("flex flex-col gap-2 p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
        {Icon ? <Icon className="size-4 shrink-0 text-subtle-foreground" aria-hidden /> : null}
      </div>
      {loading ? (
        <>
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-3.5 w-32" />
        </>
      ) : (
        <>
          <p
            className={cn(
              "truncate text-2xl font-semibold tracking-tight tabular-nums",
              valueClassName,
            )}
          >
            {value}
          </p>
          {(trend || hint) && (
            <div className="flex min-h-4 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
              {trend ? <TrendPill trend={trend} /> : null}
              {hint ? <span className="truncate">{hint}</span> : null}
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function TrendPill({ trend }: { trend: StatTrend }) {
  const good = trend.direction === "flat" ? null : (trend.direction === "up") === trend.upIsGood;
  const Icon =
    trend.direction === "up" ? ArrowUpRight : trend.direction === "down" ? ArrowDownRight : Minus;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-medium tabular-nums",
        good === null ? "text-muted-foreground" : good ? "text-success" : "text-destructive",
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      <span aria-hidden>{trend.label}</span>
      <span className="sr-only">{trend.description}</span>
    </span>
  );
}
