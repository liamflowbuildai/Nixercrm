import { stageIndex } from "./stages";
import { currentMonthKey, getPilotStatus, monthLabel } from "./sales";
import type { Project, SalesMonth } from "./types";

export function getProjectWarnings(
  project: Project,
  months: SalesMonth[] = [],
): string[] {
  if (project.client_type === "sales_system") {
    return getSalesWarnings(project, months);
  }

  const warnings: string[] = [];
  if (project.stage === "lost") return warnings;

  if (
    project.invoice_paid_at == null &&
    stageIndex(project.stage) >= stageIndex("project_complete")
  ) {
    warnings.push("Invoice hasn't been paid yet.");
  }

  if (
    !project.no_maintenance &&
    project.maintenance_setup_at == null &&
    stageIndex(project.stage) >= stageIndex("site_live")
  ) {
    warnings.push("Maintenance hasn't been set up yet.");
  }

  return warnings;
}

function getSalesWarnings(project: Project, months: SalesMonth[]): string[] {
  const warnings: string[] = [];
  const idx = stageIndex(project.stage);
  const status = getPilotStatus(project, months);

  if (
    project.onboarding_paid_at == null &&
    idx >= stageIndex("ss_onboarding_paid") &&
    project.stage !== "ss_lost"
  ) {
    warnings.push("Onboarding payment date isn't recorded yet.");
  }

  if (
    project.pilot_start_date == null &&
    idx >= stageIndex("ss_ads_live") &&
    idx < stageIndex("ss_ended")
  ) {
    warnings.push("Pilot start date (ads live) isn't set.");
  }

  if (status.extended) {
    const short = status.guaranteedCalls - status.callsHeld;
    warnings.push(
      `Pilot past 90 days: ${short} call${short === 1 ? "" : "s"} still owed under the guarantee.`,
    );
  }

  const thisMonth = currentMonthKey();
  for (const m of months) {
    if (m.project_id !== project.id) continue;
    if (m.month >= thisMonth) continue;
    const hasValue = m.calls_held > 0 || (m.retainer_amount ?? 0) > 0;
    if (hasValue && m.invoiced_at == null) {
      warnings.push(`${monthLabel(m.month)} hasn't been invoiced yet.`);
    }
  }

  return warnings;
}
