import type {
  ImpactMetrics,
  IngestionStats,
  ModelRegistry,
  PhaseManagement,
  ReportList,
  SystemHealth,
  RetrainingStatus,
  RetrainingCheck,
  AnomalyDetectorStatus,
  FeedbackStats,
  TuningResults,
  ExperimentList,
  FeatureStats,
} from "@/types/admin";
import type { Period } from "@/types/api";

const BASE = "/api/v1/admin";

async function fetchAdmin<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  method: "GET" | "POST" = "GET",
): Promise<T> {
  const url = new URL(path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Admin uses the same API key from localStorage
  const apiKey = typeof window !== "undefined" ? localStorage.getItem("api_key") : null;
  if (apiKey) headers["X-API-Key"] = apiKey;

  const res = await fetch(url.toString(), { method, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Admin API error ${res.status}`);
  }

  return res.json();
}

// Tier 1
export function getImpactMetrics(period: Period = "30d", clientId?: string) {
  return fetchAdmin<ImpactMetrics>(`${BASE}/impact`, { period, client_id: clientId });
}

export function getIngestionStats() {
  return fetchAdmin<IngestionStats>(`${BASE}/ingestion`);
}

export function getModelRegistry(clientId?: string) {
  return fetchAdmin<ModelRegistry>(`${BASE}/models`, { client_id: clientId });
}

export function getPhaseManagement() {
  return fetchAdmin<PhaseManagement>(`${BASE}/clients/phases`);
}

export function getReports(clientId?: string) {
  return fetchAdmin<ReportList>(`${BASE}/reports`, { client_id: clientId });
}

export function getSystemHealth() {
  return fetchAdmin<SystemHealth>(`${BASE}/system/health`);
}

// Tier 2
export function getAnomalyStatus(clientId: string) {
  return fetchAdmin<AnomalyDetectorStatus>(`${BASE}/anomaly/${clientId}`);
}

export function getRetrainingStatus() {
  return fetchAdmin<RetrainingStatus>(`${BASE}/retraining/status`);
}

export function checkRetraining(clientId: string) {
  return fetchAdmin<RetrainingCheck>(`${BASE}/retraining/check/${clientId}`, undefined, "POST");
}

export function getFeedbackStats(period: Period = "30d") {
  return fetchAdmin<FeedbackStats>(`${BASE}/feedback/stats`, { period });
}

export function getTuningResults(clientId: string) {
  return fetchAdmin<TuningResults>(`${BASE}/tuning/${clientId}`);
}

// Tier 3
export function getExperiments() {
  return fetchAdmin<ExperimentList>(`${BASE}/experiments`);
}

export function getFeatureStats(clientId: string) {
  return fetchAdmin<FeatureStats>(`${BASE}/features/${clientId}`);
}
