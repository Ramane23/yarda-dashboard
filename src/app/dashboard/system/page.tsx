"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Database,
  ExternalLink,
  Globe,
  FlaskConical,
  Layers,
  RefreshCw,
  Server,
  Shield,
  Users,
  UserPlus,
  XCircle,
  FileText,
  Cpu,
  BarChart3,
  Microscope,
} from "lucide-react";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/useT";
import { cn, formatNumber, formatMs } from "@/lib/utils";
import {
  getSystemHealth,
  getIngestionStats,
  getPhaseManagement,
  getModelRegistry,
  getRetrainingStatus,
  checkRetraining,
  getFeedbackStats,
  getExperiments,
  getReports,
  getAnomalyStatus,
  getFeatureStats,
  getUsers,
  registerUser,
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
  const viewAsClient = useAppStore((s) => s.viewAsClient);
  const t = useT();
  const queryClient = useQueryClient();

  // User management state
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    display_name: "",
    role: "client",
    client_id: "",
  });

  // Global queries (not client-filtered)
  const health = useQuery({ queryKey: ["admin-health"], queryFn: getSystemHealth, retry: 1 });
  const ingestion = useQuery({
    queryKey: ["admin-ingestion"],
    queryFn: getIngestionStats,
    retry: 1,
  });
  const phases = useQuery({ queryKey: ["admin-phases"], queryFn: getPhaseManagement, retry: 1 });
  const retraining = useQuery({
    queryKey: ["admin-retraining"],
    queryFn: getRetrainingStatus,
    retry: 1,
  });
  const experiments = useQuery({
    queryKey: ["admin-experiments"],
    queryFn: getExperiments,
    retry: 1,
  });

  // Client-filtered queries
  const models = useQuery({
    queryKey: ["admin-models", viewAsClient],
    queryFn: () => getModelRegistry(viewAsClient || undefined),
    retry: 1,
  });
  const feedback = useQuery({
    queryKey: ["admin-feedback", period, viewAsClient],
    queryFn: () => getFeedbackStats(period),
    retry: 1,
  });
  const reports = useQuery({
    queryKey: ["admin-reports", viewAsClient],
    queryFn: () => getReports(viewAsClient || undefined),
    retry: 1,
  });

  // Per-client queries (only when a client is selected)
  const anomaly = useQuery({
    queryKey: ["admin-anomaly", viewAsClient],
    queryFn: () => getAnomalyStatus(viewAsClient),
    enabled: !!viewAsClient,
    retry: 1,
  });
  const features = useQuery({
    queryKey: ["admin-features", viewAsClient],
    queryFn: () => getFeatureStats(viewAsClient),
    enabled: !!viewAsClient,
    retry: 1,
  });

  const retrainCheck = useMutation({
    mutationFn: (clientId: string) => checkRetraining(clientId),
  });

  // User management
  const users = useQuery({ queryKey: ["admin-users"], queryFn: getUsers, retry: 1 });
  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setShowAddUser(false);
      setNewUser({ email: "", password: "", display_name: "", role: "client", client_id: "" });
    },
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
  const ph = phases.data;
  const mod = models.data;
  const ret = retraining.data;
  const fb = feedback.data;
  const exp = experiments.data;
  const rep = reports.data;
  const anom = anomaly.data;
  const feat = features.data;

  const formatUptime = (s: number) => {
    const d = Math.floor(s / 86400);
    const hrs = Math.floor((s % 86400) / 3600);
    const mins = Math.floor((s % 3600) / 60);
    if (d > 0) return `${d}d ${hrs}h`;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
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
                          <CheckCircle2 size={12} className="mr-1 inline" />
                        ) : (
                          <XCircle size={12} className="mr-1 inline" />
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

        {/* ── Row 2: Client Phases + Model Registry ── */}
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
                  {ph.clients
                    .filter((c) => !viewAsClient || c.client_id === viewAsClient)
                    .map((c) => (
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

        {/* ── Row 3b: Anomaly Detector + Feature Pipeline (only when client selected) ── */}
        {viewAsClient && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Anomaly Detector */}
            <div className="card space-y-4 p-5">
              <SectionTitle icon={Microscope}>{t("system.anomaly")}</SectionTitle>
              {anom ? (
                <>
                  <div className="flex items-center gap-2">
                    <StatusDot ok={anom.is_fitted} />
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        anom.is_fitted
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-surface-400",
                      )}
                    >
                      {anom.is_fitted ? t("system.fitted") : t("system.notFitted")}
                    </span>
                  </div>
                  {anom.is_fitted && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {anom.contamination != null && (
                        <Stat label="Contamination" value={anom.contamination.toFixed(3)} />
                      )}
                      {anom.n_estimators != null && (
                        <Stat label="Estimators" value={anom.n_estimators} />
                      )}
                      {anom.n_samples_trained != null && (
                        <Stat label="Samples" value={formatNumber(anom.n_samples_trained)} />
                      )}
                      {anom.n_features != null && <Stat label="Features" value={anom.n_features} />}
                      {anom.threshold != null && (
                        <Stat label="Threshold" value={anom.threshold.toFixed(4)} />
                      )}
                    </div>
                  )}
                </>
              ) : anomaly.isLoading ? (
                <div className="animate-pulse h-16 rounded bg-surface-200 dark:bg-surface-700" />
              ) : (
                <p className="text-sm text-red-500">{anomaly.error?.message}</p>
              )}
            </div>

            {/* Feature Pipeline */}
            <div className="card space-y-4 p-5">
              <SectionTitle icon={Layers}>{t("system.features")}</SectionTitle>
              {feat ? (
                feat.feature_file ? (
                  <>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-surface-600 dark:text-surface-300">
                        {feat.feature_file}
                      </span>
                      {feat.last_modified && (
                        <span className="text-surface-400">
                          &middot; {new Date(feat.last_modified).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {feat.n_rows != null && (
                        <Stat label="Rows" value={formatNumber(feat.n_rows)} />
                      )}
                      {feat.n_features != null && <Stat label="Features" value={feat.n_features} />}
                    </div>
                    {feat.columns.length > 0 && (
                      <div className="max-h-40 space-y-1 overflow-auto">
                        {feat.columns.slice(0, 20).map((col) => (
                          <div key={col.name} className="flex items-center gap-2 text-[11px]">
                            <span className="min-w-0 flex-1 truncate font-mono text-surface-600 dark:text-surface-300">
                              {col.name}
                            </span>
                            <span className="rounded bg-surface-100 px-1 text-[10px] text-surface-400 dark:bg-surface-800">
                              {col.dtype}
                            </span>
                            {col.mean != null && (
                              <span className="font-mono text-surface-500">μ={col.mean}</span>
                            )}
                            {col.nulls > 0 && (
                              <span className="font-mono text-amber-500">{col.nulls} null</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-surface-400">No feature data available</p>
                )
              ) : features.isLoading ? (
                <div className="animate-pulse h-16 rounded bg-surface-200 dark:bg-surface-700" />
              ) : (
                <p className="text-sm text-red-500">{features.error?.message}</p>
              )}
            </div>
          </div>
        )}

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

                {/* Check retraining — uses viewAsClient or manual select */}
                {ph && ph.clients.length > 0 && (
                  <div className="flex items-center gap-2 border-t pt-3 dark:border-surface-700">
                    {viewAsClient ? (
                      <span className="flex-1 text-xs font-medium text-surface-600 dark:text-surface-300">
                        {ph.clients.find((c) => c.client_id === viewAsClient)?.client_name ||
                          viewAsClient}
                      </span>
                    ) : (
                      <select
                        value={retrainCheck.variables || ""}
                        onChange={(e) => e.target.value && retrainCheck.mutate(e.target.value)}
                        className="input-field flex-1 py-1.5 text-xs"
                      >
                        <option value="">{t("system.selectClient")}</option>
                        {ph.clients.map((c) => (
                          <option key={c.client_id} value={c.client_id}>
                            {c.client_name}
                          </option>
                        ))}
                      </select>
                    )}
                    <button
                      onClick={() => {
                        const cid = viewAsClient || (retrainCheck.variables as string);
                        if (cid) retrainCheck.mutate(cid);
                      }}
                      disabled={
                        (!viewAsClient && !retrainCheck.variables) || retrainCheck.isPending
                      }
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
                    {fb.per_client
                      .filter((c) => !viewAsClient || c.client_name === viewAsClient)
                      .map((c) => (
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
                      href={r.url || `/api/v1/admin/reports/${r.client_id}/${r.filename}`}
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
                      <ExternalLink size={12} className="shrink-0 text-surface-400" />
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

        {/* ── Row 6: User Management ── */}
        <div className="card space-y-4 p-5">
          <div className="flex items-center justify-between">
            <SectionTitle icon={Users}>{t("system.users")}</SectionTitle>
            <button
              onClick={() => setShowAddUser(!showAddUser)}
              className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs"
            >
              <UserPlus size={14} />
              {t("system.addUser")}
            </button>
          </div>

          {/* Add User Form */}
          {showAddUser && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                registerMutation.mutate({
                  email: newUser.email,
                  password: newUser.password,
                  display_name: newUser.display_name || undefined,
                  role: newUser.role,
                  client_id: newUser.client_id || undefined,
                });
              }}
              className="rounded-lg border bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-800/50"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-surface-500">
                    {t("system.userEmail")} *
                  </label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="input-field w-full py-1.5 text-sm"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-surface-500">
                    {t("system.userPassword")} *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="input-field w-full py-1.5 text-sm"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-surface-500">
                    {t("system.userName")}
                  </label>
                  <input
                    type="text"
                    value={newUser.display_name}
                    onChange={(e) => setNewUser({ ...newUser, display_name: e.target.value })}
                    className="input-field w-full py-1.5 text-sm"
                    placeholder="Display name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-surface-500">
                    {t("system.userRole")}
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="input-field w-full py-1.5 text-sm"
                  >
                    <option value="client">Client</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-surface-500">
                    {t("system.userClient")}
                  </label>
                  <select
                    value={newUser.client_id}
                    onChange={(e) => setNewUser({ ...newUser, client_id: e.target.value })}
                    className="input-field w-full py-1.5 text-sm"
                  >
                    <option value="">{t("system.noClient")}</option>
                    {ph?.clients.map((c) => (
                      <option key={c.client_id} value={c.client_id}>
                        {c.client_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="btn-primary w-full py-1.5 text-sm disabled:opacity-50"
                  >
                    {registerMutation.isPending ? (
                      <RefreshCw size={14} className="mx-auto animate-spin" />
                    ) : (
                      t("system.addUser")
                    )}
                  </button>
                </div>
              </div>
              {registerMutation.isError && (
                <p className="mt-2 text-xs text-red-500">
                  {registerMutation.error?.message || "Registration failed"}
                </p>
              )}
              {registerMutation.isSuccess && (
                <p className="mt-2 text-xs text-emerald-600">User created successfully</p>
              )}
            </form>
          )}

          {/* User List */}
          {users.data ? (
            users.data.users.length === 0 ? (
              <p className="text-xs text-surface-400">No users found</p>
            ) : (
              <div className="overflow-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-left text-surface-400 dark:border-surface-700">
                      <th className="pb-2 pr-4 font-medium">{t("system.userEmail")}</th>
                      <th className="pb-2 pr-4 font-medium">{t("system.userName")}</th>
                      <th className="pb-2 pr-4 font-medium">{t("system.userRole")}</th>
                      <th className="pb-2 pr-4 font-medium">{t("system.userClient")}</th>
                      <th className="pb-2 font-medium">{t("system.userCreated")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.data.users.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-surface-100 dark:border-surface-800"
                      >
                        <td className="py-2.5 pr-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full",
                                u.is_active ? "bg-emerald-500" : "bg-surface-300",
                              )}
                            />
                            <span className="font-medium text-surface-900 dark:text-white">
                              {u.email}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 pr-4 text-surface-600 dark:text-surface-300">
                          {u.display_name || "—"}
                        </td>
                        <td className="py-2.5 pr-4">
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-bold",
                              u.role === "admin"
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
                            )}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4 text-surface-600 dark:text-surface-300">
                          {u.client_name || t("system.noClient")}
                        </td>
                        <td className="py-2.5 text-surface-400">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : users.isLoading ? (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 rounded bg-surface-200 dark:bg-surface-700" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-red-500">{users.error?.message}</p>
          )}
        </div>
      </div>
    </>
  );
}
