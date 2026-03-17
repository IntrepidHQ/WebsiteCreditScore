import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LeadStageBadge } from "@/features/app/components/lead-stage-badge";
import { getWorkspaceAppContext } from "@/lib/product/context";

export default async function LeadsPage() {
  const { repository, session, workspace } = await getWorkspaceAppContext();
  const dashboard = await repository.getDashboard(workspace.id, session);

  return (
    <Card>
      <CardHeader>
        <p className="text-xs uppercase tracking-[0.24em] text-muted">Lead pipeline</p>
        <CardTitle className="mt-2 text-4xl">All saved opportunities</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {dashboard.leads.map((lead) => (
          <div
            className="grid gap-3 rounded-[10px] border border-border/70 bg-background-alt/60 p-4 lg:grid-cols-[minmax(0,1fr)_12rem_12rem_auto]"
            key={lead.id}
          >
            <div>
              <p className="font-semibold text-foreground">{lead.title}</p>
              <p className="mt-2 text-sm leading-6 text-muted">{lead.summary}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Current</p>
              <p className="mt-2 font-display text-3xl font-semibold text-foreground">
                {lead.currentScore}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Projected</p>
              <p className="mt-2 font-display text-3xl font-semibold text-accent">
                {lead.projectedScore}
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 lg:items-end">
              <LeadStageBadge stage={lead.stage} />
              <Button asChild size="sm" variant="secondary">
                <Link href={`/app/leads/${lead.id}`}>Open lead</Link>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
