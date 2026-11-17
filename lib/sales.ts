import { stageIndex } from "./stages";
import type { Project, SalesMonth } from "./types";

export const PILOT_DAYS = 90;
export const DEFAULT_ONBOARDING_FEE = 1000;
export const DEFAULT_PRICE_PER_CALL = 150;

export function monthAmount(project: Project, month: SalesMonth): number {
  return (
    (month.calls_held ?? 0) * (project.price_per_call ?? 0) +
    (month.retainer_amount ?? 0)
  );
}

function parseDate(dateStr: string): Date {
  return new Date(`${dateStr.slice(0, 10)}T00:00:00`);
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function toDateInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

export function monthLabel(monthKey: string): string {
  return parseDate(monthKey).toLocaleString("en-IE", {
    month: "long",
    year: "numeric",
  });
}

export type PilotStatus = {
  projectedValue: number; // onboarding + guaranteed calls × price
  earnedToDate: number; // onboarding (if paid) + every logged month
  remainingProjected: number; // what's still to come to reach the projection
  callsHeld: number;
  guaranteedCalls: number;
  guaranteeMet: boolean;
  pilotStart: Date | null;
  pilotEnd: Date | null;
  dayOfPilot: number | null; // 1-based; null before the pilot starts
  daysLeft: number | null;
  extended: boolean; // 90 days are up but the guarantee isn't met yet
  unpaidAmount: number; // calls held but not paid yet
};

export function getPilotStatus(
  project: Project,
  months: SalesMonth[],
): PilotStatus {
  const own = months.filter((m) => m.project_id === project.id);
  const fee = project.onboarding_fee ?? 0;
  const price = project.price_per_call ?? 0;
  const guaranteedCalls = project.guaranteed_calls ?? 0;
  const callsHeld = own.reduce((sum, m) => sum + (m.calls_held ?? 0), 0);
  const monthsEarned = own.reduce((sum, m) => sum + monthAmount(project, m), 0);
  const onboardingPaid = project.onboarding_paid_at != null;

  const projectedValue = fee + guaranteedCalls * price;
  const earnedToDate = (onboardingPaid ? fee : 0) + monthsEarned;
  const remainingProjected =
    (onboardingPaid ? 0 : fee) +
    Math.max(0, guaranteedCalls - callsHeld) * price;
  const guaranteeMet = guaranteedCalls > 0 && callsHeld >= guaranteedCalls;

  let pilotStart: Date | null = null;
  let pilotEnd: Date | null = null;
  let dayOfPilot: number | null = null;
  let daysLeft: number | null = null;
  if (project.pilot_start_date) {
    pilotStart = parseDate(project.pilot_start_date);
    pilotEnd = new Date(pilotStart);
    pilotEnd.setDate(pilotEnd.getDate() + PILOT_DAYS);
    const msPerDay = 1000 * 60 * 60 * 24;
    const today = startOfToday();
    const elapsed = Math.round((today.getTime() - pilotStart.getTime()) / msPerDay);
    dayOfPilot = elapsed >= 0 ? elapsed + 1 : null;
    daysLeft = Math.round((pilotEnd.getTime() - today.getTime()) / msPerDay);
  }

  const pilotStillOpen =
    stageIndex(project.stage) < stageIndex("ss_pilot_complete");
  const extended =
    pilotStillOpen && daysLeft != null && daysLeft < 0 && !guaranteeMet;

  const unpaidAmount = own
    .filter((m) => m.paid_at == null)
    .reduce((sum, m) => sum + monthAmount(project, m), 0);

  return {
    projectedValue,
    earnedToDate,
    remainingProjected,
    callsHeld,
    guaranteedCalls,
    guaranteeMet,
    pilotStart,
    pilotEnd,
    dayOfPilot,
    daysLeft,
    extended,
    unpaidAmount,
  };
}

// Sales clients still worth counting toward the pipeline (not lost/ended).
export function isLiveSalesClient(project: Project): boolean {
  return (
    project.client_type === "sales_system" &&
    project.stage !== "ss_lost" &&
    project.stage !== "ss_ended"
  );
}

// Currently inside (or extended past) the 90-day pilot.
export function isInPilot(project: Project): boolean {
  if (project.client_type !== "sales_system") return false;
  const idx = stageIndex(project.stage);
  return (
    idx >= stageIndex("ss_onboarding_paid") &&
    idx < stageIndex("ss_pilot_complete")
  );
}
