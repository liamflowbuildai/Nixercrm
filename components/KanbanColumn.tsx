"use client";

import { useDroppable } from "@dnd-kit/core";
import type { Project } from "@/lib/types";
import type { STAGES } from "@/lib/stages";
import { DraggableProjectCard } from "./DraggableProjectCard";

export function KanbanColumn({
  stage,
  projects,
}: {
  stage: (typeof STAGES)[number];
  projects: Project[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.value });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-64 shrink-0 flex-col rounded-lg border p-2 transition-colors ${
        isOver ? "border-accent bg-surface-1" : "border-border bg-surface-1/60"
      }`}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
          {stage.label}
        </h3>
        <span className="text-xs text-muted">{projects.length}</span>
      </div>
      <div className="flex min-h-[48px] flex-col gap-2">
        {projects.map((project) => (
          <DraggableProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
