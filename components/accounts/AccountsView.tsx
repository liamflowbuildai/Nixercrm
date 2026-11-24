import { Figure, FigureRow, Panel, Section } from "@/components/dashboard/Figure";
import {
  CORPORATION_TAX,
  DIRECTORS,
  EMPLOYER_PRSI,
  RETAIN_SHARE,
  VAT_THRESHOLD_SERVICES,
  adPerformance,
  corporationTaxSetAside,
  directorsPay,
  monthlyPnl,
  sumPnl,
} from "@/lib/accounts";
import type { AdSpend, MaintenancePayment, Project, SalesMonth } from "@/lib/types";
import { expenseTotal } from "@/lib/expenses";
import { computeFinancialSummary } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";

const pct = (n: number | null) => (n == null ? "—" : `${Math.round(n * 100)}%`);
const eur = (n: number) => formatCurrency(n);
const signed = (n: number) => `${n < 0 ? "−" : ""}${formatCurrency(Math.abs(n))}`;
const th = "py-2 pr-4 text-right font-normal text-dim first:text-left";
const td = "py-2 pr-4 text-right first:text-left";

export function AccountsView({
  projects,
  months,
  adSpend,
  maintenancePayments,
}: {
  projects: Project[];
  months: SalesMonth[];
  adSpend: AdSpend[];
  maintenancePayments: MaintenancePayment[];
}) {
  const now = new Date();
  const pnl = monthlyPnl(projects, months, adSpend, maintenancePayments, 12);
  const thisYear = pnl.filter((r) => r.year === now.getFullYear());
  const tracked = thisYear.filter((r) => r.tracked);
  const ytd = sumPnl(thisYear);
  const trackedSum = sumPnl(tracked);
  const trackedLabel = tracked.length
    ? `${tracked[0].label.split(" ")[0]}–${tracked[tracked.length - 1].label.split(" ")[0]}`
    : "";
  const ct = corporationTaxSetAside(trackedSum.profit);
  const pay = directorsPay(pnl);
  const ads = adPerformance(projects, months, adSpend, 6);
  const rolling12 = sumPnl(pnl).income;
  const vatShare = rolling12 / VAT_THRESHOLD_SERVICES;
  const fin = computeFinancialSummary(projects, months, maintenancePayments);
  const recurring = fin.monthlyMaintenance.total;
  const fixedCosts = expenseTotal(now.getFullYear(), now.getMonth());
  const coverage = fixedCosts > 0 ? recurring / fixedCosts : null;

  return (
    <div className="flex min-w-0 flex-col gap-14 [&>*]:min-w-0">
      <div>
        <h1 className="text-2xl font-semibold text-fg">Accounts</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          FlowBuild AI Ltd. Profit, tax to set aside, what you and Paddy can pay yourselves, and what the ads
          bring back. Tax and pay figures are planning estimates. Confirm with your accountant before acting.
        </p>
      </div>

      <FigureRow cols={4}>
        <Figure
          label={`Income ${now.getFullYear()}`}
          value={eur(ytd.income)}
          sub={`Sales ${eur(ytd.sales)} · Web ${eur(ytd.web)}`}
        />
        <Figure
          label={tracked.length ? `Costs ${trackedLabel}` : "Costs"}
          value={eur(trackedSum.expenses + trackedSum.ads)}
          sub={`Expenses ${eur(trackedSum.expenses)} · Meta ${eur(trackedSum.ads)}`}
        />
        <Figure
          label={tracked.length ? `Profit ${trackedLabel}` : "Profit"}
          value={signed(trackedSum.profit)}
          sub={`${pct(trackedSum.margin)} margin · costs tracked from Oct`}
        />
        <Figure
          label="Corporation tax to set aside"
          value={eur(ct)}
          sub={`${CORPORATION_TAX * 100}% of profit kept in the company`}
        />
      </FigureRow>

      <Section title="Monthly profit & loss">
        <div className="overflow-x-auto">
          <table className="tnum w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border-strong">
                <th className={th}>Month</th>
                <th className={th}>Sales</th>
                <th className={th}>Websites</th>
                <th className={th}>Income</th>
                <th className={th}>Expenses</th>
                <th className={th}>Meta ads</th>
                <th className={th}>Profit</th>
                <th className={th}>Margin</th>
              </tr>
            </thead>
            <tbody>
              {pnl
                .slice()
                .reverse()
                .map((r) => (
                  <tr key={r.key} className="border-b border-border">
                    <td className={`${td} text-muted`}>{r.label}</td>
                    <td className={`${td} text-muted`}>{eur(r.sales)}</td>
                    <td className={`${td} text-muted`}>{eur(r.web)}</td>
                    <td className={`${td} text-fg`}>{eur(r.income)}</td>
                    <td className={`${td} text-muted`}>{r.tracked ? eur(r.expenses) : "—"}</td>
                    <td className={`${td} text-muted`}>{r.ads ? eur(r.ads) : "—"}</td>
                    <td className={`${td} ${!r.tracked ? "text-dim" : r.profit < 0 ? "text-danger" : "text-fg"}`}>
                      {r.tracked ? signed(r.profit) : "—"}
                    </td>
                    <td className={`${td} text-muted`}>{r.tracked ? pct(r.margin) : "—"}</td>
                  </tr>
                ))}
              <tr className="font-semibold">
                <td className={`${td} text-fg`}>{trackedLabel || "Tracked"}</td>
                <td className={`${td} text-fg`}>{eur(trackedSum.sales)}</td>
                <td className={`${td} text-fg`}>{eur(trackedSum.web)}</td>
                <td className={`${td} text-fg`}>{eur(trackedSum.income)}</td>
                <td className={`${td} text-fg`}>{eur(trackedSum.expenses)}</td>
                <td className={`${td} text-fg`}>{eur(trackedSum.ads)}</td>
                <td className={`${td} text-fg`}>{signed(trackedSum.profit)}</td>
                <td className={`${td} text-fg`}>{pct(trackedSum.margin)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-dim">
          Expenses are tracked from October 2026, so profit shows from then. Earlier months show income only.
          Income: cash in for websites and maintenance, held calls and onboarding for sales clients.
        </p>
      </Section>

      <Section title="What you can pay yourselves">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="border-t border-border pt-4">
            <p className="text-sm text-muted">Safe monthly salary, each</p>
            <p className="mt-2 text-[48px] font-semibold leading-none tracking-[-0.05em] text-fg">
              {eur(pay.grossEach)}
            </p>
            <p className="mt-3 text-sm text-muted">
              Gross, for {DIRECTORS.join(" and ")} at 50/50. Nothing has been taken out so far.
            </p>
          </div>
          <Panel title="How that's worked out">
            <dl className="tnum text-sm">
              <div className="flex justify-between border-b border-border py-1.5">
                <dt className="text-muted">
                  Average monthly profit ({pay.monthsUsed} tracked month{pay.monthsUsed === 1 ? "" : "s"})
                </dt>
                <dd className="text-fg">{signed(pay.avgProfit)}</dd>
              </div>
              <div className="flex justify-between border-b border-border py-1.5">
                <dt className="text-muted">Keep {RETAIN_SHARE * 100}% in the business as a buffer</dt>
                <dd className="text-fg">−{eur(Math.max(0, pay.avgProfit) * RETAIN_SHARE)}</dd>
              </div>
              <div className="flex justify-between border-b border-border py-1.5">
                <dt className="text-muted">Available for salaries</dt>
                <dd className="text-fg">{eur(pay.pot)}</dd>
              </div>
              <div className="flex justify-between border-b border-border py-1.5">
                <dt className="text-muted">
                  Split two ways, less employer PRSI (~{Math.round(EMPLOYER_PRSI * 1000) / 10}%)
                </dt>
                <dd className="font-semibold text-fg">{eur(pay.grossEach)} each</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-dim">
              Salary is a company cost, so it reduces the profit corporation tax is charged on. Income tax, USC
              and employee PRSI then come out of each salary through payroll. Until there are three months of
              tracked profit, this is based on fewer months and will move around.
            </p>
          </Panel>
        </div>
      </Section>

      <Section title="Ad return (Meta, own lead generation)">
        <div className="overflow-x-auto">
          <table className="tnum w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border-strong">
                <th className={th}>Month</th>
                <th className={th}>Meta spend</th>
                <th className={th}>Deals added</th>
                <th className={th}>Cost per deal</th>
                <th className={th}>New clients</th>
                <th className={th}>Cost per client</th>
                <th className={th}>New client value</th>
                <th className={th}>Return per €1</th>
              </tr>
            </thead>
            <tbody>
              {ads
                .slice()
                .reverse()
                .map((a) => (
                  <tr key={a.key} className="border-b border-border">
                    <td className={`${td} text-muted`}>{a.label}</td>
                    <td className={`${td} text-fg`}>{a.ads ? eur(a.ads) : "—"}</td>
                    <td className={`${td} text-muted`}>{a.deals}</td>
                    <td className={`${td} text-muted`}>{a.costPerDeal != null ? eur(a.costPerDeal) : "—"}</td>
                    <td className={`${td} text-muted`}>{a.clients}</td>
                    <td className={`${td} text-muted`}>{a.costPerClient != null ? eur(a.costPerClient) : "—"}</td>
                    <td className={`${td} text-muted`}>{eur(a.clientValue)}</td>
                    <td className={`${td} text-fg`}>
                      {a.roas != null ? `€${a.roas.toFixed(2)}` : "—"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-dim">
          New clients: Sales System onboarding paid or website deposit paid that month. Their value: sales
          projected value (onboarding + guaranteed calls) or website budget. Deals added counts every new deal,
          including referrals, so cost per deal is a rough guide. Ad spend comes from the box on the Dashboard.
        </p>
      </Section>

      <Section title="Watch list">
        <div className="grid gap-10 lg:grid-cols-2">
          <Panel
            title={`VAT threshold: ${pct(vatShare)} of ${eur(VAT_THRESHOLD_SERVICES)}`}
            sub="Income in the last 12 months vs the VAT registration threshold for services"
          >
            <div className="h-2.5 overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, vatShare * 100)}%`,
                  background: vatShare >= 0.8 ? "var(--danger)" : "var(--accent)",
                }}
              />
            </div>
            <p className="mt-3 text-sm text-muted">
              {eur(rolling12)} in the last 12 months.{" "}
              {vatShare >= 1
                ? "⚠ Over the threshold. Talk to your accountant about registering now."
                : vatShare >= 0.8
                  ? "⚠ Getting close. Plan for VAT registration with your accountant."
                  : `${eur(VAT_THRESHOLD_SERVICES - rolling12)} of headroom before you'd need to register.`}
            </p>
          </Panel>
          <Panel
            title={`Recurring income covers ${pct(coverage)} of fixed costs`}
            sub="Monthly maintenance (MRR) vs this month's fixed expenses, before ads"
          >
            <div className="h-2.5 overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${Math.min(100, (coverage ?? 0) * 100)}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-muted">
              {eur(recurring)}/mo recurring vs {eur(fixedCosts)}/mo fixed expenses. Every client moved to monthly
              maintenance raises this floor.
            </p>
          </Panel>
        </div>
      </Section>
    </div>
  );
}
