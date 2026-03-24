"use client";

import Link from "next/link";
import { ArrowUpRight, ClipboardList } from "lucide-react";

import { PreviewImage } from "@/components/common/preview-image";
import { Button } from "@/components/ui/button";
import { DeleteLeadButton } from "@/features/app/components/delete-lead-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadStageBadge } from "@/features/app/components/lead-stage-badge";
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
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0 pb-2">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted">Scan history</p>
          <CardTitle className="mt-2 text-3xl">Every site scanned in this workspace</CardTitle>
        </div>
        <div className="rounded-[10px] border border-border/70 bg-background-alt/70 px-3 py-2 text-sm text-muted">
          {savedReports.length} total scans
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        {savedReports.map((savedReport) => {
          const lead = leadById.get(savedReport.leadId);
          const report = savedReport.reportSnapshot;

          return (
            <div
              className="grid gap-4 rounded-[10px] border border-border/70 bg-background-alt/60 p-4 md:grid-cols-[8.5rem_minmax(0,1fr)_auto]"
              key={savedReport.id}
            >
              <div className="overflow-hidden rounded-[8px] border border-border/70 bg-panel/70">
                <PreviewImage
                  alt={`${savedReport.title} preview`}
                  className="aspect-[4/3] h-full min-h-28"
                  fallbackLabel="Using site image"
                  loadingLabel="Capturing preview"
                  src={report.previewSet.current.desktop}
                />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">{savedReport.title}</p>
                  {lead ? <LeadStageBadge stage={lead.stage} /> : null}
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                  {report.executiveSummary}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs uppercase tracking-[0.16em] text-muted">
                  <span>{savedReport.normalizedUrl.replace(/^https?:\/\//, "")}</span>
                  <span>Scanned {formatTimestamp(savedReport.createdAt)}</span>
                </div>
              </div>

              <div className="flex min-w-[11rem] flex-col items-stretch gap-4 md:items-end">
                <div className="flex items-center justify-end gap-2">
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
                </div>
                <div className="text-left md:text-right">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Score</p>
                  <p className="mt-2 text-xl font-semibold text-foreground">
                    {lead?.currentScore ?? report.overallScore}
                    {" → "}
                    {lead?.projectedScore ?? report.overallScore}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
