import { NextResponse, type NextRequest } from "next/server";
import { CSP_HEADER, NONCE_HEADER, buildCsp, generateNonce } from "@/lib/csp";

/**
 * Attach a per-request nonce and the Content Security Policy to every page.
 *
 * Next.js reads the policy from the *request* headers to stamp its own
 * scripts with the nonce; the root layout reads `x-nonce` for the theme
 * script. The same policy is sent on the response.
 */
export function middleware(request: NextRequest): NextResponse {
  const nonce = generateNonce();
  const policy = buildCsp(nonce, process.env.NODE_ENV === "development");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(NONCE_HEADER, nonce);
  requestHeaders.set(CSP_HEADER, policy);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set(CSP_HEADER, policy);
  return response;
}

export const config = {
  // Pages only: API proxy calls, static assets and images need no nonce.
  matcher: [
    {
      source: "/((?!api/|_next/static|_next/image|favicon.ico|icon.png).*)",
      missing: [{ type: "header", key: "next-router-prefetch" }],
    },
  ],
};
