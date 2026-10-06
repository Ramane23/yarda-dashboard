/**
 * Holder for the current access token, kept in memory only.
 *
 * The access token is deliberately never written to localStorage or any
 * other storage that scripts can read later: a cross-site scripting bug
 * could otherwise steal a working credential (plan item SEC-31). After a page
 * reload the token is gone and is re-obtained from the httpOnly refresh
 * cookie by {@link refreshSession} in `api-client.ts`.
 *
 * Logouts are broadcast to the other tabs of the same browser so that they
 * drop their session too (plan item DSH-41).
 */

import { queryClient } from "@/lib/query-client";
import { useAppStore } from "@/lib/store";

let accessToken: string | null = null;

const CHANNEL_NAME = "yarda-auth";
type AuthMessage = { type: "logout" };

const channel: BroadcastChannel | null =
  typeof window !== "undefined" && "BroadcastChannel" in window
    ? new BroadcastChannel(CHANNEL_NAME)
    : null;

channel?.addEventListener("message", (event: MessageEvent<AuthMessage>) => {
  if (event.data?.type === "logout") clearLocalSession();
});

/** Current access token, or `null` when signed out or not yet restored. */
export function getAccessToken(): string | null {
  return accessToken;
}

/** Store a freshly issued access token. */
export function setAccessToken(token: string): void {
  accessToken = token;
}

/**
 * Forget the session in this tab only, including every cached API response:
 * the next user signing in here must never see the previous user's data.
 */
function clearLocalSession(): void {
  accessToken = null;
  queryClient.clear();
  useAppStore.getState().clearUser();
}

/** The refresh token was rejected: the session is over in this tab. */
export function onSessionExpired(): void {
  clearLocalSession();
}

/** End the session in this tab and tell the other tabs to do the same. */
export function endSessionEverywhere(): void {
  clearLocalSession();
  channel?.postMessage({ type: "logout" } satisfies AuthMessage);
}
