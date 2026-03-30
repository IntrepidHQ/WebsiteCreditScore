"use client";

import Link from "next/link";
import { ArrowUpRight, ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DeleteLeadButton } from "@/features/app/components/delete-lead-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadStageBadge } from "@/features/app/components/lead-stage-badge";
import { LeadOverviewCard } from "@/features/app/components/lead-overview-card";
import type { LeadRecord, SavedReport } from "@/lib/types/product";

function formatTimestamp(input: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(input));
}

export function ScanHistorySection({
  savedReports,
  leads,
}: {
  savedReports: SavedReport[];
  leads: LeadRecord[];
}) {
  const leadById = new Map(leads.map((lead) => [lead.id, lead]));

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0 pb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted">Scan history</p>
          <CardTitle className="mt-2 text-[clamp(3.1rem,2.6rem+0.9vw,4.4rem)] leading-[0.92]">
            Every site scanned in this workspace
          </CardTitle>
        </div>
        <div className="rounded-[10px] border border-border/70 bg-background-alt/70 px-3 py-2 text-sm text-muted">
          {savedReports.length} total scans
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        {savedReports.map((savedReport) => {
          const lead = leadById.get(savedReport.leadId);
          const report = savedReport.reportSnapshot;

          return (
            <LeadOverviewCard
              actions={
                <>
                  {lead ? <LeadStageBadge stage={lead.stage} /> : null}
                  <DeleteLeadButton
                    label={`Delete ${savedReport.title}`}
                    leadId={savedReport.leadId}
                    returnTo="/app"
                  />
                  <Button asChild aria-label={`Open lead detail for ${savedReport.title}`} size="icon" variant="outline">
                    <Link href={`/app/leads/${savedReport.leadId}`}>
                      <ClipboardList className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild aria-label={`Open audit for ${savedReport.title}`} size="icon" variant="outline">
                    <Link href={`/audit/${report.id}?url=${encodeURIComponent(report.normalizedUrl)}`}>
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </Button>
                </>
              }
              currentScore={lead?.currentScore ?? report.overallScore}
              fallbackImage={report.previewSet.fallbackCurrent.desktop}
              loadingLabel="Capturing preview"
              meta={
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs uppercase tracking-[0.16em] text-muted">
                  <span>{savedReport.normalizedUrl.replace(/^https?:\/\//, "")}</span>
                  <span>Scored {formatTimestamp(savedReport.createdAt)}</span>
                </div>
              }
              previewAlt={`${savedReport.title} preview`}
              previewImage={report.previewSet.current.desktop}
              projectedScore={lead?.projectedScore ?? report.overallScore}
              scoreLabel="Current score"
              scoreValueClassName="text-[2rem] sm:text-[2.15rem]"
              summary={report.executiveSummary}
              title={savedReport.title}
              key={savedReport.id}
            />
          );
        })}
      </CardContent>
    </Card>
  );
}
