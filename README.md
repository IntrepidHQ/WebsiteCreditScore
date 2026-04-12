# WebsiteCreditScore.com

A Next.js App Router product that turns a single URL into a cinematic redesign audit and proposal workflow. WebsiteCreditScore.com is built for agencies and website providers who want to package stronger outreach, clearer pricing, and better discovery control before a build begins.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS v4
- GSAP + ScrollTrigger
- Zustand
- Radix/shadcn-style primitives
- Vitest + React Testing Library

## Features

- Home, Platform, and Examples pages with URL intake, sample audits, and agency-facing positioning
- Internal workspace at `/app` with:
  - Google OAuth when Supabase env vars are present
  - local demo workspace fallback when they are not
  - saved leads, reminders, referral codes, and outreach templates
  - shareable audit, packet, and brief links backed by saved report snapshots
- Audit report page at `/audit/[id]` with:
  - website preview and device toggle
  - animated scoring
  - findings sections
  - competitor comparison
  - rebuild strategy
  - before/after vision
  - pricing configurator with ROI scenario calculator
  - close / proposal actions
- Settings page with:
  - live CSS-variable theme controls (including **surface color harmony**: monochromatic, complementary, analogous)
  - motion toggle
  - branding mode
  - random theme generator
  - export theme JSON
- Theming reference: see [`docs/THEMING.md`](docs/THEMING.md) for harmony models, contrast rules, and preset notes.
- Mock API at `POST /api/audit`
- Deterministic report generation for any URL across seeded industry presets
- Supabase-ready payload schema in `supabase/schema.sql`

## Run Locally

1. Install dependencies:

```bash
pnpm install
```

2. Start the dev server:

```bash
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000)

**`/app/login` without Supabase env:** The full sign-in layout still renders. A yellow notice explains missing variables; the email/password fields are visible but disabled until you add keys (see below). Use **Continue in demo workspace** when demo mode is allowed (see `src/lib/auth/demo-flag.ts`).

### Optional Supabase Auth Setup

If you want Google OAuth and Supabase-backed workspaces instead of the local demo workspace, copy `.env.example` to `.env.local` and fill in values. See **Production sign-in checklist (Plan A)** below for Vercel + Supabase Dashboard steps. Production canonical site: **https://www.websitecreditscore.com** — keep Supabase **Site URL** and **Redirect URLs** aligned with whether you use `www` or apex.

```bash
NEXT_PUBLIC_SUPABASE_URL=...
# Any one of: NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
# or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY (see src/lib/supabase/config.ts)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Optional: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` (storage uploads), `GOOGLE_PAGESPEED_API_KEY` (PageSpeed screenshot fallback quota; create a key in Google Cloud Console with PageSpeed Insights API enabled).

## Production sign-in checklist (Plan A)

Use this when sign-in reaches a dead end (login loop, `?error=` on `/app/login`, or opaque errors on `/app`). The app expects **the same Supabase project** for env vars, Auth, and the database you migrate.

### 1. Vercel → Environment Variables (Production)

Set for the **Production** environment (and **Preview** if you test OAuth on preview URLs):

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL from Supabase → Settings → API |
| **One** of: `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Anon/public key from the same project |
| `NEXT_PUBLIC_SITE_URL` | Your live origin, e.g. `https://websitecreditscore.com` (used for absolute links) |

Redeploy after changing these.

### 2. Supabase → Authentication → URL configuration

In the **same** Supabase project as the keys above:

- **Site URL**: your production origin (e.g. `https://websitecreditscore.com`).
- **Redirect URLs**: add explicit callback URLs Supabase is allowed to redirect to after OAuth/email:
  - `https://YOUR_DOMAIN/auth/callback`
  - `http://localhost:3000/auth/callback` (local dev)

Google OAuth in this app uses `redirectTo` = `{origin}/auth/callback?next=...` (see `src/app/auth/google/route.ts`), so the callback path must be allowed here.

### 3. Database migrations (same Supabase project)

In Supabase → **SQL Editor**, run the migration files in order:

1. `supabase/migrations/20260330232000_init_schema.sql` — tables + RLS (required).
2. If you still hit unique-constraint issues on `saved_reports.lead_id` across workspaces, run `supabase/migrations/20260404140000_saved_reports_lead_per_workspace.sql`.
3. If Supabase returns **`42P17` / `infinite recursion detected in policy for relation "workspaces"`**, run `supabase/migrations/20260405180000_fix_workspaces_rls_recursion.sql` (fixes RLS between `workspaces` and `leads`).

Without (1), workspace load fails and you may be redirected to `/app/login?error=db-not-ready` or `workspace-unavailable`.

### 4. Google provider (Google Cloud Console)

If email/password works but **Google** does not: in [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → your OAuth client → **Authorized redirect URIs**, add **Supabase’s** callback (not your Vercel domain):

`https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`

You can copy the exact URL from Supabase → Authentication → Providers → Google.

### 5. Quick verification

- Open `/app/login` — if env vars are set, you should **not** see the yellow “Auth is not configured” banner; the form fields should be interactive (not grayed out).
- After Google sign-in, you should land on `/auth/callback` then `/app` (or `next` query), not immediately back on login with `error=callback-failed` (that usually means redirect URL mismatch or expired code).
- Vercel **Logs** / browser URL: note `?error=` codes (`db-not-ready`, `workspace-unavailable`, `session-required`, etc.) to see which gate failed.

### Homepage audit vs `/app`

- The marketing **homepage** calls `POST /api/audit` with **`persist: false`** and always opens **`/audit/[id]?url=...`** so visitors are never sent to **`/app/leads/...`** (which requires a signed-in session). Saving scans to the workspace is done from **`/app`** after login.
- Set **`WCS_UNLIMITED_WORKSPACE=true`** on the server (e.g. Vercel) to skip token deductions, grant pro-style defaults for **new** workspaces, and show “Unlimited” on the dashboard — useful before billing is enforced.

### Workspace vs scans

- A **workspace row** is created the first time you successfully open **`/app`** (server runs `ensureWorkspace`). It is **not** created by running a scan.
- **`no_workspace_row`** from `/api/workspace/gate` means that insert has not happened yet — usually you have not loaded `/app` after fixing auth/RLS, or `/app` is erroring before layout completes.
- **Welcome scan** — New workspaces include `onboardingWelcomeScanUsed: false` in the stored payload. The **first** live URL scan does **not** deduct tokens; the dashboard calls this out until you run it.

### 6. Still stuck on `/app` after Plan A?

1. **Diagnostics** — While signed in, open **`/api/workspace/gate`** (same site, same browser). The JSON field `step` shows where it fails: env, auth cookie, DB query, duplicate workspaces, or OK. This route skips the global Supabase middleware so session refresh and diagnostics use one `getUser()` per request (avoids a false **“Auth session missing”** when middleware already rotated cookies). Use the **same hostname** as sign-in (`www` vs apex must match your Supabase Site URL and Redirect URLs).
2. **Vercel Preview** — If you test on `*.vercel.app`, add that deployment URL (or a pattern your team uses) under Supabase → Authentication → **Redirect URLs**, e.g. `https://your-app-xxx.vercel.app/auth/callback`. Production and Preview use different origins.
3. **`NEXT_PUBLIC_SITE_URL`** — Set it to the origin users actually use (including `www` vs apex). Mismatches mostly hurt absolute links, but keep it aligned with your canonical domain.
4. **Duplicate `workspaces` rows** — Two rows with the same `owner_user_id` used to break workspace load; the app now picks the oldest row, but you should delete extras in the SQL Editor if `gate` reports `duplicate_workspace_rows`.

Legacy reference: `supabase/schema.sql` may drift from migrations; prefer the `supabase/migrations/` files for a fresh project.

## Scripts

```bash
pnpm dev
pnpm lint
pnpm test
pnpm build
```

## Project Structure

```text
src/
  app/                  App Router pages, route handlers, loading states
  components/           Shared UI primitives and common shell components
  features/
    app/                Internal workspace shell, pipeline, referrals, templates
    audit/              Audit presentation sections and close workflow
    landing/            Landing page intake and sample audit components
    pricing/            Configurator UI
    theme/              Settings and branding controls
  hooks/                Motion and GSAP helpers
  lib/
    auth/               Demo + Supabase session helpers
    benchmarks/library/  Large benchmark rubrics, sites, and pattern notes (split from a single file for tooling)
    mock/
      report-builder/   Audit assembly: benchmark selection, report sections, main `build-report` orchestration
      …                 Seed data, `report-enhancements`, `sample-audits`
    product/            Repository layer, local store, share resolution, quality checks
    supabase/           Supabase client and env helpers
    types/              Core TypeScript models
    utils/              Pricing, theme, scoring, and URL helpers
  store/                Zustand state for theme, pricing, and UI controls
  test/                 Vitest setup
```

### Large files (for contributors and coding agents)

Some domains still carry big data or logic files (for example `report-enhancements.ts`, `niche-competitors.ts`, product stores, `site-observation.ts`). Prefer **editing the smallest module that owns the behavior** (e.g. `src/lib/mock/report-builder/build-report.ts` for orchestration, `report-sections.ts` for pricing/opportunity blocks). Import paths like `@/lib/mock/report-builder` resolve to `src/lib/mock/report-builder/index.ts`. The same applies to `@/lib/benchmarks/library` → `src/lib/benchmarks/library/index.ts`.

## Animation Architecture

- GSAP + ScrollTrigger drive the pinned hero preview, findings narrative sections, and before/after vision section.
- Reduced motion is respected via `prefers-reduced-motion` and a manual override in settings.
- Theming and motion settings are applied globally via CSS variables and a client-side theme provider.

## Where To Wire Real Audit Data Later

- `src/app/api/audit/route.ts`
  Replace the mock builder call with your live audit pipeline or queue.
- `src/lib/mock/report-builder/` (see `build-report.ts` and `report-sections.ts`)
  Swap deterministic seeded logic for normalized crawler, screenshot, SEO, and posture results.
- `src/lib/product/repository.ts`
  Replace the local fallback with your preferred persistence strategy or extend the Supabase adapter.
- `src/features/audit/components/*`
  The report UI already accepts typed `AuditReport` data, so a real backend can drop in without reshaping the presentation layer heavily.

## Notes

- Optional **Firecrawl**: set `FIRECRAWL_API` or `FIRECRAWL_API_KEY` in **Vercel** and `.env.local` (not only Supabase Edge secrets). The app calls `POST https://api.firecrawl.dev/v2/scrape` when the live HTML fetch fails, the page looks empty/under construction, or extractable text is very thin. Disk cache under `/tmp` plus Firecrawl `maxAge` (7 days) limits repeat credit use.
- Packet PDF export is real; the packet page stays themed on screen and prints in light mode.
- Public share links for `/audit/[id]`, `/packet/[id]`, and `/brief/[id]` can resolve from saved report snapshots.
- Preview images prefer captured site screenshots and fall back to site image metadata when capture is unavailable.
- The theme JSON export includes both visual tokens and agency branding fields.
