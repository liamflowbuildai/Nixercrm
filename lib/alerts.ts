import type { Project } from "./types";

export type Alert = {
  projectId: string;
  projectName: string;
  type: "renewal" | "follow_up";
  date: string;
  daysUntil: number;
};

const TYPE_FIELD: Record<Alert["type"], keyof Project> = {
  renewal: "renewal_date",
  follow_up: "follow_up_date",
};

function daysUntil(dateStr: string, now: Date): number {
  const target = new Date(`${dateStr}T00:00:00`);
  const diffMs = target.getTime() - now.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function computeAlerts(projects: Project[], withinDays = 7): Alert[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const alerts: Alert[] = [];

  for (const project of projects) {
    for (const type of Object.keys(TYPE_FIELD) as Alert["type"][]) {
      const dateValue = project[TYPE_FIELD[type]] as string | null;
      if (!dateValue) continue;

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
  }

  return alerts.sort((a, b) => a.daysUntil - b.daysUntil);
}
