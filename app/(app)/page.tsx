import { createClient } from "@/lib/supabase/server";
import { KanbanBoard } from "@/components/KanbanBoard";
import { ActiveProjectsList } from "@/components/ActiveProjectsList";
import { ActivePilotsList } from "@/components/ActivePilotsList";
import { FinancialSummary } from "@/components/FinancialSummary";
import { NeedsAttention } from "@/components/NeedsAttention";
import { computeAlerts } from "@/lib/alerts";
import { isInPilot } from "@/lib/sales";
import { SALES_STAGES, WEBSITE_STAGES } from "@/lib/stages";
import type { Project, SalesMonth } from "@/lib/types";

const heading =
  "mb-3 text-sm font-semibold uppercase tracking-wide text-muted";

export default async function DashboardPage() {
  const supabase = await createClient();
  const [{ data }, { data: monthRows }] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("sales_call_months").select("*"),
  ]);

  // Rows created before the sales-system migration have no client_type.
  const projects = ((data ?? []) as Project[]).map((p) => ({
    ...p,
    client_type: p.client_type ?? "website",
  }));
  const months = (monthRows ?? []) as SalesMonth[];

  const websiteProjects = projects.filter((p) => p.client_type !== "sales_system");
  const salesProjects = projects.filter((p) => p.client_type === "sales_system");
  const activeProjects = websiteProjects.filter(
    (p) => p.stage === "project_underway",
  );
  const activePilots = salesProjects.filter(isInPilot);
  const alerts = computeAlerts(projects);

  return (
    <div className="flex flex-col gap-8">
      <NeedsAttention alerts={alerts} />
      <section>
        <h2 className={heading}>Finances</h2>
        <FinancialSummary projects={projects} months={months} />
      </section>
      <section>
        <h2 className={heading}>Active Pilots</h2>
        <ActivePilotsList projects={activePilots} months={months} />
      </section>
      <section>
        <h2 className={heading}>Active Projects</h2>
        <ActiveProjectsList projects={activeProjects} />
      </section>
      <section>
        <h2 className={heading}>Sales System Pipeline</h2>
        <KanbanBoard
          id="sales-kanban"
          stages={SALES_STAGES}
          initialProjects={salesProjects}
          months={months}
        />
      </section>
      <section>
        <h2 className={heading}>Website Pipeline</h2>
        <KanbanBoard
          id="website-kanban"
          stages={WEBSITE_STAGES}
          initialProjects={websiteProjects}
        />
      </section>
    </div>
  );
}
