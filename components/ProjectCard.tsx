import Link from "next/link";
import { getProjectWarnings } from "@/lib/warnings";
import type { Project } from "@/lib/types";

export function ProjectCard({ project }: { project: Project }) {
  const warnings = getProjectWarnings(project);

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
      {project.budget_amount != null && (
        <p className="mt-1 text-xs text-muted">
          €{project.budget_amount.toLocaleString()}
        </p>
      )}
    </div>
  );
}
