-- Capability access for new scans. Existing rows remain compatible and public
-- until explicitly migrated; new rows opt into access_required in application
-- code. Raw tokens are never stored.
alter table public.scans
  add column if not exists access_required boolean not null default false;

create table if not exists public.scan_access_tokens (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.scans(id) on delete cascade,
  token_hash text not null unique,
  kind text not null check (kind in ('owner', 'share')),
  label text,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz
);

create index if not exists scan_access_tokens_scan_idx
  on public.scan_access_tokens (scan_id, created_at desc);

alter table public.scan_access_tokens enable row level security;

revoke all on table public.scan_access_tokens from public, anon, authenticated;
grant all on table public.scan_access_tokens to service_role;
