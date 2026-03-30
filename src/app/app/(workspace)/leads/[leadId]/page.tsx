import Link from "next/link";
import { notFound } from "next/navigation";
import { History, LayoutPanelLeft, Sparkles } from "lucide-react";

import { completeReminderAction, updateLeadStageAction } from "@/app/app/actions";
import { AuditReportSections } from "@/features/audit/components/audit-report-sections";
import { ScoreMeter } from "@/components/common/score-meter";
import { Button } from "@/components/ui/button";
import { DeleteLeadButton } from "@/features/app/components/delete-lead-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadStageBadge } from "@/features/app/components/lead-stage-badge";
import { ShareLinksPanel } from "@/features/app/components/share-links-panel";
import { getWorkspaceAppContext } from "@/lib/product/context";
import { applyProposalOffer, isProposalOfferActive } from "@/lib/utils/proposal-offers";
import { calculatePricingSummary, getDefaultSelectedIds } from "@/lib/utils/pricing";

const stageOptions = [
  "new",
  "audit-ready",
  "packet-sent",
  "follow-up-due",
  "discovery-booked",
  "brief-approved",
  "won",
  "lost",
] as const;

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;
  const { repository, session, workspace } = await getWorkspaceAppContext();
  const detail = await repository.getLeadDetail(workspace.id, leadId, session);

  if (!detail) {
    notFound();
  }

  const report = detail.savedReport.reportSnapshot;
  const pricingSummary = calculatePricingSummary(
    report.pricingBundle,
    getDefaultSelectedIds(report.pricingBundle),
  );
  const offerSummary = applyProposalOffer(pricingSummary.total, report.proposalOffer);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-accent">Lead record</p>
                  <CardTitle className="mt-2 text-[clamp(4rem,3.2rem+1vw,5.4rem)] leading-[0.92]">
                    {detail.lead.title}
                  </CardTitle>
                </div>
                <LeadStageBadge stage={detail.lead.stage} />
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-[minmax(0,1fr)_16rem]">
              <div className="space-y-3">
                <ScoreMeter
                  className="max-w-[18rem]"
                  label="Current score"
                  projectedScore={detail.lead.projectedScore}
                  score={detail.lead.currentScore}
                  valueClassName="text-[2rem] sm:text-[2.15rem]"
                />
                <p className="text-[1.08rem] leading-[1.95rem] text-muted">{detail.lead.summary}</p>
                <div className="grid gap-2 text-sm text-muted">
                  <p>Projected score: {detail.lead.projectedScore}</p>
                  <p>{detail.lead.normalizedUrl}</p>
                </div>
              </div>
              <form action={updateLeadStageAction} className="space-y-3">
                <input name="leadId" type="hidden" value={detail.lead.id} />
                <input name="returnTo" type="hidden" value={`/app/leads/${detail.lead.id}`} />
                <label className="grid gap-2 text-sm font-semibold text-foreground">
                  Stage
                  <select
                    className="h-11 rounded-[8px] border border-border/70 bg-panel/80 px-3 text-sm text-foreground"
                    defaultValue={detail.lead.stage}
                    name="stage"
                  >
                    {stageOptions.map((option) => (
                      <option key={option} value={option}>
                        {option.replace(/-/g, " ")}
                      </option>
                    ))}
                  </select>
                </label>
                <Button className="w-full" type="submit" variant="secondary">
                  Update stage
                </Button>
                <div className="flex justify-end">
                  <DeleteLeadButton
                    label={`Delete ${detail.lead.title}`}
                    leadId={detail.lead.id}
                    returnTo="/app"
                  />
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-accent">
                <Sparkles className="size-4" />
                Proposal offer
              </div>
              <CardTitle className="text-[clamp(3rem,2.4rem+0.95vw,4.4rem)] leading-[0.92]">
                {report.proposalOffer?.label ?? "No active offer"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {report.proposalOffer ? (
                <>
                  <p className="text-sm leading-7 text-muted">{report.proposalOffer.reason}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[10px] border border-border/70 bg-background-alt/60 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">Original scope</p>
                      <p className="mt-2 font-display text-[clamp(3rem,2.4rem+0.95vw,4.4rem)] font-semibold text-foreground">
                        ${offerSummary.originalTotal.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-[10px] border border-accent/30 bg-accent/10 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">Current offer</p>
                      <p className="mt-2 font-display text-[clamp(3rem,2.4rem+0.95vw,4.4rem)] font-semibold text-accent">
                        ${offerSummary.finalTotal.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">
                    {isProposalOfferActive(report.proposalOffer) ? "Active" : "Expired"} · expires{" "}
                    {new Date(report.proposalOffer.expiresAt).toLocaleDateString()}
                  </p>
                </>
              ) : null}
            </CardContent>
          </Card>

          <ShareLinksPanel
            baseUrl={baseUrl}
            leadId={detail.lead.id}
            shareLinks={detail.shareLinks}
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-accent">
                <LayoutPanelLeft className="size-4" />
                Workflow
              </div>
              <CardTitle className="text-[clamp(3rem,2.4rem+0.95vw,4.4rem)] leading-[0.92]">
                Reminders and activity
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <div className="space-y-3">
                {detail.reminders.map((reminder) => (
                  <div
                    className="rounded-[10px] border border-border/70 bg-background-alt/60 p-4"
                    key={reminder.id}
                  >
                    <p className="font-semibold text-foreground">{reminder.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{reminder.detail}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-xs uppercase tracking-[0.18em] text-muted">
                        {reminder.status}
                      </span>
                      {reminder.status === "open" ? (
                        <form action={completeReminderAction}>
                          <input name="reminderId" type="hidden" value={reminder.id} />
                          <input
                            name="returnTo"
                            type="hidden"
                            value={`/app/leads/${detail.lead.id}`}
                          />
                          <Button size="sm" type="submit" variant="ghost">
                            Mark done
                          </Button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {detail.activities.map((activity) => (
                  <div
                    className="rounded-[10px] border border-border/70 bg-background-alt/60 p-4"
                    key={activity.id}
                  >
                    <div className="flex items-start gap-3">
                      <History className="mt-0.5 size-4 text-accent" />
                      <div>
                        <p className="font-semibold text-foreground">{activity.title}</p>
                        <p className="mt-2 text-sm leading-6 text-muted">{activity.detail}</p>
                        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted">
                          {new Date(activity.occurredAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="overflow-hidden rounded-[12px] border border-border/70 bg-panel/70">
        <AuditReportSections report={report} />
      </section>

      <div className="flex justify-end">
        <Button asChild variant="secondary">
          <Link href={`/packet/${detail.lead.id}?share=${detail.shareLinks.find((entry) => entry.surface === "packet")?.token ?? ""}`}>
            Open packet share
          </Link>
        </Button>
      </div>
    </div>
  );
}
