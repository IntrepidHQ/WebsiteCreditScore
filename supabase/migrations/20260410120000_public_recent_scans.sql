-- Durable "recent public scans" for the marketing homepage (server-side reads/writes via service role).
create table if not exists public.public_recent_scans (
  normalized_url text primary key,
  title text not null,
  score double precision not null,
  summary text not null,
  report_id text not null,
  preview_image text,
  scanned_at timestamptz not null default now()
);

create index if not exists public_recent_scans_scanned_at_idx
  on public.public_recent_scans (scanned_at desc);

alter table public.public_recent_scans enable row level security;

-- No policies: only the service role (bypasses RLS) may access this table from the app server.
