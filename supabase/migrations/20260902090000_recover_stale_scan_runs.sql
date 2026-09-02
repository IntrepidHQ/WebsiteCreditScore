-- Return interrupted workers to an explicit retryable state. A scheduler can
-- call the recovery endpoint without creating duplicate workers.
create or replace function public.recover_stale_scan_runs(p_limit integer default 20)
returns table(id uuid)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with stale as (
    select s.id
    from public.scans s
    where s.status = 'streaming'
      and s.run_lease_expires_at is not null
      and s.run_lease_expires_at < now()
    order by s.run_lease_expires_at asc
    limit greatest(1, least(coalesce(p_limit, 20), 100))
    for update skip locked
  )
  update public.scans s
  set status = 'error',
      last_error = 'Worker lease expired. The scan is ready to retry.',
      run_lease_expires_at = null,
      progress = jsonb_build_object(
        'phase', 'retry available',
        'message', 'The previous worker stopped responding.',
        'updated_at', now()
      )
  from stale
  where s.id = stale.id
  returning s.id;
end;
$$;
