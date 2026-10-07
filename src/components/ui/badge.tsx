import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { decisionTone, phaseTone, scoreTone } from "@/lib/tokens";

/** Visual variants of {@link Badge}. */
export const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium [&_svg]:size-3",
  {
    variants: {
      variant: {
        neutral: "bg-muted text-muted-foreground",
        primary: "bg-primary-soft text-primary-soft-foreground",
        outline: "border border-border text-muted-foreground",
        success: "bg-risk-allow-soft text-risk-allow",
        warning: "bg-risk-review-soft text-risk-review",
        danger: "bg-risk-block-soft text-risk-block",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

/** Small status label. Prefer the specialised badges below for business values. */
export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

/** Leading dot in the tone's solid colour, so status is not conveyed by text colour alone. */
function Dot({ className }: { className: string }) {
  return <span aria-hidden className={cn("size-1.5 rounded-full", className)} />;
}

/**
 * Decision badge (allow / review / alert / block).
 *
 * @param label - Translated label; defaults to the raw decision.
 */
export function DecisionBadge({
  decision,
  label,
}: {
  decision: string | null | undefined;
  label?: string;
}) {
  if (!decision) return <span className="text-xs text-subtle-foreground">—</span>;
  const tone = decisionTone(decision);
  return (
    <span className={cn(badgeVariants(), tone.soft, "capitalize")}>
      <Dot className={tone.solid} />
      {label ?? decision}
    </span>
  );
}

/** Risk score badge on a 0–100 scale, coloured by band. */
export function ScoreBadge({ score }: { score: number | null | undefined }) {
  if (score === null || score === undefined || !Number.isFinite(score)) {
    return <span className="text-xs text-subtle-foreground">—</span>;
  }
  return (
    <span
      className={cn(
        badgeVariants(),
        scoreTone(score).soft,
        "min-w-9 justify-center tabular-nums font-semibold",
      )}
    >
      {Math.round(score * 100)}
    </span>
  );
}

/** Learning-phase pill. */
export function PhaseBadge({ phase, label }: { phase: string | null | undefined; label: string }) {
  const tone = phaseTone(phase);
  return (
    <span className={cn(badgeVariants(), tone.soft)}>
      <Dot className={tone.solid} />
      {label}
    </span>
  );
}
