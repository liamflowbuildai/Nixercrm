import { stageIndex } from "./stages";
import type { Project } from "./types";

export function getProjectWarnings(project: Project): string[] {
  const warnings: string[] = [];

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
