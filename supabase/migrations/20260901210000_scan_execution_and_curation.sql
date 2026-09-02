-- WCS durable execution contract. Existing reports remain private unless a
-- human explicitly approves them for the public examples surface.
alter table public.scans
  add column if not exists is_public_example boolean not null default false,
  add column if not exists public_example_approved_at timestamptz,
  add column if not exists scan_attempts integer not null default 0,
  add column if not exists run_started_at timestamptz,
  add column if not exists run_lease_expires_at timestamptz,
  add column if not exists last_error text,
  add column if not exists progress jsonb not null default '{}'::jsonb,
  add column if not exists completed_at timestamptz;

create index if not exists scans_public_examples_idx
  on public.scans (created_at desc)
  where is_public_example and status = 'done';

create index if not exists scans_recoverable_runs_idx
  on public.scans (run_lease_expires_at)
  where status = 'streaming';

-- One worker may own a scan at a time. Expired leases are reclaimable after a
-- deployment interruption, so a retry cannot create parallel paid research.
create or replace function public.claim_scan_run(p_scan_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  changed integer;
begin
  update public.scans
  set status = 'streaming',
      scan_attempts = scan_attempts + 1,
      run_started_at = now(),
      run_lease_expires_at = now() + interval '7 minutes',
      last_error = null,
      progress = jsonb_build_object('phase', 'starting', 'updated_at', now())
  where id = p_scan_id
    and paid = true
    and (
      status in ('pending', 'error')
      or (status = 'streaming' and (run_lease_expires_at is null or run_lease_expires_at < now()))
    );

  get diagnostics changed = row_count;
  return changed = 1;
end;
$$;
