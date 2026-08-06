"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { STAGES, type ProjectStage } from "@/lib/stages";

function parseStage(formData: FormData): ProjectStage | undefined {
  const value = formData.get("stage");
  const match = STAGES.find((s) => s.value === value);
  return match?.value;
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

  const { data, error } = await supabase
    .from("projects")
    .insert({
      name,
      stage: parseStage(formData),
      client_name: optionalString(formData, "client_name"),
      client_email: optionalString(formData, "client_email"),
      client_phone: optionalString(formData, "client_phone"),
      live_url: optionalString(formData, "live_url"),
      folder_url: optionalString(formData, "folder_url"),
      budget_amount: optionalNumber(formData, "budget_amount"),
      no_maintenance: checkbox(formData, "no_maintenance"),
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

  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({
      name,
      stage: parseStage(formData),
      client_name: optionalString(formData, "client_name"),
      client_email: optionalString(formData, "client_email"),
      client_phone: optionalString(formData, "client_phone"),
      live_url: optionalString(formData, "live_url"),
      folder_url: optionalString(formData, "folder_url"),
      budget_amount: optionalNumber(formData, "budget_amount"),
      deposit_amount: optionalNumber(formData, "deposit_amount"),
      deposit_paid_at: optionalString(formData, "deposit_paid_at"),
      invoice_paid_at: optionalString(formData, "invoice_paid_at"),
      maintenance_fee: optionalNumber(formData, "maintenance_fee"),
      maintenance_setup_at: optionalString(formData, "maintenance_setup_at"),
      no_maintenance: checkbox(formData, "no_maintenance"),
      launch_date: optionalString(formData, "launch_date"),
      renewal_date: optionalString(formData, "renewal_date"),
      follow_up_date: optionalString(formData, "follow_up_date"),
      notes: optionalString(formData, "notes"),
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
  const { error } = await supabase
    .from("projects")
    .update({ stage })
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
