alter table scans
  add column if not exists tier text not null default 'quick'
    check (tier in ('quick','standard','deep')),
  add column if not exists mode text not null default 'standard'
    check (mode in ('standard','max')),
  add column if not exists free_claim_email text;

create index if not exists scans_tier_mode_idx on scans(tier, mode);
create index if not exists scans_free_claim_email_idx on scans(lower(free_claim_email)) where free_claim_email is not null;

create table if not exists free_scan_claims (
  email           text primary key,
  claimed_at      timestamptz not null default now(),
  scan_id         uuid references scans(id) on delete set null,
  domain          text not null,
  ip_hash         text,
  user_agent_hash text
);

create index if not exists free_scan_claims_claimed_at_idx on free_scan_claims(claimed_at desc);
create index if not exists free_scan_claims_domain_idx on free_scan_claims(domain, claimed_at desc);
create index if not exists free_scan_claims_ip_idx on free_scan_claims(ip_hash, claimed_at desc) where ip_hash is not null;

alter table free_scan_claims enable row level security;

drop policy if exists "service-role free_scan_claims all" on free_scan_claims;
create policy "service-role free_scan_claims all"
  on free_scan_claims for all
  to service_role
  using (true)
  with check (true);

create or replace function claim_verified_free_scan(
  p_email text,
  p_domain text,
  p_ip_hash text default null,
  p_user_agent_hash text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_scan_id uuid := gen_random_uuid();
  v_email text := lower(trim(p_email));
begin
  if v_email is null or v_email = '' then
    return null;
  end if;

  begin
    insert into scans (
      id,
      domain,
      status,
      paid,
      stripe_session_id,
      tier,
      mode,
      free_claim_email,
      ip_hash,
      user_agent
    )
    values (
      v_scan_id,
      lower(trim(p_domain)),
      'pending',
      true,
      'free_scan_' || substr(replace(v_scan_id::text, '-', ''), 1, 12),
      'quick',
      'standard',
      v_email,
      p_ip_hash,
      p_user_agent_hash
    );

    insert into free_scan_claims (
      email,
      scan_id,
      domain,
      ip_hash,
      user_agent_hash
    )
    values (
      v_email,
      v_scan_id,
      lower(trim(p_domain)),
      p_ip_hash,
      p_user_agent_hash
    );

    return v_scan_id;
  exception
    when unique_violation then
      return null;
  end;
end;
$$;

revoke all on function claim_verified_free_scan(text, text, text, text) from public;
grant execute on function claim_verified_free_scan(text, text, text, text) to service_role;
