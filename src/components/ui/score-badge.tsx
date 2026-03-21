import { cn, scoreBgColor, decisionBg } from "@/lib/utils";

export function ScoreBadge({ score }: { score: number }) {
  return (
    <span className={cn("badge font-mono font-semibold", scoreBgColor(score))}>
      {(score * 100).toFixed(0)}
    </span>
  );
}

export function DecisionBadge({ decision }: { decision: string | null }) {
  if (!decision) return <span className="text-xs text-surface-400">—</span>;
  return (
    <span className={cn("badge border capitalize", decisionBg(decision))}>
      {decision}
    </span>
  );
}
