import type {
  DashboardStats,
  PaginatedTransactions,
  AnalyticsData,
  PaginatedReviewQueue,
  ModelsResponse,
  FeedbackSummary,
  PhaseProgress,
  ScoringConfig,
  ProductionModelsResponse,
  TrainingDataResponse,
  Period,
  Decision,
  SortOrder,
} from "@/types/api";

import { API_BASE, apiFetch } from "@/lib/http/api-client";

const BASE = `${API_BASE}/dashboard`;

type Params = Record<string, string | number | boolean | undefined>;

function fetchAPI<T>(path: string, params?: Params): Promise<T> {
  return apiFetch<T>(path, { params });
}

// ---- Dashboard endpoints ----

export function getStats(period: Period = "7d") {
  return fetchAPI<DashboardStats>(`${BASE}/stats`, { period });
}

export function getTransactions(
  opts: {
    period?: Period;
    decision?: Decision;
    min_score?: number;
    max_score?: number;
    labeled?: boolean;
    page?: number;
    page_size?: number;
    sort?: SortOrder;
  } = {},
) {
  return fetchAPI<PaginatedTransactions>(
    `${BASE}/transactions`,
    opts as Record<string, string | number | boolean>,
  );
}

export function getAnalytics(period: Period = "30d") {
  return fetchAPI<AnalyticsData>(`${BASE}/analytics`, { period });
}

export function getReviewQueue(
  opts: {
    period?: Period;
    min_score?: number;
    page?: number;
    page_size?: number;
  } = {},
) {
  return fetchAPI<PaginatedReviewQueue>(
    `${BASE}/review-queue`,
    opts as Record<string, string | number | boolean>,
  );
}

export function getModels() {
  return fetchAPI<ModelsResponse>(`${BASE}/models`);
}

export function getProductionModels() {
  return fetchAPI<ProductionModelsResponse>(`${BASE}/models/production`);
}

export function getFeedbackSummary(period: Period = "30d") {
  return fetchAPI<FeedbackSummary>(`${BASE}/feedback-summary`, { period });
}

export function getPhaseProgress() {
  return fetchAPI<PhaseProgress>(`${BASE}/phase-progress`);
}

export function getScoringConfig() {
  return fetchAPI<ScoringConfig>(`${BASE}/scoring-config`);
}

export interface ImpactData {
  confirmed_fraud_intercepted: number;
  confirmed_fraud_count: number;
  amount_under_surveillance: number;
  surveillance_count: number;
  total_amount_processed: number;
  total_transactions: number;
  currency: string;
}

export function getImpact(period: Period = "30d") {
  return fetchAPI<ImpactData>(`${BASE}/impact`, { period });
}

export function getTrainingData(page = 1, pageSize = 50) {
  return fetchAPI<TrainingDataResponse>(`${BASE}/training-data`, { page, page_size: pageSize });
}

/** One page of the engineered feature matrix with labels (admins only). */
export interface TrainingTablePage {
  client_id: string;
  total: number;
  page: number;
  page_size: number;
  pages: number;
  feature_columns: string[];
  rows: Record<string, unknown>[];
}

export function getTrainingTable(page: number, pageSize: number) {
  return fetchAPI<TrainingTablePage>(`${BASE}/training-data/table`, { page, page_size: pageSize });
}

/** Start a training run for the tenant being viewed (admins only). */
export function triggerTraining() {
  return apiFetch<{ client_id: string; message: string }>(`${BASE}/trigger-training`, {
    method: "POST",
  });
}

export function submitFeedback(requestId: string, feedback: { label: string; notes?: string }) {
  return apiFetch<{ status: string; request_id: string }>(
    `${API_BASE}/predictions/${encodeURIComponent(requestId)}/feedback`,
    { method: "POST", body: feedback },
  );
}
