-- Durable cache for vendor AI responses (benchmark rerank, site analysis).
-- Server writes via SUPABASE_SERVICE_ROLE_KEY; no RLS policies so only service role should be used from app.
create table if not exists public.public_ai_response_cache (
  cache_key text primary key,
  kind text not null,
  payload jsonb not null,
  expires_at timestamptz not null
);

create index if not exists public_ai_response_cache_expires_at_idx
  on public.public_ai_response_cache (expires_at);

create index if not exists public_ai_response_cache_kind_idx
  on public.public_ai_response_cache (kind);

alter table public.public_ai_response_cache enable row level security;
