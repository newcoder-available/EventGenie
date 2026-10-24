/**
 * Probes against a running dev server: CSP, cross-origin refusal, error hygiene and rate limiting.
 *
 * Opt in with EVENTGENIE_LIVE=1 (or =burst to include the rate-limit burst,
 * which spends the hourly window).
 */

import assert from "node:assert/strict";
import test from "node:test";
import { buildContext } from "../src/lib/ai-service.ts";
import { demoState } from "./fixtures.mts";

const state = demoState;

const live = process.env.EVENTGENIE_LIVE === "1" || process.env.EVENTGENIE_LIVE === "burst";
const liveBurst = process.env.EVENTGENIE_LIVE === "burst";
const BASE = process.env.EVENTGENIE_BASE_URL ?? "http://localhost:3000";

const sampleBody = () => ({ context: buildContext(state), prompt: "Create a 6-month checklist" });

test("live: cross-origin POSTs are refused", { skip: !live }, async () => {
  const res = await fetch(`${BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://evil.example" },
    body: JSON.stringify(sampleBody()),
  });
  assert.equal(res.status, 403);
});

test("live: malformed input is rejected without leaking values", { skip: !live }, async () => {
  const res = await fetch(`${BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context: { city: "SECRETCITY" }, prompt: "x" }),
  });
  assert.notEqual(res.status, 429, "the hourly window is spent — restart the dev server first");
  assert.equal(res.status, 400);
  const body = await res.text();
  assert.ok(!body.includes("SECRETCITY"), "the error echoed a submitted value");
});

test("live: security headers are present", { skip: !live }, async () => {
  const res = await fetch(BASE);
  const csp = res.headers.get("content-security-policy") ?? "";
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /nonce-/);
  assert.match(csp, /object-src 'none'/);
  assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  assert.equal(res.headers.get("x-frame-options"), "DENY");
});

test("live: the generate endpoint rate-limits a burst", { skip: !liveBurst }, async () => {
  let limited = false;
  for (let i = 0; i < 24; i++) {
    const res = await fetch(`${BASE}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sampleBody()),
    });
    if (res.status === 429) {
      assert.ok(res.headers.get("retry-after"));
      limited = true;
      break;
    }
  }
  assert.ok(limited, "24 generate requests in a row were never rate-limited");
});
