import { MaxWorkflowPage } from "@/features/max/components/max-workflow-page";
import { workspaceHasMaxAccess } from "@/lib/billing/max-access";
import { getWorkspaceDashboardContext } from "@/lib/product/context";

export const dynamic = "force-dynamic";

export default async function MaxRoutePage() {
  const { workspace, dashboard } = await getWorkspaceDashboardContext();
  const hasAccess = workspaceHasMaxAccess(workspace);
  const savedReportOptions = [...dashboard.savedReports]
    .sort(
      (a, b) =>
        new Date(b.updatedAt ?? b.createdAt).getTime() -
        new Date(a.updatedAt ?? a.createdAt).getTime(),
    )
    .map((r) => ({
      id: r.id,
      title: r.title,
      normalizedUrl: r.normalizedUrl,
      updatedAt: r.updatedAt ?? r.createdAt,
    }));

  return (
    <MaxWorkflowPage
      availableTokens={dashboard.workspace.tokenBalance}
      hasAccess={hasAccess}
      savedReportOptions={savedReportOptions}
    />
  );
}
