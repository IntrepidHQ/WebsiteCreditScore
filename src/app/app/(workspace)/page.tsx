import Link from "next/link";
import { ArrowRight, BellDot, CircleCheckBig, FolderKanban, Send, ArrowUpRight } from "lucide-react";

import { createLeadAction, completeReminderAction } from "@/app/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LeadStageBadge } from "@/features/app/components/lead-stage-badge";
import { LeadOverviewCard } from "@/features/app/components/lead-overview-card";
import { ScanHistorySection } from "@/features/app/components/scan-history-section";
import { getWorkspaceAppContext } from "@/lib/product/context";

export default async function AppDashboardPage() {
  const { repository, session, workspace } = await getWorkspaceAppContext();
  const dashboard = await repository.getDashboard(workspace.id, session);
  const visibleLeads = dashboard.leads.filter((lead) => lead.title !== "Provider Pages");
  const visibleSavedReports = dashboard.savedReports.filter(
    (savedReport) => savedReport.title !== "Provider Pages",
  );
  const wonCount = visibleLeads.filter((lead) => lead.stage === "won").length;
  const openReminderCount = dashboard.reminders.filter((reminder) => reminder.status === "open").length;
  const packetReadyCount = visibleLeads.filter(
    (lead) => lead.stage === "audit-ready" || lead.stage === "packet-sent",
  ).length;

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_24rem]">
        <Card id="new-lead">
          <CardHeader className="pb-2">
            <p className="text-xs uppercase tracking-[0.24em] text-accent">Create and save</p>
            <CardTitle className="text-[clamp(4.2rem,3.4rem+1vw,5.8rem)] leading-[0.92]">
              Turn a live site into a saved lead
            </CardTitle>
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
                  value: visibleLeads.length,
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
              <CardContent className="flex items-start gap-3">
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
              <CardTitle className="mt-2 text-[clamp(3.4rem,2.8rem+1.1vw,4.8rem)] leading-[0.92]">
                Recent leads
              </CardTitle>
            </div>
            <div className="rounded-[10px] border border-border/70 bg-background-alt/70 px-3 py-2 text-sm text-muted">
              {packetReadyCount} ready to send
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
          {visibleLeads.slice(0, 5).map((lead) => (
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
              fallbackImage="/previews/fallback-desktop.svg"
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

        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Reminders</p>
            <CardTitle className="mt-2 text-[clamp(3.1rem,2.6rem+0.9vw,4.4rem)] leading-[0.92]">
              What needs follow-up
            </CardTitle>
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

      <ScanHistorySection leads={visibleLeads} savedReports={visibleSavedReports} />
    </div>
  );
}
