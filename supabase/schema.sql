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
  'testimonial_requested'
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
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
