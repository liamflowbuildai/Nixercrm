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

export const EXPENSES: Expense[] = [
  // Awaiting November 2026 list from Liam.
];

// First month we have expense records for. Profit isn't shown before this,
// because missing expenses would make it look higher than it was.
export const EXPENSES_TRACKED_FROM = "2026-11";

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
