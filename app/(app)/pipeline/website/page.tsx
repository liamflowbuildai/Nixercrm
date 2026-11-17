import { KanbanBoard } from "@/components/KanbanBoard";
import { ActiveProjectsList } from "@/components/ActiveProjectsList";
import { Figure, FigureRow, Panel } from "@/components/dashboard/Figure";
import { loadCrmData } from "@/lib/data";
import { computeFinancialSummary } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";
import { WEBSITE_STAGES } from "@/lib/stages";

export default async function WebsitePipelinePage() {
  const { websiteProjects, months } = await loadCrmData();
  const fin = computeFinancialSummary(websiteProjects, months);
  const active = websiteProjects.filter((p) => p.stage === "project_underway");

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold text-fg">Website pipeline</h1>
        <p className="mt-1 text-sm text-muted">Website builds from first call to testimonial. Drag a card to move it.</p>
      </div>
      <FigureRow cols={4}>
        <Figure label="Pipeline value" value={formatCurrency(fin.pipelineValue.total)} sub="Remaining on jobs in progress" />
        <Figure label="Outstanding" value={formatCurrency(fin.outstanding.total)} sub="Finished, not paid yet" />
        <Figure label={`Revenue ${new Date().getFullYear()}`} value={formatCurrency(fin.revenueThisYear.total)} />
        <Figure label="Maintenance (yearly)" value={formatCurrency(fin.yearlyMaintenance.total)} />
      </FigureRow>
      <KanbanBoard
        id="website-kanban"
        stages={WEBSITE_STAGES}
        initialProjects={websiteProjects}
      />
      <Panel title="Active projects">
        <ActiveProjectsList projects={active} />
      </Panel>
    </div>
  );
}
