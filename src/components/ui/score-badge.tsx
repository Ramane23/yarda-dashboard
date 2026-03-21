import { cn, decisionBg } from "@/lib/utils";

export function ScoreBadge({ score }: { score: number }) {
  let color = "bg-emerald-100 text-emerald-700";
  if (score >= 0.8) color = "bg-red-100 text-red-700";
  else if (score >= 0.6) color = "bg-orange-100 text-orange-700";
  else if (score >= 0.4) color = "bg-amber-100 text-amber-700";

  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-semibold", color)}>
      {(score * 100).toFixed(0)}
    </span>
  );
}

export function DecisionBadge({ decision }: { decision: string | null }) {
  if (!decision) return <span className="text-xs text-slate-400">--</span>;
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        decisionBg(decision),
      )}
    >
      {decision}
    </span>
  );
}
