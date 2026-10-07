/**
 * Navigation helpers that must be safe against attacker-controlled input.
 */

/** Where to go after sign-in when no valid destination was requested. */
export const DEFAULT_AFTER_LOGIN = "/dashboard";

/**
 * Return `raw` as a same-origin path, or {@link DEFAULT_AFTER_LOGIN}.
 *
 * `raw` comes from the `?next=` query parameter, which anyone can put in a
 * link. Checking for a leading `/` is not enough: browsers treat `/\evil.com`
 * and `//evil.com` as other hosts. The value is therefore resolved against
 * the current origin and accepted only if it stays on that origin.
 *
 * @param raw - The requested destination, possibly `null`.
 * @param origin - The current origin (injectable for tests).
 */
export function safeNextPath(
  raw: string | null,
  origin: string = typeof window === "undefined" ? "http://localhost" : window.location.origin,
): string {
  if (!raw || !raw.startsWith("/")) return DEFAULT_AFTER_LOGIN;
  try {
    const target = new URL(raw, origin);
    if (target.origin !== origin) return DEFAULT_AFTER_LOGIN;
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return DEFAULT_AFTER_LOGIN;
  }
}

/** What the set-password page was opened for. */
export type SetPasswordMode = "invite" | "reset" | "forgot";

/** The one-time token and mode carried by a set-password link. */
export interface SetPasswordLink {
  token: string | null;
  mode: SetPasswordMode;
}

/**
 * Read the token and mode from a set-password link.
 *
 * Emails put them in the URL fragment (`#token=...&mode=reset`), which
 * browsers never send to a server, so the token stays out of access logs
 * and `Referer` headers. Links sent before that change used the query
 * string; it is still read so they keep working until they expire.
 *
 * @param hash - `location.hash`, with or without the leading `#`.
 * @param search - `location.search`, with or without the leading `?`.
 */
export function readSetPasswordLink(hash: string, search: string): SetPasswordLink {
  const fromHash = new URLSearchParams(hash.replace(/^#/, ""));
  const params = fromHash.has("token") ? fromHash : new URLSearchParams(search.replace(/^\?/, ""));
  const token = params.get("token") || null;
  const mode: SetPasswordMode = !token
    ? "forgot"
    : params.get("mode") === "reset"
      ? "reset"
      : "invite";
  return { token, mode };
}
