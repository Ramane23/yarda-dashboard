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
  PredictionDetail,
} from "@/types/admin";
import type { Period } from "@/types/api";

const BASE = "/api/v1/admin";

async function fetchAdmin<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  method: "GET" | "POST" | "DELETE" = "GET",
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

// Pipeline flow — uses dashboard endpoint (needs X-Client-ID header)
export async function getPredictionDetail(requestId: string): Promise<PredictionDetail> {
  const url = new URL(`/api/v1/dashboard/predictions/${requestId}`, window.location.origin);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const viewAs = typeof window !== "undefined" ? localStorage.getItem("view_as_client") : null;
  const clientId =
    viewAs || (typeof window !== "undefined" ? localStorage.getItem("client_id") : null);
  if (clientId) headers["X-Client-ID"] = clientId;
  const res = await fetch(url.toString(), { headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `API error ${res.status}`);
  }
  return res.json();
}

// Client Onboarding
export interface OnboardClientRequest {
  client_id: string;
  client_name: string;
  operator_type: "mto" | "mmo";
  currency: string;
  corridors: string[];
  transaction_types: string[];
  thresholds?: { review: number; alert: number; block: number };
  min_labels_for_learning?: number;
  min_labels_for_classification?: number;
}

export interface OnboardClientResponse {
  client_id: string;
  success: boolean;
  message: string;
  phase: string;
}

export function onboardClient(data: OnboardClientRequest) {
  const url = new URL(`${BASE}/clients`, window.location.origin);
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
    if (!r.ok) throw new Error(body.detail || `Onboard failed: ${r.status}`);
    return body as OnboardClientResponse;
  });
}

// API Key Management
export interface ApiKeyItem {
  key_id: string;
  client_id: string;
  scopes: string[];
  created_at: string | null;
  expires_at: string | null;
  is_active: boolean;
}

export interface ApiKeyListResponse {
  total: number;
  keys: ApiKeyItem[];
}

export interface ApiKeyCreateResponse {
  api_key: string;
  key_id: string;
  client_id: string;
  scopes: string[];
  expires_at: string | null;
  created_at: string;
}

export function getApiKeys(clientId?: string) {
  return fetchAdmin<ApiKeyListResponse>(`${BASE}/api-keys`, { client_id: clientId });
}

export function createApiKey(data: {
  client_id: string;
  scopes?: string[];
  expires_in_days?: number;
  description?: string;
  send_to_email?: string;
}) {
  const url = new URL(`${BASE}/api-keys`, window.location.origin);
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
    if (!r.ok) throw new Error(body.detail || `Create API key failed: ${r.status}`);
    return body as ApiKeyCreateResponse;
  });
}

export function revokeApiKey(keyId: string) {
  return fetchAdmin<{ ok: boolean }>(`${BASE}/api-keys/${keyId}`, undefined, "DELETE");
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

export function deleteUser(userId: number) {
  return fetchAdmin<{ ok: boolean }>(`${BASE}/users/${userId}`, undefined, "DELETE");
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

export function inviteUser(data: {
  email: string;
  display_name?: string;
  role: string;
  client_id?: string;
}) {
  const url = new URL("/api/v1/auth/invite", window.location.origin);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(url.toString(), {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  }).then(async (r) => {
    const body = await r.json();
    if (!r.ok) throw new Error(body.detail || `Invite failed: ${r.status}`);
    return body;
  });
}
