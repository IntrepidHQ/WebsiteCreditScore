import { isUnlimitedWorkspace } from "@/lib/product/unlimited-workspace";
import type { WorkspaceEntitlement, WorkspaceRecord } from "@/lib/types/product";

export const MAX_ENTITLEMENT_ERROR = "MAX_ENTITLEMENT_REQUIRED";

/** Complimentary MAX for trusted test accounts (never store passwords in the repo). */
const COMPLIMENTARY_MAX_EMAILS = new Set(
  ["seekercray@gmail.com", "crayhanssolo@gmail.com"].map((email) => email.toLowerCase()),
);

const parseCommaSeparatedEmails = (raw: string | undefined): string[] => {
  if (!raw?.trim()) {
    return [];
  }
  return raw
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
};

export const isComplimentaryMaxEmail = (email: string | null | undefined): boolean => {
  const normalized = (email ?? "").trim().toLowerCase();
  if (!normalized) {
    return false;
  }
  if (COMPLIMENTARY_MAX_EMAILS.has(normalized)) {
    return true;
  }
  return parseCommaSeparatedEmails(process.env.COMPLIMENTARY_MAX_EMAILS).includes(normalized);
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

const isTruthyEnv = (value: string | undefined): boolean =>
  value === "1" || value?.toLowerCase() === "true";

/**
 * When `WORKSPACE_CHAT_ALLOW_WITHOUT_MAX` is `1` or `true`, workspace chat is allowed without the
 * MAX add-on (for staging and internal testing). Production should leave this unset.
 */
export const workspaceAgentChatSkipsMaxGate = (): boolean =>
  isTruthyEnv(process.env.WORKSPACE_CHAT_ALLOW_WITHOUT_MAX);

/** Workspace assistant chat: MAX add-on unless testing bypass env is enabled. */
export const workspaceHasAgentChatAccess = (workspace: WorkspaceRecord): boolean => {
  if (workspaceAgentChatSkipsMaxGate()) {
    return true;
  }
  return workspaceHasMaxAccess(workspace);
};

export const assertWorkspaceAllowsMaxPrompt = (workspace: WorkspaceRecord): void => {
  if (!workspaceHasMaxAccess(workspace)) {
    throw new Error(MAX_ENTITLEMENT_ERROR);
  }
};

export const isMaxEntitlementError = (err: unknown): boolean =>
  err instanceof Error && err.message === MAX_ENTITLEMENT_ERROR;
