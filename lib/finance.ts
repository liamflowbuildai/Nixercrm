import { STAGES } from "./stages";
import type { Project } from "./types";

const PROJECT_COMPLETE_INDEX = STAGES.findIndex(
  (s) => s.value === "project_complete",
);

function stageIndex(stage: Project["stage"]): number {
  return STAGES.findIndex((s) => s.value === stage);
}

export type FinancialLine = {
  project: Project;
  amount: number;
};

export type FinancialBreakdown = {
  total: number;
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

  return {
    total: lines.reduce((sum, line) => sum + line.amount, 0),
    lines,
  };
}

// Actual cash received per project — deposit and final/invoice payments
// combined into a single total per job, whichever of the two (or both)
// landed within the given period.
function collectRevenueLines(
  projects: Project[],
  matchesDate: (date: Date) => boolean,
) {
  const lines: Array<{ project: Project; amount: number }> = [];

  for (const project of projects) {
    let amount = 0;

    if (project.deposit_paid_at && project.deposit_amount) {
      if (matchesDate(new Date(project.deposit_paid_at))) {
        amount += project.deposit_amount;
      }
    }

    if (project.invoice_paid_at) {
      if (matchesDate(new Date(project.invoice_paid_at))) {
        amount += (project.budget_amount ?? 0) - (project.deposit_amount ?? 0);
      }
    }

    if (amount > 0) {
      lines.push({ project, amount });
    }
  }

  return lines;
}

export function computeFinancialSummary(projects: Project[]): FinancialSummary {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Money remaining on jobs still being worked on (a paid deposit comes off
  // the budget). Anything already at Project Complete or later belongs in
  // "outstanding" instead, not here.
  const pipelineValue = toBreakdown(
    projects
      .filter(
        (p) =>
          p.invoice_paid_at == null &&
          stageIndex(p.stage) < PROJECT_COMPLETE_INDEX,
      )
      .map((p) => ({
        project: p,
        amount: (p.budget_amount ?? 0) - (p.deposit_amount ?? 0),
      })),
  );

  // Work that's actually finished (Project Complete stage or later) but
  // hasn't had an invoice payment recorded yet.
  const outstanding = toBreakdown(
    projects
      .filter(
        (p) =>
          p.invoice_paid_at == null &&
          stageIndex(p.stage) >= PROJECT_COMPLETE_INDEX,
      )
      .map((p) => ({
        project: p,
        amount: (p.budget_amount ?? 0) - (p.deposit_amount ?? 0),
      })),
  );

  // Revenue = cash actually received — deposits count the moment they're
  // paid, not just the final invoice payment.
  const revenueThisYear = toBreakdown(
    collectRevenueLines(projects, (d) => d.getFullYear() === currentYear),
  );

  const revenueThisMonth = toBreakdown(
    collectRevenueLines(
      projects,
      (d) => d.getFullYear() === currentYear && d.getMonth() === currentMonth,
    ),
  );

  // maintenance_fee is the annual maintenance amount, not monthly.
  const yearlyMaintenance = toBreakdown(
    projects
      .filter((p) => p.maintenance_setup_at != null)
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
