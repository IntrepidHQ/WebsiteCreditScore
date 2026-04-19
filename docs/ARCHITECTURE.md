# Architecture

High-level system design for websitecreditscore.com. Next.js 16 App Router, React 19, Supabase, Stripe, TypeScript. This doc stays at the conceptual layer — implementation details belong next to the code.

## Data flow

```
┌──────────────┐    ┌─────────────┐    ┌──────────────────────┐
│  User / URL  │───▶│  Normalize  │───▶│  Observation layer   │
└──────────────┘    └─────────────┘    │                      │
                                       │ • Firecrawl (HTML)   │
                                       │ • Browserless (shot) │
                                       │ • PageSpeed / CWV    │
                                       │ • Schema / a11y      │
                                       └──────────┬───────────┘
                                                  │
                                                  ▼
                                        ┌─────────────────────┐
                                        │  Scoring engine     │
                                        │                     │
                                        │  7 dimensions,      │
                                        │  weighted composite │
                                        └─────────┬───────────┘
                                                  │
                                                  ▼
                                        ┌─────────────────────┐
                                        │  LLM enrichment     │
                                        │  (Claude Sonnet)    │
                                        │                     │
                                        │  • Explanations     │
                                        │  • Redesign pitch   │
                                        │  • Outreach draft   │
                                        └─────────┬───────────┘
                                                  │
                                                  ▼
                                        ┌─────────────────────┐
                                        │  Persistence        │
                                        │                     │
                                        │  • workspaces       │
                                        │  • saved_reports    │
                                        │  • scans (Phase 2)  │
                                        └─────────┬───────────┘
                                                  │
                                                  ▼
                                        ┌─────────────────────┐
                                        │  Surfaces           │
                                        │                     │
                                        │  • Scan report UI   │
                                        │  • Workspace dash   │
                                        │  • Admin aggregate  │
                                        └─────────────────────┘
```

## Key subsystems

### Next.js App Router

- Server components by default. Client components only for interactivity that actually needs it.
- `force-dynamic` on routes that read session / workspace state per-request.
- Route handlers (`/api/*`) for mutations and webhooks. All webhooks are `runtime = "nodejs"` because Stripe signature verification needs Node's crypto.

### Observation layer (`src/lib/audit/`)

Stateless callers for external data sources. Each returns a typed record or `null` on failure. The scan flow is tolerant of partial failures — if Browserless is down, the audit still runs without the screenshot; if PageSpeed is rate-limited, the Core Web Vitals dimension is scored as unavailable rather than zero.

### Scoring engine (`src/lib/scoring/`)

Pure functions. Given an observation record, returns a scored report with seven dimensions, a weighted composite, per-dimension findings, and a prioritized action list. No IO, no persistence. The scoring rubric and weights live in `src/lib/scoring/rubric.ts` and are versioned — we never mutate a scored report retroactively.

### LLM enrichment (`src/lib/ai/`)

Wraps Anthropic's Claude Sonnet. Prompts are in `src/lib/ai/prompts/`. Every LLM call has:

- A strict output schema (Zod-validated).
- A budget ceiling (input + output token cap).
- A cache layer (`ai_response_cache` table) keyed by prompt hash + model version.

The cache is critical for economics — Claude Sonnet at ~$3/MT in and ~$15/MT out is the dominant per-scan cost, and cache hits are free.

### Persistence (Supabase)

- `workspaces` — account root. RLS via `owner_user_id = auth.uid()`.
- `saved_reports` — completed scans (report JSON + metadata).
- `scans` — per-scan cost + revenue ledger (Phase 2).
- `stripe_webhook_log` — event ledger + dedupe.
- `ai_response_cache` — prompt hash → response.
- Storage buckets: `screenshots`, `dataroom`.

All writes use the service-role client. Reads use the per-request session client. RLS is the security boundary; we assume the app code is compromised and write policies accordingly.

### Admin surface (`/admin`)

Email-allowlist gated via `ADMIN_EMAILS` env. Data source is selected at module load time (`src/lib/admin/data-source.ts`):

- `hasSupabaseEnv() === true` → live queries against `workspaces` + `scans`.
- Otherwise → deterministic mock seed (preview deploys, unconfigured local dev).

The swap is a module-level boolean so the admin pages don't need to know which source is active.

### Billing (Stripe)

Fulfillment is webhook-driven. `checkout.session.completed` and `async_payment_succeeded` both route through `fulfillCheckoutSession`, which:

1. Resolves the workspace by customer reference.
2. Adds credits / entitlements from the catalog (`src/lib/billing/catalog.ts`).
3. Marks the session processed in `stripe_webhook_log`.

The webhook handler dedupes by `event_id`. A replay of a previously-successful event returns 200 and skips the handler. A replay of a previously-failed event runs the handler again so retries complete.

## Environments

| Env | URL | Supabase | Stripe | Notes |
| --- | --- | --- | --- | --- |
| Local | `http://localhost:3000` | Optional (mock fallback) | Test keys or unconfigured | Demo session cookie unlocks auth flows. |
| Preview | Vercel preview domains | Preview branch | Test keys | Mock fallback when preview Supabase is disabled. |
| Prod | websitecreditscore.com | Prod instance | Live keys | All env vars required; webhook pointed at `/api/stripe/webhooks`. |

## Operational tenets

1. **Never block the user on logging.** Metrics, analytics, cost logging — all fire-and-forget.
2. **Gracefully degrade.** If Supabase is unreachable, the scan still runs and returns a report — it just doesn't persist.
3. **Cache the expensive part.** Firecrawl + Claude are the heavy spenders. Cache both.
4. **Version the rubric.** Scoring rules change over time. Every scored report carries the rubric version so comparisons across time stay honest.
5. **Webhook idempotency is non-negotiable.** Every webhook endpoint dedupes by provider event ID.
