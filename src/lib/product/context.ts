import { requireWorkspaceSession } from "@/lib/auth/session";
import { getProductRepository } from "@/lib/product/repository";
import { redirectOnRecoverableProductError } from "@/lib/product/workspace-load-errors";

const withRepositoryRecovery = async <T>(run: () => Promise<T>): Promise<T> => {
  try {
    return await run();
  } catch (err) {
    redirectOnRecoverableProductError(err);
    throw err;
  }
};

export async function getWorkspaceAppContext() {
  const session = await requireWorkspaceSession();
  const repository = getProductRepository(session);
  const workspace = await withRepositoryRecovery(() => repository.ensureWorkspace(session));

  return {
    session,
    repository,
    workspace,
  };
}

/** Use for any page that calls `repository.getDashboard` — errors must not bypass the layout. */
export async function getWorkspaceDashboardContext() {
  const ctx = await getWorkspaceAppContext();
  const dashboard = await withRepositoryRecovery(() =>
    ctx.repository.getDashboard(ctx.workspace.id, ctx.session),
  );
  return { ...ctx, dashboard };
}

/** Lead detail: wraps `getLeadDetail` so Supabase errors redirect instead of a 500. */
export async function getWorkspaceLeadDetailContext(leadId: string) {
  const ctx = await getWorkspaceAppContext();
  const detail = await withRepositoryRecovery(() =>
    ctx.repository.getLeadDetail(ctx.workspace.id, leadId, ctx.session),
  );
  return { ...ctx, detail };
}
