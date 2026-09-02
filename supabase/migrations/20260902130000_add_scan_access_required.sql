-- New scans are private by default. Existing rows remain compatible and public
-- until they are deliberately migrated or curated.
alter table public.scans
  add column if not exists access_required boolean not null default false;

create index if not exists scans_access_required_idx
  on public.scans (access_required, status, created_at desc);
