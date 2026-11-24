import { createClient } from "@/lib/supabase/server";
import type { AdSpend, MaintenancePayment, Project, SalesMonth } from "./types";

export async function loadCrmData() {
  const supabase = await createClient();
  const [{ data }, { data: monthRows }, { data: adRows }, { data: payRows }] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("sales_call_months").select("*"),
    supabase.from("ad_spend").select("*"),
    supabase.from("maintenance_payments").select("*"),
  ]);

  const projects = ((data ?? []) as Project[]).map((p) => ({
    ...p,
    client_type: p.client_type ?? "website",
  }));
  const months = (monthRows ?? []) as SalesMonth[];

  return {
    projects,
    months,
    adSpend: (adRows ?? []) as AdSpend[],
    maintenancePayments: (payRows ?? []) as MaintenancePayment[],
    websiteProjects: projects.filter((p) => p.client_type !== "sales_system"),
    salesProjects: projects.filter((p) => p.client_type === "sales_system"),
  };
}
