import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectForm } from "@/components/ProjectForm";
import { TaskList } from "@/components/TaskList";
import { PilotSummary } from "@/components/PilotSummary";
import { SalesMonthLog } from "@/components/SalesMonthLog";
import { updateProject, deleteProject } from "@/app/(app)/actions";
import { clientTypeLabel, parseClientType, stageLabel } from "@/lib/stages";
import { getProjectWarnings } from "@/lib/warnings";
import type { Project, ProjectTask, SalesMonth } from "@/lib/types";

export default async function ProjectDetailPage(
  props: PageProps<"/projects/[id]">,
) {
  const { id } = await props.params;
  const supabase = await createClient();

  const [{ data: project }, { data: tasks }, { data: monthRows }] =
    await Promise.all([
      supabase.from("projects").select("*").eq("id", id).single(),
      supabase
        .from("project_tasks")
        .select("*")
        .eq("project_id", id)
        .order("created_at"),
      supabase.from("sales_call_months").select("*").eq("project_id", id),
    ]);

  if (!project) {
    notFound();
  }

  const typed = project as Project;
  const clientType = parseClientType(typed.client_type);
  const months = (monthRows ?? []) as SalesMonth[];
  const boundUpdate = updateProject.bind(null, id);
  const boundDelete = deleteProject.bind(null, id);
  const warnings = getProjectWarnings(typed, months);

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <div className="min-w-0 flex-1">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-fg">{typed.name}</h1>
            <p className="text-sm text-muted">
              {clientTypeLabel(clientType)} · {stageLabel(typed.stage)}
            </p>
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
        {clientType === "sales_system" && (
          <PilotSummary project={typed} months={months} />
        )}
        <ProjectForm
          action={boundUpdate}
          clientType={clientType}
          defaultValues={typed}
          submitLabel="Save changes"
        />
        {clientType === "sales_system" && (
          <div className="mt-10">
            <SalesMonthLog project={typed} months={months} />
          </div>
        )}
      </div>
      <div className="w-full lg:w-80">
        <TaskList projectId={id} tasks={(tasks ?? []) as ProjectTask[]} />
      </div>
    </div>
  );
}
