# WebsiteCreditScore — UI/UX & Data Improvement Plan

_Last updated: 2026-06-28_

This plan is based on a full read of the shipped app (not the legacy README, which
describes an older `/app` workspace architecture that no longer matches the code).

## What the app actually is today

A **sessionless, pay-per-scan** product:

1. Visitor pastes a domain on `/`.
2. They either (a) claim a **free first Aerial scan** via Supabase email OTP,
   (b) spend a **prepaid wallet credit** (cookie-anchored), or (c) pay via
   **Stripe Checkout** ($1+, with volume packs).
3. `POST /api/scan/start` creates a `scans` row (UUID = the access capability).
4. `/scan/[id]` opens; `GET /api/scan/[id]/stream` (SSE) runs an Anthropic agent
   (`claude-haiku-4-5`) that performs 8–200 live `web_search` calls depending on
   tier/mode, then calls `submit_credit_report` once.
5. The report is Zod-validated (`WCSReportSchema`), persisted, and cached per
   domain for 7 days. The client renders a 10-dimension scorecard, red/green
   flags, evidence citations, executive summary, and (for deeper tiers) a
   decision memo / risk matrix.
6. A Calendly "Strategy Call" upsell is layered through the report.

**Tiers:** Aerial / Surface / Deep (standard mode) and Trench / Mantle / Core
(MAX mode). Pricing + search budgets live in `src/lib/pricing.ts`.

The data model is well-built: atomic Postgres RPCs for credit grant/consume and
free-claim, idempotency on Stripe webhook retries, unguessable-UUID RLS.

---

## Findings (evidence-backed)

### Data collection — the biggest gap
The only analytics is `<Analytics/>` from `@vercel/analytics` (anonymous
pageviews). There is **zero funnel instrumentation** for a conversion-driven
micro-payment product. You cannot currently see where the $1 funnel leaks:
no events for scan-started, OTP-sent/verified, checkout-opened, tier or
MAX-mode toggled, scan-completed, or CTA-clicked. The `scans` table also does
not capture `referrer`, `utm_*`, scan duration, search count, or result grade
as first-class columns.

### Correctness bugs (FIXED 2026-06-28)
- `layout.tsx` OG/meta said "8 dimensions" — product has 10. ✅ fixed
- `docs/page.tsx` listed only **8** dimensions (missing `visual_design` and
  `ux_conversion`), with **fabricated weights summing to 109%** that disagreed
  with the canonical `DIMENSION_WEIGHTS` in `schema.ts`. ✅ rebuilt to all 10 with
  correct weights/colors.
- `docs/page.tsx` FAQ + grade-tier ranges contradicted `scoreToGrade()`.
  ✅ corrected to the real thresholds (A+ ≥ 97, A ≥ 93, … F < 60).

### Still open
- **Stale README**: describes `/app` workspace, `/audit/[id]`, `POST /api/audit`,
  settings/theming — none of which is the shipped surface. Misleads contributors.
- **No streaming resilience**: `live-report.tsx` `EventSource.onerror` just says
  "refresh." A dropped connection mid-scan strands a paying user even though the
  scan persists server-side.
- **`live-report.tsx` is 1,341 lines** mixing radar SVG, 10+ subcomponents, and
  streaming logic in one file.
- **Visual/UX/technical scores are AI-guessed** from search snippets; the
  existing `GOOGLE_PAGESPEED_API_KEY` and Firecrawl capture are not fed into the
  scoring prompt, weakening defensibility of three weighted dimensions.

---

## Plan

### Phase 1 — Instrument the funnel (highest ROI)
1. ✅ **DONE (2026-06-28)** Event analytics via `@vercel/analytics` `track()`,
   centralized in `src/lib/analytics.ts`. Events wired: `scan_form_viewed`,
   `tier_selected`, `max_mode_toggled`, `otp_sent`, `otp_verified`,
   `checkout_opened`, `checkout_quantity_selected`, `scan_started{source}`,
   `scan_completed{grade,score,cached}`, `scan_failed{reason}`,
   `share_link_copied`. (Still TODO: `cta_strategy_call_clicked` on the Calendly
   buttons.)
2. ✅ **DONE (2026-06-28)** `scans` table enriched via migration
   `20260628000000_scan_funnel_enrichment.sql`: `referrer`, `utm_source/medium/
   campaign`, `started_at`, `completed_at`, `search_count`, `result_grade`,
   `result_score`. Populated in `lib/db/scans.ts` (`updateScanStatus` stamps
   `started_at`; `saveScanResult` stamps the rest) and attribution captured in
   `/api/scan/start` (referrer header + UTM from client). **NOTE:** the
   verified-free path uses the `claim_verified_free_scan` Postgres RPC, which
   does not yet write attribution — follow-up needed if free-tier attribution
   matters.
3. **TODO** Build a `/admin` funnel view: free→paid conversion, OTP drop-off,
   tier mix, MAX attach rate, avg scan cost vs. revenue.

### Security / abuse
- ✅ **DONE (2026-06-28)** Disposable-email blocklist (`src/lib/disposable-email.ts`)
  rejects throwaway-mailbox providers at `/api/free-scan/otp`, capping free-scan
  credit-griefing. Tested in `disposable-email.test.ts`.

### Deep-scan presentation
- ✅ **DONE (2026-06-28)** Fixed the bug where every report rendered as "Aerial"
  depth regardless of tier paid. `scan/[id]/page.tsx` now computes
  `scanDepthKey(tier, mode)` and threads it through `LiveReport` → `ReportContent`
  so paid tiers (Surface…Core) display their real depth label, search budget, and
  unlocks.


### Phase 2 — UX polish
4. Resilient SSE: auto-reconnect + resume-from-status; "Your scan is safe —
   reconnecting…" instead of a dead-end error.
5. Turn the OTP/free flow into an explicit 2-step stepper with resend cooldown.
6. Better pending states: estimated time, current dimension, progress tied to
   real search events; respect `prefers-reduced-motion`.
7. Refactor `live-report.tsx` into `scan/[id]/components/*`.

### Phase 3 — Data quality & trust
8. Feed PageSpeed + screenshot/Firecrawl signals into the scoring prompt so
   `visual_design` / `ux_conversion` / `technical` are grounded, not guessed.
9. Rewrite the README to match the shipped `/scan` + wallet architecture; align
   privacy/cookies copy with whatever analytics is adopted in Phase 1.

### Phase 4 — Conversion lift
10. A/B the hero CTA (scan-first vs. Calendly call-first) now that funnel data
    exists.
11. Capture email at free-scan time for a follow-up sequence; surface
    "rescan in 30 days" and contextual pack pricing.

---

## Single source of truth
`src/lib/schema.ts` owns `DIMENSION_KEYS`, `DIMENSION_LABELS`,
`DIMENSION_WEIGHTS`, `DIMENSION_COLORS`, and `scoreToGrade()`. Any page that
restates dimensions, weights, or grade thresholds (e.g. `docs/page.tsx`,
`page.tsx`) must mirror these values — do not hand-author divergent copies.
