-- FlowBuild CRM schema
-- Run this once in the Supabase SQL editor for your project.

create type project_stage as enum (
  'call_booked',
  'quoted',
  'confirmed',
  'deposit_paid',
  'project_underway',
  'project_complete',
  'invoice_paid',
  'site_live',
  'maintenance_setup',
  'testimonial_requested',
  -- Sales System pipeline
  'ss_call_booked','ss_projections','ss_call2_booked','ss_deciding',
  'ss_agreed','ss_onboarding_paid','ss_onboarding','ss_ads_review',
  'ss_ads_live','ss_day21_review','ss_review_done','ss_pilot_complete',
  'ss_retained','ss_ended','ss_lost',
  'lost'
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_type text not null default 'website'
    check (client_type in ('website', 'sales_system')),
  client_name text,
  client_email text,
  client_phone text,
  stage project_stage not null default 'call_booked',
  live_url text,
  folder_url text,
  budget_amount numeric,
  deposit_amount numeric,
  deposit_paid_at date,
  invoice_paid_at date,
  maintenance_fee numeric,
  maintenance_setup_at date,
  no_maintenance boolean not null default false,
  launch_date date,
  renewal_date date,
  follow_up_date date,
  notes text,
  onboarding_fee numeric,
  onboarding_paid_at date,
  price_per_call numeric,
  guaranteed_calls integer,
  pilot_start_date date,
  lost_from_stage project_stage,
  lost_at date,
  created_by uuid references auth.users,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  is_done boolean not null default false,
  created_at timestamptz not null default now()
);

create index project_tasks_project_id_idx on project_tasks(project_id);

create table sales_call_months (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  month date not null,
  calls_held integer not null default 0 check (calls_held >= 0),
  retainer_amount numeric,
  invoiced_at date,
  paid_at date,
  created_at timestamptz not null default now(),
  unique (project_id, month)
);

alter table sales_call_months enable row level security;

create policy "authenticated users can do anything with sales_call_months"
  on sales_call_months for all
  to authenticated
  using (true)
  with check (true);

alter table projects enable row level security;
alter table project_tasks enable row level security;

create policy "authenticated users can do anything with projects"
  on projects for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated users can do anything with project_tasks"
  on project_tasks for all
  to authenticated
  using (true)
  with check (true);

create function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_set_updated_at
  before update on projects
  for each row
  execute function set_updated_at();

-- Migration: if your database was created before `no_maintenance` existed
-- above, run this once instead of the whole script:
-- alter table projects add column no_maintenance boolean not null default false;

-- Migration: databases created before Sales System clients existed should run
-- supabase/migrations/2026-11-17-sales-system.sql instead of this script.

create table ad_spend (
  id uuid primary key default gen_random_uuid(),
  month date not null unique,
  daily_budget numeric,
  actual_total numeric,
  updated_at timestamptz not null default now()
);
alter table ad_spend enable row level security;
create policy "authenticated users can do anything with ad_spend"
  on ad_spend for all to authenticated using (true) with check (true);
