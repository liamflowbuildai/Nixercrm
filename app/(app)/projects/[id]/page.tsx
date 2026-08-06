import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectForm } from "@/components/ProjectForm";
import { TaskList } from "@/components/TaskList";
import { updateProject, deleteProject } from "@/app/(app)/actions";
import { stageLabel } from "@/lib/stages";
import { getProjectWarnings } from "@/lib/warnings";
import type { Project, ProjectTask } from "@/lib/types";

export default async function ProjectDetailPage(
  props: PageProps<"/projects/[id]">,
) {
  const { id } = await props.params;
  const supabase = await createClient();

  const [{ data: project }, { data: tasks }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).single(),
    supabase
      .from("project_tasks")
      .select("*")
      .eq("project_id", id)
      .order("created_at"),
  ]);

  if (!project) {
    notFound();
  }

  const boundUpdate = updateProject.bind(null, id);
  const boundDelete = deleteProject.bind(null, id);
  const warnings = getProjectWarnings(project as Project);

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <div className="flex-1">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-fg">{project.name}</h1>
            <p className="text-sm text-muted">{stageLabel(project.stage)}</p>
          </div>
          <form action={boundDelete}>
            <button
              type="submit"
              className="text-sm text-danger hover:underline"
            >
              Delete project
            </button>
          </form>
        </div>
        {warnings.length > 0 && (
          <div className="mb-6 flex flex-col gap-1 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            {warnings.map((warning) => (
              <p key={warning}>⚠ {warning}</p>
            ))}
          </div>
        )}
        <ProjectForm
          action={boundUpdate}
          defaultValues={project as Project}
          submitLabel="Save changes"
        />
      </div>
      <div className="w-full lg:w-80">
        <TaskList projectId={id} tasks={(tasks ?? []) as ProjectTask[]} />
      </div>
    </div>
  );
}
