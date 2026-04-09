import Link from "next/link";
import { ArrowRight, ClipboardList, FileText, ScanSearch } from "lucide-react";

import { ScoreBreakdownBars } from "@/components/common/score-breakdown-bars";
import { ScoreDial } from "@/components/common/score-dial";
import { ScoreRadar } from "@/components/common/score-radar";
import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuditCategoryScore, DesignPatternNote } from "@/lib/types/audit";

const workflowSteps = [
  {
    label: "Audit",
    detail: "Score the live site and name the exact gaps in hierarchy, trust, pacing, and mobile clarity.",
    icon: ScanSearch,
  },
  {
    label: "Packet",
    detail: "Turn the score into a clear explanation of what the site is costing you and why the redesign is worth doing.",
    icon: FileText,
  },
  {
    label: "Brief",
    detail: "Turn that reasoning into a cleaner plan so the rebuild starts with the right priorities instead of guesswork.",
    icon: ClipboardList,
  },
] as const;

export function LandingWorkflowSection({
  currentBreakdown,
  targetBreakdown,
  notes,
}: {
  currentBreakdown: AuditCategoryScore[];
  targetBreakdown: AuditCategoryScore[];
  notes: DesignPatternNote[];
}) {
  return (
    <section className="presentation-section py-8" id="workflow">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <SectionHeading
          description="Use the review to see where your site is losing trust, where good leads are stalling, and what to fix first if you want the next version to perform better."
          eyebrow="How it works"
          title="Find the weak spots, frame the opportunity, and move into scope faster"
        />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)]">
          <div className="space-y-5">
            <div className="rounded-[28px] border border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_88%,transparent),color-mix(in_srgb,var(--theme-background-alt)_96%,transparent))] p-6 sm:p-7">
              <ScoreRadar centerLabel="Current site" items={currentBreakdown} />
            </div>

            <div className="space-y-5 rounded-[28px] border border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_88%,transparent),color-mix(in_srgb,var(--theme-background-alt)_96%,transparent))] p-6 sm:p-7">
              <ScoreDial bandLabel="Benchmark-ready" label="Target range" score={8.9} />
              <div className="grid gap-3">
                {workflowSteps.map((item, index) => (
                  <div
                    className="rounded-[22px] border border-border/60 bg-background/30 px-5 py-4"
                    key={item.label}
                  >
                    <div className="flex items-center gap-3">
                      <div className="inline-flex size-11 items-center justify-center rounded-[14px] border border-accent/20 bg-accent/10 text-accent">
                        <item.icon className="size-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                          0{index + 1}
                        </p>
                        <p className="text-base font-semibold text-foreground">{item.label}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted">{item.detail}</p>
                  </div>
                ))}
              </div>
              <Button asChild variant="secondary">
                <Link href="/benchmarks">
                  See the benchmark method
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-5 rounded-[28px] border border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_88%,transparent),color-mix(in_srgb,var(--theme-background-alt)_96%,transparent))] p-6 sm:p-7">
            <div className="space-y-3">
              <Badge variant="accent">Weighted categories</Badge>
              <h3 className="font-display text-[clamp(3rem,2.4rem+1vw,4.3rem)] leading-[0.92] tracking-[-0.05em] text-foreground">
                The score rewards clarity, trust, and momentum, not just polish
              </h3>
              <p className="text-base leading-7 text-muted">
                A better-looking redesign is not the point. The point is to see where your
                current site is hiding value, weakening trust, or making ready buyers hesitate.
              </p>
            </div>

            <ScoreBreakdownBars
              items={currentBreakdown}
              showWeights
              targetItems={targetBreakdown}
            />

            <div className="grid gap-4 md:grid-cols-3">
              {notes.map((note) => (
                <Card className="h-full rounded-[22px] border-border/60 bg-panel/35 shadow-none" key={note.id}>
                  <CardHeader className="space-y-2 pb-2">
                    <Badge variant="neutral">{note.category}</Badge>
                    <CardTitle className="text-[clamp(1.95rem,1.72rem+0.35vw,2.35rem)] leading-[0.98] tracking-[-0.04em]">
                      {note.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <p className="text-sm leading-6 text-muted">{note.takeaways[0]}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
