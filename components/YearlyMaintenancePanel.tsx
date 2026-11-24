import { addMaintenancePayment, deleteMaintenancePayment } from "@/app/(app)/actions";
import { formatCurrency } from "@/lib/format";
import { yearlyStatus } from "@/lib/maintenance";
import type { MaintenancePayment, Project } from "@/lib/types";

const input =
  "rounded-xl border border-border-strong bg-bg px-2 py-1.5 text-sm text-fg outline-none focus:border-accent";
const fmt = (d: Date) => d.toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" });

// Yearly-billed maintenance: paid-until status, payment history, record a payment.
export function YearlyMaintenancePanel({
  project,
  payments,
}: {
  project: Project;
  payments: MaintenancePayment[];
}) {
  const s = yearlyStatus(project, payments);
  const own = payments
    .filter((p) => p.project_id === project.id)
    .sort((a, b) => b.paid_at.localeCompare(a.paid_at));
  const add = addMaintenancePayment.bind(null, project.id);
  const today = new Date().toISOString().slice(0, 10);

  let status = "Set the maintenance set-up date or record a payment to track renewals.";
  let tone = "text-muted";
  if (s.dueDate && s.daysUntilDue != null) {
    if (s.overdue) {
      status = `Renewal overdue: was due ${fmt(s.dueDate)}`;
      tone = "text-danger";
    } else {
      status = `${s.paidUntil ? "Paid" : "Covered"} until ${fmt(s.dueDate)} · renews in ${s.daysUntilDue} days`;
      tone = s.daysUntilDue <= 30 ? "text-accent-lt" : "text-ok";
    }
  }

  return (
    <section className="max-w-2xl">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted">
        Yearly maintenance
      </h2>
      <p className={`mb-1 text-sm ${tone}`}>{status}</p>
      <p className="mb-4 text-xs text-dim">
        Tip: at renewal, try moving them to monthly. Switch Maintenance billed to Monthly above.
      </p>

      <form action={add} className="mb-5 flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">Paid on</span>
          <input name="paid_at" type="date" defaultValue={today} required className={input} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">Amount €</span>
          <input
            name="amount"
            type="number"
            step="0.01"
            min={0}
            required
            defaultValue={project.maintenance_fee ?? ""}
            className={`${input} w-28`}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">Covers until</span>
          <input name="covers_until" type="date" className={input} />
        </label>
        <button
          type="submit"
          className="rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-lt"
        >
          Record payment
        </button>
      </form>
      <p className="-mt-3 mb-4 text-xs text-dim">Leave Covers until blank for one year from the payment date.</p>

      {own.length === 0 ? (
        <p className="text-sm text-dim">No maintenance payments recorded yet.</p>
      ) : (
        <ul className="flex flex-col">
          {own.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 border-b border-border py-2 text-sm">
              <span className="text-fg">{fmt(new Date(`${p.paid_at}T00:00:00`))}</span>
              <span className="text-muted">
                {p.covers_until ? `to ${fmt(new Date(`${p.covers_until}T00:00:00`))}` : ""}
              </span>
              <span className="tnum text-fg">{formatCurrency(p.amount)}</span>
              <form action={deleteMaintenancePayment.bind(null, p.id, project.id)}>
                <button type="submit" className="text-muted hover:text-danger" title="Remove this payment">
                  ✕
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
