import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { getPilotStatus, PILOT_DAYS } from "@/lib/sales";
import { stageLabel } from "@/lib/stages";
import type { Project, SalesMonth } from "@/lib/types";

export function ActivePilotsList({
  projects,
  months,
}: {
  projects: Project[];
  months: SalesMonth[];
}) {
  if (projects.length === 0) {
    return <p className="text-sm text-muted">No sales system pilots running.</p>;
  }

  return (
    <div className="flex flex-col">
      {projects.map((project) => {
        const s = getPilotStatus(project, months);
        const pct =
          s.guaranteedCalls > 0
            ? Math.min(100, Math.round((s.callsHeld / s.guaranteedCalls) * 100))
            : 0;
        const dayText = s.extended
          ? "Extended past 90 days"
          : s.dayOfPilot != null
            ? `Day ${Math.min(s.dayOfPilot, PILOT_DAYS)} of ${PILOT_DAYS}`
            : stageLabel(project.stage);

        return (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="grid grid-cols-1 gap-2 border-b border-border py-3 text-sm hover:bg-surface-1 sm:grid-cols-[1.4fr_2fr_1fr_1fr] sm:items-center"
          >
            <span>
              <span className="font-medium text-fg">{project.name}</span>
              <span className={`block text-xs ${s.extended ? "text-danger" : "text-muted"}`}>
                {dayText}
              </span>
            </span>
            <span>
              <span className="mb-1 block text-xs text-muted">
                {s.callsHeld} / {s.guaranteedCalls || "?"} calls
              </span>
              <span className="block h-1.5 overflow-hidden rounded-full bg-surface-2">
                <span
                  className="block h-full rounded-full bg-accent"
                  style={{ width: `${pct}%` }}
                />
              </span>
            </span>
            <span>
              <span className="block text-xs text-muted">Made</span>
              <span className="text-accent">{formatCurrency(s.earnedToDate)}</span>
            </span>
            <span>
              <span className="block text-xs text-muted">Projected</span>
              <span className="text-fg">{formatCurrency(s.projectedValue)}</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
