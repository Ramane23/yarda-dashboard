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

  // JWT Bearer token (primary auth)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Legacy API key fallback
  const apiKey = typeof window !== "undefined" ? localStorage.getItem("api_key") : null;
  if (apiKey && !token) headers["X-API-Key"] = apiKey;

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

// User Management
export interface UserItem {
  id: number;
  email: string;
  display_name: string | null;
  role: string;
  client_id: string | null;
  client_name: string | null;
  is_active: boolean;
  created_at: string | null;
}

export interface UserListResponse {
  total: number;
  users: UserItem[];
}

export function getUsers() {
  return fetchAdmin<UserListResponse>(`${BASE}/users`);
}

export function registerUser(data: {
  email: string;
  password: string;
  display_name?: string;
  role: string;
  client_id?: string;
}) {
  // Register goes through /auth/register, not /admin
  const url = new URL("/api/v1/auth/register", window.location.origin);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const apiKey = typeof window !== "undefined" ? localStorage.getItem("api_key") : null;
  if (apiKey && !token) headers["X-API-Key"] = apiKey;
  return fetch(url.toString(), {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  }).then(async (r) => {
    const body = await r.json();
    if (!r.ok) throw new Error(body.detail || `Register failed: ${r.status}`);
    return body;
  });
}
