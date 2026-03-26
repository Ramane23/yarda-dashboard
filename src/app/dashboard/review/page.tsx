"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ShieldAlert,
  Target,
  CheckCircle2,
  XCircle,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { ScoreBadge, DecisionBadge } from "@/components/ui/score-badge";
import { getReviewQueue, getPhaseProgress, getScoringConfig, submitFeedback } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { cn, phaseLabel } from "@/lib/utils";
import { useT } from "@/lib/useT";
import type { ReviewItem } from "@/types/api";
import type { TranslationKey } from "@/lib/i18n";

// Fallback fraud types (used while scoring config loads)
const DEFAULT_FRAUD_TYPES: { value: string; key: TranslationKey }[] = [
  { value: "account_takeover", key: "fraudType.account_takeover" },
  { value: "mule_account", key: "fraudType.mule_account" },
  { value: "identity_theft", key: "fraudType.identity_theft" },
  { value: "money_laundering", key: "fraudType.money_laundering" },
  { value: "structuring", key: "fraudType.structuring" },
  { value: "social_engineering", key: "fraudType.social_engineering" },
  { value: "synthetic_identity", key: "fraudType.synthetic_identity" },
  { value: "unauthorized_transfer", key: "fraudType.unauthorized_transfer" },
  { value: "other", key: "fraudType.other" },
];

export default function ReviewQueuePage() {
  const period = useAppStore((s) => s.period);
  const locale = useAppStore((s) => s.locale);
  const viewAsClient = useAppStore((s) => s.viewAsClient);
  const t = useT();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [labelState, setLabelState] = useState<{
    isFraud: boolean | null;
    fraudType: string;
    notes: string;
  }>({ isFraud: null, fraudType: "", notes: "" });
  const [successId, setSuccessId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["review-queue", period, page, viewAsClient],
    queryFn: () => getReviewQueue({ period, page, page_size: 50 }),
  });

  const { data: phaseProgress } = useQuery({
    queryKey: ["phase-progress", viewAsClient],
    queryFn: () => getPhaseProgress(),
  });

  const { data: scoringConfig } = useQuery({
    queryKey: ["scoring-config", viewAsClient],
    queryFn: () => getScoringConfig(),
  });

  // Use client's fraud taxonomy from config, fallback to defaults
  const FRAUD_TYPES: { value: string; key: TranslationKey }[] = scoringConfig?.fraud_taxonomy
    ?.length
    ? scoringConfig.fraud_taxonomy.map((t) => ({
        value: t.key,
        key: `fraudType.${t.key}` as TranslationKey,
      }))
    : DEFAULT_FRAUD_TYPES;

  const feedbackMutation = useMutation({
    mutationFn: ({
      requestId,
      feedback,
    }: {
      requestId: string;
      feedback: { is_fraud: boolean; fraud_type?: string; notes?: string };
    }) => submitFeedback(requestId, feedback),
    onSuccess: (_data, variables) => {
      setSuccessId(variables.requestId);
      setExpandedRow(null);
      setLabelState({ isFraud: null, fraudType: "", notes: "" });
      queryClient.invalidateQueries({ queryKey: ["review-queue"] });
      queryClient.invalidateQueries({ queryKey: ["phase-progress"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setTimeout(() => setSuccessId(null), 3000);
    },
  });

  const handleToggleRow = (requestId: string) => {
    if (expandedRow === requestId) {
      setExpandedRow(null);
      setLabelState({ isFraud: null, fraudType: "", notes: "" });
    } else {
      setExpandedRow(requestId);
      setLabelState({ isFraud: null, fraudType: "", notes: "" });
    }
  };

  const handleSubmitLabel = (requestId: string) => {
    if (labelState.isFraud === null) return;
    feedbackMutation.mutate({
      requestId,
      feedback: {
        is_fraud: labelState.isFraud,
        fraud_type: labelState.isFraud ? labelState.fraudType || undefined : undefined,
        notes: labelState.notes || undefined,
      },
    });
  };

  const isColdStart = phaseProgress?.current_phase === "detection";

  const columns = [
    {
      key: "id",
      header: t("transactions.transaction"),
      render: (item: ReviewItem) => (
        <span className="font-mono text-xs text-surface-600 dark:text-surface-400">
          {item.transaction_id || item.request_id.slice(0, 12)}
        </span>
      ),
    },
    {
      key: "decision",
      header: t("transactions.decision"),
      render: (item: ReviewItem) => <DecisionBadge decision={item.decision} />,
    },
    {
      key: "score",
      header: t("review.riskScore"),
      render: (item: ReviewItem) => <ScoreBadge score={item.score} />,
    },
    {
      key: "features",
      header: t("review.topRiskFactors"),
      render: (item: ReviewItem) => (
        <div className="flex flex-wrap gap-1">
          {item.top_features.length > 0 ? (
            item.top_features.map((f) => (
              <span
                key={f}
                className="rounded-md bg-surface-100 px-1.5 py-0.5 font-mono text-[10px] text-surface-600 dark:bg-surface-800 dark:text-surface-400"
              >
                {f}
              </span>
            ))
          ) : (
            <span className="text-xs text-surface-400">--</span>
          )}
        </div>
      ),
    },
    {
      key: "phase",
      header: t("transactions.phase"),
      render: (item: ReviewItem) => {
        if (!item.phase) return <span className="text-xs text-surface-400">--</span>;
        const p = phaseLabel(item.phase, locale);
        return <span className={cn("badge text-[10px]", p.color)}>{p.label}</span>;
      },
    },
    {
      key: "time",
      header: t("transactions.time"),
      render: (item: ReviewItem) => (
        <span className="text-xs text-surface-500 dark:text-surface-400">
          {item.timestamp ? format(new Date(item.timestamp), "MMM d, HH:mm") : "--"}
        </span>
      ),
    },
    {
      key: "label",
      header: t("transactions.label"),
      render: (item: ReviewItem) => {
        if (successId === item.request_id) {
          return (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={12} />
              {t("review.labelSubmitted")}
            </span>
          );
        }
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleRow(item.request_id);
            }}
            className="flex items-center gap-1 rounded-md border border-brand-200 bg-brand-50 px-2 py-1 text-[11px] font-medium text-brand-700 transition-colors hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-950/30 dark:text-brand-400 dark:hover:bg-brand-950/50"
          >
            {expandedRow === item.request_id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {t("review.labelTransaction")}
          </button>
        );
      },
    },
  ];

  return (
    <>
      <Header title={t("review.title")} />
      <div className="flex-1 space-y-4 overflow-auto p-6">
        {/* Cold Start Banner */}
        {isColdStart && (
          <div className="animate-fade-in rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50 to-brand-50 p-4 dark:border-sky-800 dark:from-sky-950/30 dark:to-brand-950/30">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-sky-100 p-2 dark:bg-sky-900/50">
                <Target size={18} className="text-sky-600 dark:text-sky-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-sky-800 dark:text-sky-300">
                  {t("review.detectionBanner")}
                </p>
                <p className="mt-0.5 text-xs text-sky-600 dark:text-sky-400">
                  {t("review.collectLabels")}
                </p>
                {phaseProgress && (
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-sky-600 dark:text-sky-400">
                        {t("phase.labelsCollected")}
                      </span>
                      <span className="font-mono font-semibold text-sky-800 dark:text-sky-200">
                        {phaseProgress.labeled_count}
                        {phaseProgress.next_phase_threshold
                          ? ` / ${phaseProgress.next_phase_threshold}`
                          : ""}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-sky-100 dark:bg-sky-900/50">
                      <div
                        className="h-full rounded-full bg-sky-500 transition-all duration-700"
                        style={{
                          width: `${Math.min(phaseProgress.progress_percent, 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-sky-500 dark:text-sky-400">
                      {phaseProgress.labels_remaining > 0
                        ? `${phaseProgress.labels_remaining} ${t("phase.labelsNeeded")}`
                        : t("phase.reachedFinal")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Status bar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950/30">
            <ShieldAlert size={14} className="text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              {isLoading
                ? t("transactions.loading")
                : `${data?.total ?? 0} ${t("review.pendingReview")}`}
            </span>
          </div>
        </div>

        {/* Table with expandable labeling rows */}
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          keyFn={(item) => item.request_id}
          emptyMessage={t("review.allCaughtUp")}
          renderExpandedRow={(item: ReviewItem) => {
            if (expandedRow !== item.request_id) return null;
            return (
              <tr>
                <td
                  colSpan={columns.length}
                  className="border-t border-surface-100 bg-surface-50/50 px-4 py-4 dark:border-surface-800 dark:bg-surface-900/50"
                >
                  <div className="space-y-4">
                    {/* Fraud / Legitimate toggle */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setLabelState((s) => ({ ...s, isFraud: true, fraudType: "" }))
                        }
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                          labelState.isFraud === true
                            ? "border-red-300 bg-red-50 text-red-700 shadow-sm dark:border-red-700 dark:bg-red-950/40 dark:text-red-400"
                            : "border-surface-200 text-surface-500 hover:border-red-200 hover:text-red-600 dark:border-surface-700 dark:text-surface-400",
                        )}
                      >
                        <XCircle size={14} />
                        {t("review.markFraud")}
                      </button>
                      <button
                        onClick={() =>
                          setLabelState((s) => ({
                            ...s,
                            isFraud: false,
                            fraudType: "",
                          }))
                        }
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                          labelState.isFraud === false
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "border-surface-200 text-surface-500 hover:border-emerald-200 hover:text-emerald-600 dark:border-surface-700 dark:text-surface-400",
                        )}
                      >
                        <CheckCircle2 size={14} />
                        {t("review.markLegitimate")}
                      </button>
                    </div>

                    {/* Fraud type selector (only if fraud) */}
                    {labelState.isFraud === true && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-surface-600 dark:text-surface-400">
                          {t("review.fraudType")}
                        </label>
                        <select
                          value={labelState.fraudType}
                          onChange={(e) =>
                            setLabelState((s) => ({
                              ...s,
                              fraudType: e.target.value,
                            }))
                          }
                          className="input-field max-w-xs text-sm"
                        >
                          <option value="">{t("review.selectFraudType")}</option>
                          {FRAUD_TYPES.map((ft) => (
                            <option key={ft.value} value={ft.value}>
                              {t(ft.key)}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Notes */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-surface-600 dark:text-surface-400">
                        {t("review.notes")}
                      </label>
                      <textarea
                        value={labelState.notes}
                        onChange={(e) => setLabelState((s) => ({ ...s, notes: e.target.value }))}
                        rows={2}
                        className="input-field max-w-lg resize-none text-sm"
                        placeholder="..."
                      />
                    </div>

                    {/* Submit */}
                    <button
                      onClick={() => handleSubmitLabel(item.request_id)}
                      disabled={labelState.isFraud === null || feedbackMutation.isPending}
                      className="btn-primary flex items-center gap-1.5 text-sm disabled:opacity-50"
                    >
                      <Send size={13} />
                      {feedbackMutation.isPending
                        ? t("review.submitting")
                        : t("review.submitLabel")}
                    </button>
                  </div>
                </td>
              </tr>
            );
          }}
        />

        {data && data.pages > 0 && (
          <Pagination
            page={data.page}
            pages={data.pages}
            total={data.total}
            onPageChange={setPage}
          />
        )}
      </div>
    </>
  );
}
