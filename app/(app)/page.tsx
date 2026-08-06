import { createClient } from "@/lib/supabase/server";
import { KanbanBoard } from "@/components/KanbanBoard";
import { ActiveProjectsList } from "@/components/ActiveProjectsList";
import { FinancialSummary } from "@/components/FinancialSummary";
import { NeedsAttention } from "@/components/NeedsAttention";
import { computeAlerts } from "@/lib/alerts";
import type { Project } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  const projects = (data ?? []) as Project[];
  const activeProjects = projects.filter(
    (p) => p.stage === "project_underway",
  );
  const alerts = computeAlerts(projects);

  return (
    <div className="flex flex-col gap-8">
      <NeedsAttention alerts={alerts} />
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Finances
        </h2>
        <FinancialSummary projects={projects} />
      </section>
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Active Projects
        </h2>
        <ActiveProjectsList projects={activeProjects} />
      </section>
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Pipeline
        </h2>
        <KanbanBoard initialProjects={projects} />
      </section>
    </div>
  );
}
