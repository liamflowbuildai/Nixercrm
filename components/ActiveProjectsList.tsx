import Link from "next/link";
import type { Project } from "@/lib/types";

export function ActiveProjectsList({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return <p className="text-sm text-muted">No active projects right now.</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <div
          key={project.id}
          className="rounded-lg border border-border bg-surface-1 p-4"
        >
          <Link
            href={`/projects/${project.id}`}
            className="font-medium text-fg hover:text-accent"
          >
            {project.name}
          </Link>
          {project.client_name && (
            <p className="mt-1 text-sm text-muted">{project.client_name}</p>
          )}
          <div className="mt-3 flex gap-3 text-sm">
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                Live site
              </a>
            )}
            {project.folder_url && (
              <a
                href={project.folder_url}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                Drive folder
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
