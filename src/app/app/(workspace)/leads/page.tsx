import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { LeadOverviewCard } from "@/features/app/components/lead-overview-card";
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
        <CardTitle className="mt-2 text-[clamp(3.8rem,3.1rem+1vw,5rem)] leading-[0.92]">
          All saved opportunities
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {dashboard.leads.map((lead) => (
          <LeadOverviewCard
            actions={
              <>
                <LeadStageBadge stage={lead.stage} />
                <Button asChild aria-label={`Open ${lead.title}`} size="icon" variant="outline">
                  <Link href={`/app/leads/${lead.id}`}>
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
              </>
            }
            currentScore={lead.currentScore}
            fallbackImage={lead.previewImage ?? "/previews/fallback-desktop.svg"}
            previewAlt={`${lead.title} preview`}
            previewImage={lead.previewImage ?? "/previews/fallback-desktop.svg"}
            projectedScore={lead.projectedScore}
            scoreLabel="Current score"
            scoreValueClassName="text-[2rem] sm:text-[2.15rem]"
            summary={lead.summary}
            title={lead.title}
            key={lead.id}
          />
        ))}
      </CardContent>
    </Card>
  );
}
