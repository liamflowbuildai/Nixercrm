"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  isLostStage,
  parseClientType,
  stageIndex,
  stagesFor,
  type ClientType,
  type ProjectStage,
} from "@/lib/stages";
import { toDateInput } from "@/lib/sales";

function parseStage(
  formData: FormData,
  type: ClientType,
): ProjectStage | undefined {
  const value = formData.get("stage");
  const match = stagesFor(type).find((s) => s.value === value);
  return match?.value;
}

// The 90-day pilot starts when a Sales System client reaches "Ads Live".
// If no start date has been entered by then, default it to today.
function needsPilotStart(stage: ProjectStage | undefined): boolean {
  if (!stage || !stage.startsWith("ss_")) return false;
  const idx = stageIndex(stage);
  return idx >= stageIndex("ss_ads_live") && idx < stageIndex("ss_ended");
}

// Lost tracking: moving a deal into Lost records the stage it was lost at
// and the date; moving it back out clears both. A stage picked on the form
// (to correct or backfill it) wins over the automatic one.
async function lostFields(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string | null,
  newStage: ProjectStage | undefined,
  pickedFrom: ProjectStage | null = null,
): Promise<Record<string, unknown>> {
  if (!newStage) return {};
  let existing: { stage: ProjectStage; lost_from_stage: ProjectStage | null; lost_at: string | null } | null = null;
  if (projectId) {
    const { data } = await supabase
      .from("projects")
      .select("stage, lost_from_stage, lost_at")
      .eq("id", projectId)
      .single();
    existing = data;
  }
  if (!isLostStage(newStage)) {
    return existing?.lost_from_stage || existing?.lost_at
      ? { lost_from_stage: null, lost_at: null }
      : {};
  }
  const autoFrom =
    existing && !isLostStage(existing.stage) ? existing.stage : existing?.lost_from_stage ?? null;
  return {
    lost_from_stage: pickedFrom ?? autoFrom,
    lost_at: existing?.lost_at ?? toDateInput(new Date()),
  };
}

function parseLostFrom(formData: FormData, type: ClientType): ProjectStage | null {
  const value = formData.get("lost_from_stage");
  const match = stagesFor(type).find((s) => s.value === value && !isLostStage(s.value));
  return match?.value ?? null;
}

function salesFields(formData: FormData) {
  return {
    onboarding_fee: optionalNumber(formData, "onboarding_fee"),
    onboarding_paid_at: optionalString(formData, "onboarding_paid_at"),
    price_per_call: optionalNumber(formData, "price_per_call"),
    guaranteed_calls: optionalNumber(formData, "guaranteed_calls"),
    pilot_start_date: optionalString(formData, "pilot_start_date"),
  };
}

// The form takes maintenance per month; the database keeps the yearly
// figure (as it always has), so existing records don't change.
function monthlyToYearly(monthly: number | null): number | null {
  return monthly == null ? null : Math.round(monthly * 12 * 100) / 100;
}

const toMonthly = (yearly: number) => Math.round((yearly / 12) * 100) / 100;

// If the monthly figure wasn't edited, keep the exact yearly value already
// stored (e.g. €500/yr shows as €41.67/mo and must not become €500.04).
function maintenanceYearly(formData: FormData): number | null {
  const monthly = optionalNumber(formData, "maintenance_monthly");
  const original = optionalNumber(formData, "maintenance_fee_original");
  if (monthly != null && original != null && toMonthly(original) === monthly) {
    return original;
  }
  return monthlyToYearly(monthly);
}

function websiteFields(formData: FormData) {
  return {
    live_url: optionalString(formData, "live_url"),
    budget_amount: optionalNumber(formData, "budget_amount"),
    deposit_amount: optionalNumber(formData, "deposit_amount"),
    deposit_paid_at: optionalString(formData, "deposit_paid_at"),
    invoice_paid_at: optionalString(formData, "invoice_paid_at"),
    maintenance_fee: maintenanceYearly(formData),
    maintenance_setup_at: optionalString(formData, "maintenance_setup_at"),
    no_maintenance: checkbox(formData, "no_maintenance"),
    launch_date: optionalString(formData, "launch_date"),
    renewal_date: optionalString(formData, "renewal_date"),
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

function optionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
}

function optionalNumber(formData: FormData, key: string): number | null {
  const value = optionalString(formData, key);
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function checkbox(formData: FormData, key: string): boolean {
  return formData.get(key) === "true";
}

export async function createProject(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Error("Project name is required.");
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const clientType = parseClientType(formData.get("client_type"));
  const stage = parseStage(formData, clientType);

  const typeFields: Record<string, unknown> =
    clientType === "sales_system"
      ? salesFields(formData)
      : websiteFields(formData);
  if (
    clientType === "sales_system" &&
    needsPilotStart(stage) &&
    !typeFields.pilot_start_date
  ) {
    typeFields.pilot_start_date = toDateInput(new Date());
  }

  const lost = await lostFields(supabase, null, stage, parseLostFrom(formData, clientType));

  const { data, error } = await supabase
    .from("projects")
    .insert({
      name,
      client_type: clientType,
      stage: stage ?? stagesFor(clientType)[0].value,
      client_name: optionalString(formData, "client_name"),
      client_email: optionalString(formData, "client_email"),
      client_phone: optionalString(formData, "client_phone"),
      folder_url: optionalString(formData, "folder_url"),
      ...typeFields,
      ...lost,
      created_by: userData.user?.id ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create project.");
  }

  revalidatePath("/");
  redirect(`/projects/${data.id}`);
}

export async function updateProject(projectId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Error("Project name is required.");
  }

  const clientType = parseClientType(formData.get("client_type"));
  const stage = parseStage(formData, clientType);

  // Only touch the fields that belong to this client type, so saving one
  // kind of form never blanks out columns it doesn't show.
  const typeFields: Record<string, unknown> =
    clientType === "sales_system"
      ? salesFields(formData)
      : websiteFields(formData);
  if (
    clientType === "sales_system" &&
    needsPilotStart(stage) &&
    !typeFields.pilot_start_date
  ) {
    typeFields.pilot_start_date = toDateInput(new Date());
  }

  const supabase = await createClient();
  const lost = await lostFields(
    supabase,
    projectId,
    stage,
    parseLostFrom(formData, clientType),
  );
  const { error } = await supabase
    .from("projects")
    .update({
      name,
      stage,
      client_name: optionalString(formData, "client_name"),
      client_email: optionalString(formData, "client_email"),
      client_phone: optionalString(formData, "client_phone"),
      folder_url: optionalString(formData, "folder_url"),
      follow_up_date: optionalString(formData, "follow_up_date"),
      notes: optionalString(formData, "notes"),
      ...typeFields,
      ...lost,
    })
    .eq("id", projectId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
}

export async function updateProjectStage(
  projectId: string,
  stage: ProjectStage,
) {
  const supabase = await createClient();
  const update: Record<string, unknown> = {
    stage,
    ...(await lostFields(supabase, projectId, stage)),
  };

  if (needsPilotStart(stage)) {
    const { data: existing } = await supabase
      .from("projects")
      .select("pilot_start_date")
      .eq("id", projectId)
      .single();
    if (existing && !existing.pilot_start_date) {
      update.pilot_start_date = toDateInput(new Date());
    }
  }

  const { error } = await supabase
    .from("projects")
    .update(update)
    .eq("id", projectId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  redirect("/");
}

export async function addTask(projectId: string, title: string) {
  const trimmed = title.trim();
  if (!trimmed) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("project_tasks")
    .insert({ project_id: projectId, title: trimmed });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/projects/${projectId}`);
}

export async function toggleTask(
  taskId: string,
  projectId: string,
  isDone: boolean,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("project_tasks")
    .update({ is_done: isDone })
    .eq("id", taskId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/projects/${projectId}`);
}

export async function deleteTask(taskId: string, projectId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("project_tasks")
    .delete()
    .eq("id", taskId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/projects/${projectId}`);
}

// ---------- Sales System: calls held per calendar month ----------

function parseMonthKey(value: string | null): string | null {
  // accepts "YYYY-MM" (month input) or "YYYY-MM-DD"
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})/.exec(value);
  return match ? `${match[1]}-${match[2]}-01` : null;
}

function revalidateSales(projectId: string) {
  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
}

// Create or overwrite one month's figures for a client.
export async function saveSalesMonth(projectId: string, formData: FormData) {
  const month = parseMonthKey(optionalString(formData, "month"));
  if (!month) throw new Error("Pick a month.");

  const supabase = await createClient();
  const { error } = await supabase.from("sales_call_months").upsert(
    {
      project_id: projectId,
      month,
      calls_held: Math.max(0, Math.round(optionalNumber(formData, "calls_held") ?? 0)),
      retainer_amount: optionalNumber(formData, "retainer_amount"),
      invoiced_at: optionalString(formData, "invoiced_at"),
      paid_at: optionalString(formData, "paid_at"),
    },
    { onConflict: "project_id,month" },
  );

  if (error) throw new Error(error.message);
  revalidateSales(projectId);
}

// Weekly quick-add: adds N held calls to a month's running total
// (the current month unless another one is picked).
export async function addCallsHeld(projectId: string, formData: FormData) {
  const add = Math.round(optionalNumber(formData, "add_calls") ?? 0);
  if (!add) return;
  const month =
    parseMonthKey(optionalString(formData, "month")) ??
    parseMonthKey(toDateInput(new Date()))!;

  const supabase = await createClient();
  const { data: existing, error: readError } = await supabase
    .from("sales_call_months")
    .select("id, calls_held")
    .eq("project_id", projectId)
    .eq("month", month)
    .maybeSingle();
  if (readError) throw new Error(readError.message);

  const { error } = existing
    ? await supabase
        .from("sales_call_months")
        .update({ calls_held: Math.max(0, existing.calls_held + add) })
        .eq("id", existing.id)
    : await supabase
        .from("sales_call_months")
        .insert({ project_id: projectId, month, calls_held: Math.max(0, add) });

  if (error) throw new Error(error.message);
  revalidateSales(projectId);
}

export async function deleteSalesMonth(monthId: string, projectId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("sales_call_months")
    .delete()
    .eq("id", monthId);

  if (error) throw new Error(error.message);
  revalidateSales(projectId);
}
