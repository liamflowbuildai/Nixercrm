-- Lost bucket for both pipelines. Paste into the Supabase SQL editor, Run.
-- SAFE: backs up first, then only ADDS (one stage value, two empty columns).
-- Nothing existing is changed or deleted. Safe to re-run.

-- 1. Fresh backup of everything as it is right now
create table if not exists backup_20261117b_projects as table projects;
create table if not exists backup_20261117b_project_tasks as table project_tasks;
create table if not exists backup_20261117b_sales_call_months as table sales_call_months;
alter table backup_20261117b_projects enable row level security;
alter table backup_20261117b_project_tasks enable row level security;
alter table backup_20261117b_sales_call_months enable row level security;

-- 2. "Lost" stage for the website pipeline (sales already has one)
alter type project_stage add value if not exists 'lost';

-- 3. Which stage a deal was lost at, and when (empty until a deal is lost)
alter table projects
  add column if not exists lost_from_stage project_stage,
  add column if not exists lost_at date;

-- 4. Check: each pair should match
select
  (select count(*) from projects) as projects_now,
  (select count(*) from backup_20261117b_projects) as projects_backed_up,
  (select count(*) from project_tasks) as tasks_now,
  (select count(*) from backup_20261117b_project_tasks) as tasks_backed_up;
