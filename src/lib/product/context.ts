import { requireWorkspaceSession } from "@/lib/auth/session";
import { getProductRepository } from "@/lib/product/repository";

export async function getWorkspaceAppContext() {
  const session = await requireWorkspaceSession();
  const repository = getProductRepository(session);
  const workspace = await repository.ensureWorkspace(session);

  return {
    session,
    repository,
    workspace,
  };
}
