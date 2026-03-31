import { MaxWorkflowPage } from "@/features/max/components/max-workflow-page";
import { getWorkspaceAppContext } from "@/lib/product/context";

export const dynamic = "force-dynamic";

export default async function MaxRoutePage() {
  const { repository, session, workspace } = await getWorkspaceAppContext();
  const dashboard = await repository.getDashboard(workspace.id, session);
  const latestReport = dashboard.savedReports[0]?.reportSnapshot ?? null;
  const hasAccess = workspace.entitlements.includes("max-stealth");

  return (
    <MaxWorkflowPage
      availableTokens={dashboard.workspace.tokenBalance}
      hasAccess={hasAccess}
      report={latestReport}
    />
  );
}
