export const STAGES = [
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
] as const;

export type ProjectStage = (typeof STAGES)[number]["value"];

export function stageLabel(stage: ProjectStage): string {
  return STAGES.find((s) => s.value === stage)?.label ?? stage;
}

export function stageIndex(stage: ProjectStage): number {
  return STAGES.findIndex((s) => s.value === stage);
}
