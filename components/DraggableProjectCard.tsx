"use client";

import { useDraggable } from "@dnd-kit/core";
import type { Project } from "@/lib/types";
import { ProjectCard } from "./ProjectCard";

export function DraggableProjectCard({ project }: { project: Project }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: project.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={isDragging ? "opacity-40" : ""}
    >
      <ProjectCard project={project} />
    </div>
  );
}
