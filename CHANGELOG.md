# Changelog

All notable changes to websitecreditscore.com are documented here. Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added — Phase 2 (billing + cost tracking)

- `scans` table with per-scan cost + revenue ledger. Every completed audit writes a row for unit-economics attribution.
- `stripe_webhook_log` table for webhook dedupe and audit trail.
- Three new Stripe SKUs in the catalog: `scan-1x` ($1, single scan), `pro-50-bundle` ($50, 50 scans), `privacy-pro-50` ($50, 50 scans with Privacy Pro entitlement).
- New `privacy-pro` workspace entitlement — redacts customer display name, email, and scanned URLs on every admin surface.
- `src/lib/billing/scan-cost.ts` — cost estimator + `recordScan` fire-and-forget writer.
- `src/lib/admin/queries.ts` — live Supabase-backed admin data source.
- `src/lib/admin/data-source.ts` — module-load-time selector between mock and live data sources.
- OG image route at `src/app/opengraph-image.tsx`.

### Added — Phase 4 (SEO + social content)

- Six seed trend articles covering the pillar keyword clusters (website credit score, AI search readiness, audit pricing, score-to-sale, GEO, 9-minute audit).
- `docs/SEO.md` — keyword taxonomy, 30-article calendar, on-page checklist, backlink tactics.
- `docs/SOCIAL.md` — channel playbooks, content pillars, repurposing flow.

### Added — Phase 5 (docs + legal drafts)

- `docs/ARCHITECTURE.md`, `docs/ADMIN.md`, `docs/BILLING.md`.
- `SECURITY.md`, `CONTRIBUTING.md`, this file.
- Privacy, Terms, and Cookies pages as drafts with "REVIEW WITH COUNSEL" banners.

### Added — Phase 6 (launch checklist)

- `LAUNCH-CHECKLIST.html` — self-contained HTML checklist of user-side tasks (accounts to create, env vars to paste, Stripe products to configure, migrations to run, etc.) with `localStorage`-persisted progress.

### Changed

- Stripe webhook handler refactored to log receipt + dedupe before dispatch. Retries after handler failure now complete correctly.
- Admin pages (`/admin`, `/admin/customers/[id]`) read from `src/lib/admin/data-source` instead of `mock-data`. No JSX changes.

---

## [Phase 3] — 2026-04-18

### Added

- `/admin` dashboard scaffold with KPI cards, sparkline charts, paying-customers table, per-customer profile + scan history.
- Email-allowlist admin gate via `ADMIN_EMAILS` env.
- Deterministic mock seed (`src/lib/admin/mock-data.ts`) so the dashboard renders even before Supabase is configured.
- `Sparkline` pure-SVG component.

---

## [Phase 1] — 2026-04-17

### Added

- UX + scoring quality upgrades across the score report surface.
- Improvements to observation adapters (Firecrawl + PageSpeed handling).
- Expanded scoring rubric with additional trust-layer and mobile-experience checkpoints.

### Fixed

- Several hydration mismatches on the report page.
- Mobile layout regressions on the pricing page.
