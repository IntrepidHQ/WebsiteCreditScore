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
  - live CSS-variable theme controls
  - motion toggle
  - branding mode
  - random theme generator
  - export theme JSON
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

### Optional Supabase Auth Setup

If you want Google OAuth and Supabase-backed workspaces instead of the local demo workspace, add:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

The included schema file at `supabase/schema.sql` defines the payload-based tables used by the product layer.

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
    mock/               Seed data and deterministic report builder
    product/            Repository layer, local store, share resolution, quality checks
    supabase/           Supabase client and env helpers
    types/              Core TypeScript models
    utils/              Pricing, theme, scoring, and URL helpers
  store/                Zustand state for theme, pricing, and UI controls
  test/                 Vitest setup
```

## Animation Architecture

- GSAP + ScrollTrigger drive the pinned hero preview, findings narrative sections, and before/after vision section.
- Reduced motion is respected via `prefers-reduced-motion` and a manual override in settings.
- Theming and motion settings are applied globally via CSS variables and a client-side theme provider.

## Where To Wire Real Audit Data Later

- `src/app/api/audit/route.ts`
  Replace the mock builder call with your live audit pipeline or queue.
- `src/lib/mock/report-builder.ts`
  Swap deterministic seeded logic for normalized crawler, screenshot, SEO, and posture results.
- `src/lib/product/repository.ts`
  Replace the local fallback with your preferred persistence strategy or extend the Supabase adapter.
- `src/features/audit/components/*`
  The report UI already accepts typed `AuditReport` data, so a real backend can drop in without reshaping the presentation layer heavily.

## Notes

- Packet PDF export is real; the packet page stays themed on screen and prints in light mode.
- Public share links for `/audit/[id]`, `/packet/[id]`, and `/brief/[id]` can resolve from saved report snapshots.
- Preview images prefer captured site screenshots and fall back to site image metadata when capture is unavailable.
- The theme JSON export includes both visual tokens and agency branding fields.
