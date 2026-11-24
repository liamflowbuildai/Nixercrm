import type { AdSpend } from "./types";

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function monthStartKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-01`;
}

export type MonthAdSpend = {
  row: AdSpend | null;
  daily: number;
  total: number; // full month: actual total if entered, else daily × days in month
  soFar: number; // spent to date this month (estimate from daily unless actual entered)
  isActual: boolean;
};

// Meta ad spend for a month. A recorded actual total wins over the daily
// estimate (use it once the month's real figure is known).
export function adSpendForMonth(
  rows: AdSpend[],
  year: number,
  month: number,
  today = new Date(),
): MonthAdSpend {
  const row = rows.find((r) => r.month.startsWith(monthStartKey(year, month).slice(0, 7))) ?? null;
  const daily = row?.daily_budget ?? 0;
  const days = daysInMonth(year, month);
  const isCurrent = today.getFullYear() === year && today.getMonth() === month;
  const elapsed = isCurrent ? today.getDate() : days;
  if (row?.actual_total != null) {
    return { row, daily, total: row.actual_total, soFar: row.actual_total, isActual: true };
  }
  return { row, daily, total: daily * days, soFar: daily * elapsed, isActual: false };
}
