import Link from "next/link";
import { ProjectForm } from "@/components/ProjectForm";
import { createProject } from "@/app/(app)/actions";
import { CLIENT_TYPES, parseClientType } from "@/lib/stages";

export default async function NewProjectPage(props: PageProps<"/projects/new">) {
  const searchParams = await props.searchParams;
  const clientType = parseClientType(searchParams.type);

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-fg">New client</h1>
      <div className="mb-6 flex gap-2">
        {CLIENT_TYPES.map((t) => (
          <Link
            key={t.value}
            href={`/projects/new?type=${t.value}`}
            className={`rounded-full border px-4 py-2 text-sm ${
              t.value === clientType
                ? "border-accent bg-accent/10 text-fg"
                : "border-border text-muted hover:text-fg"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>
      <ProjectForm
        key={clientType}
        action={createProject}
        clientType={clientType}
        submitLabel="Create client"
      />
    </div>
  );
}
