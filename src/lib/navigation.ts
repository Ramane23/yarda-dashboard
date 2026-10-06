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
