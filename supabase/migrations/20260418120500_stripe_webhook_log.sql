-- Stripe webhook event log.
--
-- /api/stripe/webhooks inserts here BEFORE processing to dedupe replays
-- (Stripe retries with the same event_id). Processing outcome is written
-- back to processed_at / processed_ok / error_message.
--
-- Additive migration. No existing columns dropped.

create table if not exists public.stripe_webhook_log (
  event_id text primary key,
  type text not null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processed_ok boolean,
  error_message text
);

create index if not exists stripe_webhook_log_type_idx
  on public.stripe_webhook_log (type, received_at desc);

alter table public.stripe_webhook_log enable row level security;
-- No policies → service-role only. Authenticated users cannot read or write.

-- Rollback (uncomment to revert):
-- drop index if exists public.stripe_webhook_log_type_idx;
-- drop table if exists public.stripe_webhook_log;
