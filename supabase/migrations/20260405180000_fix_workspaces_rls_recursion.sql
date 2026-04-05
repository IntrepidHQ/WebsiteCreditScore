-- Fix PostgreSQL 42P17: infinite recursion detected in policy for relation "workspaces".
--
-- The policy "public can read workspaces that have shared leads" subqueried `leads`.
-- RLS on `leads` includes policies that subquery `workspaces`, which re-evaluated
-- workspaces policies → infinite recursion.
--
-- This helper runs with row_security disabled inside the function body only, so the
-- existence check does not re-enter RLS.

create or replace function public.workspace_has_public_share(p_workspace_id text)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1
    from leads
    join share_links on share_links.lead_id = leads.id
    where leads.workspace_id = p_workspace_id
      and share_links.enabled = true
  );
$$;

revoke all on function public.workspace_has_public_share(text) from public;
grant execute on function public.workspace_has_public_share(text) to authenticated;
grant execute on function public.workspace_has_public_share(text) to anon;

drop policy if exists "public can read workspaces that have shared leads" on workspaces;

create policy "public can read workspaces that have shared leads"
  on workspaces
  for select
  using (public.workspace_has_public_share(workspaces.id));
