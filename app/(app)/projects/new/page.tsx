import { ProjectForm } from "@/components/ProjectForm";
import { createProject } from "@/app/(app)/actions";

export default function NewProjectPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-fg">New project</h1>
      <ProjectForm action={createProject} submitLabel="Create project" />
    </div>
  );
}
