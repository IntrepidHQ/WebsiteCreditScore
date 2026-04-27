-- Wallets: cookie-anchored credit ledger for prepaid scan packs.
-- Sessionless. Recovery is via email + Stripe session id (no auth account needed).

create table if not exists wallets (
  id                 uuid primary key default gen_random_uuid(),
  email              text,
  stripe_customer_id text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists wallets_email_idx           on wallets (lower(email)) where email is not null;
create index if not exists wallets_stripe_customer_idx on wallets (stripe_customer_id) where stripe_customer_id is not null;

-- One row per (wallet, tier, mode); balance is non-negative.
create table if not exists wallet_credits (
  wallet_id uuid not null references wallets(id) on delete cascade,
  tier      text not null check (tier in ('quick','standard','deep')),
  mode      text not null check (mode in ('standard','max')),
  balance   int  not null default 0 check (balance >= 0),
  primary key (wallet_id, tier, mode)
);

-- Append-only audit log. Idempotency on Stripe purchases via the partial unique index.
create table if not exists wallet_transactions (
  id                uuid primary key default gen_random_uuid(),
  wallet_id         uuid not null references wallets(id) on delete cascade,
  type              text not null check (type in ('purchase','consume','refund','grant')),
  tier              text not null check (tier in ('quick','standard','deep')),
  mode              text not null check (mode in ('standard','max')),
  delta             int  not null,            -- +N for purchase/grant/refund, -N for consume
  stripe_session_id text,
  scan_id           uuid references scans(id) on delete set null,
  created_at        timestamptz not null default now()
);

create index if not exists wallet_transactions_wallet_idx
  on wallet_transactions (wallet_id, created_at desc);

create index if not exists wallet_transactions_session_idx
  on wallet_transactions (stripe_session_id) where stripe_session_id is not null;

-- Prevent double-credit on Stripe webhook retry: one purchase row per (session, tier, mode).
create unique index if not exists wallet_transactions_purchase_unique
  on wallet_transactions (stripe_session_id, tier, mode)
  where stripe_session_id is not null and type = 'purchase';

-- Atomic credit grant: insert tx + upsert balance in a single statement.
create or replace function credit_wallet(
  p_wallet_id         uuid,
  p_tier              text,
  p_mode              text,
  p_quantity          int,
  p_stripe_session_id text
) returns boolean
language plpgsql
as $$
declare
  v_inserted int;
begin
  if p_quantity <= 0 then
    return false;
  end if;

  insert into wallet_transactions (wallet_id, type, tier, mode, delta, stripe_session_id)
  values (p_wallet_id, 'purchase', p_tier, p_mode, p_quantity, p_stripe_session_id)
  on conflict (stripe_session_id, tier, mode)
    where stripe_session_id is not null and type = 'purchase'
  do nothing;

  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return false; -- already credited (webhook retry)
  end if;

  insert into wallet_credits (wallet_id, tier, mode, balance)
  values (p_wallet_id, p_tier, p_mode, p_quantity)
  on conflict (wallet_id, tier, mode)
  do update set balance = wallet_credits.balance + excluded.balance;

  update wallets set updated_at = now() where id = p_wallet_id;
  return true;
end;
$$;

-- Atomic consume: decrement only if balance > 0. Returns true on success.
create or replace function consume_wallet_credit(
  p_wallet_id uuid,
  p_tier      text,
  p_mode      text,
  p_scan_id   uuid
) returns boolean
language plpgsql
as $$
declare
  v_updated int;
begin
  update wallet_credits
     set balance = balance - 1
   where wallet_id = p_wallet_id
     and tier      = p_tier
     and mode      = p_mode
     and balance   > 0;

  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    return false;
  end if;

  insert into wallet_transactions (wallet_id, type, tier, mode, delta, scan_id)
  values (p_wallet_id, 'consume', p_tier, p_mode, -1, p_scan_id);

  update wallets set updated_at = now() where id = p_wallet_id;
  return true;
end;
$$;

alter table wallets              enable row level security;
alter table wallet_credits       enable row level security;
alter table wallet_transactions  enable row level security;

-- All writes go through the service role from API routes; deny anon by default.
create policy "service-role wallets all"             on wallets             for all using (true) with check (true);
create policy "service-role wallet_credits all"      on wallet_credits      for all using (true) with check (true);
create policy "service-role wallet_transactions all" on wallet_transactions for all using (true) with check (true);
