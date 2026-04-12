import { isUnlimitedWorkspace } from "@/lib/product/unlimited-workspace";
import type { WorkspaceEntitlement, WorkspaceRecord } from "@/lib/types/product";

export const MAX_ENTITLEMENT_ERROR = "MAX_ENTITLEMENT_REQUIRED";

/** Complimentary MAX for trusted test accounts (never store passwords in the repo). */
const COMPLIMENTARY_MAX_EMAILS = new Set(
  ["seekercray@gmail.com", "crayhanssolo@gmail.com"].map((email) => email.toLowerCase()),
);

export const isComplimentaryMaxEmail = (email: string | null | undefined): boolean => {
  const normalized = (email ?? "").trim().toLowerCase();
  if (!normalized) {
    return false;
  }
  return COMPLIMENTARY_MAX_EMAILS.has(normalized);
};

const mergeEntitlementSets = (
  current: WorkspaceEntitlement[],
  extras: WorkspaceEntitlement[],
): WorkspaceEntitlement[] => Array.from(new Set([...current, ...extras]));

/**
 * Grants `max-stealth` in-memory when the signed-in email is allowlisted.
 * Callers should persist the returned workspace when entitlements change.
 */
export const workspaceWithComplimentaryMaxEntitlement = (
  workspace: WorkspaceRecord,
  sessionEmail: string | null | undefined,
): WorkspaceRecord => {
  if (!isComplimentaryMaxEmail(sessionEmail)) {
    return workspace;
  }

  if ((workspace.entitlements ?? []).includes("max-stealth")) {
    return workspace;
  }

  return {
    ...workspace,
    entitlements: mergeEntitlementSets(workspace.entitlements ?? [], ["max-stealth"]),
  };
};

/**
 * MAX build prompts require the paid add-on (`max-stealth`) unless the deploy is in unlimited mode.
 */
export const workspaceHasMaxAccess = (workspace: WorkspaceRecord): boolean => {
  if (isUnlimitedWorkspace()) {
    return true;
  }
  return workspace.entitlements?.includes("max-stealth") ?? false;
};

export const assertWorkspaceAllowsMaxPrompt = (workspace: WorkspaceRecord): void => {
  if (!workspaceHasMaxAccess(workspace)) {
    throw new Error(MAX_ENTITLEMENT_ERROR);
  }
};

export const isMaxEntitlementError = (err: unknown): boolean =>
  err instanceof Error && err.message === MAX_ENTITLEMENT_ERROR;
