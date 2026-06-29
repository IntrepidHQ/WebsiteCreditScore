-- Funnel & quality enrichment for the scans table.
-- These columns make cohort / conversion / unit-economics analysis possible
-- without parsing the JSONB result blob on every query.

alter table scans
  -- Acquisition attribution (captured at scan-creation time from the request).
  add column if not exists referrer      text,
  add column if not exists utm_source    text,
  add column if not exists utm_medium    text,
  add column if not exists utm_campaign  text,
  -- Timing: started_at is set when the agent begins streaming; completed_at when
  -- the report is saved. Duration = completed_at - started_at.
  add column if not exists started_at    timestamptz,
  add column if not exists completed_at  timestamptz,
  -- Quality signals denormalized from result for fast aggregation.
  add column if not exists search_count  int,
  add column if not exists result_grade  text,
  add column if not exists result_score  int;

-- Index for grade/score distribution queries and recency-bounded cohorts.
create index if not exists scans_result_grade_idx
  on scans(result_grade) where result_grade is not null;
create index if not exists scans_utm_source_idx
  on scans(utm_source, created_at desc) where utm_source is not null;
create index if not exists scans_completed_at_idx
  on scans(completed_at desc) where completed_at is not null;
