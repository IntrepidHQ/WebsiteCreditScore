import { isUnlimitedWorkspace } from "@/lib/product/unlimited-workspace";
import type { WorkspaceRecord } from "@/lib/types/product";

export const MAX_ENTITLEMENT_ERROR = "MAX_ENTITLEMENT_REQUIRED";

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
