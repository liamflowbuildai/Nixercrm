// Accounts tab: monthly P&L, tax set-aside, directors' pay, ad ROI, VAT watch.
// FlowBuild AI is an Irish Ltd with two directors (Liam, Paddy) at 50/50,
// not VAT registered, Meta ads are its own lead generation.
// All tax figures are planning estimates, not advice: confirm with the accountant.
import { adSpendForMonth } from "./adspend";
import { lastMonths } from "./analytics";
import { expenseTotal, hasExpenseData } from "./expenses";
import { revenueForMonth } from "./finance";
import { getPilotStatus } from "./sales";
import type { AdSpend, MaintenancePayment, Project, SalesMonth } from "./types";

export const CORPORATION_TAX = 0.125; // Irish trading rate
export const EMPLOYER_PRSI = 0.1125; // approx. employer PRSI on director salaries
export const VAT_THRESHOLD_SERVICES = 42500; // € in any 12 months (services)
export const RETAIN_SHARE = 0.25; // share of profit kept in the business
export const DIRECTORS = ["Liam", "Paddy"];

export type PnlMonth = {
  key: string;
  label: string;
  year: number;
  month: number;
  sales: number;
  web: number;
  income: number;
  expenses: number;
  ads: number;
  profit: number;
  margin: number | null;
  tracked: boolean; // expenses recorded for this month
};

export function monthlyPnl(
  projects: Project[],
  months: SalesMonth[],
  adSpend: AdSpend[],
  payments: MaintenancePayment[],
  n = 12,
): PnlMonth[] {
  return lastMonths(n).map((m) => {
    const rev = revenueForMonth(projects, months, m.year, m.month, payments);
    const income = rev.web + rev.sales;
    const tracked = hasExpenseData(m.year, m.month);
    const expenses = tracked ? expenseTotal(m.year, m.month) : 0;
    const ads = adSpendForMonth(adSpend, m.year, m.month).total;
    const profit = income - expenses - ads;
    return {
      key: m.key,
      label: new Date(m.year, m.month, 1).toLocaleString("en-IE", { month: "short", year: "2-digit" }),
      year: m.year,
      month: m.month,
      sales: rev.sales,
      web: rev.web,
      income,
      expenses,
      ads,
      profit,
      margin: income > 0 ? profit / income : null,
      tracked,
    };
  });
}

export function sumPnl(rows: PnlMonth[]) {
  const s = rows.reduce(
    (a, r) => ({
      sales: a.sales + r.sales,
      web: a.web + r.web,
      income: a.income + r.income,
      expenses: a.expenses + r.expenses,
      ads: a.ads + r.ads,
      profit: a.profit + r.profit,
    }),
    { sales: 0, web: 0, income: 0, expenses: 0, ads: 0, profit: 0 },
  );
  return { ...s, margin: s.income > 0 ? s.profit / s.income : null };
}

// Directors' pay: average profit over the last (up to) 3 tracked months, keep
// a share in the business, and pay the rest as salary split 50/50. Salary
// costs the company employer PRSI on top, so the gross each is net of that.
export function directorsPay(pnl: PnlMonth[]) {
  const tracked = pnl.filter((r) => r.tracked).slice(-3);
  const avgProfit = tracked.length
    ? tracked.reduce((s, r) => s + r.profit, 0) / tracked.length
    : 0;
  const pot = Math.max(0, avgProfit) * (1 - RETAIN_SHARE);
  const grossEach = pot / DIRECTORS.length / (1 + EMPLOYER_PRSI);
  return { monthsUsed: tracked.length, avgProfit, pot, grossEach };
}

// Corporation tax to put aside on profit kept in the company this year
// (profit paid out as salary is a cost, so it isn't taxed at 12.5%).
export function corporationTaxSetAside(profitYtd: number) {
  return Math.max(0, profitYtd) * CORPORATION_TAX;
}

export type AdMonth = {
  key: string;
  label: string;
  ads: number;
  deals: number;
  clients: number;
  clientValue: number;
  costPerDeal: number | null;
  costPerClient: number | null;
  roas: number | null; // € of new-client value per €1 of ads
};

// New clients won in a month: Sales System onboarding paid, or website deposit
// paid. Their value: sales projected value (onboarding + guarantee), website
// budget.
export function adPerformance(
  projects: Project[],
  months: SalesMonth[],
  adSpend: AdSpend[],
  n = 6,
): AdMonth[] {
  return lastMonths(n).map((m) => {
    const ads = adSpendForMonth(adSpend, m.year, m.month).total;
    const deals = projects.filter((p) => p.created_at.startsWith(m.key)).length;
    const won = projects.filter((p) =>
      p.client_type === "sales_system"
        ? p.onboarding_paid_at?.startsWith(m.key)
        : p.deposit_paid_at?.startsWith(m.key),
    );
    const clientValue = won.reduce(
      (s, p) =>
        s +
        (p.client_type === "sales_system"
          ? getPilotStatus(p, months).projectedValue
          : p.budget_amount ?? 0),
      0,
    );
    return {
      key: m.key,
      label: m.label,
      ads,
      deals,
      clients: won.length,
      clientValue,
      costPerDeal: ads > 0 && deals > 0 ? ads / deals : null,
      costPerClient: ads > 0 && won.length > 0 ? ads / won.length : null,
      roas: ads > 0 ? clientValue / ads : null,
    };
  });
}
