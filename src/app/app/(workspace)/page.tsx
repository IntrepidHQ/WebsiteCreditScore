import Link from "next/link";
import { ArrowRight, BellDot, CircleCheckBig, FolderKanban, Send, ArrowUpRight } from "lucide-react";

import { createLeadAction, completeReminderAction } from "@/app/app/actions";
import { PreviewImage } from "@/components/common/preview-image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScoreMeter } from "@/components/common/score-meter";
import { LeadStageBadge } from "@/features/app/components/lead-stage-badge";
import { ScanHistorySection } from "@/features/app/components/scan-history-section";
import { getWorkspaceAppContext } from "@/lib/product/context";

export default async function AppDashboardPage() {
  const { repository, session, workspace } = await getWorkspaceAppContext();
  const dashboard = await repository.getDashboard(workspace.id, session);
  const wonCount = dashboard.leads.filter((lead) => lead.stage === "won").length;
  const openReminderCount = dashboard.reminders.filter((reminder) => reminder.status === "open").length;
  const packetReadyCount = dashboard.leads.filter(
    (lead) => lead.stage === "audit-ready" || lead.stage === "packet-sent",
  ).length;

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_24rem]">
        <Card id="new-lead">
          <CardHeader className="pb-2">
            <p className="text-xs uppercase tracking-[0.24em] text-accent">Create and save</p>
            <CardTitle className="text-4xl">Turn a live site into a saved lead</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="max-w-3xl text-sm leading-7 text-muted">
              Generate the audit, preserve the report snapshot, seed the packet and brief share links, and drop the opportunity straight into the pipeline.
            </p>
            <form action={createLeadAction} className="flex flex-col gap-3 sm:flex-row">
              <Input
                autoComplete="url"
                className="flex-1"
                name="url"
                placeholder="https://example.com"
                type="url"
              />
              <Button type="submit">
                Generate saved audit
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {[
            {
              icon: FolderKanban,
              label: "Saved leads",
              value: dashboard.leads.length,
              detail: "Audits now tied to real opportunities",
            },
            {
              icon: BellDot,
              label: "Follow-ups due",
              value: openReminderCount,
              detail: "Open reminders waiting on outreach",
            },
            {
              icon: CircleCheckBig,
              label: "Won or approved",
              value: wonCount,
              detail: "Discovery or delivery moving forward",
            },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="flex items-start gap-3 p-5">
                <div className="rounded-[8px] border border-accent/30 bg-accent/10 p-2 text-accent">
                  <item.icon className="size-4" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">{item.label}</p>
                  <p className="mt-2 font-display text-4xl font-semibold text-foreground">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm text-muted">{item.detail}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4 space-y-0 pb-2">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted">Pipeline</p>
              <CardTitle className="mt-2 text-3xl">Recent leads</CardTitle>
            </div>
            <div className="rounded-[10px] border border-border/70 bg-background-alt/70 px-3 py-2 text-sm text-muted">
              {packetReadyCount} ready to send
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            {dashboard.leads.slice(0, 5).map((lead) => (
              <div
                className="grid gap-4 rounded-[10px] border border-border/70 bg-background-alt/60 p-4 md:grid-cols-[8.5rem_minmax(0,1fr)_auto]"
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
                  <ScoreMeter
                    className="max-w-[12.5rem] md:ml-auto"
                    compact
                    label="Current score"
                    projectedScore={lead.projectedScore}
                    score={lead.currentScore}
                    valueClassName="text-[2rem] sm:text-[2.15rem]"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Reminders</p>
            <CardTitle className="mt-2 text-3xl">What needs follow-up</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {dashboard.reminders.slice(0, 4).map((reminder) => (
              <div
                className="rounded-[10px] border border-border/70 bg-background-alt/60 p-4"
                key={reminder.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{reminder.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{reminder.detail}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted">
                      Due {new Date(reminder.dueAt).toLocaleDateString()}
                    </p>
                  </div>
                  <form action={completeReminderAction}>
                    <input name="reminderId" type="hidden" value={reminder.id} />
                    <input name="returnTo" type="hidden" value="/app" />
                    <Button size="sm" type="submit" variant="ghost">
                      <Send className="size-4" />
                      Done
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <ScanHistorySection leads={dashboard.leads} savedReports={dashboard.savedReports} />
    </div>
  );
}
