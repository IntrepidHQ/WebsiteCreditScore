import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { PreviewImage } from "@/components/common/preview-image";
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
            className="grid gap-4 rounded-[10px] border border-border/70 bg-background-alt/60 p-4 md:grid-cols-[8rem_minmax(0,1fr)_auto]"
            key={lead.id}
          >
            <div className="overflow-hidden rounded-[8px] border border-border/70 bg-panel/70">
              <PreviewImage
                alt={`${lead.title} preview`}
                className="aspect-[4/3] h-full min-h-28"
                fallbackLabel="Using site image"
                loadingLabel="Capturing preview"
                src={lead.previewImage ?? "/previews/fallback-desktop.svg"}
              />
            </div>

            <div className="min-w-0">
              <p className="font-semibold text-foreground">{lead.title}</p>
              <p className="mt-2 text-sm leading-6 text-muted">{lead.summary}</p>
            </div>

            <div className="flex min-w-[11rem] flex-col items-stretch gap-4 md:items-end">
              <div className="flex items-center justify-end gap-2">
                <LeadStageBadge stage={lead.stage} />
                <Button asChild aria-label={`Open ${lead.title}`} size="icon" variant="outline">
                  <Link href={`/app/leads/${lead.id}`}>
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
              </div>
              <div className="text-left md:text-right">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Score</p>
                <p className="mt-2 text-xl font-semibold text-foreground">
                  {lead.currentScore} → {lead.projectedScore}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
