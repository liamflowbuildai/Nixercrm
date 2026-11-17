"use client";

import { useRef, useTransition } from "react";
import type { ProjectTask } from "@/lib/types";
import { addTask, toggleTask, deleteTask } from "@/app/(app)/actions";

export function TaskList({
  projectId,
  tasks,
}: {
  projectId: string;
  tasks: ProjectTask[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdd(formData: FormData) {
    const title = String(formData.get("title") ?? "");
    formRef.current?.reset();
    startTransition(async () => {
      await addTask(projectId, title);
    });
  }

  function handleToggle(taskId: string, isDone: boolean) {
    startTransition(async () => {
      await toggleTask(taskId, projectId, isDone);
    });
  }

  function handleDelete(taskId: string) {
    startTransition(async () => {
      await deleteTask(taskId, projectId);
    });
  }

  return (
    <div className="border-t border-border pt-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        To-dos
      </h2>
      <ul className="mb-4 flex flex-col gap-2">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={task.is_done}
              onChange={(e) => handleToggle(task.id, e.target.checked)}
              className="accent-accent"
            />
            <span
              className={
                task.is_done ? "flex-1 text-muted line-through" : "flex-1 text-fg"
              }
            >
              {task.title}
            </span>
            <button
              type="button"
              onClick={() => handleDelete(task.id)}
              className="text-muted hover:text-danger"
              aria-label="Delete to-do"
            >
              ×
            </button>
          </li>
        ))}
        {tasks.length === 0 && (
          <li className="text-sm text-muted">No to-dos yet.</li>
        )}
      </ul>
      <form ref={formRef} action={handleAdd} className="flex gap-2">
        <input
          name="title"
          placeholder="Add a to-do…"
          className="flex-1 rounded-xl border border-border-strong bg-bg px-3 py-1.5 text-sm text-fg outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full border border-border-strong px-3 py-1.5 text-sm text-fg hover:border-accent"
        >
          Add
        </button>
      </form>
    </div>
  );
}
