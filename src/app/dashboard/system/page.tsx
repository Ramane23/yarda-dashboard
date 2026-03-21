"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Database,
  Globe,
  FlaskConical,
  Layers,
  RefreshCw,
  Server,
  Shield,
  Users,
  XCircle,
  FileText,
  Cpu,
  BarChart3,
} from "lucide-react";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/useT";
import { cn, formatNumber, formatMs } from "@/lib/utils";
import {
  getSystemHealth,
  getIngestionStats,
  getImpactMetrics,
  getPhaseManagement,
  getModelRegistry,
  getRetrainingStatus,
  checkRetraining,
  getFeedbackStats,
  getExperiments,
  getReports,
} from "@/lib/admin-api";

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={cn(
        "inline-block h-2.5 w-2.5 rounded-full",
        ok
          ? "bg-emerald-500 shadow-sm shadow-emerald-500/50"
          : "bg-red-500 shadow-sm shadow-red-500/50",
      )}
    />
  );
}

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: typeof Activity;
  children: React.ReactNode;
}) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">
      <Icon size={16} />
      {children}
    </h2>
  );
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div>
      <p className="text-xs text-surface-400 dark:text-surface-500">{label}</p>
      <p className="font-mono text-lg font-bold text-surface-900 dark:text-white">{value}</p>
      {sub && <p className="text-[11px] text-surface-400">{sub}</p>}
    </div>
  );
}

export default function SystemPage() {
  const period = useAppStore((s) => s.period);
  const t = useT();
  const [selectedClient, setSelectedClient] = useState<string>("");

  // Parallel queries to all admin endpoints
  const health = useQuery({ queryKey: ["admin-health"], queryFn: getSystemHealth, retry: 1 });
  const ingestion = useQuery({
    queryKey: ["admin-ingestion"],
    queryFn: getIngestionStats,
    retry: 1,
  });
  const impact = useQuery({
    queryKey: ["admin-impact", period],
    queryFn: () => getImpactMetrics(period),
    retry: 1,
  });
  const phases = useQuery({ queryKey: ["admin-phases"], queryFn: getPhaseManagement, retry: 1 });
  const models = useQuery({
    queryKey: ["admin-models"],
    queryFn: () => getModelRegistry(),
    retry: 1,
  });
  const retraining = useQuery({
    queryKey: ["admin-retraining"],
    queryFn: getRetrainingStatus,
    retry: 1,
  });
  const feedback = useQuery({
    queryKey: ["admin-feedback", period],
    queryFn: () => getFeedbackStats(period),
    retry: 1,
  });
  const experiments = useQuery({
    queryKey: ["admin-experiments"],
    queryFn: getExperiments,
    retry: 1,
  });
  const reports = useQuery({ queryKey: ["admin-reports"], queryFn: () => getReports(), retry: 1 });

  const retrainCheck = useMutation({
    mutationFn: (clientId: string) => checkRetraining(clientId),
  });

  // Check if we got a 403 (unauthorized)
  const isUnauthorized =
    health.error?.message?.includes("403") || health.error?.message?.includes("admin");

  if (isUnauthorized) {
    return (
      <>
        <Header title={t("system.title")} />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="card max-w-md p-8 text-center">
            <Shield size={48} className="mx-auto mb-4 text-red-500" />
            <p className="text-lg font-semibold text-surface-900 dark:text-white">
              {t("system.unauthorized")}
            </p>
          </div>
        </div>
      </>
    );
  }

  const h = health.data;
  const ing = ingestion.data;
  const imp = impact.data;
  const ph = phases.data;
  const mod = models.data;
  const ret = retraining.data;
  const fb = feedback.data;
  const exp = experiments.data;
  const rep = reports.data;

  const formatUptime = (s: number) => {
    const d = Math.floor(s / 86400);
    const hrs = Math.floor((s % 86400) / 3600);
    const mins = Math.floor((s % 3600) / 60);
    if (d > 0) return `${d}d ${hrs}h`;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const formatAmount = (amount: number, currency: string) => {
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M ${currency}`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K ${currency}`;
    return `${amount.toFixed(0)} ${currency}`;
  };

  return (
    <>
      <Header title={t("system.title")} />
      <div className="flex-1 space-y-6 overflow-auto p-6">
        {/* ── Row 1: Health + Ingestion ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* System Health */}
          <div className="card space-y-4 p-5">
            <SectionTitle icon={Server}>{t("system.health")}</SectionTitle>
            {h ? (
              <>
                <div className="flex items-center gap-3">
                  <StatusDot ok={h.status === "healthy"} />
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      h.status === "healthy"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400",
                    )}
                  >
                    {h.status === "healthy" ? t("system.healthy") : t("system.degraded")}
                  </span>
                  <span className="ml-auto text-xs text-surface-400">
                    {t("system.uptime")}: {formatUptime(h.uptime_seconds)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="flex items-center gap-2">
                    <Database size={14} className="text-surface-400" />
                    <div>
                      <p className="text-[11px] text-surface-400">{t("system.database")}</p>
                      <p
                        className={cn(
                          "text-xs font-semibold",
                          h.database === "healthy" ? "text-emerald-600" : "text-red-600",
                        )}
                      >
                        {h.database === "healthy" ? (
                          <CheckCircle2 size={12} className="inline mr-1" />
                        ) : (
                          <XCircle size={12} className="inline mr-1" />
                        )}
                        {h.database}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers size={14} className="text-surface-400" />
                    <div>
                      <p className="text-[11px] text-surface-400">{t("system.redis")}</p>
                      <p
                        className={cn(
                          "text-xs font-semibold",
                          h.redis === "healthy" ? "text-emerald-600" : "text-amber-600",
                        )}
                      >
                        {h.redis}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-surface-400">{t("system.activeClients")}</p>
                    <p className="font-mono text-lg font-bold text-surface-900 dark:text-white">
                      {h.clients_active}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-surface-400">{t("system.prodModels")}</p>
                    <p className="font-mono text-lg font-bold text-surface-900 dark:text-white">
                      {h.models_in_production}
                    </p>
                  </div>
                </div>
              </>
            ) : health.isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-32 rounded bg-surface-200 dark:bg-surface-700" />
                <div className="h-8 w-full rounded bg-surface-200 dark:bg-surface-700" />
              </div>
            ) : (
              <p className="text-sm text-red-500">{health.error?.message}</p>
            )}
          </div>

          {/* Ingestion & API */}
          <div className="card space-y-4 p-5">
            <SectionTitle icon={Globe}>{t("system.ingestion")}</SectionTitle>
            {ing ? (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <Stat
                    label={t("system.totalRequests")}
                    value={formatNumber(ing.total_requests)}
                  />
                  <Stat
                    label={t("system.errorRate")}
                    value={`${ing.error_rate_percent.toFixed(2)}%`}
                    sub={`${ing.total_errors} errors`}
                  />
                  <Stat label={t("system.avgLatency")} value={formatMs(ing.avg_response_time_ms)} />
                  <Stat label={t("system.p95Latency")} value={formatMs(ing.p95_response_time_ms)} />
                  <Stat label={t("system.p99Latency")} value={formatMs(ing.p99_response_time_ms)} />
                </div>
                {ing.per_path.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-surface-400">
                      {t("system.topEndpoints")}
                    </p>
                    <div className="space-y-1">
                      {ing.per_path.slice(0, 8).map((ep) => (
                        <div
                          key={`${ep.method}-${ep.path}`}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span className="w-12 shrink-0 rounded bg-surface-100 px-1.5 py-0.5 text-center font-mono text-[10px] font-bold text-surface-500 dark:bg-surface-800">
                            {ep.method}
                          </span>
                          <span className="min-w-0 flex-1 truncate font-mono text-surface-600 dark:text-surface-300">
                            {ep.path}
                          </span>
                          <span className="font-mono text-surface-900 dark:text-white">
                            {formatNumber(ep.total)}
                          </span>
                          {ep.errors > 0 && (
                            <span className="font-mono text-red-500">{ep.errors} err</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : ingestion.isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-8 w-full rounded bg-surface-200 dark:bg-surface-700" />
              </div>
            ) : (
              <p className="text-sm text-red-500">{ingestion.error?.message}</p>
            )}
          </div>
        </div>

        {/* ── Row 2: Impact Metrics ── */}
        <div className="card space-y-4 p-5">
          <SectionTitle icon={Shield}>{t("system.impact")}</SectionTitle>
          {imp ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  {t("system.confirmedFraud")}
                </p>
                <p className="mt-1 font-mono text-2xl font-bold text-emerald-800 dark:text-emerald-300">
                  {formatAmount(imp.confirmed_fraud_intercepted, imp.currency)}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-500">
                  {imp.confirmed_fraud_count} {t("system.transactions")}
                </p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  {t("system.underSurveillance")}
                </p>
                <p className="mt-1 font-mono text-2xl font-bold text-amber-800 dark:text-amber-300">
                  {formatAmount(imp.amount_under_surveillance, imp.currency)}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-500">
                  {imp.surveillance_count} {t("system.transactions")}
                </p>
              </div>
              <div className="rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-800">
                <p className="text-xs font-medium text-surface-500">{t("system.totalProcessed")}</p>
                <p className="mt-1 font-mono text-2xl font-bold text-surface-900 dark:text-white">
                  {formatAmount(imp.total_amount_processed, imp.currency)}
                </p>
                <p className="text-xs text-surface-400">
                  {imp.total_transactions} {t("system.transactions")}
                </p>
              </div>
            </div>
          ) : impact.isLoading ? (
            <div className="animate-pulse h-24 rounded bg-surface-200 dark:bg-surface-700" />
          ) : (
            <p className="text-sm text-red-500">{impact.error?.message}</p>
          )}
        </div>

        {/* ── Row 3: Client Phases + Model Registry ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Client Phases */}
          <div className="card space-y-4 p-5">
            <SectionTitle icon={Users}>{t("system.clients")}</SectionTitle>
            {ph ? (
              <>
                <p className="text-xs text-surface-400">
                  {ph.active_clients}/{ph.total_clients} {t("system.activeClients").toLowerCase()}
                </p>
                <div className="space-y-2">
                  {ph.clients.map((c) => (
                    <div
                      key={c.client_id}
                      className="flex items-center gap-3 rounded-lg border bg-surface-50 p-3 dark:border-surface-700 dark:bg-surface-800/50"
                    >
                      <StatusDot ok={c.is_active} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-surface-900 dark:text-white">
                          {c.client_name}
                        </p>
                        <p className="text-[11px] text-surface-400">
                          {c.client_id} &middot; {c.operator_type}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                          c.phase === "detection" &&
                            "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
                          c.phase === "learning" &&
                            "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
                          c.phase === "classification" &&
                            "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
                          c.phase === "intelligence" &&
                            "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
                        )}
                      >
                        {c.phase}
                      </span>
                      <span className="font-mono text-xs text-surface-500">
                        {c.labeled_count} labels
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : phases.isLoading ? (
              <div className="animate-pulse space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-14 rounded bg-surface-200 dark:bg-surface-700" />
                ))}
              </div>
            ) : (
              <p className="text-sm text-red-500">{phases.error?.message}</p>
            )}
          </div>

          {/* Model Registry */}
          <div className="card space-y-4 p-5">
            <SectionTitle icon={Cpu}>{t("system.models")}</SectionTitle>
            {mod ? (
              <>
                <p className="text-xs text-surface-400">{mod.total_models} models</p>
                {/* Active per client */}
                {Object.entries(mod.active_per_client).length > 0 && (
                  <div className="space-y-2">
                    {Object.entries(mod.active_per_client).map(([client, info]) => {
                      const m = info as Record<string, unknown>;
                      return (
                        <div
                          key={client}
                          className="flex items-center justify-between rounded-lg border bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/20"
                        >
                          <div>
                            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                              {client}
                            </p>
                            <p className="font-mono text-sm font-bold text-emerald-800 dark:text-emerald-300">
                              {String(m.model_name || "—")} v{String(m.version || "?")}
                            </p>
                          </div>
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* Recent models list */}
                <div className="max-h-48 space-y-1 overflow-auto">
                  {mod.models.slice(0, 10).map((m) => (
                    <div key={m.id} className="flex items-center gap-2 text-xs">
                      <span
                        className={cn(
                          "w-16 shrink-0 rounded px-1.5 py-0.5 text-center text-[10px] font-bold",
                          m.stage === "production"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                            : m.stage === "staging"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                              : "bg-surface-100 text-surface-500 dark:bg-surface-800",
                        )}
                      >
                        {m.stage || "none"}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-mono text-surface-600 dark:text-surface-300">
                        {m.model_name} v{m.version}
                      </span>
                      {m.client_name && <span className="text-surface-400">{m.client_name}</span>}
                      {m.framework && (
                        <span className="rounded bg-surface-100 px-1 text-[10px] text-surface-400 dark:bg-surface-800">
                          {m.framework}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : models.isLoading ? (
              <div className="animate-pulse space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 rounded bg-surface-200 dark:bg-surface-700" />
                ))}
              </div>
            ) : (
              <p className="text-sm text-red-500">{models.error?.message}</p>
            )}
          </div>
        </div>

        {/* ── Row 4: Retraining + Feedback ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Retraining */}
          <div className="card space-y-4 p-5">
            <SectionTitle icon={RefreshCw}>{t("system.retraining")}</SectionTitle>
            {ret ? (
              <>
                <div className="flex gap-4 text-xs">
                  <span className="text-surface-400">
                    {t("system.primaryMetric")}:{" "}
                    <strong className="text-surface-700 dark:text-surface-200">
                      {ret.primary_metric}
                    </strong>
                  </span>
                  <span className="text-surface-400">
                    {t("system.minImprovement")}:{" "}
                    <strong className="text-surface-700 dark:text-surface-200">
                      {(ret.min_improvement * 100).toFixed(1)}%
                    </strong>
                  </span>
                </div>
                <div className="space-y-1.5">
                  {ret.triggers.map((tr) => (
                    <div key={tr.name} className="flex items-center gap-2 text-xs">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          tr.enabled ? "bg-emerald-500" : "bg-surface-300 dark:bg-surface-600",
                        )}
                      />
                      <span className="flex-1 text-surface-700 dark:text-surface-300">
                        {tr.name}
                      </span>
                      <span className="rounded bg-surface-100 px-1.5 py-0.5 text-[10px] text-surface-400 dark:bg-surface-800">
                        {tr.type}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-semibold",
                          tr.enabled ? "text-emerald-600" : "text-surface-400",
                        )}
                      >
                        {tr.enabled ? t("system.enabled") : t("system.disabled")}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Check retraining for a client */}
                {ph && ph.clients.length > 0 && (
                  <div className="flex items-center gap-2 border-t pt-3 dark:border-surface-700">
                    <select
                      value={selectedClient}
                      onChange={(e) => setSelectedClient(e.target.value)}
                      className="input-field flex-1 py-1.5 text-xs"
                    >
                      <option value="">{t("system.selectClient")}</option>
                      {ph.clients.map((c) => (
                        <option key={c.client_id} value={c.client_id}>
                          {c.client_name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => selectedClient && retrainCheck.mutate(selectedClient)}
                      disabled={!selectedClient || retrainCheck.isPending}
                      className="btn-primary px-3 py-1.5 text-xs disabled:opacity-50"
                    >
                      {retrainCheck.isPending ? (
                        <RefreshCw size={12} className="animate-spin" />
                      ) : (
                        t("system.checkRetraining")
                      )}
                    </button>
                  </div>
                )}
                {retrainCheck.data && (
                  <div
                    className={cn(
                      "rounded-lg border p-3 text-xs",
                      retrainCheck.data.should_retrain
                        ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20"
                        : "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20",
                    )}
                  >
                    <p
                      className={cn(
                        "font-semibold",
                        retrainCheck.data.should_retrain
                          ? "text-amber-700 dark:text-amber-400"
                          : "text-emerald-700 dark:text-emerald-400",
                      )}
                    >
                      {retrainCheck.data.should_retrain ? (
                        <AlertTriangle size={12} className="mr-1 inline" />
                      ) : (
                        <CheckCircle2 size={12} className="mr-1 inline" />
                      )}
                      {retrainCheck.data.should_retrain
                        ? t("system.shouldRetrain")
                        : t("system.noRetrain")}
                    </p>
                    <div className="mt-2 space-y-1">
                      {retrainCheck.data.results.map((r) => (
                        <div key={r.trigger_name} className="flex items-center gap-2">
                          {r.triggered ? (
                            <AlertTriangle size={10} className="text-amber-500" />
                          ) : (
                            <CheckCircle2 size={10} className="text-emerald-500" />
                          )}
                          <span className="text-surface-600 dark:text-surface-300">
                            {r.trigger_name}: {r.reason}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : retraining.isLoading ? (
              <div className="animate-pulse h-20 rounded bg-surface-200 dark:bg-surface-700" />
            ) : (
              <p className="text-sm text-red-500">{retraining.error?.message}</p>
            )}
          </div>

          {/* Feedback & Labels */}
          <div className="card space-y-4 p-5">
            <SectionTitle icon={BarChart3}>{t("system.feedback")}</SectionTitle>
            {fb ? (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <Stat label={t("system.totalLabeled")} value={formatNumber(fb.total_labeled)} />
                  <Stat label={t("system.fraudLabels")} value={formatNumber(fb.total_fraud)} />
                  <Stat label={t("system.legitLabels")} value={formatNumber(fb.total_legitimate)} />
                </div>
                {fb.total_labeled > 0 && (
                  <div className="h-3 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-400"
                      style={{ width: `${(fb.total_fraud / fb.total_labeled) * 100}%` }}
                    />
                  </div>
                )}
                {fb.per_client.length > 0 && (
                  <div className="space-y-1.5">
                    {fb.per_client.map((c) => (
                      <div key={c.client_name} className="flex items-center gap-2 text-xs">
                        <span className="min-w-0 flex-1 text-surface-600 dark:text-surface-300">
                          {c.client_name}
                        </span>
                        <span className="font-mono text-surface-900 dark:text-white">
                          {c.total}
                        </span>
                        <span className="font-mono text-red-500">{c.fraud} fraud</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : feedback.isLoading ? (
              <div className="animate-pulse h-20 rounded bg-surface-200 dark:bg-surface-700" />
            ) : (
              <p className="text-sm text-red-500">{feedback.error?.message}</p>
            )}
          </div>
        </div>

        {/* ── Row 5: Experiments + Reports ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Experiment Tracking (Comet ML) */}
          <div className="card space-y-4 p-5">
            <SectionTitle icon={FlaskConical}>{t("system.experiments")}</SectionTitle>
            {exp ? (
              <>
                {exp.workspace && (
                  <div className="flex gap-4 text-xs text-surface-400">
                    <span>
                      {t("system.workspace")}:{" "}
                      <strong className="text-surface-700 dark:text-surface-200">
                        {exp.workspace}
                      </strong>
                    </span>
                    {exp.project && (
                      <span>
                        {t("system.project")}:{" "}
                        <strong className="text-surface-700 dark:text-surface-200">
                          {exp.project}
                        </strong>
                      </span>
                    )}
                  </div>
                )}
                {exp.experiments.length === 0 ? (
                  <p className="text-xs text-surface-400">{t("system.noExperiments")}</p>
                ) : (
                  <div className="max-h-56 space-y-2 overflow-auto">
                    {exp.experiments.map((e) => (
                      <div
                        key={e.key || e.name}
                        className="rounded-lg border bg-surface-50 p-3 dark:border-surface-700 dark:bg-surface-800/50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-surface-900 dark:text-white">
                            {e.name}
                          </span>
                          {e.status && (
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-bold",
                                e.status === "finished"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
                              )}
                            >
                              {e.status}
                            </span>
                          )}
                        </div>
                        {Object.keys(e.metrics).length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                            {Object.entries(e.metrics)
                              .slice(0, 6)
                              .map(([k, v]) => (
                                <span key={k} className="text-[11px]">
                                  <span className="text-surface-400">{k}:</span>{" "}
                                  <span className="font-mono font-semibold text-surface-700 dark:text-surface-200">
                                    {v.toFixed(4)}
                                  </span>
                                </span>
                              ))}
                          </div>
                        )}
                        {e.tags.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {e.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded bg-surface-200 px-1.5 py-0.5 text-[10px] text-surface-500 dark:bg-surface-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : experiments.isLoading ? (
              <div className="animate-pulse h-20 rounded bg-surface-200 dark:bg-surface-700" />
            ) : (
              <p className="text-sm text-red-500">{experiments.error?.message}</p>
            )}
          </div>

          {/* Training Reports */}
          <div className="card space-y-4 p-5">
            <SectionTitle icon={FileText}>{t("system.reports")}</SectionTitle>
            {rep ? (
              rep.reports.length === 0 ? (
                <p className="text-xs text-surface-400">{t("system.noReports")}</p>
              ) : (
                <div className="max-h-56 space-y-1.5 overflow-auto">
                  {rep.reports.map((r) => (
                    <a
                      key={`${r.client_id}-${r.filename}`}
                      href={`/api/v1/admin/reports/${r.client_id}/${r.filename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg border bg-surface-50 p-2.5 text-xs transition-colors hover:bg-surface-100 dark:border-surface-700 dark:bg-surface-800/50 dark:hover:bg-surface-800"
                    >
                      <FileText size={14} className="shrink-0 text-brand-500" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-surface-900 dark:text-white">
                          {r.filename}
                        </p>
                        <p className="text-[11px] text-surface-400">
                          {r.client_id} &middot; {new Date(r.generated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] text-surface-400">
                        {r.size_bytes > 1024
                          ? `${(r.size_bytes / 1024).toFixed(0)} KB`
                          : `${r.size_bytes} B`}
                      </span>
                    </a>
                  ))}
                </div>
              )
            ) : reports.isLoading ? (
              <div className="animate-pulse h-20 rounded bg-surface-200 dark:bg-surface-700" />
            ) : (
              <p className="text-sm text-red-500">{reports.error?.message}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
