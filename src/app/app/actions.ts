"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getWorkspaceAppContext } from "@/lib/product/context";
import type { LeadStage } from "@/lib/types/product";

/**
 * Dashboard scan: same session resolution as `/app` RSC (`getWorkspaceAppContext`), including
 * demo mode when Supabase env is set but there is no JWT — avoids redirecting to login while
 * the rest of the workspace still loads.
 */
export const submitWorkspaceScanFromDashboardAction = async (formData: FormData) => {
  const rawUrl = String(formData.get("url") ?? "").trim();

  if (!rawUrl) {
    redirect("/app?error=missing-url");
  }

  try {
    const { repository, session, workspace } = await getWorkspaceAppContext();
    const lead = await repository.createLeadFromUrl(workspace.id, rawUrl, session);
    revalidatePath("/app");
    revalidatePath("/app/leads");
    redirect(`/app/leads/${lead.id}`);
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_TOKENS") {
      redirect("/app?error=insufficient-tokens");
    }
    throw error;
  }
};

export async function updateLeadStageAction(formData: FormData) {
  const leadId = String(formData.get("leadId") ?? "");
  const stage = String(formData.get("stage") ?? "") as LeadStage;
  const returnTo = String(formData.get("returnTo") ?? "/app/leads");
  const { repository, session, workspace } = await getWorkspaceAppContext();

  if (!leadId || !stage) {
    redirect(returnTo);
  }

  await repository.updateLeadStage(workspace.id, leadId, stage, session);
  revalidatePath("/app");
  revalidatePath("/app/leads");
  revalidatePath(returnTo);
  redirect(returnTo);
}

export async function deleteLeadAction(formData: FormData) {
  const leadId = String(formData.get("leadId") ?? "");
  const returnTo = String(formData.get("returnTo") ?? "/app");
  const { repository, session, workspace } = await getWorkspaceAppContext();

  if (!leadId) {
    redirect(returnTo);
  }

  await repository.deleteLead(workspace.id, leadId, session);
  revalidatePath("/app");
  revalidatePath("/app/leads");
  redirect(returnTo);
}

export async function completeReminderAction(formData: FormData) {
  const reminderId = String(formData.get("reminderId") ?? "");
  const returnTo = String(formData.get("returnTo") ?? "/app");
  const { repository, session, workspace } = await getWorkspaceAppContext();

  if (!reminderId) {
    redirect(returnTo);
  }

  await repository.completeReminder(workspace.id, reminderId, session);
  revalidatePath("/app");
  revalidatePath("/app/leads");
  revalidatePath(returnTo);
  redirect(returnTo);
}

export async function saveTemplateAction(formData: FormData) {
  const { repository, session, workspace } = await getWorkspaceAppContext();
  const id = String(formData.get("id") ?? "").trim() || undefined;
  const name = String(formData.get("name") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const kind = String(formData.get("kind") ?? "intro") as "intro" | "follow-up" | "proposal";

  if (!name || !subject || !body) {
    redirect("/app/templates?error=missing-fields");
  }

  await repository.saveTemplate(workspace.id, session, {
    id,
    name,
    subject,
    body,
    kind,
  });
  revalidatePath("/app");
  revalidatePath("/app/templates");
  redirect("/app/templates?saved=1");
}
