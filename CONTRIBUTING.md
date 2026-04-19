# Contributing

Thanks for your interest. This is a small project with a narrow focus — contributions that tighten scoring accuracy, improve observation quality, or fix specific bugs are especially welcome.

## Getting started

Requirements:

- Node 20+
- pnpm 9+
- A Supabase project (optional for local dev — the app falls back to mock data when Supabase env is not set)

Install + run:

```bash
pnpm install
pnpm dev
```

The dev server runs on `http://localhost:3000`.

## Environment

Copy `.env.example` to `.env.local`. Most optional env vars can stay empty for local development — the app degrades gracefully. The ones you'll likely want:

- `ANTHROPIC_API_KEY` — enables LLM enrichment.
- `FIRECRAWL_API_KEY` — enables HTML observation.
- `ADMIN_EMAILS` — enables `/admin` access for your email.
- `ALLOW_DEMO_WORKSPACE=1` — unlocks the demo session cookie for local-only auth flows.

## Workflow

1. Fork + branch from `master`.
2. Make your change.
3. Run the full verification suite:

```bash
pnpm typecheck
pnpm test
pnpm lint
```

4. Commit using [Conventional Commits](https://www.conventionalcommits.org/):

   ```
   feat(scoring): add mobile tap-target check
   fix(admin): handle null lastScanAt in customer sort
   docs(billing): update cost model for Claude Sonnet pricing
   ```

5. Open a PR against `master` with:
   - A clear summary of what changed and why.
   - Screenshots for UI changes.
   - A test plan (bulleted checklist of what you verified).

## Code style

- TypeScript strict mode. No `any` unless there is a written justification.
- Prefer pure functions for business logic. Persistence stays in the edges.
- React Server Components by default. Client components only when interactivity is actually needed.
- Tailwind utility classes for styling. Custom CSS only for cases Tailwind can't express cleanly.
- Tests colocated with the code (`foo.ts` + `foo.test.ts`).

## Testing

Vitest for unit tests. Playwright for end-to-end (not yet wired in every PR — coming).

```bash
pnpm test              # unit + integration
pnpm test -- scoring   # filter by name
pnpm typecheck         # TypeScript only
```

Tests should:

- Assert behavior, not implementation.
- Cover the happy path and at least one failure mode.
- Be deterministic. Mock time, mock random, mock external calls.

## Scope boundaries

**In scope for contributions:**

- Scoring rubric improvements with evidence (published research, user-facing case studies).
- New observation adapters (e.g. additional performance signals).
- Accessibility fixes.
- Bug fixes with reproduction steps.
- Documentation improvements.

**Out of scope without prior discussion:**

- New billing integrations (Stripe is the one billing provider).
- New auth providers (Supabase + Google OAuth is the auth surface).
- Large refactors. Open an issue first.
- New third-party dependencies. We keep the dependency count small.

## Questions

Open a discussion or an issue on GitHub. For security issues, see [SECURITY.md](./SECURITY.md) — please don't file public issues for security reports.
