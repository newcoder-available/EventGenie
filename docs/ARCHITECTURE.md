# Architecture

How EventGenie is put together, and the three rules that explain most of the code.

## The layers

```
app/        routing and page composition only — no business logic
  (public)/   landing (occasion picker) and demo sign-in, no app shell
  (app)/      the ten planning screens, behind the session guard
  api/        two server routes; the only place the API key exists

components/ presentation
  layout/     shell, sidebar, top bar, session guard
  ui/         Radix + CVA primitives, FormDialog, generated Artwork, ornaments
  <domain>/   budget, checklist, timeline, guests, vendors, inspiration,
              schedule, ai-assistant — one folder per planning screen

hooks/      state and behaviour, no markup
  useSession  which occasion, and who is planning it
  useEvent    the plan itself, plus every derived figure
  useAssistant chat, generation and the apply gate
  useToast    notifications

lib/        pure logic, no React
  calculations  every derived number in the app
  validation    Zod schemas: forms, persistence, API payloads
  ai-service    the interface to an AI, real or local
  local-planner the offline implementation
  prompts       system prompts and context construction
  ai-schema     the model's output contract (Zod + JSON Schema)
  security      PII redaction, untrusted-input fencing, origin checks
  ratelimit     fixed-window limiter
  storage       localStorage, per occasion
  eventThemes   accents, motifs, nouns and prompts per occasion
  csv, utils    small helpers

data/       the seven sample plans
  template.ts   the template shape and the share-to-amount builder
  events/       one file per occasion

types/event.ts  the domain model
proxy.ts        per-request nonce CSP
```

## Rule 1 — one state object, every figure derived

`useEvent` holds the whole plan in a reducer. Nothing else stores a total.

`EventProvider` computes the full summary — budget, categories, guests, tasks,
vendors, progress — once per state change with `useMemo`, and shares it through
context. Components read `summary`, never recompute.

This exists because fourteen components were calling the selectors directly in
render, and `overallProgress` walks tasks, vendors, guests *and* milestones. A
single KPI row cost seven full passes over the plan, on every render anywhere in
the tree.

The practical consequence: the budget page, the KPI cards and the donut cannot
disagree, because there is only one number.

## Rule 2 — the occasion is a parameter, not a fork

There is no `if (wedding)` branching in the UI. An occasion supplies:

- an **accent** (one of twelve presets, each validated at 4.5:1)
- a **motif** (one of seven tiles, rendered through a CSS mask so one black SVG
  serves every accent)
- an **icon**, a set of **nouns** ("Side" vs "Team"), and **assistant prompts**
- a **template** in `data/events/` producing a complete starter plan

`themeFor(eventType)` resolves all of it. Adding an occasion means adding a
theme entry and a template — no component changes.

The one thing occasions do **not** touch is the chart palette. Those eight hues
were validated as a set against the ivory canvas for contrast and colourblind
separation; re-tinting them per occasion would void that. Tests enforce it.

## Rule 3 — everything crossing a boundary is validated

Four boundaries, same treatment:

| Boundary | Guard |
| --- | --- |
| Browser → API | Zod `.strict()` schemas, body-size caps, same-origin check, rate limit |
| API → model | PII redacted, user text fenced as `<untrusted>`, guest names never sent |
| Model → API | JSON Schema on the way out, Zod on the way in |
| Storage → app | `eventStateSchema` on read — local storage is writable by any script |

A model response is third-party input and gets the same scrutiny as a form
field. Nothing a generation produces reaches the plan without an explicit
*Apply*.

## Where the AI lives

```
components/ai-assistant/  ChatPanel + GenerationPanel, markup only
hooks/useAssistant        streaming, abort, and the apply gate
lib/ai-service            one interface, two implementations
lib/local-planner         the offline one
app/api/assistant         streaming chat
app/api/generate          schema-constrained structured output
```

`ai-service` picks the implementation: with `ANTHROPIC_API_KEY` set the routes
call Claude; without it the local planner answers in the same shape, so the UI
cannot tell the difference and the apply path is exercised either way.

## Verifying

```bash
npm run verify     # eslint, tsc --noEmit, 26 tests
```

Tests live in `scripts/selftest.mts` and run on `node:test` with a small
resolver hook for the `@/` alias. The live probes (CSP headers, cross-origin
refusal, rate limiting) need a dev server and are opt-in via `EVENTGENIE_LIVE`.
