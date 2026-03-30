import Link from "next/link";
import { ArrowRight, ClipboardList, FileText, ScanSearch } from "lucide-react";

import { ScoreBreakdownBars } from "@/components/common/score-breakdown-bars";
import { ScoreDial } from "@/components/common/score-dial";
import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SampleAuditCard } from "@/features/landing/components/sample-audit-card";
import { getBenchmarkRubricForProfile } from "@/lib/benchmarks/library";
import { buildAuditReportById, getSampleAuditCards } from "@/lib/mock/report-builder";
import { buildBenchmarkTargetCategoryScores } from "@/lib/utils/score-visuals";

const workflowCards = [
  {
    step: "01",
    title: "Score the live site",
    detail:
      "Start with a weighted audit that makes the gaps concrete enough to discuss in money, trust, and conversion terms.",
    icon: ScanSearch,
  },
  {
    step: "02",
    title: "Package the redesign case",
    detail:
      "Turn the score and findings into a sendable packet and intro narrative that already feels considered.",
    icon: FileText,
  },
  {
    step: "03",
    title: "Tighten scope before build",
    detail:
      "Carry the same logic into the brief so discovery starts with sharper priorities and less drift.",
    icon: ClipboardList,
  },
] as const;

export default function PlatformPage() {
  const samples = getSampleAuditCards();
  const featuredAudit = samples.find((sample) => sample.id === "saunders-woodworks") ?? samples[0];
  const featuredReport = featuredAudit ? buildAuditReportById(featuredAudit.id) : null;
  const rubric = getBenchmarkRubricForProfile("local-service");

  if (!featuredAudit || !featuredReport) {
    return null;
  }

  return (
    <main className="presentation-section pt-10 sm:pt-14" id="main-content">
      <section className="pb-8">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.82fr)] xl:px-8">
          <div className="space-y-6">
            <Badge variant="accent">Platform</Badge>
            <div className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">
                Audit to packet to brief
              </p>
              <h1 className="max-w-5xl font-display text-[clamp(4.1rem,3.2rem+2vw,6.5rem)] leading-[0.9] tracking-[-0.06em] text-foreground">
                One workflow for turning a weak site into a clearer redesign proposal.
              </h1>
              <p className="max-w-3xl text-[1.08rem] leading-8 text-muted sm:text-[1.18rem] sm:leading-9">
                The platform exists to keep the same reasoning intact from the first score
                to the client packet to the scoped brief.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={`/audit/${featuredAudit.id}`}>
                  Open featured audit
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/benchmarks">
                  Review benchmark method
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-4 rounded-[28px] border border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_88%,transparent),color-mix(in_srgb,var(--theme-background-alt)_96%,transparent))] p-6 sm:p-7">
            <ScoreDial label="Featured current score" score={featuredReport.overallScore} />
            <div className="rounded-[22px] border border-accent/20 bg-accent/8 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                What raises the score fastest
              </p>
              <div className="mt-3 space-y-2">
                {rubric.fastLifts.map((item) => (
                  <p className="text-sm leading-6 text-foreground" key={item}>
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="presentation-section py-8">
        <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 xl:px-8">
          <SectionHeading
            description="The point is not to generate more deliverables. It is to preserve one clear argument all the way from critique to scope."
            eyebrow="Workflow"
            title="Keep the logic intact from score to proposal"
          />

          <div className="grid gap-5 xl:grid-cols-3">
            {workflowCards.map((card) => (
              <Card className="rounded-[24px] border-border/60 bg-panel/40 shadow-none" key={card.step}>
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex size-12 items-center justify-center rounded-[14px] border border-accent/20 bg-accent/10 text-accent">
                      <card.icon className="size-5" />
                    </div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                      {card.step}
                    </p>
                  </div>
                  <CardTitle className="text-[clamp(2.3rem,1.95rem+0.5vw,3rem)]">
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm leading-7 text-muted">{card.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="presentation-section py-8">
        <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 sm:px-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:px-8">
          <SampleAuditCard audit={featuredAudit} />

          <div className="space-y-5 rounded-[28px] border border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_88%,transparent),color-mix(in_srgb,var(--theme-background-alt)_96%,transparent))] p-6 sm:p-7">
            <div className="space-y-3">
              <Badge variant="accent">Score to proposal module</Badge>
              <h2 className="font-display text-[clamp(3rem,2.4rem+1vw,4.3rem)] leading-[0.92] tracking-[-0.05em] text-foreground">
                The score only matters if it changes the conversation
              </h2>
              <p className="text-base leading-7 text-muted">
                {featuredReport.executiveSummary}
              </p>
            </div>

            <ScoreBreakdownBars
              items={featuredReport.categoryScores}
              showWeights
              targetItems={buildBenchmarkTargetCategoryScores(featuredReport.categoryScores)}
            />

            <div className="grid gap-3">
              {featuredAudit.highlights?.map((item) => (
                <div
                  className="rounded-[18px] border border-border/50 bg-background/30 px-4 py-3 text-sm leading-6 text-foreground"
                  key={item}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="presentation-section py-8">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 xl:px-8">
          <div className="rounded-[28px] border border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_84%,transparent),color-mix(in_srgb,var(--theme-background-alt)_96%,transparent))] px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <Badge variant="accent">Next step</Badge>
                <h2 className="font-display text-[clamp(2.8rem,2.2rem+0.7vw,3.7rem)] leading-[0.95] tracking-[-0.05em] text-foreground">
                  Open the sample audit, then walk the packet and brief in sequence.
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href={`/audit/${featuredAudit.id}`}>
                    Open featured audit
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/brief/mark-deford-md">
                    Review brief workflow
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
