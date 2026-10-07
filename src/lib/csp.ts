/**
 * Content Security Policy of the dashboard (plan item SEC-32).
 *
 * Scripts must carry the per-request nonce (`'strict-dynamic'` lets them
 * load their own chunks), so an injected `<script>` or inline handler never
 * runs. The API is reached through the same-origin `/api` proxy, so
 * `connect-src 'self'` is enough. Inline *style attributes* stay allowed:
 * charting and layout libraries set them, and they cannot run code.
 */

/** Response header names, shared by the middleware and its tests. */
export const CSP_HEADER = "Content-Security-Policy";
export const NONCE_HEADER = "x-nonce";

/**
 * Build the policy for one response.
 *
 * @param nonce - Fresh, unpredictable value for this response (base64).
 * @param development - Allows `'unsafe-eval'`, which React's dev tooling needs.
 */
export function buildCsp(nonce: string, development: boolean): string {
  const scriptSrc = [`'self'`, `'nonce-${nonce}'`, `'strict-dynamic'`];
  if (development) scriptSrc.push(`'unsafe-eval'`);
  const directives: Record<string, string[]> = {
    "default-src": [`'self'`],
    "script-src": scriptSrc,
    "style-src": [`'self'`, `'unsafe-inline'`],
    "img-src": [`'self'`, "data:", "blob:"],
    "font-src": [`'self'`],
    "connect-src": [`'self'`],
    "object-src": [`'none'`],
    "base-uri": [`'self'`],
    "form-action": [`'self'`],
    "frame-ancestors": [`'none'`],
  };
  const policy = Object.entries(directives).map(([name, values]) => `${name} ${values.join(" ")}`);
  if (!development) policy.push("upgrade-insecure-requests");
  return policy.join("; ");
}

/** Return a 128-bit random nonce, base64-encoded. */
export function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}
