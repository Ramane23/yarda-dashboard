import type {
  DashboardStats,
  PaginatedTransactions,
  AnalyticsData,
  PaginatedReviewQueue,
  ModelsResponse,
  FeedbackSummary,
  PhaseProgress,
  Period,
  Decision,
  SortOrder,
} from "@/types/api";

const BASE = "/api/v1/dashboard";

async function fetchAPI<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
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

  // Client ID from localStorage or env
  const clientId = typeof window !== "undefined" ? localStorage.getItem("client_id") : null;
  if (clientId) headers["X-Client-ID"] = clientId;

  const apiKey = typeof window !== "undefined" ? localStorage.getItem("api_key") : null;
  if (apiKey) headers["X-API-Key"] = apiKey;

  const res = await fetch(url.toString(), { headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `API error ${res.status}`);
  }

  return res.json();
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

export function getFeedbackSummary(period: Period = "30d") {
  return fetchAPI<FeedbackSummary>(`${BASE}/feedback-summary`, { period });
}

export function getPhaseProgress() {
  return fetchAPI<PhaseProgress>(`${BASE}/phase-progress`);
}

export function submitFeedback(
  requestId: string,
  feedback: { is_fraud: boolean; fraud_type?: string; notes?: string },
) {
  const url = new URL(`/api/v1/predictions/${requestId}/feedback`, window.location.origin);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const clientId = typeof window !== "undefined" ? localStorage.getItem("client_id") : null;
  if (clientId) headers["X-Client-ID"] = clientId;
  const apiKey = typeof window !== "undefined" ? localStorage.getItem("api_key") : null;
  if (apiKey) headers["X-API-Key"] = apiKey;
  return fetch(url.toString(), { method: "POST", headers, body: JSON.stringify(feedback) }).then(
    (r) => {
      if (!r.ok) throw new Error(`Feedback failed: ${r.status}`);
      return r.json();
    },
  );
}
