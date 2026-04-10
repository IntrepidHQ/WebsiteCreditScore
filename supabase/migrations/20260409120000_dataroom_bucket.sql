-- Dataroom: public read URLs for builder handoff; writes go through the app (service role).
-- Run in Supabase SQL editor or via CLI after reviewing security posture.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dataroom',
  'dataroom',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Optional: lock down direct anonymous uploads (service role bypasses RLS).
-- Adjust if you later allow client-side uploads with a signed policy.

create policy "Public read dataroom objects"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'dataroom');
