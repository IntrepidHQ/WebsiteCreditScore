import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { workspaceHasMaxAccess } from "@/lib/billing/max-access";
import { getWorkspaceDashboardContext } from "@/lib/product/context";

export const metadata = {
  title: "Pipeline | Workspace",
};

export default async function PipelinePage() {
  const { workspace, dashboard } = await getWorkspaceDashboardContext();
  const hasMax = workspaceHasMaxAccess(workspace);
  const count = dashboard.leads.length;

  if (!hasMax) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl">Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-muted">
            <p>
              The consolidated pipeline view is bundled with MAX — upgrade to group saved audits, stages, and
              reminders alongside chat and handoffs.
            </p>
            <Button asChild>
              <Link href="/pricing">View pricing</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-10 sm:px-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl tracking-tight text-foreground">Pipeline</h1>
        <p className="text-sm leading-6 text-muted">
          You have {count} saved {count === 1 ? "opportunity" : "opportunities"} in this workspace. Open Leads for full
          detail, reminders, and share links.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Next steps</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/app/leads">Open Leads</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/app/max">MAX handoffs</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/app/chat">Workspace chat</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
