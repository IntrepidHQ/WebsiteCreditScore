import Link from "next/link";

import { AgentChatPanel } from "@/features/app/components/agent-chat-panel";
import { buildAgentChatReportContext } from "@/features/app/utils/build-agent-chat-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { workspaceHasAgentChatAccess } from "@/lib/billing/max-access";
import { getWorkspaceDashboardContext } from "@/lib/product/context";

export default async function WorkspaceChatPage() {
  const { workspace, dashboard } = await getWorkspaceDashboardContext();
  const hasMax = workspaceHasAgentChatAccess(workspace);
  const latestSavedReport = dashboard.savedReports[0] ?? null;
  const reportContext = buildAgentChatReportContext(latestSavedReport);

  if (!hasMax) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Workspace chat requires MAX</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-muted">
            <p>
              The in-app assistant is included with the MAX add-on. Upgrade to unlock chat grounded in your
              saved audits and handoff workflows.
            </p>
            <Button asChild>
              <Link href="/app/max">Open MAX in workspace</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl tracking-tight text-foreground">Workspace chat</h1>
        <p className="text-sm leading-6 text-muted">
          Ask questions about audits, proposals, and build handoffs. Context below pulls from your most recently
          saved report when available.
        </p>
      </div>
      <AgentChatPanel layout="standalone" reportContext={reportContext} />
    </div>
  );
}
