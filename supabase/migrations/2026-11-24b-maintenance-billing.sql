-- Maintenance billing (monthly vs yearly) + yearly maintenance payments.
-- Paste into the Supabase SQL editor, Run.
-- SAFE: backs up first, then only ADDS (two columns, one new table).
-- Every existing client becomes "yearly" via the column default; nothing
-- existing is changed or deleted. Safe to re-run.

-- 1. Fresh backup
create table if not exists backup_20261124b_projects as table projects;
alter table backup_20261124b_projects enable row level security;

-- 2. How each website client's maintenance is billed
alter table projects
  add column if not exists maintenance_billing text not null default 'yearly'
    check (maintenance_billing in ('monthly', 'yearly')),
  add column if not exists monthly_billing_from date;

-- 3. Payments from yearly-billed clients
create table if not exists maintenance_payments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  paid_at date not null,
  amount numeric not null,
  covers_until date,
  note text,
  created_at timestamptz not null default now()
);
alter table maintenance_payments enable row level security;
drop policy if exists "authenticated users can do anything with maintenance_payments" on maintenance_payments;
create policy "authenticated users can do anything with maintenance_payments"
  on maintenance_payments for all to authenticated using (true) with check (true);

-- 4. Check: these should match
select
  (select count(*) from projects) as projects_now,
  (select count(*) from backup_20261124b_projects) as projects_backed_up;
