-- Create a public bucket for persisting site preview screenshots.
-- Screenshots are re-captured live on miss but stored here so that cold
-- starts and new deploys can skip the expensive Playwright capture step.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-previews',
  'site-previews',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
on conflict (id) do nothing;

-- Public read: preview images are non-sensitive (any URL can be screenshotted).
create policy "public can read site preview images"
  on storage.objects
  for select
  using (bucket_id = 'site-previews');

-- Server-side uploads use the service role key which bypasses RLS, so no
-- insert/update policy is needed for authenticated or anon roles.
