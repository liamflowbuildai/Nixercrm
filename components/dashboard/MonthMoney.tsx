import { saveAdSpend } from "@/app/(app)/actions";
import type { MonthAdSpend } from "@/lib/adspend";
import type { Expense } from "@/lib/expenses";
import { formatCurrency } from "@/lib/format";
import { DEFAULT_PRICE_PER_CALL } from "@/lib/sales";

const input =
  "w-full rounded-xl border border-border-strong bg-bg px-3 py-2 text-sm text-fg outline-none focus:border-accent";

function signed(n: number) {
  return `${n < 0 ? "−" : ""}${formatCurrency(Math.abs(n))}`;
}

// This month's money in vs out: profit after fixed expenses and Meta ads,
// what's needed to break even, and where to enter the ad spend.
export function MonthMoney({
  monthName,
  monthKey,
  revenue,
  expenseItems,
  expenses,
  expensesKnown,
  ad,
  prevLabel,
  prevProfit,
}: {
  monthName: string;
  monthKey: string; // YYYY-MM
  revenue: number;
  expenseItems: Expense[];
  expenses: number;
  expensesKnown: boolean;
  ad: MonthAdSpend;
  prevLabel: string;
  prevProfit: number | null;
}) {
  const outgoings = expenses + ad.total;
  const profit = revenue - outgoings;
  const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : null;
  const gap = Math.max(0, outgoings - revenue);
  const callsNeeded = Math.ceil(gap / DEFAULT_PRICE_PER_CALL);
  const days = new Date(Number(monthKey.slice(0, 4)), Number(monthKey.slice(5, 7)), 0).getDate();

  return (
    <div className="border-t border-border pt-4">
      <p className="text-sm text-muted">Profit in {monthName}</p>
      <p
        className={`mt-2 text-[40px] font-semibold leading-none tracking-[-0.045em] ${
          profit >= 0 ? "text-fg" : "text-danger"
        }`}
      >
        {signed(profit)}
      </p>
      <p className="mt-3 text-sm">
        {gap > 0 ? (
          <span className="text-danger">
            ▼ {formatCurrency(gap)} to break even · about {callsNeeded} more held call
            {callsNeeded === 1 ? "" : "s"} at {formatCurrency(DEFAULT_PRICE_PER_CALL)}
          </span>
        ) : (
          <span className="text-ok">
            ▲ Broken even{margin != null ? ` · ${margin}% margin` : ""}
          </span>
        )}
      </p>
      {prevProfit != null && (
        <p className="mt-1 text-xs text-dim">
          {prevLabel}: {signed(prevProfit)} profit
        </p>
      )}

      {/* in vs out */}
      <dl className="tnum mt-5 text-sm">
        <div className="flex justify-between border-b border-border py-1.5">
          <dt className="text-muted">Income</dt>
          <dd className="text-fg">{formatCurrency(revenue)}</dd>
        </div>
        <details className="border-b border-border">
          <summary className="flex cursor-pointer justify-between py-1.5">
            <span className="text-muted">
              Fixed expenses <span className="text-xs text-dim">({expenseItems.length}) ⌄</span>
            </span>
            <span className="text-fg">
              {expensesKnown ? `−${formatCurrency(expenses)}` : <span className="text-dim">not added</span>}
            </span>
          </summary>
          <ul className="pb-2 pl-3">
            {expenseItems
              .slice()
              .sort((a, b) => b.amount - a.amount)
              .map((e) => (
                <li key={e.name} className="flex justify-between gap-4 py-0.5 text-xs">
                  <span className="text-dim">
                    {e.name}
                    {!e.recurring && " (one-off)"}
                  </span>
                  <span className="text-muted">{formatCurrency(e.amount)}</span>
                </li>
              ))}
          </ul>
        </details>
        <div className="flex justify-between border-b border-border py-1.5">
          <dt className="text-muted">
            Meta ads{" "}
            <span className="text-xs text-dim">
              {ad.isActual
                ? "(actual)"
                : ad.daily > 0
                  ? `(${formatCurrency(ad.daily)}/day × ${days}, ${formatCurrency(ad.soFar)} so far)`
                  : "(not set)"}
            </span>
          </dt>
          <dd className="text-fg">−{formatCurrency(ad.total)}</dd>
        </div>
        <div className="flex justify-between py-1.5 font-semibold">
          <dt className="text-fg">Total outgoings</dt>
          <dd className="text-fg">−{formatCurrency(outgoings)}</dd>
        </div>
      </dl>

      {/* ad spend entry */}
      <form action={saveAdSpend} className="mt-4 grid grid-cols-[1fr_1fr_auto] items-end gap-2">
        <input type="hidden" name="month" value={monthKey} />
        <label className="flex flex-col gap-1">
          <span className="text-xs text-dim">Meta spend €/day</span>
          <input
            name="daily_budget"
            type="number"
            min={0}
            step="0.01"
            defaultValue={ad.row?.daily_budget ?? ""}
            placeholder="e.g. 20"
            className={input}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-dim">Actual month total €</span>
          <input
            name="actual_total"
            type="number"
            min={0}
            step="0.01"
            defaultValue={ad.row?.actual_total ?? ""}
            placeholder="optional"
            className={input}
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-lt"
        >
          Save
        </button>
      </form>
      <p className="mt-1.5 text-xs text-dim">
        Daily × days in the month until you enter the actual total from Meta.
      </p>
    </div>
  );
}
