import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Website Audit Examples — Real Sites, Real Scores",
  description:
    "Browse scored website audits for real companies. Each example includes a weighted score breakdown, key findings, and redesign recommendations.",
  openGraph: {
    title: "Website Audit Examples",
    description:
      "Real website audits with scores, findings, and redesign direction. See how the audit reads in practice.",
  },
};
import { ArrowRight, Eye, FileText, Layers3 } from "lucide-react";

import { ScoreBreakdownBars } from "@/components/common/score-breakdown-bars";
import { buildBenchmarkTargetCategoryScores } from "@/lib/utils/score-visuals";
import { ScoreDial } from "@/components/common/score-dial";
import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LandingRecentReportsSection } from "@/features/landing/components/landing-recent-reports-section";
import { buildAuditReportById, getPublicScanHistoryCards } from "@/lib/mock/report-builder";

export default function ExamplesPage() {
  const samples = getPublicScanHistoryCards();
  const featuredAudit = samples.find((sample) => sample.id === "saunders-woodworks") ?? samples[0];
  const featuredReport = featuredAudit ? buildAuditReportById(featuredAudit.id) : null;

  if (!featuredAudit || !featuredReport) {
    return null;
  }

  return (
    <main className="presentation-section pt-10 sm:pt-14" id="main-content">
      <section className="pb-8">
        <div className="mx-auto w-full max-w-7xl space-y-6 px-4 sm:px-6 xl:px-8">
          <Badge variant="accent">Examples</Badge>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
            <div className="space-y-4">
              <h1 className="max-w-5xl font-display text-[clamp(4rem,3.1rem+2vw,6.2rem)] leading-[0.9] tracking-[-0.06em] text-foreground">
                Examples that show the score as proof, not decoration.
              </h1>
              <p className="max-w-3xl text-[1.08rem] leading-8 text-muted sm:text-[1.18rem] sm:leading-9">
                Each scan starts from a live site, carries a weighted score breakdown,
                and ends in a clearer redesign recommendation.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="sm" variant="secondary">
                <Link href="/benchmarks">
                  Read the benchmark method
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link href={`/audit/${featuredAudit.id}`}>
                  Open featured audit
                  <Eye className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <LandingRecentReportsSection
        description="Examples and scan history are the same thing here: every scan becomes a reference for how the audit reads."
        eyebrow="Scan history"
        samples={samples}
        title="Examples and scan history, in one place"
      />

      <section className="presentation-section py-8">
        <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 xl:px-8">
          <SectionHeading
            description="These examples are there to make the audit legible. You should understand what the overall score means, which categories are dragging it down, and why the recommendation follows naturally."
            eyebrow="How to read one"
            title="Read the example like an owner, not a browser"
          />

          <div className="grid gap-5 xl:grid-cols-3">
            <Card className="rounded-[24px] border-border/60 bg-panel/40 shadow-none">
              <CardHeader className="space-y-4">
                <div className="flex items-center gap-2 text-accent">
                  <Eye className="size-4" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em]">
                    Overall score
                  </span>
                </div>
                <CardTitle className="text-[clamp(2.2rem,1.9rem+0.4vw,2.9rem)]">
                  Start with the first impression summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <ScoreDial label={featuredAudit.title} score={featuredReport.overallScore} />
                <p className="text-sm leading-6 text-muted">
                  The top-line score is there to frame what the site is costing, not replace the underlying evidence.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-border/60 bg-panel/40 shadow-none xl:col-span-2">
              <CardHeader className="space-y-4">
                <div className="flex items-center gap-2 text-accent">
                  <Layers3 className="size-4" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em]">
                    Weighted categories
                  </span>
                </div>
                <CardTitle className="text-[clamp(2.2rem,1.9rem+0.4vw,2.9rem)]">
                  Then read the gap between current performance and benchmark-ready work
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <ScoreBreakdownBars
                  items={featuredReport.categoryScores}
                  showWeights
                  targetItems={buildBenchmarkTargetCategoryScores(featuredReport.categoryScores)}
                />
                <p className="text-sm leading-6 text-muted">
                  This is where the problem becomes specific: which categories are underweight, which ones are already credible, and which upgrades will move the score fastest.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <Card className="rounded-[24px] border-border/60 bg-panel/40 shadow-none">
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-2 text-accent">
                  <FileText className="size-4" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em]">
                    Evidence beats opinion
                  </span>
                </div>
                <CardTitle className="text-[clamp(2.4rem,2rem+0.6vw,3rem)]">
                  What the example proves
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {featuredAudit.highlights?.map((item) => (
                  <div
                    className="rounded-[18px] border border-border/50 bg-background/30 px-4 py-3 text-sm leading-6 text-foreground"
                    key={item}
                  >
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="rounded-[24px] border border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_84%,transparent),color-mix(in_srgb,var(--theme-background-alt)_96%,transparent))] px-5 py-6 sm:px-6">
              <Badge variant="accent">Next step</Badge>
              <h2 className="mt-4 font-display text-[clamp(2.8rem,2.3rem+0.6vw,3.5rem)] leading-[0.95] tracking-[-0.05em] text-foreground">
                Open the audit, then review the brief that follows from it.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                The examples page is proof. The full audit and brief show how the same reasoning
                turns into a clearer action plan and a better decision about what to fix first.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href={`/audit/${featuredAudit.id}`}>
                    Open featured audit
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/brief/mark-deford-md">
                    Open brief
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
