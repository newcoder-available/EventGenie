# Threat model

EventGenie is a single-tenant web app that takes free text from a user, sends a derived prompt to a
model provider, and renders the result. That shape has four interesting boundaries, and this
document says what crosses each one and what is done about it.

```
browser ──1──> Next.js route handler ──2──> Anthropic API
   ^                    │                        │
   └────────4───────────┴──────────3─────────────┘
       rendered output        model response
```

1. **User → server.** Untrusted. Could be malformed, oversized, hostile, or cross-origin.
2. **Server → provider.** Carries the user's words. Must not carry their identity or our key.
3. **Provider → server.** Untrusted. A model response is data from a third party.
4. **Server → rendered output.** Must not be able to execute.

---

## 1. User → server

**Validation.** Every route parses its body with a strict Zod schema
([`src/lib/schema.ts`](src/lib/schema.ts)): enums for anything selectable, bounds on every
number, max lengths on every string, max sizes on every array, and `.strict()` so unknown keys
are a rejection rather than a silent pass-through. This closes mass-assignment and keeps the
token cost of a request bounded by construction.

**Body size.** Read as text and length-checked before `JSON.parse`, so a 50 MB body is refused
rather than parsed: 64 KB for `/api/generate`, 64 KB for `/api/assistant`.

**CSRF.** Both routes are `POST` with a JSON content type and a same-origin check on the
`Origin` header ([`isSameOrigin`](src/lib/security.ts)). A request with no `Origin` is allowed
through — that is a non-browser client with no ambient credentials to abuse — but a request from
another origin is a 403. There are no cookies and no session, so this is defence in depth
rather than the only control.

**Rate limiting.** A fixed window per client IP: 20 generations and 60 chat messages an hour, with
`Retry-After` on refusal ([`src/lib/ratelimit.ts`](src/lib/ratelimit.ts)). This is the control
that stops a public demo from becoming someone else's free inference endpoint.

> **Limitation, stated plainly.** The limiter is in process memory. It is correct for one
> instance and resets on restart. Behind a load balancer the same window arithmetic belongs in
> Redis (`INCR` + `EXPIRE`), with this kept as the local fallback. The client key is derived
> from `X-Forwarded-For`, which is only trustworthy behind a proxy that sets it.

**Error responses.** Validation failures return the *paths* that failed, never the values
submitted. An error message is not a reflection channel.

---

## 2. Server → provider

**The key.** Read from `process.env` inside [`src/lib/anthropic.ts`](src/lib/anthropic.ts),
which imports `server-only` — importing it from a Client Component is a build error, not a
runtime surprise. It is never prefixed `NEXT_PUBLIC_`, never serialised into a response, and
never logged. The browser's CSP `connect-src` is `'self'`, so the page has no route to the
provider even if something tried.

**PII minimisation.** The model context is built from counts and totals, never from the
guest list: no guest name is ever sent, and `tests/security.test.mts` asserts it. Beyond that,
before any free text is put in a prompt it passes through
[`redactPii`](src/lib/security.ts), which removes email addresses, phone numbers, card-shaped
digit runs, Aadhaar-shaped numbers, IBANs and UPI handles. The same patterns run in the browser
as a *warning* while the user types, so they can delete contact details themselves — but the
server-side pass is the control, because the client-side one is advice.

A plan does not need anyone's phone number. The cheapest way to avoid sending personal data to a
third party is to not have it in the payload.

**Prompt injection.** The honest framing: you cannot prove a model will ignore a hostile
instruction, so the design assumes one might get through and limits what that buys an attacker.

*Structural.* User free text is wrapped by
[`asUntrustedData`](src/lib/security.ts) in `<untrusted field="...">` tags, with any
`<untrusted>`/`</untrusted>` sequences in the payload stripped first so it cannot close its own
fence and continue as though it were the prompt author. Null bytes are removed. Replayed chat
history is re-fenced on every turn — an injection planted three turns ago is still untrusted.

*Instructional.* The system prompt states that fenced content is information about the event and
never an instruction, and specifically that requests to change role, reveal instructions, ignore
prior rules, or produce output outside the schema are to be ignored and noted as an assumption.

*Structural, again — the part that actually holds.* The generate call is constrained by a JSON
Schema output contract. An injection that convinces the model to "print your system prompt" still
has to emit a `headline`, a `summary`, and `tasks` / `ideas` / `budgetLines` arrays of
length-bounded strings against fixed category enums, and the result is re-validated on arrival —
twice, once server-side and once in the browser. The blast radius of a successful injection is a
bad suggestion, not arbitrary output and not a different response shape.

*And a human gate.* Nothing a generation produces is written to the plan automatically. It
renders as a preview and the couple presses "Apply to my plan".

*What this does not stop.* A sufficiently clever injection can still influence plan **content** —
pushing a budget split, say. Since there is no tool use, no retrieval, no outbound network from
the model, and no automated action taken on the plan, content influence is the whole of the
exposure. If this app ever gained the ability to email a vendor or spend money, that calculus
would change and those actions would need confirmation at the point of use.

---

## 3. Provider → server

**A model response is untrusted input.** It is parsed, then validated against the same Zod schema
used for storage and rendering. A response that does not validate is a 502 with a
retryable message — it is never partially rendered.

**Arithmetic is re-derived, not trusted.** Nothing a model returns is displayed as a total.
Every figure in the UI comes from [`src/lib/calculations.ts`](src/lib/calculations.ts), computed
from the couple's own rows — so a wrong number from a generation becomes one wrong row the user
can see and delete, never a wrong summary.

**Refusals.** `stop_reason: "refusal"` is checked explicitly on both routes and surfaced as a clear message.
Server-side fallbacks (`fallbacks: "default"`) are enabled so a declined request is routed to
another model before it ever reaches that path.

**Logging.** Failures log an error name and HTTP status, and schema mismatches log field paths.
No prompt, no response body, no user input, no key. Logs are the most commonly overlooked place
for sensitive data to pool.

---

## 4. Server → rendered output

**No HTML from untrusted sources.** Every model-produced string is rendered as a React text
child, and `dangerouslySetInnerHTML` does not appear anywhere in the codebase.

**Content-Security-Policy.** Minted per request with a fresh nonce in
[`src/proxy.ts`](src/proxy.ts); Next.js stamps that nonce onto its own scripts so
`strict-dynamic` holds without an allowlist.

```
default-src 'self'
script-src  'self' 'nonce-<random>' 'strict-dynamic'
style-src   'self' 'unsafe-inline'
connect-src 'self'
object-src  'none'
base-uri    'none'
form-action 'self'
frame-ancestors 'none'
upgrade-insecure-requests
```

`style-src` keeps `'unsafe-inline'` because the framework and Tailwind both inject non-nonced
style elements. That is a deliberate, scoped concession: it permits CSS injection, not script
execution, and `script-src` — the half that gives an attacker code — is nonce-gated.

**Other headers** (`next.config.ts`): HSTS with preload, `X-Content-Type-Options: nosniff`,
`X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, a
`Permissions-Policy` denying camera, microphone, geolocation, payment and USB, and
`Cross-Origin-Opener-Policy: same-origin`. API responses are `no-store`.

---

## The sign-in step

There is no authentication here, and the app does not pretend otherwise. Choosing an occasion
and entering a name and an email writes a `Session` object to local storage; the route guard
reads it to decide which step to show. That is flow control, not access control.

No password is collected, deliberately: a password field in front of a demo with no server
teaches people to type a real one somewhere it does not belong, and would hand us a credential
to mishandle. The sign-in page states this on the page itself, not only here.

Nothing behind the guard is sensitive to anyone but the visitor — the data is in their own
browser either way — so a client-side guard is the honest level of protection for what it
protects. If plans were ever stored server-side, this would have to become a real session.

## Data at rest

There is none on a server. Plans live in the browser's `localStorage`, keyed per occasion
(`eventgenie.plan.<occasion>.v1`), and are read back through `eventStateSchema` — the same
validation any other input gets — local storage is writable by any script that reaches the
origin, so it is not trusted just because we wrote it. "Reset to demo data" in Settings clears it, and "Export JSON" takes a copy out first. Storage access is
wrapped in `try`/`catch` throughout, so private-browsing mode degrades to a non-persistent
session instead of a blank page.

---

## Dependencies

Runtime: `next`, `react`, `react-dom`, `@anthropic-ai/sdk`, `zod`, `recharts`, `lucide-react`,
`react-hook-form` + `@hookform/resolvers`, four `@radix-ui/*` primitives, `framer-motion`, and the
`clsx` / `tailwind-merge` / `class-variance-authority` trio, plus `server-only` as a build-time
guard. `@hookform/resolvers` is pinned to v5: v6 drags in the `@typeschema`/`effect` peer graph,
none of which this app uses, and npm cannot resolve it cleanly. The initial scaffold pulled Next 15.5.4, which carries
CVE-2025-66478; it was upgraded to 16.4.2 before any application code was written against it.

---

## Reporting

This is a demonstration app. If you are adapting it for production, the items to address first
are the distributed rate limiter, an authenticated session if weddings are ever stored
server-side, and confirmation gates on any action that spends money or actually contacts a
vendor — today "mark as contacted" only moves a chip in the user's own tracker.
