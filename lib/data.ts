import { createClient } from "@/lib/supabase/server";
import type { Project, SalesMonth } from "./types";

export async function loadCrmData() {
  const supabase = await createClient();
  const [{ data }, { data: monthRows }] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("sales_call_months").select("*"),
  ]);

  const projects = ((data ?? []) as Project[]).map((p) => ({
    ...p,
    client_type: p.client_type ?? "website",
  }));
  const months = (monthRows ?? []) as SalesMonth[];

  return {
    projects,
    months,
    websiteProjects: projects.filter((p) => p.client_type !== "sales_system"),
    salesProjects: projects.filter((p) => p.client_type === "sales_system"),
  };
}
