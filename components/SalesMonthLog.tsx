import {
  addCallsHeld,
  deleteSalesMonth,
  saveSalesMonth,
} from "@/app/(app)/actions";
import { formatCurrency } from "@/lib/format";
import { currentMonthKey, monthAmount, monthLabel } from "@/lib/sales";
import type { Project, SalesMonth } from "@/lib/types";

const input =
  "rounded-xl border border-border-strong bg-bg px-2 py-1.5 text-sm text-fg outline-none focus:border-accent";

export function SalesMonthLog({
  project,
  months,
}: {
  project: Project;
  months: SalesMonth[];
}) {
  const sorted = [...months].sort((a, b) => b.month.localeCompare(a.month));
  const thisMonth = currentMonthKey();
  const quickAdd = addCallsHeld.bind(null, project.id);
  const save = saveSalesMonth.bind(null, project.id);

  return (
    <section className="max-w-2xl">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted">
        Calls held
      </h2>
      <p className="mb-4 text-sm text-muted">
        Check their GHL and add the calls held each week. Each call counts as{" "}
        {formatCurrency(project.price_per_call ?? 0)} in the month it was held.
      </p>

      <form action={quickAdd} className="mb-6 flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">Calls held this week</span>
          <input
            name="add_calls"
            type="number"
            min={-99}
            max={999}
            required
            placeholder="e.g. 4"
            className={`${input} w-28`}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">Month</span>
          <input
            name="month"
            type="month"
            defaultValue={thisMonth.slice(0, 7)}
            className={input}
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-lt"
        >
          + Add calls
        </button>
      </form>

      <div className="flex min-w-0 flex-col overflow-x-auto [&>*]:min-w-[560px]">
        <div className="grid grid-cols-[1.3fr_0.7fr_0.9fr_1fr_1fr_auto] gap-2 border-b border-border pb-2 text-xs text-muted">
          <span>Month</span>
          <span>Calls</span>
          <span>Retainer €</span>
          <span>Invoiced</span>
          <span>Paid</span>
          <span />
        </div>
        {sorted.length === 0 && (
          <p className="py-3 text-sm text-muted">No calls logged yet.</p>
        )}
        {sorted.map((m) => (
          <div key={m.id} className="border-b border-border py-2">
            <form
              action={save}
              className="grid grid-cols-[1.3fr_0.7fr_0.9fr_1fr_1fr_auto] items-center gap-2"
            >
              <input type="hidden" name="month" value={m.month} />
              <span className="text-sm text-fg">
                {monthLabel(m.month)}
                <span className="block text-xs text-muted">
                  {formatCurrency(monthAmount(project, m))}
                </span>
              </span>
              <input
                name="calls_held"
                type="number"
                min={0}
                defaultValue={m.calls_held}
                className={input}
              />
              <input
                name="retainer_amount"
                type="number"
                min={0}
                defaultValue={m.retainer_amount ?? ""}
                placeholder="—"
                className={input}
              />
              <input
                name="invoiced_at"
                type="date"
                defaultValue={m.invoiced_at ?? ""}
                className={input}
              />
              <input
                name="paid_at"
                type="date"
                defaultValue={m.paid_at ?? ""}
                className={input}
              />
              <div className="flex gap-2">
                <button type="submit" className="text-sm text-accent hover:underline">
                  Save
                </button>
                <button
                  type="submit"
                  formAction={deleteSalesMonth.bind(null, m.id, project.id)}
                  className="text-sm text-muted hover:text-danger"
                  title="Remove this month"
                >
                  ✕
                </button>
              </div>
            </form>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">
        Retainer € is for months after the pilot if they move to a retainer.
      </p>
    </section>
  );
}
