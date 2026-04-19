# Admin Dashboard

Internal ops surface at `/admin`. Shows customer list, per-customer scan history, 30-day aggregates, and unit economics. Gated behind an email allowlist.

## Access

Set `ADMIN_EMAILS` to a comma-separated list of admin email addresses:

```
ADMIN_EMAILS=founder@websitecreditscore.com,ops@websitecreditscore.com
```

- Unauthenticated visitors → redirected to `/app/login?next=/admin`.
- Authenticated non-admins → redirected to `/`.
- Authenticated admins → the dashboard renders.

### Local dev without Supabase

Set `ALLOW_DEMO_WORKSPACE=1` in local `.env.local`. The demo session cookie (`craydl-demo-session`) unlocks `/admin` without an email allowlist check. Production deployments must leave `ALLOW_DEMO_WORKSPACE` unset — the demo bypass is a no-op in prod.

## Data source

Module-load-time selection in `src/lib/admin/data-source.ts`:

- **`hasSupabaseEnv() === true`** → live Supabase queries (`src/lib/admin/queries.ts`).
- **Otherwise** → deterministic mock data (`src/lib/admin/mock-data.ts`).

Both sources export the same function names and return-shapes, so the admin pages are source-agnostic.

## Metrics

| Metric | Definition |
| --- | --- |
| **Paying customers** | Workspaces with at least one completed scan. |
| **Scans (30d)** | Completed + failed scan count over the trailing 30 days. |
| **Revenue (30d)** | Sum of `revenue_cents` across scans in the window. |
| **Cost (30d)** | Sum of `provider_cost_cents` across scans in the window. |
| **Margin (30d)** | Revenue minus cost, in cents. |
| **Margin %** | Margin / revenue × 100. Zero when revenue is zero. |
| **Scans used / included** | Workspace scan count vs. included credits (`null` for pay-per-scan). |
| **Lifetime revenue** | Sum of all scan revenue for the workspace. |
| **Lifetime cost** | Sum of all scan cost for the workspace. |

### What's in "revenue"

Each scan writes its attributed revenue at the time of scan:

- **Free** — 0¢.
- **Pay per scan** — 100¢ (price of the `scan-1x` SKU).
- **Pro 50** / **Privacy Pro** — 100¢ attributed per scan (bundle price divided by bundle size).

The attribution runs at write time via `attributeScanRevenueCents()` in `src/app/api/audit/route.ts`. Changing attribution later does not retroactively update historical scans — we want audit trails to reflect the economics as they were at the time.

## Privacy Pro redaction

Workspaces with the `privacy-pro` entitlement are redacted on every admin surface:

- **Display name** → `"Private account"`.
- **Email** → `"•••@<domain>"` (domain preserved so we can still reason about email source).
- **Scanned URLs** → hostname masked (first letter + bullets, e.g. `https://a•••••.com`).

The redaction is applied by `applyPrivacyToCustomer` / `applyPrivacyToScan` in `src/lib/admin/privacy.ts`. Both the mock and live data sources route through these helpers, so behavior is identical regardless of which source is active.

**What is not redacted:** aggregate counts, revenue totals, cost totals, score values. These are the numbers that matter for ops without identifying the account.

**What is not stored in the first place:** the Privacy Pro layer does not attempt retroactive redaction of data that was never captured differently — it's a display-layer policy. A stronger "zero-knowledge" tier would need to redact at the database layer; that's a future entitlement, not today's.

## Common operations

### See recent scans for a workspace

1. Go to `/admin`.
2. Find the workspace in the paying customers table.
3. Click the "Open" link in the rightmost column.
4. The profile page lists scans in reverse-chronological order with per-row margin.

### Verify a webhook was processed

The admin UI doesn't surface webhook logs today (roadmap). To check directly:

```sql
select event_id, type, received_at, processed_at, processed_ok, error_message
from public.stripe_webhook_log
order by received_at desc
limit 20;
```

`processed_ok = true` means fulfillment ran successfully. `processed_ok = false` with a non-null `error_message` means the handler failed and Stripe is retrying.

### Diagnose a low margin

1. Open the customer profile.
2. Scan the "Cost" column in the scan history table.
3. Outlier costs almost always trace back to either (a) very large sites that needed multiple Firecrawl passes, or (b) LLM enrichment runs where the prompt cache missed.
4. If cost is persistently above revenue, the workspace is unprofitable and the credit pricing needs to be revisited.
