-- Cookie-anchored rewards. Points reward useful public corpus growth and can
-- only be redeemed for private Aerial scan credits.

alter table public.wallets
  add column if not exists points_balance integer not null default 0 check (points_balance >= 0);

alter table public.scans
  add column if not exists referrer_wallet_id uuid references public.wallets(id) on delete set null;

create table if not exists public.wallet_point_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  type text not null check (type in ('public_scan', 'gift_completed', 'redeem', 'adjustment')),
  delta integer not null,
  scan_id uuid references public.scans(id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index if not exists wallet_point_scan_award_unique
  on public.wallet_point_transactions (scan_id, type)
  where scan_id is not null and type in ('public_scan', 'gift_completed');

create index if not exists wallet_point_transactions_wallet_idx
  on public.wallet_point_transactions (wallet_id, created_at desc);

create table if not exists public.scan_gifts (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  sender_wallet_id uuid not null references public.wallets(id) on delete cascade,
  claimed_by_wallet_id uuid references public.wallets(id) on delete set null,
  completed_scan_id uuid references public.scans(id) on delete set null,
  created_at timestamptz not null default now(),
  claimed_at timestamptz
);

create index if not exists scan_gifts_sender_idx
  on public.scan_gifts (sender_wallet_id, created_at desc);

create or replace function public.award_scan_points(
  p_wallet_id uuid,
  p_scan_id uuid,
  p_type text,
  p_points integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted integer;
begin
  if p_points <= 0 or p_type not in ('public_scan', 'gift_completed') then
    return false;
  end if;

  insert into public.wallet_point_transactions (wallet_id, type, delta, scan_id)
  values (p_wallet_id, p_type, p_points, p_scan_id)
  on conflict (scan_id, type)
    where scan_id is not null and type in ('public_scan', 'gift_completed')
  do nothing;

  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then return false; end if;

  update public.wallets
  set points_balance = points_balance + p_points, updated_at = now()
  where id = p_wallet_id;
  return true;
end;
$$;

create or replace function public.redeem_wallet_points(
  p_wallet_id uuid,
  p_cost integer default 100
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_updated integer;
begin
  if p_cost <= 0 then return false; end if;

  update public.wallets
  set points_balance = points_balance - p_cost, updated_at = now()
  where id = p_wallet_id and points_balance >= p_cost;

  get diagnostics v_updated = row_count;
  if v_updated = 0 then return false; end if;

  insert into public.wallet_point_transactions (wallet_id, type, delta)
  values (p_wallet_id, 'redeem', -p_cost);

  insert into public.wallet_credits (wallet_id, tier, mode, balance)
  values (p_wallet_id, 'quick', 'standard', 1)
  on conflict (wallet_id, tier, mode)
  do update set balance = public.wallet_credits.balance + 1;

  insert into public.wallet_transactions (wallet_id, type, tier, mode, delta)
  values (p_wallet_id, 'grant', 'quick', 'standard', 1);
  return true;
end;
$$;

alter table public.wallet_point_transactions enable row level security;
alter table public.scan_gifts enable row level security;
revoke all on table public.wallet_point_transactions from public, anon, authenticated;
revoke all on table public.scan_gifts from public, anon, authenticated;
grant all on table public.wallet_point_transactions to service_role;
grant all on table public.scan_gifts to service_role;
grant execute on function public.award_scan_points(uuid, uuid, text, integer) to service_role;
grant execute on function public.redeem_wallet_points(uuid, integer) to service_role;
