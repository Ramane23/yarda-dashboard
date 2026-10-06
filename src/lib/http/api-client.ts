/**
 * The single HTTP client for the YARDA API.
 *
 * Every request from the dashboard goes through {@link apiFetch}. It:
 * - sends the in-memory access token as `Authorization: Bearer`;
 * - sends `X-Client-ID` only when an admin is viewing a specific tenant (a
 *   client user's tenant is bound to their session on the server);
 * - on a 401, refreshes the session once (the refresh token travels in an
 *   httpOnly cookie) and retries the request; concurrent 401s share one
 *   refresh;
 * - turns any non-2xx response into a typed {@link ApiError}, reading the
 *   API's `{ error: { code, message } }` envelope.
 *
 * Before this module the same header-building code was copy-pasted about ten
 * times with small inconsistencies (plan items DSH-10, DSH-11).
 */

import { getAccessToken, onSessionExpired, setAccessToken } from "@/lib/http/session";
import { useAppStore, type SessionUser } from "@/lib/store";

/** Base path of the API, proxied to the backend by `next.config.ts`. */
export const API_BASE = "/api/v1";

/** Header that marks requests as coming from the browser dashboard. */
const CLIENT_HEADER = { "X-Requested-With": "yarda-dashboard" } as const;

type QueryValue = string | number | boolean | undefined | null;

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  /** Query-string parameters; `undefined` and `null` values are omitted. */
  params?: Record<string, QueryValue>;
  /** JSON body. */
  body?: unknown;
  /** Set to `false` for endpoints that must not trigger a refresh (login, refresh itself). */
  auth?: boolean;
}

/** An error response from the API, or a network failure (`status === 0`). */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** True when the user must sign in again. */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

/** Shape of `/auth/login` and `/auth/refresh` responses. */
export interface SessionResponse {
  token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: number;
    email: string;
    display_name: string | null;
    role: string;
    client_id: string | null;
    client_name: string | null;
  };
}

/** Convert the API's user payload into the store's {@link SessionUser}. */
export function toSessionUser(user: SessionResponse["user"]): SessionUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    role: user.role === "admin" ? "admin" : "client",
    clientId: user.client_id,
    clientName: user.client_name,
  };
}

function buildUrl(path: string, params?: Record<string, QueryValue>): string {
  const url = new URL(path.startsWith("/") ? path : `${API_BASE}/${path}`, window.location.origin);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

function buildHeaders(hasBody: boolean): Headers {
  const headers = new Headers(CLIENT_HEADER);
  if (hasBody) headers.set("Content-Type", "application/json");

  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const { user, viewAsClient } = useAppStore.getState();
  if (user?.role === "admin" && viewAsClient) headers.set("X-Client-ID", viewAsClient);
  return headers;
}

async function toApiError(response: Response): Promise<ApiError> {
  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    // Non-JSON body (e.g. a proxy error page): fall through to a generic message.
  }
  const envelope = (payload as { error?: { code?: string; message?: string; details?: unknown } })
    ?.error;
  const legacyDetail = (payload as { detail?: unknown })?.detail;
  const message =
    envelope?.message ??
    (typeof legacyDetail === "string" ? legacyDetail : null) ??
    `Request failed (${response.status})`;
  return new ApiError(response.status, envelope?.code ?? "HTTP_ERROR", message, envelope?.details);
}

async function send(path: string, options: ApiRequestOptions): Promise<Response> {
  const hasBody = options.body !== undefined;
  try {
    return await fetch(buildUrl(path, options.params), {
      method: options.method ?? (hasBody ? "POST" : "GET"),
      headers: buildHeaders(hasBody),
      body: hasBody ? JSON.stringify(options.body) : undefined,
      credentials: "same-origin",
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Network error: the API could not be reached.");
  }
}

/**
 * Result of trying to renew the session.
 * - `refreshed`: a new access token is in memory;
 * - `expired`: the server rejected the refresh token; the session is over;
 * - `unavailable`: the API could not be reached or failed; the session is
 *   kept and the caller may retry later.
 */
export type RefreshOutcome = "refreshed" | "expired" | "unavailable";

let refreshInFlight: Promise<RefreshOutcome> | null = null;

/** HTTP statuses with which the API rejects a refresh token. */
const SESSION_REJECTED = new Set([401, 403]);

/**
 * Exchange the refresh cookie for a new access token.
 *
 * Concurrent callers share one request. Never rejects. Only an explicit
 * rejection by the API ends the session; a network error or server failure
 * leaves it in place so that a brief outage does not sign everyone out.
 */
export function refreshSession(): Promise<RefreshOutcome> {
  refreshInFlight ??= (async (): Promise<RefreshOutcome> => {
    try {
      const response = await send(`${API_BASE}/auth/refresh`, { method: "POST", auth: false });
      if (SESSION_REJECTED.has(response.status)) {
        onSessionExpired();
        return "expired";
      }
      if (!response.ok) return "unavailable";
      const session = (await response.json()) as SessionResponse;
      setAccessToken(session.token);
      useAppStore.getState().setUser(toSessionUser(session.user));
      return "refreshed";
    } catch {
      return "unavailable";
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

/**
 * Call the API and return the parsed JSON body.
 *
 * On a 401 the session is refreshed once and the request retried. If the
 * retried request is still rejected, the session is over (the user was
 * deactivated or signed out everywhere) and it is cleared.
 *
 * @throws {ApiError} for any non-2xx response or network failure.
 */
export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  let response = await send(path, options);

  if (response.status === 401 && options.auth !== false) {
    if ((await refreshSession()) === "refreshed") {
      response = await send(path, options);
      if (response.status === 401) onSessionExpired();
    }
  }
  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
