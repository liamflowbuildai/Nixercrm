-- Lost bucket + Meta ad spend. Paste into the Supabase SQL editor, Run.
-- SAFE: backs up first, then only ADDS (one stage value, two empty columns,
-- one new table). Nothing existing is changed or deleted. Safe to re-run.

-- 1. Fresh backup of everything as it is right now
create table if not exists backup_20261124_projects as table projects;
create table if not exists backup_20261124_project_tasks as table project_tasks;
create table if not exists backup_20261124_sales_call_months as table sales_call_months;
alter table backup_20261124_projects enable row level security;
alter table backup_20261124_project_tasks enable row level security;
alter table backup_20261124_sales_call_months enable row level security;

-- 2. "Lost" stage for the website pipeline (sales already has one)
alter type project_stage add value if not exists 'lost';

-- 3. Which stage a deal was lost at, and when (empty until a deal is lost)
alter table projects
  add column if not exists lost_from_stage project_stage,
  add column if not exists lost_at date;

-- 4. Meta ad spend, one row per month
create table if not exists ad_spend (
  id uuid primary key default gen_random_uuid(),
  month date not null unique,          -- first day of the month
  daily_budget numeric,
  actual_total numeric,
  updated_at timestamptz not null default now()
);
alter table ad_spend enable row level security;
drop policy if exists "authenticated users can do anything with ad_spend" on ad_spend;
create policy "authenticated users can do anything with ad_spend"
  on ad_spend for all to authenticated using (true) with check (true);

-- 5. Check: each pair should match
select
  (select count(*) from projects) as projects_now,
  (select count(*) from backup_20261124_projects) as projects_backed_up,
  (select count(*) from project_tasks) as tasks_now,
  (select count(*) from backup_20261124_project_tasks) as tasks_backed_up;
