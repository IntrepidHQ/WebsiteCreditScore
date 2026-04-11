"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getOptionalWorkspaceSession } from "@/lib/auth/session";
import { getWorkspaceAppContext } from "@/lib/product/context";
import { getProductRepository } from "@/lib/product/repository";
import type { AgencyBranding, ThemeTokens } from "@/lib/types/audit";
import { isLeadStage } from "@/lib/product/lead-kanban";
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

/**
 * Update pipeline stage from the Kanban board without a full-page redirect.
 */
export async function updateLeadStageInline(
  leadId: string,
  stage: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!leadId.trim()) {
    return { ok: false, error: "Missing lead." };
  }
  if (!isLeadStage(stage)) {
    return { ok: false, error: "Invalid stage." };
  }

  try {
    const { repository, session, workspace } = await getWorkspaceAppContext();
    const updated = await repository.updateLeadStage(workspace.id, leadId, stage, session);
    if (!updated) {
      return { ok: false, error: "Lead not found." };
    }
    revalidatePath("/app");
    revalidatePath("/app/leads");
    revalidatePath(`/app/leads/${leadId}`);
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update stage.";
    return { ok: false, error: message };
  }
}

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

export const THEME_SAVE_NO_SESSION = "THEME_SAVE_NO_SESSION";

/**
 * Persists theme + branding to the signed-in workspace when a session exists.
 * Returns `{ ok: false, error: THEME_SAVE_NO_SESSION }` on the public theme page
 * so the client can skip UI noise; other failures return a message for display.
 */
export async function saveWorkspaceThemeAction(
  theme: ThemeTokens,
  branding: AgencyBranding,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getOptionalWorkspaceSession();
  if (!session) {
    return { ok: false, error: THEME_SAVE_NO_SESSION };
  }

  try {
    const repository = getProductRepository(session);
    const workspace = await repository.ensureWorkspace(session);
    await repository.saveTheme(workspace.id, session, theme, branding);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save theme.";
    return { ok: false, error: message };
  }
}
