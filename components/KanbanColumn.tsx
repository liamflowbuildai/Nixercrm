"use client";

import { useDroppable } from "@dnd-kit/core";
import type { Project, SalesMonth } from "@/lib/types";
import type { StageOption } from "@/lib/stages";
import { DraggableProjectCard } from "./DraggableProjectCard";

export function KanbanColumn({
  stage,
  projects,
  months,
}: {
  stage: StageOption;
  projects: Project[];
  months: SalesMonth[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.value });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-64 shrink-0 flex-col rounded-2xl border p-2 transition-colors ${
        isOver ? "border-accent bg-surface-2" : "border-border bg-surface-1"
      }`}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="font-mono text-[11px] uppercase tracking-wide text-muted">
          {stage.label}
        </h3>
        <span className="text-xs text-muted">{projects.length}</span>
      </div>
      <div className="flex min-h-[48px] flex-col gap-2">
        {projects.map((project) => (
          <DraggableProjectCard
            key={project.id}
            project={project}
            months={months}
          />
        ))}
      </div>
    </div>
  );
}
