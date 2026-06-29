# WebsiteCreditScore — Manifesto, Mission & Monetization Plan
_Drafted 2026-06-29 · the operating doctrine + the path to first paying customers_

---

## PART I — MISSION & BELIEF SYSTEM

### Mission statement
**WebsiteCreditScore exists to make the trustworthiness of any website legible — in
minutes, with evidence — so that buyers, partners, and founders can act on proof
instead of vibes.** We turn the invisible signals of credibility into one honest
number and a plain-English verdict anyone can use.

### What we believe (the doctrine WCS lives by)
1. **Trust is earned in public and must be measurable.** If a claim can't be cited,
   it isn't proof.
2. **Evidence over opinion.** Every score traces to a source. No hand-waving, no
   hedging to the middle. We give A+s and Fs when the evidence warrants.
3. **Candor is a kindness.** Exposing a flaw clearly is more useful than flattery.
   We highlight brilliance just as loudly as we flag risk.
4. **The web should be safe, legible, and accessible by default.** A credible site
   is fast, secure, transparent, and usable by everyone — including assistive tech.
5. **A human stands behind the machine.** AI does the research; a human operator's
   taste and accountability shape the verdict.
6. **Privacy is non-negotiable.** We scan public signals only; we never sell user
   data or scan-subject profiles.

### The Web Trust Standards WCS sets — and holds ITSELF to
We cannot grade others on standards we violate. Everything we ship must pass our own
rubric. These are the operating standards for every WCS property (and a public
"Trust Charter" page on the site):

| Standard | What it means for our own site |
|---|---|
| **Legitimacy** | Real business identity, reachable contact, honest ownership shown. |
| **Transparency** | Clear pricing, refund policy, methodology published, no dark patterns. |
| **Technical health** | HTTPS/HSTS, fast loads, no console errors, uptime monitored. |
| **Accessibility** | WCAG AA: contrast, keyboard nav, reduced-motion respected, screen-reader sane. |
| **Content integrity** | No thin/AI-spun filler; claims cited; numbers real, never invented. |
| **UX honesty** | Frictionless, no deceptive CTAs, refunds honored automatically. |

> Rule: before any WCS page ships, it must score ≥ A- on its own ten dimensions.
> We eat our own cooking.

---

## PART II — WHAT'S TRUE TODAY (verified state)
- **Not deployed.** All this session's work (admin dashboard, funnel analytics,
  deep-scan fix, disposable-email block, SP webhook, Human Operator section,
  enrichment migration) is uncommitted in the working tree. Live site = old version.
- **DB ready:** the combined migration was applied to the fresh Supabase project.
- **Sessionless by design:** no user accounts, no login, no billing/settings page.
  Scans accessed by unguessable URL; credits in a cookie wallet; `/restore` recovers
  via Stripe receipt id.
- **Revenue model today:** one-time $1–$15 charges. No recurring revenue.
- Build is green, typecheck clean, 17/17 tests pass with the full working tree.

---

## PART III — BREAKING EVERY BARRIER TO FIRST CUSTOMERS

### Phase 0 — SHIP IT (this is barrier #1; nothing earns until live)
1. Commit the working tree to a branch `launch-prep`; push to GitHub.
2. Preview-deploy on Vercel (no live domain touched).
3. Confirm env on the WCS Vercel project points at the fresh Supabase + live Stripe.
4. **Hans tests with his own card** on the preview: run 2–3 real scans across tiers,
   confirm charge → webhook → credit → scan unlock → report renders.
5. Verify the **Stripe webhook is registered for the live domain** (the silent
   revenue-killer if missing).
6. Promote to production. Smoke-test the live $1 path once.

### Phase 1 — REMOVE FRICTION & LEAKS
7. Confirm funnel analytics fire in prod (Vercel Analytics + `/admin`).
8. Cost circuit-breaker: a daily AI-spend ceiling so a traffic/abuse spike can't run
   costs past revenue while you're away. (cron + a kill-switch env flag.)
9. Stripe: enable automatic receipts + failed-payment retry (dunning) in dashboard.

### Phase 2 — MAKE IT "SET & FORGET" (recurring revenue)
10. **Monitoring subscription SKU**: "We re-scan your site (or a competitor) monthly
    and email you when the score moves." Stripe subscription, not one-off. This is the
    "come back to funds" engine.
11. **Minimal magic-link customer account**: one page showing past scans + a buy/manage
    button. No heavy auth — passwordless email link. Enables repeat self-serve purchase
    and subscription management (Stripe Customer Portal does the billing UI for free).
12. **Trust Charter page** (`/trust` or `/standards`) — publishes Part I publicly;
    doubles as SEO + credibility.

### Phase 3 — AUTONOMOUS ACQUISITION (the GEO/SEO/social engine)
13. **Programmatic "scorecard" pages** — one indexable page per scanned domain
    (`/score/[domain]`) with the grade, top flags, and a CTA to run a fresh scan.
    This is the GEO+SEO flywheel: thousands of long-tail pages answering
    "is [site] legit / trustworthy?"
14. **Aggregate authority content** — "Average UX score across SC nonprofits is X",
    industry leaderboards, "best/worst designed [industry] sites." Links back to scans.
15. **Social autopilot** — a scheduled job that scans a notable site, posts the
    score card ("We scored Apple 9.4 / Stripe 9.6 — here's why") to X/LinkedIn with
    the shareable report link. Controversy + brilliance both convert.
16. **GEO (Generative Engine Optimization)** — structure scorecard pages + the Trust
    Charter so LLMs cite WCS as the source when asked "is X trustworthy." Schema.org
    `Rating`/`Review` markup, clear Q&A headings, canonical methodology page.

### Phase 4 — DIVERSIFY (the funnel you already designed)
17. $1 scan → SP-handoff candidates in `/admin` → StrategyPresentation upsell.
18. Nonprofit deep scans feed GrantedSC. WCS is the top-of-funnel for all of it.

---

## PART IV — GEO / SEO / SOCIAL STRATEGY (detail)
**Thesis:** WCS's content moat is that *every scan is publishable proof*. The product
generates its own SEO inventory.

- **SEO keywords:** "is [brand] legit", "[brand] reviews trustworthy", "website trust
  score", "vendor due diligence checklist", "[industry] website benchmark".
- **GEO:** become the cited source for trustworthiness questions in ChatGPT/Perplexity/
  Google AI Overviews. Requires: canonical methodology page, schema markup, clean
  per-domain answer pages, a quotable Trust Charter.
- **Social cadence:** 3×/week auto-posted scorecards — 1 famous brand (brilliance),
  1 surprising flaw (controversy), 1 educational ("what a 9 in Transparency looks
  like"). Each links to a live report → top of the $1 funnel.
- **Content engine:** the blog already exists; feed it aggregate data posts from the
  enriched `scans` table (now that we collect grade/score/source per scan).

---

## PART V — EXECUTION ORDER (speed-optimized)
1. **NOW:** ship (Phase 0). Hans card-tests on preview, then promote.
2. Cost guardrail + Stripe dunning (Phase 1) — same day as launch.
3. Trust Charter page + programmatic scorecard pages (Phase 2/3 SEO foundation).
4. Monitoring subscription + magic-link account (Phase 2 recurring revenue).
5. Social autopilot cron (Phase 3).

Guardrail throughout: preview → review → promote. Never blind-push to the live
revenue site. Eat our own cooking — every page ships at ≥ A-.
