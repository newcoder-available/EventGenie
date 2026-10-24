import { NextResponse, type NextRequest } from "next/server";

/**
* Per-request Content-Security-Policy with a fresh nonce (Next 16 proxy).
 *
 * Next.js reads the nonce back out of this header and stamps it onto the
 * scripts it injects, so `strict-dynamic` holds without an allowlist. The
 * static headers (HSTS, frame options, permissions) live in next.config.ts —
 * only the nonce needs to be minted per request.
 *
 * style-src keeps 'unsafe-inline' because the framework and Tailwind both
 * inject style elements that are not nonced. Scripts — the half that matters
 * for XSS — are nonce-gated.
 */
export function proxy(request: NextRequest) {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const dev = process.env.NODE_ENV !== "production";

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data:`,
    `font-src 'self' data:`,
    // The browser never talks to the model provider directly; only to us.
    `connect-src 'self'`,
    `object-src 'none'`,
    `base-uri 'none'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("content-security-policy", csp);
  return response;
}

export const config = {
  matcher: [
    // Everything except static assets and the favicon.
    {
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
