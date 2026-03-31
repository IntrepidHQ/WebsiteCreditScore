create extension if not exists "pgcrypto";

create table if not exists workspaces (
  id text primary key,
  owner_user_id uuid not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists saved_reports (
  id text primary key,
  workspace_id text not null references workspaces(id) on delete cascade,
  lead_id text not null unique,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists leads (
  id text primary key,
  workspace_id text not null references workspaces(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists activities (
  id text primary key,
  workspace_id text not null references workspaces(id) on delete cascade,
  lead_id text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists reminders (
  id text primary key,
  workspace_id text not null references workspaces(id) on delete cascade,
  lead_id text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists email_templates (
  id text primary key,
  workspace_id text not null references workspaces(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists referral_codes (
  id text primary key,
  workspace_id text not null references workspaces(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists referral_events (
  id text primary key,
  workspace_id text not null references workspaces(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists workspace_credits (
  id text primary key,
  workspace_id text not null references workspaces(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists product_promos (
  id text primary key,
  workspace_id text not null references workspaces(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists share_links (
  id text primary key,
  workspace_id text not null references workspaces(id) on delete cascade,
  lead_id text not null,
  surface text not null check (surface in ('audit', 'packet', 'brief')),
  token text not null unique,
  enabled boolean not null default true,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table workspaces enable row level security;
alter table saved_reports enable row level security;
alter table leads enable row level security;
alter table activities enable row level security;
alter table reminders enable row level security;
alter table email_templates enable row level security;
alter table referral_codes enable row level security;
alter table referral_events enable row level security;
alter table workspace_credits enable row level security;
alter table product_promos enable row level security;
alter table share_links enable row level security;

create policy "workspace owner can manage workspaces"
  on workspaces
  for all
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

create policy "workspace owner can manage leads"
  on leads
  for all
  using (
    exists (
      select 1 from workspaces
      where workspaces.id = leads.workspace_id
        and workspaces.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from workspaces
      where workspaces.id = leads.workspace_id
        and workspaces.owner_user_id = auth.uid()
    )
  );

create policy "workspace owner can manage saved reports"
  on saved_reports
  for all
  using (
    exists (
      select 1 from workspaces
      where workspaces.id = saved_reports.workspace_id
        and workspaces.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from workspaces
      where workspaces.id = saved_reports.workspace_id
        and workspaces.owner_user_id = auth.uid()
    )
  );

create policy "workspace owner can manage workspace payload tables"
  on activities
  for all
  using (
    exists (
      select 1 from workspaces
      where workspaces.id = activities.workspace_id
        and workspaces.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from workspaces
      where workspaces.id = activities.workspace_id
        and workspaces.owner_user_id = auth.uid()
    )
  );

create policy "workspace owner can manage reminders"
  on reminders
  for all
  using (
    exists (
      select 1 from workspaces
      where workspaces.id = reminders.workspace_id
        and workspaces.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from workspaces
      where workspaces.id = reminders.workspace_id
        and workspaces.owner_user_id = auth.uid()
    )
  );

create policy "workspace owner can manage templates"
  on email_templates
  for all
  using (
    exists (
      select 1 from workspaces
      where workspaces.id = email_templates.workspace_id
        and workspaces.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from workspaces
      where workspaces.id = email_templates.workspace_id
        and workspaces.owner_user_id = auth.uid()
    )
  );

create policy "workspace owner can manage referral codes"
  on referral_codes
  for all
  using (
    exists (
      select 1 from workspaces
      where workspaces.id = referral_codes.workspace_id
        and workspaces.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from workspaces
      where workspaces.id = referral_codes.workspace_id
        and workspaces.owner_user_id = auth.uid()
    )
  );

create policy "workspace owner can manage referral events"
  on referral_events
  for all
  using (
    exists (
      select 1 from workspaces
      where workspaces.id = referral_events.workspace_id
        and workspaces.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from workspaces
      where workspaces.id = referral_events.workspace_id
        and workspaces.owner_user_id = auth.uid()
    )
  );

create policy "workspace owner can manage credits"
  on workspace_credits
  for all
  using (
    exists (
      select 1 from workspaces
      where workspaces.id = workspace_credits.workspace_id
        and workspaces.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from workspaces
      where workspaces.id = workspace_credits.workspace_id
        and workspaces.owner_user_id = auth.uid()
    )
  );

create policy "workspace owner can manage promos"
  on product_promos
  for all
  using (
    exists (
      select 1 from workspaces
      where workspaces.id = product_promos.workspace_id
        and workspaces.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from workspaces
      where workspaces.id = product_promos.workspace_id
        and workspaces.owner_user_id = auth.uid()
    )
  );

create policy "workspace owner can manage share links"
  on share_links
  for all
  using (
    exists (
      select 1 from workspaces
      where workspaces.id = share_links.workspace_id
        and workspaces.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from workspaces
      where workspaces.id = share_links.workspace_id
        and workspaces.owner_user_id = auth.uid()
    )
  );

create policy "public can resolve share links"
  on share_links
  for select
  using (enabled = true);

create policy "public can read shared leads"
  on leads
  for select
  using (
    exists (
      select 1 from share_links
      where share_links.lead_id = leads.id
        and share_links.enabled = true
    )
  );

create policy "public can read shared reports"
  on saved_reports
  for select
  using (
    exists (
      select 1 from share_links
      where share_links.lead_id = saved_reports.lead_id
        and share_links.enabled = true
    )
  );

create policy "public can read workspaces that have shared leads"
  on workspaces
  for select
  using (
    exists (
      select 1
      from leads
      join share_links on share_links.lead_id = leads.id
      where leads.workspace_id = workspaces.id
        and share_links.enabled = true
    )
  );
