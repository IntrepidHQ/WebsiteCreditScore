-- The product contract is funding-based:
--   free/operator scans are public; paid wallet/Stripe scans are private.
-- `is_public_example` remains a separate editorial flag and never overrides
-- private access.

alter table public.scans
  add column if not exists wallet_id uuid references public.wallets(id) on delete set null;

create index if not exists scans_wallet_idx
  on public.scans (wallet_id, created_at desc)
  where wallet_id is not null;

update public.scans
set access_required = false
where stripe_session_id like 'free_scan_%'
   or stripe_session_id like 'comp_scan_%';

update public.scans
set access_required = true
where stripe_session_id like 'wallet_scan_%'
   or stripe_session_id like 'cs_%';
