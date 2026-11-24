import type { ClientType, ProjectStage } from "./stages";

export type Project = {
  id: string;
  name: string;
  client_type: ClientType;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  stage: ProjectStage;
  live_url: string | null;
  folder_url: string | null;
  budget_amount: number | null;
  deposit_amount: number | null;
  deposit_paid_at: string | null;
  invoice_paid_at: string | null;
  maintenance_fee: number | null;
  maintenance_setup_at: string | null;
  no_maintenance: boolean;
  launch_date: string | null;
  renewal_date: string | null;
  follow_up_date: string | null;
  notes: string | null;
  // Sales System fields (null for website projects)
  onboarding_fee: number | null;
  onboarding_paid_at: string | null;
  price_per_call: number | null;
  guaranteed_calls: number | null;
  pilot_start_date: string | null;
  // Lost deals: the stage they were at when lost, and when
  lost_from_stage: ProjectStage | null;
  lost_at: string | null;
  // Website maintenance billing: yearly (older clients) or monthly
  maintenance_billing: "monthly" | "yearly" | null;
  monthly_billing_from: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectTask = {
  id: string;
  project_id: string;
  title: string;
  is_done: boolean;
  created_at: string;
};

// One row per Sales System client per calendar month. Revenue for the month =
// calls_held × price_per_call + retainer_amount (retainer is for after the pilot).
export type SalesMonth = {
  id: string;
  project_id: string;
  month: string; // first day of the month, YYYY-MM-01
  calls_held: number;
  retainer_amount: number | null;
  invoiced_at: string | null;
  paid_at: string | null;
  created_at: string;
};

// Meta ad spend per calendar month (one row per month).
export type AdSpend = {
  id: string;
  month: string; // YYYY-MM-01
  daily_budget: number | null;
  actual_total: number | null;
  updated_at: string;
};

// A maintenance payment from a yearly-billed website client.
export type MaintenancePayment = {
  id: string;
  project_id: string;
  paid_at: string;
  amount: number;
  covers_until: string | null;
  note: string | null;
  created_at: string;
};
