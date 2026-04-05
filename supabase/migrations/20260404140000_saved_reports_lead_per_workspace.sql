-- Lead IDs were globally unique, which broke sample seeds for every workspace after the first.
-- Enforce uniqueness per workspace instead.
alter table saved_reports drop constraint if exists saved_reports_lead_id_key;

alter table saved_reports
  add constraint saved_reports_workspace_id_lead_id_key unique (workspace_id, lead_id);
