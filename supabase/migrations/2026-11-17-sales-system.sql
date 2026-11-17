-- Sales System clients — paste this whole file into the Supabase SQL editor
-- and press Run once.
--
-- SAFE: step 1 snapshots your existing data into backup tables first.
-- Steps 2–4 only ADD things (new stage values, new empty columns, one new
-- table). No existing row, column or value is changed or deleted. Existing
-- projects become client_type = 'website' via the column default.
-- Safe to re-run: every statement checks whether it has already happened.

-- ===== 1. Backup copies of everything that exists today =====
create table if not exists backup_20261117_projects as table projects;
create table if not exists backup_20261117_project_tasks as table project_tasks;
-- lock the backups down (RLS on with no policies = nobody can read them via the API)
alter table backup_20261117_projects enable row level security;
alter table backup_20261117_project_tasks enable row level security;

-- ===== 2. New Sales System pipeline stages =====
alter type project_stage add value if not exists 'ss_call_booked';
alter type project_stage add value if not exists 'ss_projections';
alter type project_stage add value if not exists 'ss_call2_booked';
alter type project_stage add value if not exists 'ss_deciding';
alter type project_stage add value if not exists 'ss_agreed';
alter type project_stage add value if not exists 'ss_onboarding_paid';
alter type project_stage add value if not exists 'ss_onboarding';
alter type project_stage add value if not exists 'ss_ads_review';
alter type project_stage add value if not exists 'ss_ads_live';
alter type project_stage add value if not exists 'ss_day21_review';
alter type project_stage add value if not exists 'ss_review_done';
alter type project_stage add value if not exists 'ss_pilot_complete';
alter type project_stage add value if not exists 'ss_retained';
alter type project_stage add value if not exists 'ss_ended';
alter type project_stage add value if not exists 'ss_lost';

-- ===== 3. New columns on projects (all empty / defaulted) =====
alter table projects
  add column if not exists client_type text not null default 'website'
    check (client_type in ('website', 'sales_system')),
  add column if not exists onboarding_fee numeric,
  add column if not exists onboarding_paid_at date,
  add column if not exists price_per_call numeric,
  add column if not exists guaranteed_calls integer,
  add column if not exists pilot_start_date date;

-- ===== 4. Calls held per client per calendar month =====
create table if not exists sales_call_months (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  month date not null,                 -- first day of the calendar month
  calls_held integer not null default 0 check (calls_held >= 0),
  retainer_amount numeric,             -- post-pilot retainer for that month
  invoiced_at date,
  paid_at date,
  created_at timestamptz not null default now(),
  unique (project_id, month)
);

alter table sales_call_months enable row level security;

drop policy if exists "authenticated users can do anything with sales_call_months"
  on sales_call_months;
create policy "authenticated users can do anything with sales_call_months"
  on sales_call_months for all
  to authenticated
  using (true)
  with check (true);

-- ===== 5. Check: these counts should match (live vs backup) =====
select
  (select count(*) from projects) as projects_now,
  (select count(*) from backup_20261117_projects) as projects_backed_up,
  (select count(*) from project_tasks) as tasks_now,
  (select count(*) from backup_20261117_project_tasks) as tasks_backed_up;
