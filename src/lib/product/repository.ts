import type {
  DashboardSnapshot,
  EmailTemplateRecord,
  LeadDetailSnapshot,
  LeadRecord,
  LeadStage,
  PublicShareSnapshot,
  WorkspaceRecord,
  WorkspaceSession,
  WorkspaceEntitlement,
} from "@/lib/types/product";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import {
  applyLocalBillingPurchase,
  completeLocalReminder,
  consumeLocalWorkspaceTokens,
  createLocalLeadFromUrl,
  deleteLocalLead,
  ensureLocalWorkspace,
  getLocalDashboard,
  getLocalLeadDetail,
  resolveLocalPublicShare,
  saveLocalTemplate,
  updateLocalLeadStage,
} from "@/lib/product/local-store";
import {
  applySupabaseBillingPurchase,
  completeSupabaseReminder,
  consumeSupabaseWorkspaceTokens,
  createSupabaseLeadFromUrl,
  deleteSupabaseLead,
  ensureSupabaseWorkspace,
  getSupabaseDashboard,
  getSupabaseLeadDetail,
  resolveSupabasePublicShare,
  saveSupabaseTemplate,
  updateSupabaseLeadStage,
} from "@/lib/product/supabase-store";
import type { ShareSurface } from "@/lib/types/product";
import type { BillingAddOnId, BillingPlanId, TokenActionId } from "@/lib/billing/catalog";

export interface ProductRepository {
  kind: "local" | "supabase";
  ensureWorkspace(session: WorkspaceSession): Promise<WorkspaceRecord>;
  getDashboard(workspaceId: string, session: WorkspaceSession): Promise<DashboardSnapshot>;
  getLeadDetail(
    workspaceId: string,
    leadId: string,
    session: WorkspaceSession,
  ): Promise<LeadDetailSnapshot | null>;
  createLeadFromUrl(
    workspaceId: string,
    rawUrl: string,
    session: WorkspaceSession,
  ): Promise<LeadRecord>;
  deleteLead(
    workspaceId: string,
    leadId: string,
    session: WorkspaceSession,
  ): Promise<boolean>;
  updateLeadStage(
    workspaceId: string,
    leadId: string,
    stage: LeadStage,
    session: WorkspaceSession,
  ): Promise<LeadRecord | null>;
  completeReminder(
    workspaceId: string,
    reminderId: string,
    session: WorkspaceSession,
  ): Promise<unknown>;
  saveTemplate(
    workspaceId: string,
    session: WorkspaceSession,
    input: Pick<EmailTemplateRecord, "name" | "subject" | "body" | "kind"> & {
      id?: string;
    },
  ): Promise<EmailTemplateRecord>;
  resolvePublicShare(
    surface: ShareSurface,
    id: string,
    token: string,
  ): Promise<PublicShareSnapshot | null>;
  applyBillingPurchase(
    workspaceId: string,
    session: WorkspaceSession,
    input: {
      checkoutSessionId: string;
      label: string;
      tokenAmount: number;
      planId?: BillingPlanId | null;
      addOnIds?: BillingAddOnId[];
      entitlements?: WorkspaceEntitlement[];
    },
  ): Promise<WorkspaceRecord>;
  consumeTokenAction(
    workspaceId: string,
    session: WorkspaceSession,
    input: {
      actionId: TokenActionId;
      actionKey: string;
      label: string;
    },
  ): Promise<WorkspaceRecord>;
}

function createLocalRepository(): ProductRepository {
  return {
    kind: "local",
    ensureWorkspace: ensureLocalWorkspace,
    getDashboard: (workspaceId, session) => getLocalDashboard(workspaceId, session.userId),
    getLeadDetail: (workspaceId, leadId, session) =>
      getLocalLeadDetail(workspaceId, leadId, session.userId),
    createLeadFromUrl: (workspaceId, rawUrl, session) =>
      createLocalLeadFromUrl(workspaceId, rawUrl, session.userId),
    deleteLead: (workspaceId, leadId, session) =>
      deleteLocalLead(workspaceId, leadId, session.userId),
    updateLeadStage: (workspaceId, leadId, stage, session) =>
      updateLocalLeadStage(workspaceId, leadId, stage, session.userId),
    completeReminder: (workspaceId, reminderId, session) =>
      completeLocalReminder(workspaceId, reminderId, session.userId),
    saveTemplate: (workspaceId, session, input) =>
      saveLocalTemplate(workspaceId, session.userId, input),
    resolvePublicShare: (surface, id, token) =>
      resolveLocalPublicShare(surface, id, token),
    applyBillingPurchase: (workspaceId, session, input) =>
      applyLocalBillingPurchase(workspaceId, session.userId, input),
    consumeTokenAction: (workspaceId, session, input) =>
      consumeLocalWorkspaceTokens(workspaceId, session.userId, input),
  };
}

function createSupabaseRepository(): ProductRepository {
  return {
    kind: "supabase",
    ensureWorkspace: ensureSupabaseWorkspace,
    getDashboard: (workspaceId) => getSupabaseDashboard(workspaceId),
    getLeadDetail: (workspaceId, leadId) => getSupabaseLeadDetail(workspaceId, leadId),
    createLeadFromUrl: (workspaceId, rawUrl) => createSupabaseLeadFromUrl(workspaceId, rawUrl),
    deleteLead: (workspaceId, leadId) => deleteSupabaseLead(workspaceId, leadId),
    updateLeadStage: (workspaceId, leadId, stage) =>
      updateSupabaseLeadStage(workspaceId, leadId, stage),
    completeReminder: (workspaceId, reminderId) =>
      completeSupabaseReminder(workspaceId, reminderId),
    saveTemplate: (workspaceId, _session, input) => saveSupabaseTemplate(workspaceId, input),
    resolvePublicShare: (surface, id, token) =>
      resolveSupabasePublicShare(surface, id, token),
    applyBillingPurchase: (workspaceId, _session, input) =>
      applySupabaseBillingPurchase(workspaceId, input),
    consumeTokenAction: (workspaceId, _session, input) =>
      consumeSupabaseWorkspaceTokens(workspaceId, input),
  };
}

export function getProductRepository(session?: WorkspaceSession | null): ProductRepository {
  if (hasSupabaseEnv() && (!session || session.mode === "supabase")) {
    return createSupabaseRepository();
  }

  return createLocalRepository();
}
