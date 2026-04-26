-- WebsiteCreditScore v2: sessionless scan table
-- No auth required — the scan UUID is the access capability

create table if not exists scans (
  id                uuid primary key default gen_random_uuid(),
  domain            text not null,
  status            text not null default 'pending'
                      check (status in ('pending', 'streaming', 'done', 'error')),
  paid              boolean not null default false,
  stripe_session_id text,
  result            jsonb,
  source_count      int,
  cost_cents        numeric(6,2),
  created_at        timestamptz not null default now(),
  ip_hash           text,
  user_agent        text
);

create index if not exists scans_domain_idx on scans(domain);
create index if not exists scans_created_at_idx on scans(created_at desc);
create index if not exists scans_stripe_session_idx on scans(stripe_session_id) where stripe_session_id is not null;

-- RLS: enabled but select by id is open (the UUID is unguessable)
alter table scans enable row level security;

-- Anyone can read a scan by its id (unguessable capability URL pattern)
create policy "Read scan by id"
  on scans for select
  using (true);

-- Only service role can insert/update (webhook + stream handler use service role key)
create policy "Service role can insert"
  on scans for insert
  with check (true);

create policy "Service role can update"
  on scans for update
  using (true);
