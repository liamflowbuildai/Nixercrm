import { isLostStage, stagesFor, type ClientType } from "@/lib/stages";
import { DEFAULT_ONBOARDING_FEE, DEFAULT_PRICE_PER_CALL } from "@/lib/sales";
import type { Project } from "@/lib/types";

type ProjectFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  clientType: ClientType;
  defaultValues?: Partial<Project>;
  submitLabel: string;
};

export function ProjectForm({
  action,
  clientType,
  defaultValues,
  submitLabel,
}: ProjectFormProps) {
  const d = defaultValues ?? {};
  const stages = stagesFor(clientType);
  const isSales = clientType === "sales_system";
  const isNew = defaultValues == null;

  return (
    <form action={action} className="flex max-w-2xl flex-col gap-6">
      <input type="hidden" name="client_type" value={clientType} />
      {d.maintenance_fee != null && (
        <input type="hidden" name="maintenance_fee_original" value={d.maintenance_fee} />
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={isSales ? "Client / business name" : "Project name"}
          name="name"
          defaultValue={d.name}
          required
        />
        <label className="flex flex-col gap-1">
          <span className="text-sm text-muted">Stage</span>
          <select
            name="stage"
            defaultValue={d.stage ?? stages[0].value}
            className="rounded-xl border border-border-strong bg-bg px-3 py-2 text-fg outline-none focus:border-accent"
          >
            {stages.map((stage) => (
              <option key={stage.value} value={stage.value}>
                {stage.label}
              </option>
            ))}
          </select>
        </label>
        {isLostStage(d.stage) && (
          <label className="flex flex-col gap-1">
            <span className="text-sm text-muted">Lost at stage</span>
            <select
              name="lost_from_stage"
              defaultValue={d.lost_from_stage ?? ""}
              className="rounded-xl border border-border-strong bg-bg px-3 py-2 text-fg outline-none focus:border-accent"
            >
              <option value="">Not recorded</option>
              {stages
                .filter((s) => !isLostStage(s.value))
                .map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
            </select>
            <span className="text-xs text-muted">
              Filled in automatically when a deal is moved to Lost. Used for conversion rates.
            </span>
          </label>
        )}
        <Field label="Client name" name="client_name" defaultValue={d.client_name} />
        <Field
          label="Client email"
          name="client_email"
          type="email"
          defaultValue={d.client_email}
        />
        <Field label="Client phone" name="client_phone" defaultValue={d.client_phone} />
        <Field
          label="Google Drive folder link"
          name="folder_url"
          type="url"
          defaultValue={d.folder_url}
        />

        {isSales ? (
          <>
            <Field
              label="Onboarding fee (€)"
              name="onboarding_fee"
              type="number"
              defaultValue={d.onboarding_fee ?? (isNew ? DEFAULT_ONBOARDING_FEE : null)}
            />
            <Field
              label="Onboarding paid on"
              name="onboarding_paid_at"
              type="date"
              defaultValue={d.onboarding_paid_at}
            />
            <Field
              label="Price per booked call (€)"
              name="price_per_call"
              type="number"
              defaultValue={d.price_per_call ?? (isNew ? DEFAULT_PRICE_PER_CALL : null)}
            />
            <Field
              label="Guaranteed calls (whole pilot)"
              name="guaranteed_calls"
              type="number"
              defaultValue={d.guaranteed_calls}
            />
            <Field
              label="Pilot start (ads live)"
              name="pilot_start_date"
              type="date"
              defaultValue={d.pilot_start_date}
              hint="Auto-fills with today when moved to Ads Live."
            />
          </>
        ) : (
          <>
            <Field
              label="Live site URL"
              name="live_url"
              type="url"
              defaultValue={d.live_url}
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
              label="Maintenance (€/month)"
              name="maintenance_monthly"
              type="number"
              step="0.01"
              defaultValue={
                d.maintenance_fee != null
                  ? Math.round((d.maintenance_fee / 12) * 100) / 100
                  : null
              }
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
          </>
        )}

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
          className="rounded-xl border border-border-strong bg-bg px-3 py-2 text-fg outline-none focus:border-accent"
        />
      </label>

      <button
        type="submit"
        className="w-fit rounded-full bg-accent px-5 py-2 font-semibold text-accent-fg transition-colors hover:bg-accent-lt"
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
  hint,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  step?: string;
  defaultValue?: string | number | null;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-muted">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        step={step}
        className="rounded-xl border border-border-strong bg-bg px-3 py-2 text-fg outline-none focus:border-accent"
      />
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}
