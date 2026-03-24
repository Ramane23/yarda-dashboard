"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Box,
  Cpu,
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  Shield,
  Activity,
  BarChart3,
  Settings2,
  FileBox,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { getProductionModels } from "@/lib/api";
import { cn, formatNumber } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/useT";
import { format } from "date-fns";
import type { ProductionModel } from "@/types/api";
import type { TranslationKey } from "@/lib/i18n";

function MetricCard({
  label,
  value,
  format: fmt = "percent",
  color = "brand",
}: {
  label: string;
  value: number;
  format?: "percent" | "number" | "rate";
  color?: "brand" | "emerald" | "amber" | "violet" | "red";
}) {
  const displayValue =
    fmt === "percent"
      ? `${(value * 100).toFixed(1)}%`
      : fmt === "rate"
        ? `${(value * 100).toFixed(2)}%`
        : value >= 1000
          ? formatNumber(value)
          : value.toFixed(4);

  const barPct = fmt === "percent" || fmt === "rate" ? value * 100 : Math.min(value, 1) * 100;

  const colorMap: Record<string, { text: string; bar: string }> = {
    brand: { text: "text-brand-600 dark:text-brand-400", bar: "bg-brand-500" },
    emerald: { text: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500" },
    amber: { text: "text-amber-600 dark:text-amber-400", bar: "bg-amber-500" },
    violet: { text: "text-violet-600 dark:text-violet-400", bar: "bg-violet-500" },
    red: { text: "text-red-600 dark:text-red-400", bar: "bg-red-500" },
  };

  const c = colorMap[color] || colorMap.brand;

  return (
    <div className="rounded-lg border bg-surface-50/50 p-3 dark:border-surface-700 dark:bg-surface-800/50">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-400">{label}</p>
      <p className={cn("mt-0.5 font-mono text-lg font-bold", c.text)}>{displayValue}</p>
      {(fmt === "percent" || fmt === "rate") && (
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-surface-200 dark:bg-surface-700">
          <div
            className={cn("h-full rounded-full transition-all duration-500", c.bar)}
            style={{ width: `${Math.min(barPct, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

function ConfusionMatrix({
  data,
  t,
}: {
  data: NonNullable<ProductionModel["confusion_matrix"]>;
  t: (key: TranslationKey) => string;
}) {
  return (
    <div className="mx-auto max-w-xs">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-emerald-50 p-3 text-center dark:bg-emerald-950/30">
          <p className="text-[9px] font-semibold uppercase text-emerald-600 dark:text-emerald-400">
            {t("models.truePositive")}
          </p>
          <p className="font-mono text-xl font-bold text-emerald-700 dark:text-emerald-300">
            {formatNumber(data.true_positives)}
          </p>
        </div>
        <div className="rounded-lg bg-red-50 p-3 text-center dark:bg-red-950/30">
          <p className="text-[9px] font-semibold uppercase text-red-600 dark:text-red-400">
            {t("models.falseNegative")}
          </p>
          <p className="font-mono text-xl font-bold text-red-700 dark:text-red-300">
            {formatNumber(data.false_negatives)}
          </p>
        </div>
        <div className="rounded-lg bg-red-50 p-3 text-center dark:bg-red-950/30">
          <p className="text-[9px] font-semibold uppercase text-red-600 dark:text-red-400">
            {t("models.falsePositive")}
          </p>
          <p className="font-mono text-xl font-bold text-red-700 dark:text-red-300">
            {formatNumber(data.false_positives)}
          </p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-3 text-center dark:bg-emerald-950/30">
          <p className="text-[9px] font-semibold uppercase text-emerald-600 dark:text-emerald-400">
            {t("models.trueNegative")}
          </p>
          <p className="font-mono text-xl font-bold text-emerald-700 dark:text-emerald-300">
            {formatNumber(data.true_negatives)}
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureImportanceChart({ data }: { data: Record<string, number> }) {
  const sorted = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 12);

  if (sorted.length === 0) return null;

  const max = sorted[0][1];

  return (
    <div className="space-y-1.5">
      {sorted.map(([name, value]) => (
        <div key={name} className="flex items-center gap-2">
          <span className="w-40 shrink-0 truncate text-right font-mono text-[11px] text-surface-500 dark:text-surface-400">
            {name.replace(/_/g, " ")}
          </span>
          <div className="h-4 flex-1 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-brand-500 transition-all duration-500"
              style={{ width: `${(value / max) * 100}%` }}
            />
          </div>
          <span className="w-12 shrink-0 font-mono text-[11px] text-surface-600 dark:text-surface-300">
            {value.toFixed(3)}
          </span>
        </div>
      ))}
    </div>
  );
}

function ParamsGrid({
  params,
  t,
}: {
  params: Record<string, string>;
  t: (key: TranslationKey) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  const entries = Object.entries(params).filter(([k]) => !k.startsWith("sys.") && k !== "verbose");

  const keyParams = [
    "learning_rate",
    "n_estimators",
    "num_iterations",
    "max_depth",
    "num_leaves",
    "anomaly_contamination",
    "anomaly_n_estimators",
    "anomaly_threshold",
    "n_samples",
    "n_features",
    "scale_pos_weight",
    "model_type",
  ];

  const shown = expanded
    ? entries
    : entries.filter(([k]) => keyParams.includes(k) || k.startsWith("best_"));

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3 lg:grid-cols-4">
        {shown.map(([k, v]) => (
          <div key={k} className="flex items-baseline gap-1.5 py-1">
            <span className="shrink-0 font-mono text-[11px] text-surface-400">{k}:</span>
            <span className="truncate font-mono text-[11px] font-semibold text-surface-700 dark:text-surface-200">
              {v}
            </span>
          </div>
        ))}
      </div>
      {entries.length > shown.length && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? t("models.showLess") : `${t("models.showAll")} (${entries.length})`}
        </button>
      )}
    </div>
  );
}

function ModelCard({ model, t }: { model: ProductionModel; t: (key: TranslationKey) => string }) {
  const [open, setOpen] = useState(true);
  const hasClassifier =
    model.classifier_metrics && Object.keys(model.classifier_metrics).length > 0;
  const hasAnomaly = model.anomaly_metrics && Object.keys(model.anomaly_metrics).length > 0;
  const hasFeatures = model.feature_importance && Object.keys(model.feature_importance).length > 0;
  const hasParams = model.params && Object.keys(model.params).length > 0;

  const fw = model.framework?.toUpperCase() || "—";
  const isLightGBM = model.model_name.toLowerCase().includes("lightgbm");
  const isAnomaly =
    model.model_name.toLowerCase().includes("isolation") ||
    model.model_name.toLowerCase().includes("anomaly");

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div
        className="flex cursor-pointer items-start justify-between p-5"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "rounded-xl p-2.5",
              isAnomaly
                ? "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400"
                : "bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400",
            )}
          >
            {isAnomaly ? <Shield size={20} /> : <Box size={20} />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-semibold text-surface-900 dark:text-white">{model.model_name}</h4>
              <span className="font-mono text-xs text-surface-400">v{model.version}</span>
              <span className="badge bg-emerald-100 text-emerald-700 text-[10px] dark:bg-emerald-950/40 dark:text-emerald-400">
                production
              </span>
              <span className="rounded bg-surface-100 px-1.5 py-0.5 text-[10px] font-bold text-surface-500 dark:bg-surface-800">
                {fw}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-surface-500 dark:text-surface-400">
              <span className="flex items-center gap-1">
                <Cpu size={12} />
                {isLightGBM ? "LightGBM Classifier" : isAnomaly ? "Isolation Forest" : fw}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {t("models.deployedOn")} {format(new Date(model.created_at), "MMM d, yyyy")}
              </span>
            </div>
            {model.tags.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {model.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-surface-100 px-1.5 py-0.5 text-[10px] text-surface-500 dark:bg-surface-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {model.comet_url && (
            <a
              href={model.comet_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/30"
            >
              <ExternalLink size={12} />
              {t("models.viewInComet")}
            </a>
          )}
          {open ? (
            <ChevronUp size={16} className="text-surface-400" />
          ) : (
            <ChevronDown size={16} className="text-surface-400" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {open && (
        <div className="space-y-5 border-t px-5 pb-5 pt-4 dark:border-surface-800">
          {/* Classifier Metrics */}
          {hasClassifier && (
            <div>
              <h5 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-surface-500">
                <BarChart3 size={14} />
                {t("models.classifierPerformance")}
              </h5>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {model.classifier_metrics!.precision != null && (
                  <MetricCard
                    label="Precision"
                    value={model.classifier_metrics!.precision}
                    color="brand"
                  />
                )}
                {model.classifier_metrics!.recall != null && (
                  <MetricCard
                    label="Recall"
                    value={model.classifier_metrics!.recall}
                    color="emerald"
                  />
                )}
                {model.classifier_metrics!.f1_score != null && (
                  <MetricCard
                    label="F1 Score"
                    value={model.classifier_metrics!.f1_score}
                    color="amber"
                  />
                )}
                {model.classifier_metrics!.auc_roc != null && (
                  <MetricCard
                    label="AUC-ROC"
                    value={model.classifier_metrics!.auc_roc}
                    color="violet"
                  />
                )}
                {model.classifier_metrics!.accuracy != null && (
                  <MetricCard
                    label="Accuracy"
                    value={model.classifier_metrics!.accuracy}
                    color="brand"
                  />
                )}
              </div>
            </div>
          )}

          {/* Confusion Matrix */}
          {model.confusion_matrix && (
            <div>
              <h5 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-surface-500">
                <Activity size={14} />
                {t("models.confusionMatrix")}
              </h5>
              <ConfusionMatrix data={model.confusion_matrix} t={t} />
            </div>
          )}

          {/* Anomaly Detection Stats */}
          {hasAnomaly && (
            <div>
              <h5 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-surface-500">
                <AlertTriangle size={14} />
                {t("models.anomalyDetection")}
              </h5>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {model.anomaly_metrics!.threshold != null && (
                  <MetricCard
                    label={t("models.threshold")}
                    value={model.anomaly_metrics!.threshold}
                    format="number"
                    color="violet"
                  />
                )}
                {model.anomaly_metrics!.anomaly_rate != null && (
                  <MetricCard
                    label={t("models.anomalyRate")}
                    value={model.anomaly_metrics!.anomaly_rate}
                    format="rate"
                    color="red"
                  />
                )}
                {model.anomaly_metrics!.score_mean != null && (
                  <MetricCard
                    label="Mean Score"
                    value={model.anomaly_metrics!.score_mean}
                    format="number"
                    color="amber"
                  />
                )}
                {model.anomaly_metrics!.score_p95 != null && (
                  <MetricCard
                    label="P95 Score"
                    value={model.anomaly_metrics!.score_p95}
                    format="number"
                    color="amber"
                  />
                )}
                {model.anomaly_metrics!.score_p99 != null && (
                  <MetricCard
                    label="P99 Score"
                    value={model.anomaly_metrics!.score_p99}
                    format="number"
                    color="red"
                  />
                )}
              </div>
            </div>
          )}

          {/* Feature Importance */}
          {hasFeatures && (
            <div>
              <h5 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-surface-500">
                <BarChart3 size={14} />
                {t("models.featureImportance")}
              </h5>
              <FeatureImportanceChart data={model.feature_importance!} />
            </div>
          )}

          {/* Hyperparameters */}
          {hasParams && (
            <div>
              <h5 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-surface-500">
                <Settings2 size={14} />
                {t("models.hyperparameters")}
              </h5>
              <ParamsGrid params={model.params!} t={t} />
            </div>
          )}

          {/* Model Artifacts */}
          {model.assets.length > 0 && (
            <div>
              <h5 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-surface-500">
                <FileBox size={14} />
                {t("models.modelArtifacts")}
              </h5>
              <div className="flex flex-wrap gap-2">
                {model.assets.map((a) => (
                  <span
                    key={a}
                    className="rounded-lg border bg-surface-50 px-2.5 py-1 font-mono text-[11px] text-surface-600 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ModelsPage() {
  const t = useT();
  const viewAsClient = useAppStore((s) => s.viewAsClient);
  const { data, isLoading } = useQuery({
    queryKey: ["production-models", viewAsClient],
    queryFn: getProductionModels,
    staleTime: 60_000,
  });

  return (
    <>
      <Header title={t("models.title")} />
      <div className="flex-1 space-y-6 overflow-auto p-6">
        {/* Comet unavailable banner */}
        {data && !data.comet_available && data.models.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-400">
            <Info size={14} />
            {t("models.cometUnavailable")}
          </div>
        )}

        {/* Model Cards */}
        <div className="space-y-4">
          {data?.models.map((m) => (
            <ModelCard key={m.id} model={m} t={t} />
          ))}
        </div>

        {/* Empty State */}
        {(!data || data.models.length === 0) && !isLoading && (
          <div className="card flex flex-col items-center py-16">
            <Box size={40} className="text-surface-300 dark:text-surface-600" />
            <p className="mt-3 text-sm font-medium text-surface-400">{t("models.noModels")}</p>
            <p className="text-xs text-surface-400">{t("models.noModelsDesc")}</p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="card animate-pulse p-5">
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-xl bg-surface-200 dark:bg-surface-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-48 rounded bg-surface-200 dark:bg-surface-700" />
                    <div className="h-3 w-32 rounded bg-surface-200 dark:bg-surface-700" />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="h-16 rounded bg-surface-200 dark:bg-surface-700" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
