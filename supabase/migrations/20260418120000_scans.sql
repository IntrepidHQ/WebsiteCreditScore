-- Scans: per-audit usage + economics ledger.
--
-- Each completed audit inserts one row here (fire-and-forget from
-- /api/audit via src/lib/billing/scan-cost.ts::recordScan). The admin
-- dashboard aggregates off this table (see src/lib/admin/queries.ts).
--
-- Additive migration. No existing columns dropped.

create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  url text not null,
  status text not null check (status in ('running', 'complete', 'failed')) default 'complete',
  score numeric(3, 1),
  provider_cost_cents integer not null default 0,
  revenue_cents integer not null default 0,
  plan_source text not null check (plan_source in ('free', 'pay-per-scan', 'pro-50', 'privacy-pro')),
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists scans_workspace_started_idx
  on public.scans (workspace_id, started_at desc);
create index if not exists scans_started_idx
  on public.scans (started_at desc);

alter table public.scans enable row level security;

-- Workspace owners can read their own scans. Service-role bypasses RLS,
-- which is what recordScan uses for writes. No INSERT/UPDATE/DELETE policies
-- are defined, so authenticated clients cannot write or mutate scans.
drop policy if exists scans_read_own on public.scans;
create policy scans_read_own on public.scans
  for select
  using (
    workspace_id in (
      select id from public.workspaces where owner_user_id = auth.uid()
    )
  );

-- Rollback (uncomment to revert):
-- drop policy if exists scans_read_own on public.scans;
-- drop index if exists public.scans_started_idx;
-- drop index if exists public.scans_workspace_started_idx;
-- drop table if exists public.scans;
