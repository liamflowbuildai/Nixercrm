import type { MaintenancePayment, Project } from "./types";

export type Billing = "monthly" | "yearly";

export function billingOf(p: Project): Billing {
  return p.maintenance_billing === "monthly" ? "monthly" : "yearly";
}

function parseDate(dateStr: string): Date {
  return new Date(`${dateStr.slice(0, 10)}T00:00:00`);
}

function addYears(dateStr: string, n: number): Date {
  const d = parseDate(dateStr);
  d.setFullYear(d.getFullYear() + n);
  return d;
}

// A website client with maintenance that's actually running.
export function hasActiveMaintenance(p: Project): boolean {
  return (
    p.client_type !== "sales_system" &&
    p.stage !== "lost" &&
    !p.no_maintenance &&
    (p.maintenance_fee ?? 0) > 0 &&
    (p.maintenance_setup_at != null || p.monthly_billing_from != null)
  );
}

// Monthly clients: the month their monthly billing started.
export function monthlyStart(p: Project): string | null {
  return p.monthly_billing_from ?? p.maintenance_setup_at ?? null;
}

// € per month a monthly-billed client brings in during a given month.
export function monthlyMaintenanceIn(p: Project, year: number, month: number): number {
  if (billingOf(p) !== "monthly" || !hasActiveMaintenance(p)) return 0;
  const start = monthlyStart(p);
  if (!start) return 0;
  const key = `${year}-${String(month + 1).padStart(2, "0")}`;
  const now = new Date();
  const nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  if (key < start.slice(0, 7) || key > nowKey) return 0;
  return (p.maintenance_fee ?? 0) / 12;
}

export type YearlyStatus = {
  paidUntil: Date | null;
  dueDate: Date | null;
  daysUntilDue: number | null;
  overdue: boolean;
  lastPayment: MaintenancePayment | null;
};

// Yearly clients: paid up to the latest payment's "covers until" date; if no
// payment is recorded, the year is due from when maintenance was set up.
export function yearlyStatus(
  p: Project,
  payments: MaintenancePayment[],
  today = new Date(),
): YearlyStatus {
  const own = payments
    .filter((x) => x.project_id === p.id)
    .sort((a, b) => b.paid_at.localeCompare(a.paid_at));
  const lastPayment = own[0] ?? null;
  const covers = own
    .map((x) => (x.covers_until ? parseDate(x.covers_until) : addYears(x.paid_at, 1)))
    .sort((a, b) => b.getTime() - a.getTime());
  const paidUntil = covers[0] ?? null;
  const dueDate = paidUntil ?? (p.maintenance_setup_at ? parseDate(p.maintenance_setup_at) : null);
  const t = new Date(today);
  t.setHours(0, 0, 0, 0);
  const daysUntilDue = dueDate
    ? Math.round((dueDate.getTime() - t.getTime()) / 86_400_000)
    : null;
  return {
    paidUntil,
    dueDate,
    daysUntilDue,
    overdue: daysUntilDue != null && daysUntilDue <= 0,
    lastPayment,
  };
}
