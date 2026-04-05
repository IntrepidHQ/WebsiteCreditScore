"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarDays, ClipboardList, Globe2, History } from "lucide-react";

import { PreviewImage } from "@/components/common/preview-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteLeadButton } from "@/features/app/components/delete-lead-button";
import { LeadStageBadge } from "@/features/app/components/lead-stage-badge";
import type { LeadRecord, SavedReport } from "@/lib/types/product";

function formatTimestamp(input: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(input));
}

function WorkspaceScanHistoryCard({
  savedReport,
  lead,
}: {
  savedReport: SavedReport;
  lead?: LeadRecord;
}) {
  const report = savedReport.reportSnapshot;
  if (!report) {
    return null;
  }

  const desktopShot =
    report.previewSet?.current?.desktop ?? "/previews/fallback-desktop.svg";
  const fallbackShot =
    report.previewSet?.fallbackCurrent?.desktop ?? desktopShot;
  const score = Number(lead?.currentScore ?? report.overallScore ?? 0);
  const domain = savedReport.normalizedUrl.replace(/^https?:\/\//, "");
  const auditHref = `/audit/${report.id}?url=${encodeURIComponent(report.normalizedUrl)}`;

  return (
    <Card className="group h-full overflow-hidden rounded-[24px] border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_88%,transparent),color-mix(in_srgb,var(--theme-background-alt)_96%,transparent))] shadow-[0_20px_60px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-1 hover:border-accent/30">
      <Link href={auditHref}>
        <PreviewImage
          alt={`${savedReport.title} preview`}
          className="aspect-[21/10]"
          fallbackLabel="Preview unavailable"
          fallbackSrc={fallbackShot}
          imageClassName="transition duration-500 group-hover:scale-[1.02]"
          loadingLabel="Capturing desktop screenshot"
          src={desktopShot}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background/35 via-transparent to-transparent" />
        </PreviewImage>
      </Link>

      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {lead ? <LeadStageBadge stage={lead.stage} /> : null}
            <Badge variant="accent">{score.toFixed(1)}</Badge>
          </div>

          <div className="flex items-center gap-2">
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
              <Link href={auditHref}>
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        <CardTitle className="font-display text-[clamp(2.35rem,1.95rem+0.6vw,3.1rem)] leading-[0.92]">
          <Link className="transition hover:text-accent" href={auditHref}>
            {savedReport.title}
          </Link>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <p className="line-clamp-3 text-[1rem] leading-7 text-muted">
          {report.executiveSummary ?? ""}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs uppercase tracking-[0.16em] text-muted">
          <span className="inline-flex items-center gap-2">
            <Globe2 className="size-3.5" />
            <span className="truncate">{domain}</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="size-3.5" />
            Scored {formatTimestamp(savedReport.createdAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
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
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0 pb-4">
        <div>
          <div className="flex items-center gap-2 text-accent">
            <History className="size-4" />
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Scan history</p>
          </div>
          <CardTitle className="mt-2 text-[clamp(3.1rem,2.6rem+0.9vw,4.4rem)] leading-[0.92]">
            Every site scanned in this workspace
          </CardTitle>
        </div>
        <div className="rounded-[10px] border border-border/70 bg-background-alt/70 px-3 py-2 text-sm text-muted">
          {savedReports.length} total scans
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {savedReports.map((savedReport) => (
          <WorkspaceScanHistoryCard
            key={savedReport.id}
            lead={leadById.get(savedReport.leadId)}
            savedReport={savedReport}
          />
        ))}
      </CardContent>
    </Card>
  );
}
