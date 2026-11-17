import Link from "next/link";
import type { Project } from "@/lib/types";

export function ActiveProjectsList({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return <p className="text-sm text-dim">No active projects right now.</p>;
  }

  return (
    <ul className="flex flex-col">
      {projects.map((project) => (
        <li
          key={project.id}
          className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-border py-3 text-sm"
        >
          <span>
            <Link
              href={`/projects/${project.id}`}
              className="font-medium text-fg hover:text-accent"
            >
              {project.name}
            </Link>
            {project.client_name && (
              <span className="block text-xs text-dim">{project.client_name}</span>
            )}
          </span>
          <span className="flex gap-4">
            {project.live_url && (
              <a href={project.live_url} target="_blank" rel="noreferrer" className="text-accent-lt hover:text-fg">
                Live site ↗
              </a>
            )}
            {project.folder_url && (
              <a href={project.folder_url} target="_blank" rel="noreferrer" className="text-accent-lt hover:text-fg">
                Drive ↗
              </a>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
