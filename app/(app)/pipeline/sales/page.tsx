import { KanbanBoard } from "@/components/KanbanBoard";
import { ActivePilotsList } from "@/components/ActivePilotsList";
import { Figure, FigureRow, Panel } from "@/components/dashboard/Figure";
import { loadCrmData } from "@/lib/data";
import { computeFinancialSummary } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";
import { isInPilot } from "@/lib/sales";
import { salesHeadline } from "@/lib/analytics";
import { SALES_STAGES } from "@/lib/stages";

export default async function SalesPipelinePage() {
  const { salesProjects, months } = await loadCrmData();
  const fin = computeFinancialSummary(salesProjects, months);
  const head = salesHeadline(salesProjects, months);
  const pilots = salesProjects.filter(isInPilot);
  const monthName = new Date().toLocaleString("en-IE", { month: "long" });

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold text-fg">Sales System pipeline</h1>
        <p className="mt-1 text-sm text-muted">
          €1,000 onboarding + per booked call, 90-day pilot. Drag a card to move it.
        </p>
      </div>
      <FigureRow cols={5}>
        <Figure label="Still to come" value={formatCurrency(fin.pipelineValue.total)} sub="Unpaid onboarding + calls owed" />
        <Figure label={`Revenue in ${monthName}`} value={formatCurrency(fin.revenueThisMonth.total)} sub="Onboarding + calls held" />
        <Figure label="Made so far" value={formatCurrency(head.earned)} sub={`of ${formatCurrency(head.projected)} projected`} />
        <Figure label="Outstanding" value={formatCurrency(fin.outstanding.total)} sub="Calls held, not paid yet" />
        <Figure label="Pilots running" value={pilots.length} sub={`${head.callsHeld} / ${head.guaranteed} calls held`} />
      </FigureRow>
      <KanbanBoard
        id="sales-kanban"
        stages={SALES_STAGES}
        initialProjects={salesProjects}
        months={months}
      />
      <Panel title="Active pilots">
        <ActivePilotsList projects={pilots} months={months} />
      </Panel>
    </div>
  );
}
