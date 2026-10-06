/**
 * Session lifecycle for the dashboard: sign in, restore, sign out.
 *
 * The server is the source of truth for who the user is. Role and tenant are
 * taken from the API's responses, never from values the browser stored, so
 * editing browser storage cannot unlock admin screens (plan item SEC-33).
 */

import {
  API_BASE,
  apiFetch,
  refreshSession,
  toSessionUser,
  type SessionResponse,
} from "@/lib/http/api-client";
import { endSessionEverywhere, getAccessToken, setAccessToken } from "@/lib/http/session";
import { useAppStore } from "@/lib/store";

/** localStorage keys written by earlier versions of the dashboard. */
const LEGACY_STORAGE_KEYS = ["token", "client_id", "api_key", "user_role", "view_as_client"];

/** Remove credentials that previous versions left in localStorage. */
export function purgeLegacyStorage(): void {
  if (typeof window === "undefined") return;
  for (const key of LEGACY_STORAGE_KEYS) window.localStorage.removeItem(key);
}

/**
 * Sign in with email and password.
 *
 * @throws {ApiError} 401 for bad credentials, 429 when throttled.
 */
export async function signIn(email: string, password: string): Promise<void> {
  const session = await apiFetch<SessionResponse>(`${API_BASE}/auth/login`, {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  setAccessToken(session.token);
  useAppStore.getState().setUser(toSessionUser(session.user));
}

/**
 * Make sure this tab has a live session, restoring it from the refresh cookie
 * after a page load if needed.
 *
 * @returns `true` when the user is signed in.
 */
export async function ensureSession(): Promise<boolean> {
  if (getAccessToken() && useAppStore.getState().user) return true;
  return refreshSession();
}

/** Sign out on this device. Never throws: the local session is always cleared. */
export async function signOut(): Promise<void> {
  try {
    await apiFetch(`${API_BASE}/auth/logout`, { method: "POST", auth: false });
  } catch {
    // The server may be unreachable; the local session is cleared regardless.
  } finally {
    endSessionEverywhere();
  }
}
