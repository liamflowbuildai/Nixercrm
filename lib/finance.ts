import { stageIndex } from "./stages";
import { getPilotStatus, isLiveSalesClient, monthAmount } from "./sales";
import type { Project, SalesMonth } from "./types";

const PROJECT_COMPLETE_INDEX = stageIndex("project_complete");

export type FinancialLine = {
  project: Project;
  amount: number;
};

export type FinancialBreakdown = {
  total: number;
  websiteTotal: number;
  salesTotal: number;
  lines: FinancialLine[];
};

export type FinancialSummary = {
  pipelineValue: FinancialBreakdown;
  outstanding: FinancialBreakdown;
  revenueThisMonth: FinancialBreakdown;
  revenueThisYear: FinancialBreakdown;
  yearlyMaintenance: FinancialBreakdown;
};

function toBreakdown(
  rawLines: Array<{ project: Project; amount: number | null | undefined }>,
): FinancialBreakdown {
  const lines = rawLines
    .map(({ project, amount }) => ({ project, amount: amount ?? 0 }))
    .filter((line) => line.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const sum = (filter: (l: FinancialLine) => boolean) =>
    lines.filter(filter).reduce((acc, line) => acc + line.amount, 0);

  return {
    total: sum(() => true),
    websiteTotal: sum((l) => l.project.client_type !== "sales_system"),
    salesTotal: sum((l) => l.project.client_type === "sales_system"),
    lines,
  };
}

function isWebsite(p: Project): boolean {
  return p.client_type !== "sales_system";
}

function parseDate(dateStr: string): Date {
  return new Date(`${dateStr.slice(0, 10)}T00:00:00`);
}

// Website: actual cash received — deposit and final invoice payment, whichever
// (or both) landed within the period.
// Sales System: onboarding fee in the month it was paid, plus calls held (and
// any retainer) in the month they happened — counted when held, not when paid.
function collectRevenueLines(
  projects: Project[],
  months: SalesMonth[],
  matchesDate: (date: Date) => boolean,
) {
  const lines: Array<{ project: Project; amount: number }> = [];

  for (const project of projects) {
    let amount = 0;

    if (isWebsite(project)) {
      if (project.deposit_paid_at && project.deposit_amount) {
        if (matchesDate(parseDate(project.deposit_paid_at))) {
          amount += project.deposit_amount;
        }
      }
      if (project.invoice_paid_at) {
        if (matchesDate(parseDate(project.invoice_paid_at))) {
          amount +=
            (project.budget_amount ?? 0) - (project.deposit_amount ?? 0);
        }
      }
    } else {
      if (project.onboarding_paid_at && project.onboarding_fee) {
        if (matchesDate(parseDate(project.onboarding_paid_at))) {
          amount += project.onboarding_fee;
        }
      }
      for (const m of months) {
        if (m.project_id !== project.id) continue;
        if (matchesDate(parseDate(m.month))) {
          amount += monthAmount(project, m);
        }
      }
    }

    if (amount > 0) {
      lines.push({ project, amount });
    }
  }

  return lines;
}

export function computeFinancialSummary(
  projects: Project[],
  months: SalesMonth[] = [],
): FinancialSummary {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Website: money remaining on jobs still being worked on (a paid deposit
  // comes off the budget). Sales System: what's still to come to hit the
  // projection — unpaid onboarding + calls still owed under the guarantee.
  const pipelineValue = toBreakdown([
    ...projects
      .filter(
        (p) =>
          isWebsite(p) &&
          p.invoice_paid_at == null &&
          stageIndex(p.stage) < PROJECT_COMPLETE_INDEX,
      )
      .map((p) => ({
        project: p,
        amount: (p.budget_amount ?? 0) - (p.deposit_amount ?? 0),
      })),
    ...projects
      .filter(isLiveSalesClient)
      .map((p) => ({
        project: p,
        amount: getPilotStatus(p, months).remainingProjected,
      })),
  ]);

  // Website: finished work with no invoice payment recorded yet.
  // Sales System: calls held (and retainers) not marked paid yet.
  const outstanding = toBreakdown([
    ...projects
      .filter(
        (p) =>
          isWebsite(p) &&
          p.invoice_paid_at == null &&
          stageIndex(p.stage) >= PROJECT_COMPLETE_INDEX,
      )
      .map((p) => ({
        project: p,
        amount: (p.budget_amount ?? 0) - (p.deposit_amount ?? 0),
      })),
    ...projects
      .filter((p) => !isWebsite(p))
      .map((p) => ({
        project: p,
        amount: getPilotStatus(p, months).unpaidAmount,
      })),
  ]);

  const revenueThisYear = toBreakdown(
    collectRevenueLines(
      projects,
      months,
      (d) => d.getFullYear() === currentYear,
    ),
  );

  const revenueThisMonth = toBreakdown(
    collectRevenueLines(
      projects,
      months,
      (d) => d.getFullYear() === currentYear && d.getMonth() === currentMonth,
    ),
  );

  // maintenance_fee is the annual maintenance amount, not monthly.
  const yearlyMaintenance = toBreakdown(
    projects
      .filter((p) => isWebsite(p) && p.maintenance_setup_at != null)
      .map((p) => ({ project: p, amount: p.maintenance_fee })),
  );

  return {
    pipelineValue,
    outstanding,
    revenueThisMonth,
    revenueThisYear,
    yearlyMaintenance,
  };
}
