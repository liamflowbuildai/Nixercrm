import { STAGES } from "@/lib/stages";
import type { Project } from "@/lib/types";

type ProjectFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: Partial<Project>;
  submitLabel: string;
};

export function ProjectForm({
  action,
  defaultValues,
  submitLabel,
}: ProjectFormProps) {
  const d = defaultValues ?? {};

  return (
    <form action={action} className="flex max-w-2xl flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Project name" name="name" defaultValue={d.name} required />
        <label className="flex flex-col gap-1">
          <span className="text-sm text-muted">Stage</span>
          <select
            name="stage"
            defaultValue={d.stage ?? STAGES[0].value}
            className="rounded-md border border-border bg-surface-2 px-3 py-2 text-fg outline-none focus:border-accent"
          >
            {STAGES.map((stage) => (
              <option key={stage.value} value={stage.value}>
                {stage.label}
              </option>
            ))}
          </select>
        </label>
        <Field label="Client name" name="client_name" defaultValue={d.client_name} />
        <Field
          label="Client email"
          name="client_email"
          type="email"
          defaultValue={d.client_email}
        />
        <Field label="Client phone" name="client_phone" defaultValue={d.client_phone} />
        <Field
          label="Live site URL"
          name="live_url"
          type="url"
          defaultValue={d.live_url}
        />
        <Field
          label="Google Drive folder link"
          name="folder_url"
          type="url"
          defaultValue={d.folder_url}
        />
        <Field
          label="Budget (€)"
          name="budget_amount"
          type="number"
          defaultValue={d.budget_amount}
        />
        <Field
          label="Deposit amount (€)"
          name="deposit_amount"
          type="number"
          defaultValue={d.deposit_amount}
        />
        <Field
          label="Deposit paid on"
          name="deposit_paid_at"
          type="date"
          defaultValue={d.deposit_paid_at}
        />
        <Field
          label="Invoice paid on"
          name="invoice_paid_at"
          type="date"
          defaultValue={d.invoice_paid_at}
        />
        <Field
          label="Maintenance fee (€/yr)"
          name="maintenance_fee"
          type="number"
          defaultValue={d.maintenance_fee}
        />
        <Field
          label="Maintenance set up on"
          name="maintenance_setup_at"
          type="date"
          defaultValue={d.maintenance_setup_at}
        />
        <label className="flex items-center gap-2 self-end pb-2">
          <input
            type="checkbox"
            name="no_maintenance"
            value="true"
            defaultChecked={d.no_maintenance ?? false}
            className="accent-accent"
          />
          <span className="text-sm text-muted">
            No maintenance for this project
          </span>
        </label>
        <Field
          label="Launch date"
          name="launch_date"
          type="date"
          defaultValue={d.launch_date}
        />
        <Field
          label="Domain/hosting renewal"
          name="renewal_date"
          type="date"
          defaultValue={d.renewal_date}
        />
        <Field
          label="Next follow-up"
          name="follow_up_date"
          type="date"
          defaultValue={d.follow_up_date}
        />
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted">Notes</span>
        <textarea
          name="notes"
          defaultValue={d.notes ?? ""}
          rows={4}
          className="rounded-md border border-border bg-surface-2 px-3 py-2 text-fg outline-none focus:border-accent"
        />
      </label>

      <button
        type="submit"
        className="w-fit rounded-md bg-accent px-5 py-2 font-medium text-accent-fg"
      >
        {submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number | null;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-muted">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        className="rounded-md border border-border bg-surface-2 px-3 py-2 text-fg outline-none focus:border-accent"
      />
    </label>
  );
}
