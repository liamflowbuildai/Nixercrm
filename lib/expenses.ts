// FlowBuild business expenses. Kept in code (no database) and updated by
// Claude when Liam reads them out. Amounts in € per month.
//
// - Recurring: counts every month from `from` until `to` (inclusive); leave
//   `to` off while it's still running.
// - One-off: counts only in `month`.
// Months are "YYYY-MM".

export type Expense =
  | { name: string; amount: number; category?: string; recurring: true; from: string; to?: string }
  | { name: string; amount: number; category?: string; recurring?: false; month: string };

// Ad spend (Meta) is deliberately left out — Liam tracks it separately.
// Amounts are the € figures from the October 2026 Revolut Business statement;
// FX-billed tools (GoHighLevel, Apollo, Zapmail…) wobble by a few cent monthly.
export const EXPENSES: Expense[] = [
  { name: "GoHighLevel: main plan", amount: 106.53, category: "Software", recurring: true, from: "2026-10" },
  { name: "GoHighLevel: add-on", amount: 10.99, category: "Software", recurring: true, from: "2026-10" },
  { name: "GoHighLevel: usage", amount: 8.97, category: "Software", recurring: true, from: "2026-10" },
  { name: "GoHighLevel: usage (2nd charge)", amount: 9.0, category: "Software", recurring: true, from: "2026-10" },
  { name: "Zapmail: subscription 1", amount: 55.27, category: "Software", recurring: true, from: "2026-10" },
  { name: "Zapmail: subscription 2", amount: 42.28, category: "Software", recurring: true, from: "2026-10" },
  { name: "Apollo", amount: 53.29, category: "Software", recurring: true, from: "2026-10" },
  { name: "Google Workspace", amount: 39.85, category: "Software", recurring: true, from: "2026-10" },
  { name: "Pipple Software", amount: 34.36, category: "Software", recurring: true, from: "2026-10" },
  { name: "Revolut Business fee", amount: 10.0, category: "Banking", recurring: true, from: "2026-10" },
  // First seen on the November statement (not charged in October).
  { name: "Vercel", amount: 22.69, category: "Software", recurring: true, from: "2026-11" },
];

// First month we have expense records for. Profit isn't shown before this,
// because missing expenses would make it look higher than it was.
export const EXPENSES_TRACKED_FROM = "2026-10";

export function monthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

export function expensesForMonth(year: number, month: number): Expense[] {
  const key = monthKey(year, month);
  return EXPENSES.filter((e) =>
    e.recurring ? e.from <= key && (!e.to || key <= e.to) : e.month === key,
  );
}

export function expenseTotal(year: number, month: number): number {
  return expensesForMonth(year, month).reduce((s, e) => s + e.amount, 0);
}

export function hasExpenseData(year: number, month: number): boolean {
  return EXPENSES.length > 0 && monthKey(year, month) >= EXPENSES_TRACKED_FROM;
}
