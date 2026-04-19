# Billing

Stripe-based. Credit-pack model with optional entitlements. Every paid scan writes a ledger row for cost/revenue attribution.

## SKUs

| SKU id | Name | Price (USD) | Credits | Entitlements |
| --- | --- | --- | --- | --- |
| `scan-1x` | Single scan | $1 | 1 | — |
| `pro-50-bundle` | Pro 50 bundle | $50 | 50 | — |
| `privacy-pro-50` | Privacy Pro 50 bundle | $50 | 50 | `privacy-pro` |
| `extra-50-tokens` | 50 extra credits | $19 | 50 | — |
| `seo-benchmark` | SEO benchmark unlock | $20 | 0 | `seo-benchmark` |
| `max-stealth` | MAX + stealth mode | $29 | 0 | `max-stealth` |

Plus the `pro` plan ($49 → 50 credits) for legacy / subscription-style buyers.

All prices in `src/lib/billing/catalog.ts`. The catalog is the single source of truth — Stripe product metadata must match.

## Cost model

Per-scan cost estimate used for margin calculations. Lives in `src/lib/billing/scan-cost.ts`.

| Component | ¢/scan | Notes |
| --- | --- | --- |
| Claude Sonnet input (~6k tokens) | 1.8 | $3/MT → 6k tokens ≈ 1.8¢ |
| Claude Sonnet output (~1.5k tokens) | 2.25 | $15/MT → 1.5k tokens ≈ 2.25¢ |
| Firecrawl (1 call) | 1.0 | Hobby plan amortized |
| PageSpeed Insights | 0 | Free tier |
| Browserless (~3s screenshot) | 0.3 | Amortized |
| Supabase storage + egress | 0.1 | Rounded |
| **Default floor** | **~10** | `DEFAULT_SCAN_COST_CENTS = 10` |

The estimator (`estimateScanCostCents`) ceilings at `Math.max(1, Math.ceil(...))` so every recorded scan has at least 1¢ of cost — we never want "free" scans in the ledger.

## Revenue attribution

Each scan writes `revenue_cents` at the time of scan:

| Plan source | Revenue per scan |
| --- | --- |
| `free` | 0¢ |
| `pay-per-scan` | 100¢ (price of `scan-1x`) |
| `pro-50` | 100¢ ($50 / 50) |
| `privacy-pro` | 100¢ ($50 / 50) |

Plan source is derived per-scan from the workspace's entitlements + plan at scan time. See `resolveScanPlanSource` in `src/app/api/audit/route.ts`.

Historical revenue is never rewritten. If we change attribution logic (e.g. bundle prices change), only new scans see the new attribution.

## Stripe setup

### Products

Create three products in the Stripe dashboard:

1. **Single scan** — $1 / one-time. Metadata `{ "credits": "1" }`.
2. **Pro 50 bundle** — $50 / one-time. Metadata `{ "credits": "50" }`.
3. **Privacy Pro 50 bundle** — $50 / one-time. Metadata `{ "credits": "50", "entitlements": "privacy-pro" }`.

All prices USD. Use test-mode products in dev and live-mode products in prod.

### Webhook

- Endpoint: `https://<domain>/api/stripe/webhooks`.
- Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `invoice.payment_succeeded`.
- Secret: paste into `STRIPE_WEBHOOK_SECRET` env var.
- Mode: the `validateStripeWebhookSecretMode()` helper in `src/lib/billing/stripe.ts` refuses to boot if the secret's mode doesn't match `STRIPE_SECRET_KEY`'s mode. This catches "test webhook pointed at live keys" configuration bugs.

### Env vars

```
STRIPE_SECRET_KEY=sk_live_...     # or sk_test_... in dev
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## Webhook dedupe

Every event is logged to `stripe_webhook_log` with `event_id` as primary key:

1. Insert row on receipt. `on conflict (event_id) do nothing` makes this idempotent.
2. If insert returned a row → first receipt, process.
3. If conflict → check `processed_ok` on the existing row. If `true`, skip (true dedupe). If `false` or `null`, process (retry after prior failure).
4. After handler runs, update `processed_at`, `processed_ok`, `error_message`.

Failed handlers return 500 so Stripe retries. Successful handlers return 200.

Replay semantics:

- `stripe trigger checkout.session.completed` twice with the same event_id → second call is a no-op in fulfillment; log is updated once.
- Real production retry after a handler timeout → Stripe sends the same event again; handler runs again because `processed_ok` is not yet `true`.

## Reconciling Stripe with the admin dashboard

The admin `/admin` revenue totals come from `scans.revenue_cents`, not from Stripe. This is deliberate:

- Stripe tells you what was paid.
- The `scans` ledger tells you what was earned against those payments.

A workspace that buys a 50-credit bundle ($50 paid to Stripe) but only runs 20 scans has $20 in recognized revenue and $30 in deferred revenue. The admin dashboard reflects that. Reconciling against Stripe payouts requires pulling from both sources; we don't do that inside the admin UI today.

## Changing prices

1. Update `src/lib/billing/catalog.ts`.
2. Update the matching Stripe product metadata.
3. Ship both together. If the catalog and Stripe disagree, fulfillment will still apply catalog credits/entitlements — but the Stripe receipt price and the catalog price will drift, which confuses support.

Never retire a SKU id without migrating historical references. Prefer price changes in place over deleting and recreating products.
