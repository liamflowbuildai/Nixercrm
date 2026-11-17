import { stageIndex } from "./stages";
import { toDateInput } from "./sales";
import type { Project } from "./types";

export type Alert = {
  projectId: string;
  projectName: string;
  type: "renewal" | "follow_up" | "day21_review" | "pilot_end";
  date: string;
  daysUntil: number;
};

const DATE_FIELDS: Array<[Alert["type"], keyof Project]> = [
  ["renewal", "renewal_date"],
  ["follow_up", "follow_up_date"],
];

function daysUntil(dateStr: string, now: Date): number {
  const target = new Date(`${dateStr}T00:00:00`);
  const diffMs = target.getTime() - now.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr.slice(0, 10)}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toDateInput(d);
}

export function computeAlerts(projects: Project[], withinDays = 7): Alert[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const alerts: Alert[] = [];

  function push(project: Project, type: Alert["type"], dateValue: string) {
    const remaining = daysUntil(dateValue, now);
    if (remaining <= withinDays) {
      alerts.push({
        projectId: project.id,
        projectName: project.name,
        type,
        date: dateValue,
        daysUntil: remaining,
      });
    }
  }

  for (const project of projects) {
    for (const [type, field] of DATE_FIELDS) {
      const dateValue = project[field] as string | null;
      if (dateValue) push(project, type, dateValue);
    }

    // Sales System pilots: the day-21 review and the end of the 90 days.
    if (project.client_type === "sales_system" && project.pilot_start_date) {
      const idx = stageIndex(project.stage);
      if (idx < stageIndex("ss_day21_review")) {
        push(project, "day21_review", addDays(project.pilot_start_date, 21));
      }
      if (idx < stageIndex("ss_pilot_complete")) {
        push(project, "pilot_end", addDays(project.pilot_start_date, 90));
      }
    }
  }

  return alerts.sort((a, b) => a.daysUntil - b.daysUntil);
}
