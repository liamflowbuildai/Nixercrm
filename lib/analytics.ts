import { revenueForMonth } from "./finance";
import { getPilotStatus } from "./sales";
import {
  SALES_STAGES,
  WEBSITE_STAGES,
  stageIndex,
  type ProjectStage,
  type StageOption,
} from "./stages";
import type { Project, SalesMonth } from "./types";

// ---------- date range filter (scopes funnels, rates and bottlenecks) ----------

export const RANGES = [
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "ytd", label: "This year" },
  { value: "all", label: "All time" },
] as const;
export type RangeValue = (typeof RANGES)[number]["value"];

export function parseRange(value: unknown): RangeValue {
  return RANGES.some((r) => r.value === value) ? (value as RangeValue) : "90d";
}

export function inRange(createdAt: string, range: RangeValue): boolean {
  if (range === "all") return true;
  const created = new Date(createdAt);
  const now = new Date();
  if (range === "ytd") return created.getFullYear() === now.getFullYear();
  const days = range === "30d" ? 30 : 90;
  return now.getTime() - created.getTime() <= days * 86_400_000;
}

// ---------- funnels ----------

export type FunnelStep = {
  label: string;
  count: number;
  pctOfPrev: number | null; // conversion from the previous step
  pctOfTop: number;
  isBiggestDrop: boolean;
};

type StepDef = { label: string; stage: ProjectStage };

const SALES_STEPS: StepDef[] = [
  { label: "Call 1 booked", stage: "ss_call_booked" },
  { label: "Call 2 booked", stage: "ss_call2_booked" },
  { label: "Call 2 held", stage: "ss_deciding" },
  { label: "Agreed", stage: "ss_agreed" },
  { label: "Onboarding paid", stage: "ss_onboarding_paid" },
  { label: "Ads live", stage: "ss_ads_live" },
  { label: "Pilot complete", stage: "ss_pilot_complete" },
  { label: "Retained", stage: "ss_retained" },
];

const WEBSITE_STEPS: StepDef[] = [
  { label: "Call booked", stage: "call_booked" },
  { label: "Quoted", stage: "quoted" },
  { label: "Confirmed", stage: "confirmed" },
  { label: "Deposit paid", stage: "deposit_paid" },
  { label: "Project complete", stage: "project_complete" },
  { label: "Site live", stage: "site_live" },
];

// How far down the pipeline a deal has got. Lost deals count up to the stage
// they were lost at (or only the first step if that wasn't recorded);
// "Ended" clients finished the pilot. Recorded payments also prove a deal got
// at least that far.
function furthestSalesIndex(p: Project): number {
  let idx = stageIndex(p.stage);
  if (p.stage === "ss_lost") idx = p.lost_from_stage ? stageIndex(p.lost_from_stage) : 0;
  if (p.stage === "ss_ended") idx = stageIndex("ss_pilot_complete");
  if (p.onboarding_paid_at) idx = Math.max(idx, stageIndex("ss_onboarding_paid"));
  if (p.pilot_start_date) idx = Math.max(idx, stageIndex("ss_ads_live"));
  return idx;
}

function furthestWebsiteIndex(p: Project): number {
  let idx = stageIndex(p.stage);
  if (p.stage === "lost") idx = p.lost_from_stage ? stageIndex(p.lost_from_stage) : 0;
  if (p.deposit_paid_at) idx = Math.max(idx, stageIndex("deposit_paid"));
  if (p.invoice_paid_at) idx = Math.max(idx, stageIndex("invoice_paid"));
  return idx;
}

// Only the selling steps count toward "biggest drop-off" — later steps
// (delivery) are mostly clients still in progress, not lost deals.
function buildFunnel(
  projects: Project[],
  steps: StepDef[],
  furthest: (p: Project) => number,
  lastSellingStep: number,
): FunnelStep[] {
  const reached = projects.map(furthest);
  const counts = steps.map(
    (s) => reached.filter((idx) => idx >= stageIndex(s.stage)).length,
  );
  const top = counts[0] || 0;

  // The biggest relative drop between two steps (ignoring empty steps).
  let worst = -1;
  let worstPct = Infinity;
  counts.forEach((c, i) => {
    if (i === 0 || i > lastSellingStep || counts[i - 1] === 0) return;
    const pct = c / counts[i - 1];
    if (pct < worstPct) {
      worstPct = pct;
      worst = i;
    }
  });

  return steps.map((s, i) => ({
    label: s.label,
    count: counts[i],
    pctOfPrev: i === 0 || counts[i - 1] === 0 ? null : counts[i] / counts[i - 1],
    pctOfTop: top ? counts[i] / top : 0,
    isBiggestDrop: i === worst && worstPct < 1,
  }));
}

export function salesFunnel(projects: Project[]) {
  return buildFunnel(projects, SALES_STEPS, furthestSalesIndex, 4);
}

export function websiteFunnel(projects: Project[]) {
  return buildFunnel(projects, WEBSITE_STEPS, furthestWebsiteIndex, 3);
}

function rate(f: FunnelStep[], from: string, to: string): number | null {
  const a = f.find((s) => s.label === from)?.count ?? 0;
  const b = f.find((s) => s.label === to)?.count ?? 0;
  return a > 0 ? b / a : null;
}

export function salesRates(f: FunnelStep[]) {
  return {
    bookRate: rate(f, "Call 1 booked", "Call 2 booked"),
    showRate: rate(f, "Call 2 booked", "Call 2 held"),
    closeRate: rate(f, "Call 2 held", "Agreed"),
    leadToClient: rate(f, "Call 1 booked", "Onboarding paid"),
    retention: rate(f, "Pilot complete", "Retained"),
  };
}

export function websiteRates(f: FunnelStep[]) {
  return {
    quoteRate: rate(f, "Call booked", "Quoted"),
    closeRate: rate(f, "Quoted", "Confirmed"),
    leadToClient: rate(f, "Call booked", "Deposit paid"),
  };
}

// ---------- lost deals ----------

export type LostSummary = {
  total: number;
  lost: number;
  lostRate: number | null; // lost ÷ all deals added in the period
  byStage: Array<{ stage: ProjectStage; label: string; count: number }>;
  unknown: number; // lost before "lost at stage" was recorded
};

export function lostSummary(
  projects: Project[],
  stages: readonly StageOption[],
): LostSummary {
  const lostDeals = projects.filter((p) => p.stage === "lost" || p.stage === "ss_lost");
  const byStage = stages
    .filter((s) => s.value !== "lost" && s.value !== "ss_lost")
    .map((s) => ({
      stage: s.value,
      label: s.label,
      count: lostDeals.filter((p) => p.lost_from_stage === s.value).length,
    }))
    .filter((s) => s.count > 0);
  return {
    total: projects.length,
    lost: lostDeals.length,
    lostRate: projects.length ? lostDeals.length / projects.length : null,
    byStage,
    unknown: lostDeals.filter((p) => !p.lost_from_stage).length,
  };
}

// ---------- bottlenecks: where open deals are sitting ----------

export const STALE_DAYS = 14;

export type StageLoad = {
  stage: ProjectStage;
  label: string;
  count: number;
  stale: number; // untouched for STALE_DAYS+ days
  oldestDays: number;
};

const CLOSED_STAGES: ProjectStage[] = [
  "ss_ended",
  "ss_lost",
  "lost",
  "testimonial_requested",
];

export function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

export function stageLoad(
  projects: Project[],
  stages: readonly StageOption[],
): StageLoad[] {
  return stages
    .filter((s) => !CLOSED_STAGES.includes(s.value))
    .map((s) => {
      const here = projects.filter((p) => p.stage === s.value);
      const ages = here.map((p) => daysSince(p.updated_at));
      return {
        stage: s.value,
        label: s.label,
        count: here.length,
        stale: ages.filter((d) => d >= STALE_DAYS).length,
        oldestDays: ages.length ? Math.max(...ages) : 0,
      };
    });
}

export function staleDeals(projects: Project[]) {
  return projects
    .filter((p) => !CLOSED_STAGES.includes(p.stage))
    .map((p) => ({ project: p, days: daysSince(p.updated_at) }))
    .filter((d) => d.days >= STALE_DAYS)
    .sort((a, b) => b.days - a.days);
}

// ---------- monthly trends ----------

export type MonthPoint = { key: string; label: string; web: number; sales: number };

export function lastMonths(n: number): Array<{ year: number; month: number; key: string; label: string }> {
  const out = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleString("en-IE", { month: "short" }),
    });
  }
  return out;
}

export function revenueTrend(
  projects: Project[],
  months: SalesMonth[],
  n = 6,
): MonthPoint[] {
  return lastMonths(n).map((m) => ({
    key: m.key,
    label: m.label,
    ...revenueForMonth(projects, months, m.year, m.month),
  }));
}

export function callsTrend(months: SalesMonth[], n = 6) {
  return lastMonths(n).map((m) => ({
    key: m.key,
    label: m.label,
    calls: months
      .filter((row) => row.month.startsWith(m.key))
      .reduce((sum, row) => sum + (row.calls_held ?? 0), 0),
  }));
}

export function newDealsTrend(projects: Project[], n = 6): MonthPoint[] {
  return lastMonths(n).map((m) => {
    const inMonth = projects.filter((p) => p.created_at.startsWith(m.key));
    return {
      key: m.key,
      label: m.label,
      web: inMonth.filter((p) => p.client_type !== "sales_system").length,
      sales: inMonth.filter((p) => p.client_type === "sales_system").length,
    };
  });
}

// ---------- headline sales figures ----------

export function salesHeadline(projects: Project[], months: SalesMonth[]) {
  const live = projects.filter(
    (p) =>
      p.client_type === "sales_system" &&
      stageIndex(p.stage) >= stageIndex("ss_onboarding_paid") &&
      p.stage !== "ss_lost",
  );
  const statuses = live.map((p) => getPilotStatus(p, months));
  const projected = statuses.reduce((s, x) => s + x.projectedValue, 0);
  const earned = statuses.reduce((s, x) => s + x.earnedToDate, 0);
  const callsHeld = statuses.reduce((s, x) => s + x.callsHeld, 0);
  const guaranteed = statuses.reduce((s, x) => s + x.guaranteedCalls, 0);
  return {
    clients: live.length,
    projected,
    earned,
    callsHeld,
    guaranteed,
    avgClientValue: live.length ? projected / live.length : 0,
  };
}

export { SALES_STAGES, WEBSITE_STAGES };
