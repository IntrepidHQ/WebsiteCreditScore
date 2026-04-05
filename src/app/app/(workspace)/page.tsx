import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BellDot,
  ClipboardList,
  Coins,
  FolderKanban,
  Globe2,
  MailPlus,
  ScanSearch,
  Sparkles,
} from "lucide-react";

import { completeReminderAction } from "@/app/app/actions";
import { getTokenActionCost } from "@/lib/billing/catalog";
import { ScoreBreakdownBars } from "@/components/common/score-breakdown-bars";
import { ScoreDial } from "@/components/common/score-dial";
import { PreviewImage } from "@/components/common/preview-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LeadStageBadge } from "@/features/app/components/lead-stage-badge";
import { ScanHistorySection } from "@/features/app/components/scan-history-section";
import { WorkspaceTokenLinkButton } from "@/features/app/components/workspace-token-link-button";
import { getWorkspaceDashboardContext } from "@/lib/product/context";
import type { LeadRecord, SavedReport } from "@/lib/types/product";

function formatTimestamp(input: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(input));
}

function buildMailtoHref(subject: string, body: string) {
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function SearchRow({
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

  const auditHref = `/audit/${report.id}?url=${encodeURIComponent(report.normalizedUrl)}`;
  const leadHref = `/app/leads/${savedReport.leadId}`;
  const domain = savedReport.normalizedUrl.replace(/^https?:\/\//, "");

  return (
    <div className="rounded-[18px] border border-border/60 bg-background-alt/60 p-3 sm:p-4">
      <div className="grid gap-4 md:grid-cols-[8.5rem_minmax(0,1fr)_auto] md:items-center">
        <Link className="block overflow-hidden rounded-[14px]" href={auditHref}>
          <PreviewImage
            alt={`${savedReport.title} preview`}
            className="aspect-[16/11]"
            fallbackLabel="Preview unavailable"
            fallbackSrc={fallbackShot}
            loadingLabel="Capturing desktop screenshot"
            src={desktopShot}
          />
        </Link>

        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {lead ? <LeadStageBadge stage={lead.stage} /> : null}
            <span className="rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
              {Number(report.overallScore ?? 0).toFixed(1)}
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-[clamp(2rem,1.7rem+0.45vw,2.6rem)] leading-[0.92] tracking-[-0.04em] text-foreground">
              <Link className="transition hover:text-accent" href={auditHref}>
                {savedReport.title}
              </Link>
            </h3>
            <p className="line-clamp-2 text-sm leading-6 text-muted">
              {report.executiveSummary ?? ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            <span className="inline-flex items-center gap-2">
              <Globe2 className="size-3.5" />
              {domain}
            </span>
            <span>Scored {formatTimestamp(savedReport.createdAt)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <Button asChild size="sm" variant="secondary">
            <Link href={leadHref}>
              Lead
              <ClipboardList className="size-4" />
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={auditHref}>
              Audit
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default async function AppDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const error =
    typeof resolvedSearchParams.error === "string" ? resolvedSearchParams.error : null;
  const { dashboard } = await getWorkspaceDashboardContext();
  const workspaceState = dashboard.workspace;
  const welcomeFreeScanAvailable = workspaceState.onboardingWelcomeScanUsed === false;
  const scanTokenCost = getTokenActionCost("scan-site");
  const visibleLeads = dashboard.leads.filter((lead) => lead.title !== "Provider Pages");
  const visibleSavedReports = dashboard.savedReports.filter(
    (savedReport) =>
      savedReport.title !== "Provider Pages" && Boolean(savedReport.reportSnapshot),
  );
  const latestSavedReport = visibleSavedReports[0];
  const latestLead = latestSavedReport
    ? visibleLeads.find((lead) => lead.id === latestSavedReport.leadId)
    : undefined;
  const latestReport = latestSavedReport?.reportSnapshot;
  const lowScoreCount = visibleSavedReports.filter(
    (savedReport) => (savedReport.reportSnapshot?.overallScore ?? 0) < 6.5,
  ).length;
  const openReminderCount = dashboard.reminders.filter((reminder) => reminder.status === "open").length;
  const averageScore = visibleSavedReports.length
    ? Number(
        (
          visibleSavedReports.reduce(
            (sum, savedReport) => sum + (savedReport.reportSnapshot?.overallScore ?? 0),
            0,
          ) / visibleSavedReports.length
        ).toFixed(1),
      )
    : 0;
  const latestAuditHref = latestReport
    ? `/audit/${latestReport.id}?url=${encodeURIComponent(latestReport.normalizedUrl)}`
    : undefined;
  const latestPacketHref = latestReport
    ? `/packet/${latestReport.id}?url=${encodeURIComponent(latestReport.normalizedUrl)}`
    : undefined;
  const latestPacketPdfHref = latestReport
    ? `${latestPacketHref}&print=1`
    : undefined;
  const latestOutreach = latestReport?.outreachEmail;
  const emailHref =
    latestReport && latestOutreach
      ? buildMailtoHref(latestOutreach.subject ?? "Site review", latestOutreach.body ?? "")
      : undefined;
  const emailPreview = latestOutreach?.body
    ? latestOutreach.body
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 3)
    : [];

  return (
    <div className="grid gap-6">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.02fr)_minmax(23rem,0.98fr)]">
        <Card id="new-lead">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-accent">
              <ScanSearch className="size-4" />
              <p className="text-xs uppercase tracking-[0.24em] text-accent">
                {welcomeFreeScanAvailable ? "Start here" : "Run a new search"}
              </p>
            </div>
            <CardTitle className="text-[clamp(4rem,3.15rem+1.1vw,5.5rem)] leading-[0.92]">
              {welcomeFreeScanAvailable
                ? "Paste a URL — your first live scan is free."
                : "Turn any live site into a score reveal worth sending."}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {welcomeFreeScanAvailable ? (
              <div className="rounded-[18px] border border-accent/35 bg-accent/10 px-4 py-3 text-sm leading-6 text-foreground">
                <p className="font-semibold text-foreground">Welcome — this scan does not use a token.</p>
                <p className="mt-1 text-muted">
                  Your workspace is ready. After this, each new live scan uses {scanTokenCost} token
                  {scanTokenCost === 1 ? "" : "s"} from your balance (you still have {workspaceState.tokenBalance}{" "}
                  to explore with).
                </p>
              </div>
            ) : null}
            <p className="max-w-3xl text-sm leading-7 text-muted">
              {welcomeFreeScanAvailable
                ? "We will run the live score, save the full audit to your workspace, and open the lead so you can share the packet and brief."
                : `Save the audit, capture the opportunity, and move straight into the outreach packet and brief. Each new live scan uses ${scanTokenCost} token${scanTokenCost === 1 ? "" : "s"}, so the dashboard keeps the score reveal and the remaining balance in the same place.`}
            </p>
            <form
              action="/api/app/create-lead"
              className="flex flex-col gap-3 sm:flex-row"
              method="post"
            >
              <Input
                autoComplete="url"
                autoFocus={welcomeFreeScanAvailable}
                className="flex-1"
                name="url"
                placeholder="https://example.com"
                type="url"
              />
              <Button type="submit">
                {welcomeFreeScanAvailable ? "Run free first scan" : "Generate saved audit"}
                <ArrowRight className="size-4" />
              </Button>
            </form>
            {error === "insufficient-tokens" ? (
              <div className="rounded-[18px] border border-danger/25 bg-danger/10 px-4 py-3 text-sm leading-6 text-foreground">
                This workspace is out of tokens. Add more on pricing before running another live scan.
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="secondary">
                <Link href="/pricing">
                  Manage pricing
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-3 lg:grid-cols-4">
              {[
                {
                  icon: FolderKanban,
                  label: "Saved searches",
                  value: visibleSavedReports.length,
                  detail: "Every scored site in this workspace.",
                },
                {
                  icon: Sparkles,
                  label: "Big opportunities",
                  value: lowScoreCount,
                  detail: "Searches still under 6.5 overall.",
                },
                {
                  icon: Coins,
                  label: "Tokens available",
                  value: workspaceState.tokenBalance,
                  detail: "Enough balance for the next live scan or export.",
                },
                {
                  icon: BellDot,
                  label: "Follow-ups due",
                  value: openReminderCount,
                  detail: "Reminders waiting on you.",
                },
              ].map((item) => (
                <div
                  className="rounded-[18px] border border-border/60 bg-background-alt/60 p-4"
                  key={item.label}
                >
                  <div className="flex items-center gap-2 text-accent">
                    <item.icon className="size-4" />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                      {item.label}
                    </p>
                  </div>
                  <p className="mt-3 font-display text-[2.8rem] leading-[0.9] tracking-[-0.05em] text-foreground">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted">{item.detail}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 text-accent">
              <Sparkles className="size-4" />
              <p className="text-xs uppercase tracking-[0.24em] text-muted">Latest score reveal</p>
            </div>
            <CardTitle className="mt-2 text-[clamp(3rem,2.45rem+0.8vw,4rem)] leading-[0.92]">
              {latestSavedReport ? latestSavedReport.title : "No saved searches yet"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-0">
            {latestReport ? (
              <>
                <div className="grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)]">
                  <ScoreDial
                    className="h-full"
                    label="Site score"
                    projectedScore={latestLead?.projectedScore}
                    score={latestReport.overallScore ?? 0}
                  />
                  <div className="space-y-3 rounded-[22px] border border-border/60 bg-background-alt/60 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {latestLead ? <LeadStageBadge stage={latestLead.stage} /> : null}
                      <span className="rounded-full border border-border/60 bg-panel/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                        Average {averageScore.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-base leading-7 text-foreground">
                      {latestReport.executiveSummary ?? ""}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {latestAuditHref ? (
                        <Button asChild size="sm" variant="secondary">
                          <Link href={latestAuditHref}>
                            Open audit
                            <ArrowUpRight className="size-4" />
                          </Link>
                        </Button>
                      ) : null}
                      {latestPacketHref ? (
                        <Button asChild size="sm" variant="outline">
                          <Link href={latestPacketHref}>
                            Open packet
                            <ArrowUpRight className="size-4" />
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
                <ScoreBreakdownBars items={latestReport.categoryScores ?? []} showWeights />
              </>
            ) : (
              <div className="rounded-[20px] border border-border/60 bg-background-alt/60 p-5 text-sm leading-7 text-muted">
                Run the first search and the latest score reveal will show up here with the score, breakdown, and next-step links.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-accent">
              <FolderKanban className="size-4" />
              <p className="text-xs uppercase tracking-[0.24em] text-muted">Recent searches</p>
            </div>
            <CardTitle className="mt-2 text-[clamp(3.2rem,2.55rem+0.95vw,4.3rem)] leading-[0.92]">
              Your latest scored sites
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {visibleSavedReports.slice(0, 4).map((savedReport) => (
              <SearchRow
                key={savedReport.id}
                lead={visibleLeads.find((lead) => lead.id === savedReport.leadId)}
                savedReport={savedReport}
              />
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-accent">
                <MailPlus className="size-4" />
                <p className="text-xs uppercase tracking-[0.24em] text-muted">Outreach draft</p>
              </div>
              <CardTitle className="mt-2 text-[clamp(3rem,2.45rem+0.8vw,4rem)] leading-[0.92]">
                Lead with the score, then frame the upside
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {latestReport ? (
                <>
                  <div className="rounded-[18px] border border-border/60 bg-background-alt/60 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                      Subject
                    </p>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      {latestOutreach?.subject ?? "—"}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      {latestOutreach?.previewLine ?? "—"}
                    </p>
                  </div>

                  <div className="rounded-[18px] border border-border/60 bg-panel/55 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                      Opening lines
                    </p>
                    <div className="mt-3 space-y-2">
                      {emailPreview.map((line) => (
                        <p className="text-sm leading-6 text-foreground" key={line}>
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {emailHref ? (
                      <WorkspaceTokenLinkButton
                        actionId="outreach-draft"
                        actionKey={`lead:${latestSavedReport?.leadId ?? latestReport.id}:outreach`}
                        href={emailHref}
                        iconName="mail-plus"
                        label="Outreach draft"
                      >
                        Draft email
                      </WorkspaceTokenLinkButton>
                    ) : null}
                    {latestPacketHref ? (
                      <Button asChild variant="secondary">
                        <Link href={latestPacketHref}>
                          Open packet
                          <ArrowUpRight className="size-4" />
                        </Link>
                      </Button>
                    ) : null}
                    {latestPacketPdfHref ? (
                      <WorkspaceTokenLinkButton
                        actionId="packet-export"
                        actionKey={`lead:${latestSavedReport?.leadId ?? latestReport.id}:packet`}
                        href={latestPacketPdfHref}
                        iconName="arrow-up-right"
                        label="Packet PDF export"
                        newTab
                        variant="outline"
                      >
                        Export PDF
                      </WorkspaceTokenLinkButton>
                    ) : null}
                    {latestAuditHref ? (
                      <Button asChild variant="outline">
                        <Link href={latestAuditHref}>
                          Review audit
                          <ArrowUpRight className="size-4" />
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </>
              ) : (
                <p className="text-sm leading-7 text-muted">
                  Save a search first and the outreach draft will be generated here automatically.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-accent">
                <BellDot className="size-4" />
                <p className="text-xs uppercase tracking-[0.24em] text-muted">Reminders</p>
              </div>
              <CardTitle className="mt-2 text-[clamp(2.8rem,2.3rem+0.7vw,3.7rem)] leading-[0.92]">
                What still needs a nudge
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 pt-0">
              {dashboard.reminders.slice(0, 4).map((reminder) => (
                <div
                  className="rounded-[18px] border border-border/60 bg-background-alt/60 p-4"
                  key={reminder.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{reminder.title}</p>
                      <p className="mt-2 text-sm leading-6 text-muted">{reminder.detail}</p>
                      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                        Due {new Date(reminder.dueAt).toLocaleDateString()}
                      </p>
                    </div>
                    <form action={completeReminderAction}>
                      <input name="reminderId" type="hidden" value={reminder.id} />
                      <input name="returnTo" type="hidden" value="/app" />
                      <Button size="sm" type="submit" variant="ghost">
                        Done
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <ScanHistorySection leads={visibleLeads} savedReports={visibleSavedReports} />
    </div>
  );
}
