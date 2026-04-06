"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { workspaceSessionFromSupabaseUser } from "@/lib/auth/session";
import { getWorkspaceAppContext } from "@/lib/product/context";
import { redirectOnRecoverableProductError } from "@/lib/product/workspace-load-errors";
import { getProductRepository } from "@/lib/product/repository";
import type { LeadStage } from "@/lib/types/product";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Dashboard scan: Server Action reads `cookies()` in the same request context as `/app` RSC,
 * so Supabase `getUser()` sees the session after middleware refresh (avoids `session-required`
 * loops from Route Handler cookie drift).
 */
export const submitWorkspaceScanFromDashboardAction = async (formData: FormData) => {
  const rawUrl = String(formData.get("url") ?? "").trim();

  if (!rawUrl) {
    redirect("/app?error=missing-url");
  }

  if (!hasSupabaseEnv()) {
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
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/app/login?error=session-required&next=%2Fapp");
  }

  const session = workspaceSessionFromSupabaseUser(user);
  const repository = getProductRepository(session);

  let workspace;
  try {
    workspace = await repository.ensureWorkspace(session);
  } catch (err) {
    redirectOnRecoverableProductError(err);
    throw err;
  }

  try {
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
