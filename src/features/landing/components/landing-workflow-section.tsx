import Link from "next/link";
import { ArrowRight, ClipboardList, FileText, ScanSearch } from "lucide-react";

import { ScoreBreakdownBars } from "@/components/common/score-breakdown-bars";
import { ScoreDial } from "@/components/common/score-dial";
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
    detail: "Turn the score into a narrative the prospect can read as a premium redesign case, not a generic teardown.",
    icon: FileText,
  },
  {
    label: "Brief",
    detail: "Carry the same reasoning into scope so discovery and production start with cleaner priorities.",
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
          description="The score is useful because it turns premium design judgment into something repeatable enough to explain, defend, and scope against."
          eyebrow="How the score works"
          title="A design review system with evidence, weights, and reusable principles"
        />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
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
                Open the public benchmark method
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="space-y-5 rounded-[28px] border border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_88%,transparent),color-mix(in_srgb,var(--theme-background-alt)_96%,transparent))] p-6 sm:p-7">
            <div className="space-y-3">
              <Badge variant="accent">Weighted categories</Badge>
              <h3 className="font-display text-[clamp(3rem,2.4rem+1vw,4.3rem)] leading-[0.92] tracking-[-0.05em] text-foreground">
                The score favors conversion clarity and trust over decorative polish
              </h3>
              <p className="text-base leading-7 text-muted">
                This is the part generic audit tools miss: a page can look cleaner and still
                fail the pitch if the proof, reassurance, and next step do not land in the
                right order.
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
                  <CardHeader className="space-y-3">
                    <Badge variant="neutral">{note.category}</Badge>
                    <CardTitle className="text-[clamp(2.1rem,1.8rem+0.4vw,2.7rem)]">
                      {note.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
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
