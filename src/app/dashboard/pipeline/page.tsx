"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowRight,
  Box,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Database,
  Gauge,
  Search,
  Shield,
  Workflow,
  XCircle,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/useT";
import { cn, formatMs } from "@/lib/utils";
import { getTransactions } from "@/lib/api";
import { getPredictionDetail } from "@/lib/admin-api";

// ---------------------------------------------------------------------------
// Step card wrapper
// ---------------------------------------------------------------------------
function StepCard({
  stepNumber,
  icon: Icon,
  title,
  subtitle,
  accent,
  children,
}: {
  stepNumber: number;
  icon: typeof Database;
  title: string;
  subtitle: string;
  accent: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="card overflow-hidden">
      <div className="flex cursor-pointer items-center gap-4 p-4" onClick={() => setOpen(!open)}>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md",
            accent,
          )}
        >
          <span className="text-sm font-bold">{stepNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-surface-400" />
          <div>
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white">{title}</h3>
            <p className="text-[11px] text-surface-400">{subtitle}</p>
          </div>
        </div>
        <div className="ml-auto">
          {open ? (
            <ChevronUp size={16} className="text-surface-400" />
          ) : (
            <ChevronDown size={16} className="text-surface-400" />
          )}
        </div>
      </div>
      {open && <div className="border-t px-4 pb-4 pt-3 dark:border-surface-800">{children}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Key-value table
// ---------------------------------------------------------------------------
function KVTable({ data, maxRows }: { data: Record<string, unknown>; maxRows?: number }) {
  const [showAll, setShowAll] = useState(false);
  const entries = Object.entries(data);
  const shown = showAll || !maxRows ? entries : entries.slice(0, maxRows);

  if (entries.length === 0) {
    return <p className="text-xs italic text-surface-400">No data available</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-[minmax(140px,auto)_1fr] gap-x-4 gap-y-1">
        {shown.map(([k, v]) => (
          <div key={k} className="contents">
            <span className="truncate font-mono text-[11px] text-surface-500 dark:text-surface-400">
              {k}
            </span>
            <span className="truncate font-mono text-[11px] font-medium text-surface-800 dark:text-surface-200">
              {typeof v === "number"
                ? Number.isInteger(v)
                  ? String(v)
                  : v.toFixed(6)
                : String(v ?? "null")}
            </span>
          </div>
        ))}
      </div>
      {maxRows && entries.length > maxRows && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-2 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          {showAll ? "Show less" : `Show all (${entries.length})`}
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Score bar
// ---------------------------------------------------------------------------
function ScoreBar({
  label,
  score,
  weight,
  color,
}: {
  label: string;
  score: number;
  weight: number;
  color: string;
}) {
  const weighted = score * weight;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-surface-600 dark:text-surface-300">{label}</span>
        <div className="flex items-center gap-3 font-mono">
          <span className="text-surface-400">{(weight * 100).toFixed(0)}% w</span>
          <span className="font-semibold text-surface-700 dark:text-surface-200">
            {score.toFixed(4)}
          </span>
          <span className="text-surface-400">= {weighted.toFixed(4)}</span>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${Math.min(score * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Decision badge (large)
// ---------------------------------------------------------------------------
function DecisionBlock({
  decision,
  score,
  thresholds,
}: {
  decision: string;
  score: number;
  thresholds: Record<string, number>;
}) {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    allow: {
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      text: "text-emerald-700 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-800",
    },
    review: {
      bg: "bg-amber-50 dark:bg-amber-950/30",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-800",
    },
    alert: {
      bg: "bg-orange-50 dark:bg-orange-950/30",
      text: "text-orange-700 dark:text-orange-400",
      border: "border-orange-200 dark:border-orange-800",
    },
    block: {
      bg: "bg-red-50 dark:bg-red-950/30",
      text: "text-red-700 dark:text-red-400",
      border: "border-red-200 dark:border-red-800",
    },
  };
  const c = colorMap[decision] || colorMap.allow;

  return (
    <div className="space-y-3">
      <div
        className={cn("flex items-center justify-between rounded-xl border p-4", c.bg, c.border)}
      >
        <div className="flex items-center gap-3">
          {decision === "allow" ? (
            <CheckCircle2 size={28} className={c.text} />
          ) : (
            <XCircle size={28} className={c.text} />
          )}
          <div>
            <p className={cn("text-lg font-bold uppercase", c.text)}>{decision}</p>
            <p className="font-mono text-xs text-surface-400">score: {score.toFixed(4)}</p>
          </div>
        </div>
      </div>

      {/* Threshold ruler */}
      {Object.keys(thresholds).length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-400">
            Thresholds
          </p>
          <div className="relative h-6 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
            {/* Zones */}
            <div
              className="absolute inset-y-0 left-0 bg-emerald-200/50 dark:bg-emerald-900/30"
              style={{ width: `${(thresholds.review || 0.5) * 100}%` }}
            />
            <div
              className="absolute inset-y-0 bg-amber-200/50 dark:bg-amber-900/30"
              style={{
                left: `${(thresholds.review || 0.5) * 100}%`,
                width: `${((thresholds.alert || 0.7) - (thresholds.review || 0.5)) * 100}%`,
              }}
            />
            <div
              className="absolute inset-y-0 bg-orange-200/50 dark:bg-orange-900/30"
              style={{
                left: `${(thresholds.alert || 0.7) * 100}%`,
                width: `${((thresholds.block || 0.85) - (thresholds.alert || 0.7)) * 100}%`,
              }}
            />
            <div
              className="absolute inset-y-0 right-0 bg-red-200/50 dark:bg-red-900/30"
              style={{ left: `${(thresholds.block || 0.85) * 100}%` }}
            />
            {/* Score marker */}
            <div
              className="absolute inset-y-0 w-0.5 bg-surface-900 dark:bg-white"
              style={{ left: `${Math.min(score * 100, 100)}%` }}
            >
              <div className="absolute -top-0.5 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-surface-900 dark:bg-white" />
            </div>
          </div>
          <div className="flex justify-between text-[9px] font-mono text-surface-400">
            <span>0</span>
            <span>{thresholds.review?.toFixed(2)} review</span>
            <span>{thresholds.alert?.toFixed(2)} alert</span>
            <span>{thresholds.block?.toFixed(2)} block</span>
            <span>1</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Arrow connector between steps
// ---------------------------------------------------------------------------
function StepArrow() {
  return (
    <div className="flex items-center justify-center py-1">
      <ArrowRight size={20} className="text-surface-300 dark:text-surface-600" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function PipelinePage() {
  const period = useAppStore((s) => s.period);
  const viewAsClient = useAppStore((s) => s.viewAsClient);
  const t = useT();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Recent transactions list
  const { data: txns, isLoading: txnsLoading } = useQuery({
    queryKey: ["pipeline-txns", period, viewAsClient],
    queryFn: () => getTransactions({ period, page: 1, page_size: 30, sort: "newest" }),
  });

  // Selected prediction detail
  const {
    data: detail,
    isLoading: detailLoading,
    error: detailError,
  } = useQuery({
    queryKey: ["pipeline-detail", selectedId],
    queryFn: () => getPredictionDetail(selectedId!),
    enabled: !!selectedId,
  });

  const hasRawInput = detail && Object.keys(detail.raw_input).length > 0;
  const hasEngineered = detail && Object.keys(detail.engineered_features).length > 0;

  return (
    <>
      <Header title={t("pipeline.title")} />
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: transaction list */}
        <div className="w-80 shrink-0 overflow-y-auto border-r bg-surface-50/50 dark:border-surface-800 dark:bg-surface-900/50">
          <div className="sticky top-0 z-10 border-b bg-surface-50/80 p-3 backdrop-blur dark:border-surface-800 dark:bg-surface-900/80">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-surface-400">
              <Search size={14} />
              {t("pipeline.recentTransactions")}
            </div>
          </div>

          {txnsLoading && (
            <div className="space-y-2 p-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-lg bg-surface-200 dark:bg-surface-800"
                />
              ))}
            </div>
          )}

          <div className="space-y-1 p-2">
            {txns?.items.map((tx) => {
              const isSelected = selectedId === tx.request_id;
              const decColor: Record<string, string> = {
                allow: "bg-emerald-500",
                review: "bg-amber-500",
                alert: "bg-orange-500",
                block: "bg-red-500",
              };
              return (
                <button
                  key={tx.request_id}
                  onClick={() => setSelectedId(tx.request_id)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all",
                    isSelected
                      ? "bg-brand-50 ring-1 ring-brand-300 dark:bg-brand-950/40 dark:ring-brand-700"
                      : "hover:bg-surface-100 dark:hover:bg-surface-800",
                  )}
                >
                  <span
                    className={cn(
                      "h-2.5 w-2.5 shrink-0 rounded-full",
                      decColor[tx.decision || "allow"] || "bg-surface-300",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs font-medium text-surface-700 dark:text-surface-200">
                      {tx.transaction_id || tx.request_id.slice(0, 16)}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-surface-400">
                      <span className="font-semibold uppercase">{tx.decision || "—"}</span>
                      <span>{tx.score.toFixed(3)}</span>
                      {tx.timestamp && <span>{format(new Date(tx.timestamp), "HH:mm")}</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right panel: pipeline flow */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedId && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Workflow
                  size={48}
                  className="mx-auto mb-3 text-surface-300 dark:text-surface-600"
                />
                <p className="text-sm text-surface-400">{t("pipeline.selectTransaction")}</p>
              </div>
            </div>
          )}

          {selectedId && detailLoading && (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-xl bg-surface-200 dark:bg-surface-800"
                />
              ))}
            </div>
          )}

          {selectedId && detailError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-400">
              {(detailError as Error).message}
            </div>
          )}

          {detail && !detailLoading && (
            <div className="mx-auto max-w-3xl space-y-2">
              {/* Header summary */}
              <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-surface-500 dark:text-surface-400">
                <span className="font-mono font-semibold text-surface-700 dark:text-surface-200">
                  {detail.transaction_id || detail.request_id.slice(0, 20)}
                </span>
                {detail.timestamp && (
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {format(new Date(detail.timestamp), "MMM d, yyyy HH:mm:ss")}
                  </span>
                )}
                {detail.phase && (
                  <span className="rounded bg-surface-100 px-2 py-0.5 font-semibold uppercase dark:bg-surface-800">
                    {detail.phase}
                  </span>
                )}
                {detail.inference_time_ms > 0 && (
                  <span className="flex items-center gap-1">
                    <Gauge size={12} />
                    {formatMs(detail.inference_time_ms)}
                  </span>
                )}
                {detail.model_name && (
                  <span className="flex items-center gap-1">
                    <Box size={12} />
                    {detail.model_name}
                  </span>
                )}
              </div>

              {/* Step 1: Raw Input */}
              <StepCard
                stepNumber={1}
                icon={Database}
                title={t("pipeline.rawInput")}
                subtitle={t("pipeline.rawInputDesc")}
                accent="bg-sky-500"
              >
                {hasRawInput ? (
                  <KVTable data={detail.raw_input} maxRows={10} />
                ) : (
                  <p className="text-xs italic text-surface-400">{t("pipeline.noData")}</p>
                )}
              </StepCard>

              <StepArrow />

              {/* Step 2: Feature Engineering */}
              <StepCard
                stepNumber={2}
                icon={Workflow}
                title={t("pipeline.featureEng")}
                subtitle={`${
                  hasEngineered ? Object.keys(detail.engineered_features).length : 0
                } ${t("pipeline.features")}`}
                accent="bg-violet-500"
              >
                {hasEngineered ? (
                  <KVTable data={detail.engineered_features} maxRows={12} />
                ) : (
                  <p className="text-xs italic text-surface-400">{t("pipeline.noData")}</p>
                )}
              </StepCard>

              <StepArrow />

              {/* Step 3: Model Input */}
              <StepCard
                stepNumber={3}
                icon={Brain}
                title={t("pipeline.modelInput")}
                subtitle={`${detail.feature_names.length} ${t("pipeline.features")} → ${detail.model_name || "N/A"}`}
                accent="bg-brand-500"
              >
                {detail.feature_names.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {detail.feature_names.map((f) => (
                      <span
                        key={f}
                        className="rounded-md bg-surface-100 px-2 py-1 font-mono text-[10px] text-surface-600 dark:bg-surface-800 dark:text-surface-300"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic text-surface-400">{t("pipeline.noData")}</p>
                )}
              </StepCard>

              <StepArrow />

              {/* Step 4: Results */}
              <StepCard
                stepNumber={4}
                icon={Shield}
                title={t("pipeline.results")}
                subtitle={t("pipeline.resultsDesc")}
                accent="bg-emerald-500"
              >
                <div className="space-y-5">
                  {/* Scoring breakdown */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-400">
                      {t("pipeline.scoring")}
                    </p>
                    <ScoreBar
                      label="Anomaly Detection"
                      score={detail.anomaly_score}
                      weight={detail.weights.anomaly || 0}
                      color="bg-violet-500"
                    />
                    <ScoreBar
                      label="ML Classifier"
                      score={detail.ml_score}
                      weight={detail.weights.ml || 0}
                      color="bg-brand-500"
                    />
                  </div>

                  {/* Decision */}
                  {detail.decision && (
                    <DecisionBlock
                      decision={detail.decision}
                      score={detail.final_score}
                      thresholds={detail.thresholds}
                    />
                  )}

                  {/* Ground truth if labeled */}
                  {detail.ground_truth && (
                    <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-surface-700 dark:bg-surface-800/50">
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-surface-400">
                        Ground Truth
                      </p>
                      <KVTable data={detail.ground_truth} />
                    </div>
                  )}
                </div>
              </StepCard>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
