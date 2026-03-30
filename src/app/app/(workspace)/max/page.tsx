import { MaxWorkflowPage } from "@/features/max/components/max-workflow-page";
import { getWorkspaceAppContext } from "@/lib/product/context";

export const dynamic = "force-dynamic";

export default async function MaxRoutePage() {
  const { repository, session, workspace } = await getWorkspaceAppContext();
  const dashboard = await repository.getDashboard(workspace.id, session);
  const latestReport = dashboard.savedReports[0]?.reportSnapshot ?? null;

  return <MaxWorkflowPage report={latestReport} />;
}
