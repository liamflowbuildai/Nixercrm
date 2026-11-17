import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { getPilotStatus } from "@/lib/sales";
import { getProjectWarnings } from "@/lib/warnings";
import type { Project, SalesMonth } from "@/lib/types";

export function ProjectCard({
  project,
  months = [],
}: {
  project: Project;
  months?: SalesMonth[];
}) {
  const warnings = getProjectWarnings(project, months);
  const isSales = project.client_type === "sales_system";
  const pilot = isSales ? getPilotStatus(project, months) : null;

  return (
    <div className="rounded-md border border-border bg-surface-2 p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/projects/${project.id}`}
          className="font-medium text-fg hover:text-accent"
        >
          {project.name}
        </Link>
        {warnings.length > 0 && (
          <span title={warnings.join(" ")} className="shrink-0 text-danger">
            ⚠
          </span>
        )}
        {project.live_url && (
          <a
            href={project.live_url}
            target="_blank"
            rel="noreferrer"
            onPointerDown={(e) => e.stopPropagation()}
            className="text-muted hover:text-accent"
            title="Open live site"
          >
            ↗
          </a>
        )}
      </div>
      {project.client_name && (
        <p className="mt-1 text-muted">{project.client_name}</p>
      )}
      {pilot ? (
        pilot.projectedValue > 0 && (
          <p className="mt-1 text-xs text-muted">
            {formatCurrency(pilot.projectedValue)} projected
            {pilot.guaranteedCalls > 0 &&
              ` · ${pilot.callsHeld}/${pilot.guaranteedCalls} calls`}
          </p>
        )
      ) : (
        project.budget_amount != null && (
          <p className="mt-1 text-xs text-muted">
            €{project.budget_amount.toLocaleString()}
          </p>
        )
      )}
    </div>
  );
}
