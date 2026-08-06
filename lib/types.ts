import type { ProjectStage } from "./stages";

export type Project = {
  id: string;
  name: string;
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
