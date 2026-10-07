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

import { API_BASE, apiFetch } from "@/lib/http/api-client";

const BASE = `${API_BASE}/admin`;

type Params = Record<string, string | number | boolean | undefined>;

function fetchAdmin<T>(
  path: string,
  params?: Params,
  method: "GET" | "POST" | "DELETE" = "GET",
): Promise<T> {
  return apiFetch<T>(path, { params, method });
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

/** A signed link that downloads one report without credentials. */
export interface ReportLink {
  /** Path under the API root, e.g. `/v1/reports/download?token=...`. */
  url: string;
  expires_at: string;
}

/**
 * Ask the API for a one-minute download link to a report.
 *
 * A link the browser opens directly cannot carry the access token, so the
 * dashboard requests a signed link (authenticated) and then navigates to it.
 *
 * @returns The URL to open, already prefixed with the dashboard's API proxy.
 */
export async function getReportDownloadUrl(clientId: string, filename: string): Promise<string> {
  const path = `${BASE}/reports/${encodeURIComponent(clientId)}/${encodeURIComponent(filename)}/link`;
  const link = await apiFetch<ReportLink>(path, { method: "POST" });
  return `${API_BASE.replace(/\/v1$/, "")}${link.url}`;
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

// Pipeline flow (dashboard endpoint, scoped to the tenant being viewed)
export function getPredictionDetail(requestId: string): Promise<PredictionDetail> {
  return apiFetch<PredictionDetail>(
    `${API_BASE}/dashboard/predictions/${encodeURIComponent(requestId)}`,
  );
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
  return apiFetch<OnboardClientResponse>(`${BASE}/clients`, { method: "POST", body: data });
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
}) {
  return apiFetch<ApiKeyCreateResponse>(`${BASE}/api-keys`, { method: "POST", body: data });
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

/** Create a user with a password chosen by the admin. Prefer {@link inviteUser}. */
export function registerUser(data: {
  email: string;
  password: string;
  display_name?: string;
  role: string;
  client_id?: string;
}) {
  return apiFetch(`${API_BASE}/auth/register`, { method: "POST", body: data });
}

/** Create a user and email them a link to choose their password. */
export function inviteUser(data: {
  email: string;
  display_name?: string;
  role: string;
  client_id?: string;
}) {
  return apiFetch(`${API_BASE}/auth/invite`, { method: "POST", body: data });
}

/** Clients known to the platform, for the admin's tenant selector. */
export async function getClientOptions(): Promise<{ client_id: string; client_name: string }[]> {
  const data = await getPhaseManagement();
  return data.clients.map((c) => ({ client_id: c.client_id, client_name: c.client_name }));
}
