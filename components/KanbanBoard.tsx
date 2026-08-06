"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { STAGES, type ProjectStage } from "@/lib/stages";
import type { Project } from "@/lib/types";
import { updateProjectStage } from "@/app/(app)/actions";
import { KanbanColumn } from "./KanbanColumn";
import { ProjectCard } from "./ProjectCard";

export function KanbanBoard({
  initialProjects,
}: {
  initialProjects: Project[];
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const projectId = active.id as string;
    const newStage = over.id as ProjectStage;
    const project = projects.find((p) => p.id === projectId);
    if (!project || project.stage === newStage) return;

    const previousStage = project.stage;
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, stage: newStage } : p)),
    );

    updateProjectStage(projectId, newStage).catch(() => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, stage: previousStage } : p,
        ),
      );
    });
  }

  const activeProject = projects.find((p) => p.id === activeId);

  return (
    <DndContext
      id="project-kanban"
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage.value}
            stage={stage}
            projects={projects.filter((p) => p.stage === stage.value)}
          />
        ))}
      </div>
      <DragOverlay>
        {activeProject ? <ProjectCard project={activeProject} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
