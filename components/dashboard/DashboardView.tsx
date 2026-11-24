import Link from "next/link";
import { NeedsAttention } from "@/components/NeedsAttention";
import { ActivePilotsList } from "@/components/ActivePilotsList";
import { Funnel } from "@/components/charts/Funnel";
import { StageLoadBars } from "@/components/charts/StageLoadBars";
import { LostBars } from "@/components/charts/LostBars";
import { Figure, FigureRow, Panel, Section } from "@/components/dashboard/Figure";
import { RangeFilter } from "@/components/dashboard/RangeFilter";
import { CallsTrend, DealsTrend, RevenueTrend } from "@/components/dashboard/RevenueTrend";
import { computeAlerts } from "@/lib/alerts";
import {
  RANGES,
  STALE_DAYS,
  callsTrend,
  inRange,
  lostSummary,
  newDealsTrend,
  type RangeValue,
  revenueTrend,
  salesFunnel,
  salesHeadline,
  salesRates,
  stageLoad,
  staleDeals,
  websiteFunnel,
  websiteRates,
} from "@/lib/analytics";
import { computeFinancialSummary } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";
import { expenseTotal, expensesForMonth, hasExpenseData } from "@/lib/expenses";
import { isInPilot } from "@/lib/sales";
import { SALES_STAGES, WEBSITE_STAGES, stageLabel } from "@/lib/stages";
import type { Project, SalesMonth } from "@/lib/types";

const pct = (n: number | null) => (n == null ? "—" : `${Math.round(n * 100)}%`);

export function DashboardView({
  projects,
  months,
  range,
}: {
  projects: Project[];
  months: SalesMonth[];
  range: RangeValue;
}) {
  const websiteProjects = projects.filter((p) => p.client_type !== "sales_system");
  const salesProjects = projects.filter((p) => p.client_type === "sales_system");
  const rangeLabel = RANGES.find((r) => r.value === range)!.label.toLowerCase();

  const fin = computeFinancialSummary(projects, months);
  const trend = revenueTrend(projects, months, 6);
  const thisMonth = trend[trend.length - 1];
  const lastMonth = trend[trend.length - 2];
  const thisTotal = thisMonth.web + thisMonth.sales;
  const lastTotal = lastMonth.web + lastMonth.sales;
  const delta = thisTotal - lastTotal;

  const salesInRange = salesProjects.filter((p) => inRange(p.created_at, range));
  const webInRange = websiteProjects.filter((p) => inRange(p.created_at, range));
  const sFunnel = salesFunnel(salesInRange);
  const wFunnel = websiteFunnel(webInRange);
  const sLost = lostSummary(salesInRange, SALES_STAGES);
  const wLost = lostSummary(webInRange, WEBSITE_STAGES);
  const sRates = salesRates(sFunnel);
  const wRates = websiteRates(wFunnel);
  const sales = salesHeadline(salesProjects, months);
  const stale = staleDeals(projects);
  const alerts = computeAlerts(projects);
  const now = new Date();
  const monthName = now.toLocaleString("en-IE", { month: "long" });
  const expenseItems = expensesForMonth(now.getFullYear(), now.getMonth());
  const expenses = expenseTotal(now.getFullYear(), now.getMonth());
  const showProfit = hasExpenseData(now.getFullYear(), now.getMonth());
  const profit = thisTotal - expenses;
  const margin = thisTotal > 0 ? Math.round((profit / thisTotal) * 100) : null;

  return (
    <div className="flex flex-col gap-14">
      <NeedsAttention alerts={alerts} />

      {/* ---------- Money ---------- */}
      <section>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:items-start">
          <div className="border-t border-border pt-4">
            <p className="text-sm text-muted">Revenue in {monthName}</p>
            <p className="mt-2 text-[56px] font-semibold leading-none tracking-[-0.05em] text-fg sm:text-[64px]">
              {formatCurrency(thisTotal)}
            </p>
            <p className="mt-3 text-sm text-muted">
              <span className={delta >= 0 ? "text-ok" : "text-danger"}>
                {delta >= 0 ? "▲" : "▼"} {formatCurrency(Math.abs(delta))}
              </span>{" "}
              vs {lastMonth.label} · Sales {formatCurrency(thisMonth.sales)} · Web{" "}
              {formatCurrency(thisMonth.web)}
            </p>

            <div className="mt-8 border-t border-border pt-4">
              <p className="text-sm text-muted">Profit in {monthName}</p>
              {showProfit ? (
                <>
                  <p
                    className={`mt-2 text-[40px] font-semibold leading-none tracking-[-0.045em] ${
                      profit >= 0 ? "text-fg" : "text-danger"
                    }`}
                  >
                    {profit < 0 && "−"}
                    {formatCurrency(Math.abs(profit))}
                  </p>
                  <p className="mt-3 text-sm text-muted">
                    Revenue {formatCurrency(thisTotal)} − expenses {formatCurrency(expenses)}
                    {margin != null && ` · ${margin}% margin`}
                  </p>
                  <details className="mt-3 text-sm">
                    <summary className="cursor-pointer text-xs text-dim hover:text-muted">
                      {expenseItems.length} expenses this month
                    </summary>
                    <ul className="mt-2 flex flex-col">
                      {expenseItems
                        .slice()
                        .sort((a, b) => b.amount - a.amount)
                        .map((e) => (
                          <li
                            key={e.name}
                            className="flex justify-between gap-4 border-b border-border py-1.5"
                          >
                            <span className="text-muted">
                              {e.name}
                              {!e.recurring && <span className="ml-1.5 text-xs text-dim">one-off</span>}
                            </span>
                            <span className="tnum text-fg">{formatCurrency(e.amount)}</span>
                          </li>
                        ))}
                    </ul>
                  </details>
                </>
              ) : (
                <p className="mt-2 text-sm text-dim">
                  Expenses not added yet. Read them out to Claude and this fills in.
                </p>
              )}
            </div>
          </div>
          <Panel title="Revenue, last 6 months" sub="Cash in for websites; held calls + onboarding for sales clients">
            <RevenueTrend data={trend} />
          </Panel>
        </div>
        <div className="mt-8">
          <FigureRow cols={4}>
            <Figure
              label="Pipeline value"
              value={formatCurrency(fin.pipelineValue.total)}
              sub={`Sales ${formatCurrency(fin.pipelineValue.salesTotal)} · Web ${formatCurrency(fin.pipelineValue.websiteTotal)}`}
            />
            <Figure
              label="Outstanding"
              value={formatCurrency(fin.outstanding.total)}
              sub="Work done or calls held, not paid yet"
            />
            <Figure
              label={`Revenue ${new Date().getFullYear()}`}
              value={formatCurrency(fin.revenueThisYear.total)}
              sub={`Sales ${formatCurrency(fin.revenueThisYear.salesTotal)} · Web ${formatCurrency(fin.revenueThisYear.websiteTotal)}`}
            />
            <Figure
              label="Maintenance MRR"
              value={`${formatCurrency(fin.monthlyMaintenance.total)}/mo`}
              sub={`${fin.monthlyMaintenance.lines.length} clients · ${formatCurrency(fin.monthlyMaintenance.total * 12)}/yr`}
            />
          </FigureRow>
        </div>
      </section>

      {/* ---------- Conversion ---------- */}
      <Section
        title="Conversion"
        aside={
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-dim">Deals added</span>
            <RangeFilter value={range} />
          </div>
        }
      >
        <FigureRow cols={5}>
          <Figure label="Book rate" value={pct(sRates.bookRate)} sub="Call 1 → call 2 booked" />
          <Figure label="Show rate" value={pct(sRates.showRate)} sub="Call 2 booked → held" />
          <Figure label="Close rate" value={pct(sRates.closeRate)} sub="Call 2 held → agreed" />
          <Figure label="Lead → client" value={pct(sRates.leadToClient)} sub="Call 1 → onboarding paid" />
          <Figure label="Website close rate" value={pct(wRates.closeRate)} sub="Quoted → confirmed" />
        </FigureRow>
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <Panel title="Sales System funnel" sub={`${salesInRange.length} deals added, ${rangeLabel}. ▼ marks the biggest drop-off before signing.`}>
            <Funnel steps={sFunnel} color="var(--series-sales)" />
          </Panel>
          <Panel title="Website funnel" sub={`${webInRange.length} deals added, ${rangeLabel}`}>
            <Funnel steps={wFunnel} color="var(--series-web)" />
          </Panel>
        </div>
      </Section>

      {/* ---------- Lost ---------- */}
      <Section title="Lost deals" aside={<span className="text-xs text-dim">Deals added, {rangeLabel}</span>}>
        <div className="grid gap-10 lg:grid-cols-2">
          <Panel
            title={`Sales System: ${pct(sLost.lostRate)} lost`}
            sub={`${sLost.lost} of ${sLost.total} deals. Where they were lost:`}
          >
            <LostBars summary={sLost} color="var(--series-sales)" />
          </Panel>
          <Panel
            title={`Websites: ${pct(wLost.lostRate)} lost`}
            sub={`${wLost.lost} of ${wLost.total} deals. Where they were lost:`}
          >
            <LostBars summary={wLost} color="var(--series-web)" />
          </Panel>
        </div>
      </Section>

      {/* ---------- Bottlenecks ---------- */}
      <Section title="Bottlenecks">
        <div className="grid gap-10 lg:grid-cols-2">
          <Panel title="Sales deals by stage" sub="Open deals sitting in each stage right now">
            <StageLoadBars load={stageLoad(salesProjects, SALES_STAGES)} color="var(--series-sales)" />
          </Panel>
          <Panel title="Website deals by stage" sub="Open deals sitting in each stage right now">
            <StageLoadBars load={stageLoad(websiteProjects, WEBSITE_STAGES)} color="var(--series-web)" />
          </Panel>
        </div>
        <div className="mt-8">
          <Panel title={`Untouched for ${STALE_DAYS}+ days`} sub="Deals nobody has updated in two weeks">
            {stale.length === 0 ? (
              <p className="text-sm text-dim">Nothing stale. Every open deal was touched in the last two weeks.</p>
            ) : (
              <ul className="flex flex-col">
                {stale.slice(0, 8).map(({ project, days }) => (
                  <li key={project.id}>
                    <Link
                      href={`/projects/${project.id}`}
                      className="grid grid-cols-[1fr_auto] gap-x-4 border-b border-border py-2 text-sm hover:text-accent sm:grid-cols-[1fr_16rem_6rem]"
                    >
                      <span className="truncate text-fg">{project.name}</span>
                      <span className="hidden truncate text-muted sm:block">{stageLabel(project.stage)}</span>
                      <span className="tnum text-right text-danger">⚠ {days}d</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </Section>

      {/* ---------- Sales delivery ---------- */}
      <Section title="Sales System delivery">
        <FigureRow cols={4}>
          <Figure label="Signed clients" value={sales.clients} sub="Onboarding paid or later" />
          <Figure
            label="Made from them so far"
            value={formatCurrency(sales.earned)}
            sub={`of ${formatCurrency(sales.projected)} projected`}
          />
          <Figure
            label="Calls held"
            value={`${sales.callsHeld} / ${sales.guaranteed}`}
            sub="Against total guaranteed"
          />
          <Figure
            label="Avg client value"
            value={formatCurrency(sales.avgClientValue)}
            sub="Projected, onboarding + guarantee"
          />
        </FigureRow>
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <Panel title="Calls held per month">
            <CallsTrend data={callsTrend(months, 6)} />
          </Panel>
          <Panel title="Active pilots">
            <ActivePilotsList projects={salesProjects.filter(isInPilot)} months={months} />
          </Panel>
        </div>
      </Section>

      <Section title="New deals">
        <Panel title="Deals added per month">
          <DealsTrend data={newDealsTrend(projects, 6)} />
        </Panel>
      </Section>
    </div>
  );
}
