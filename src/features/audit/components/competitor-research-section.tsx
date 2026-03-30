"use client";

import { Medal, TrendingUp } from "lucide-react";

import { PreviewImage } from "@/components/common/preview-image";
import { ScoreMeter } from "@/components/common/score-meter";
import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBenchmarkReferenceScore, getTenOutOfTenNotes } from "@/lib/mock/report-enhancements";
import type { AuditCategoryKey, AuditReport, BenchmarkReference } from "@/lib/types/audit";

const strengthCopy: Record<AuditCategoryKey, string> = {
  "visual-design": "Sharper hierarchy, cleaner restraint, and a stronger premium first impression.",
  "ux-conversion": "Clearer sequencing, stronger calls to action, and less hesitation before the ask.",
  "mobile-experience": "Better pacing and CTA clarity on smaller screens.",
  "seo-readiness": "Stronger page structure, search intent coverage, and crawlable depth.",
  accessibility: "Clearer semantics, contrast, and lower-friction reading patterns.",
  "trust-credibility": "Better proof placement, reassurance, and legitimacy signals.",
  "security-posture": "More visible signs of operational maturity and lower-risk form experience.",
};

function ResearchPreview({
  alt,
  src,
  fallbackSrc,
}: {
  alt: string;
  src: string;
  fallbackSrc: string;
}) {
  return (
    <PreviewImage
      alt={alt}
      className="aspect-[16/10] border-b border-border/70"
      fallbackSrc={fallbackSrc}
      loadingLabel="Capturing desktop screenshot"
      src={src}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/40 via-transparent to-transparent" />
    </PreviewImage>
  );
}

function getLargestLift(
  currentSnapshot: AuditReport["competitorSnapshots"][number] | undefined,
  referenceSnapshot: AuditReport["competitorSnapshots"][number] | undefined,
) {
  if (!currentSnapshot || !referenceSnapshot) {
    return null;
  }

  return referenceSnapshot.metrics
    .map((metric) => {
      const currentMetric = currentSnapshot.metrics.find((item) => item.id === metric.id);

      return {
        label: metric.label,
        diff: currentMetric ? metric.value - currentMetric.value : metric.value,
        format: metric.format,
      };
    })
    .sort((left, right) => right.diff - left.diff)[0];
}

function CompetitorCard({
  reference,
  fallbackImage,
  currentSnapshot,
  referenceSnapshot,
}: {
  reference: BenchmarkReference;
  fallbackImage: string;
  currentSnapshot: AuditReport["competitorSnapshots"][number] | undefined;
  referenceSnapshot: AuditReport["competitorSnapshots"][number] | undefined;
}) {
  const lift = getLargestLift(currentSnapshot, referenceSnapshot);
  const referenceScore = referenceSnapshot?.overallScore ?? getBenchmarkReferenceScore(reference);
  const scoreLabel = reference.scoreSource === "measured" || referenceSnapshot ? "Scored" : "Reference";

  return (
    <Card className="overflow-hidden">
      <ResearchPreview
        alt={`${reference.name} preview`}
        fallbackSrc={fallbackImage}
        src={reference.previewImage}
      />
      <CardHeader className="space-y-3">
        <div className="space-y-2">
          <Badge className="whitespace-nowrap" variant="accent">
            {scoreLabel} {referenceScore.toFixed(1)}
          </Badge>
          <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            {reference.sourceLabel}
          </span>
        </div>
        <CardTitle className="font-display text-[2.05rem]">{reference.name}</CardTitle>
        <p className="text-base leading-7 text-muted">{reference.note}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="rounded-[calc(var(--theme-radius)-4px)] border border-border/70 bg-background-alt/70 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Best for</p>
            <p className="mt-2 text-lg leading-8 text-foreground">{reference.bestFor}</p>
          </div>
          <div className="rounded-[calc(var(--theme-radius)-4px)] border border-border/70 bg-background-alt/70 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Largest visible lift</p>
            <p className="mt-2 text-lg leading-8 text-foreground">
              {lift
                ? `${lift.label} +${lift.format === "score" ? lift.diff.toFixed(1) : Math.round(lift.diff)}${lift.format === "percent" ? " pts" : ""}`
                : "High-scoring benchmark"}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          {reference.whatWorks.map((item) => (
            <div
              className="rounded-[calc(var(--theme-radius)-6px)] border border-border/70 bg-panel/55 px-4 py-3 text-sm leading-6 text-foreground"
              key={item}
            >
              {item}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {reference.strengths.map((strength) => (
            <Badge className="normal-case tracking-normal" key={strength} variant="neutral">
              {strength.replace(/-/g, " ")}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function CompetitorResearchSection({ report }: { report: AuditReport }) {
  const notes = getTenOutOfTenNotes();
  const currentSnapshot = report.competitorSnapshots.find(
    (snapshot) => snapshot.relationship === "your-site",
  );
  const researchSet = report.benchmarkReferences.slice(0, 3);
  const lowestCategories = [...report.categoryScores]
    .sort((left, right) => left.score - right.score)
    .slice(0, 3);

  return (
    <section className="presentation-section" id="research">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Competitor research"
          title="Three stronger sites worth studying"
          description="These scored references show what a stronger buying experience looks like when the same model is applied consistently."
        />

        <div className="grid gap-5 xl:grid-cols-[20rem_minmax(0,1fr)]">
          <Card className="h-fit">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-2 text-accent">
                <Medal className="size-4" />
                Research summary
              </div>
              <CardTitle className="text-3xl">Where this site is leaving room on the table</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[calc(var(--theme-radius)-4px)] border border-border/70 bg-background-alt/70 p-4">
                <ScoreMeter compact label="Current score" score={report.overallScore} />
                <p className="mt-3 text-base leading-7 text-muted">
                  {currentSnapshot?.note ?? report.executiveSummary}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Biggest gaps to close</p>
                {lowestCategories.map((item) => (
                  <div
                    className="rounded-[calc(var(--theme-radius)-6px)] border border-border/70 bg-panel/55 px-4 py-3"
                    key={item.key}
                  >
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="mt-1 text-sm leading-6 text-muted">{strengthCopy[item.key]}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-[calc(var(--theme-radius)-4px)] border border-accent/20 bg-accent/8 p-4">
                <div className="mb-2 flex items-center gap-2 text-accent">
                  <TrendingUp className="size-4" />
                  High-score range
                </div>
                <div className="space-y-2 text-sm leading-6 text-foreground">
                  {notes.slice(1).map((note) => (
                    <p key={note}>{note}</p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="hidden gap-4 md:grid xl:grid-cols-3">
              {researchSet.map((reference) => (
                <CompetitorCard
                  currentSnapshot={currentSnapshot}
                  fallbackImage={report.previewSet.fallbackCurrent.desktop}
                  key={reference.id}
                  reference={reference}
                  referenceSnapshot={report.competitorSnapshots.find((item) => item.id === reference.id)}
                />
              ))}
            </div>

            <div className="space-y-3 md:hidden">
              <p className="text-sm leading-6 text-muted">
                Swipe across the tabs to move through the reference set.
              </p>
              <Tabs defaultValue={researchSet[0]?.id}>
                <TabsList className="w-full max-w-full overflow-x-auto">
                  {researchSet.map((reference) => (
                    <TabsTrigger className="shrink-0" key={reference.id} value={reference.id}>
                      {reference.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {researchSet.map((reference) => (
                  <TabsContent key={reference.id} value={reference.id}>
                    <CompetitorCard
                      currentSnapshot={currentSnapshot}
                      fallbackImage={report.previewSet.fallbackCurrent.desktop}
                      reference={reference}
                      referenceSnapshot={report.competitorSnapshots.find((item) => item.id === reference.id)}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
