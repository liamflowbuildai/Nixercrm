export const CLIENT_TYPES = [
  { value: "website", label: "Website" },
  { value: "sales_system", label: "Sales System" },
] as const;

export type ClientType = (typeof CLIENT_TYPES)[number]["value"];

export function parseClientType(value: unknown): ClientType {
  return value === "sales_system" ? "sales_system" : "website";
}

export function clientTypeLabel(type: ClientType): string {
  return CLIENT_TYPES.find((t) => t.value === type)?.label ?? type;
}

export const WEBSITE_STAGES = [
  { value: "call_booked", label: "Call Booked" },
  { value: "quoted", label: "Quoted" },
  { value: "confirmed", label: "Confirmed" },
  { value: "deposit_paid", label: "Deposit Paid" },
  { value: "project_underway", label: "Project Underway" },
  { value: "project_complete", label: "Project Complete" },
  { value: "invoice_paid", label: "Invoice Paid" },
  { value: "site_live", label: "Site Live" },
  { value: "maintenance_setup", label: "Maintenance Invoice Set Up" },
  { value: "testimonial_requested", label: "Testimonial Requested" },
  { value: "lost", label: "Lost" },
] as const;

// Sales System clients: € onboarding + € per held call, 90-day pilot.
// The 90 days start when a client is moved into "Ads Live".
export const SALES_STAGES = [
  { value: "ss_call_booked", label: "Call 1 Booked" },
  { value: "ss_projections", label: "Projections Created" },
  { value: "ss_call2_booked", label: "Call 2 Booked" },
  { value: "ss_deciding", label: "Call 2 Held / Deciding" },
  { value: "ss_agreed", label: "Agreed / Onboarding Invoice Sent" },
  { value: "ss_onboarding_paid", label: "Onboarding Paid" },
  { value: "ss_onboarding", label: "Onboarding & Setup" },
  { value: "ss_ads_review", label: "Ads & Content Sent for Review" },
  { value: "ss_ads_live", label: "Ads Live (Pilot Running)" },
  { value: "ss_day21_review", label: "Day-21 Review" },
  { value: "ss_review_done", label: "Review Changes Complete" },
  { value: "ss_pilot_complete", label: "Pilot Complete" },
  { value: "ss_retained", label: "Retained" },
  { value: "ss_ended", label: "Ended" },
  { value: "ss_lost", label: "Lost" },
] as const;

export const STAGES = [...WEBSITE_STAGES, ...SALES_STAGES] as const;

export type WebsiteStage = (typeof WEBSITE_STAGES)[number]["value"];
export type SalesStage = (typeof SALES_STAGES)[number]["value"];
export type ProjectStage = WebsiteStage | SalesStage;
export type StageOption = { readonly value: ProjectStage; readonly label: string };

export function stagesFor(type: ClientType): readonly StageOption[] {
  return type === "sales_system" ? SALES_STAGES : WEBSITE_STAGES;
}

export function stageLabel(stage: ProjectStage): string {
  return STAGES.find((s) => s.value === stage)?.label ?? stage;
}

// Position within the stage's own pipeline (website or sales).
export function stageIndex(stage: ProjectStage): number {
  const web = WEBSITE_STAGES.findIndex((s) => s.value === stage);
  if (web !== -1) return web;
  return SALES_STAGES.findIndex((s) => s.value === stage);
}

export const LOST_STAGES: readonly ProjectStage[] = ["lost", "ss_lost"];

export function isLostStage(stage: ProjectStage | null | undefined): boolean {
  return stage === "lost" || stage === "ss_lost";
}

export function lostStageFor(type: ClientType): ProjectStage {
  return type === "sales_system" ? "ss_lost" : "lost";
}

export function isSalesStage(stage: ProjectStage): boolean {
  return SALES_STAGES.some((s) => s.value === stage);
}
