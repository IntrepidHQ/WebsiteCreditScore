"use client";
import { Medal, TrendingUp } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PreviewImage } from "@/components/common/preview-image";
import { scoreCategoryIcons, scoreCategoryPalette } from "@/components/common/score-category-meta";
import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuditHorizontalRail } from "@/features/audit/components/audit-horizontal-rail";
import { REPORT_COMPETITOR_REFERENCE_LIMIT } from "@/lib/benchmarks/report-limits";
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

function ScoreRing({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  const radius = 22;
  const size = 58;
  const strokeWidth = 4.5;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.max(0, Math.min(score, 10)) / 10);

  return (
    <div className="rounded-[14px] border border-border/60 bg-panel/45 px-2 py-2 text-center">
      <div className="relative mx-auto grid size-[3.625rem] place-items-center">
        <svg
          aria-hidden="true"
          className="block"
          fill="none"
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          width={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.14)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--theme-accent)"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
            style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
          />
        </svg>
        <div className="absolute text-center">
          <p className="font-display text-[1.35rem] leading-none tracking-[-0.05em] text-foreground">
            {score.toFixed(1)}
          </p>
        </div>
      </div>
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
    </div>
  );
}

function ResearchPreview({
  alt,
  src,
  fallbackSrc,
}: {
  alt: string;
  src: string;
  fallbackSrc?: string;
}) {
  return (
    <PreviewImage
      alt={alt}
      className="aspect-[16/10] border-b border-border/70"
      errorLabel="Screenshot unavailable"
      fallbackSrc={fallbackSrc}
      loadingLabel="Capturing desktop screenshot"
      src={src}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/40 via-transparent to-transparent" />
    </PreviewImage>
  );
}

function CompetitorCard({
  reference,
  fallbackImage,
  referenceSnapshot,
}: {
  reference: BenchmarkReference;
  fallbackImage: string;
  referenceSnapshot: AuditReport["competitorSnapshots"][number] | undefined;
}) {
  const referenceScore = referenceSnapshot?.overallScore ?? getBenchmarkReferenceScore(reference);
  const scoreHighlights = reference.measuredCategoryScores?.length
    ? reference.measuredCategoryScores
        .slice()
        .sort((left, right) => right.score - left.score)
        .slice(0, 2)
        .map((category) => ({ label: category.label, score: category.score }))
    : (referenceSnapshot?.metrics ?? []).slice(0, 2).map((metric) => ({
        label: metric.label,
        score: metric.format === "score" ? metric.value : metric.value / 10,
      }));
  const conciseWhatWorks = reference.whatWorks.slice(0, 2);

  return (
    <Card className="w-full overflow-hidden">
      <a href={reference.url} rel="noreferrer" target="_blank">
        <ResearchPreview
          alt={`${reference.name} preview`}
          src={reference.previewImage}
        />
      </a>
      <CardHeader className="space-y-4 p-5 pb-1 sm:p-5 sm:pb-1">
        <div>
          <Badge className="whitespace-nowrap" variant="accent">
            {referenceScore.toFixed(1)}
          </Badge>
        </div>
        <CardTitle className="font-display text-[clamp(2.45rem,2rem+0.55vw,3.15rem)] leading-[0.94]">
          <a
            className="transition hover:text-accent"
            href={reference.url}
            rel="noreferrer"
            target="_blank"
          >
            {reference.name}
          </a>
        </CardTitle>
        <p className="text-[0.98rem] leading-[1.8] text-muted">{reference.note}</p>
      </CardHeader>
      <CardContent className="space-y-3 px-5 pb-5 pt-0 sm:px-5 sm:pb-5">
        <div className="hidden space-y-3 md:block">
          <div className="grid grid-cols-3 gap-2.5">
            <ScoreRing label="Overall" score={referenceScore} />
            {scoreHighlights.map((item) => (
              <ScoreRing key={item.label} label={item.label} score={item.score} />
            ))}
          </div>
          <div className="rounded-[calc(var(--theme-radius)-4px)] border border-border/60 bg-background-alt/60 px-3.5 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Best for</p>
            <p className="mt-2.5 text-[0.98rem] leading-7 text-foreground">{reference.bestFor}</p>
          </div>
          <div className="space-y-2">
            {conciseWhatWorks.map((item) => (
              <div
                className="rounded-[calc(var(--theme-radius)-6px)] border border-border/60 bg-panel/45 px-3.5 py-2.5 text-sm leading-6 text-foreground"
                key={item}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="md:hidden">
          <Accordion collapsible defaultValue="scores" type="single">
            <AccordionItem className="border-border/60" value="scores">
              <AccordionTrigger className="text-xs font-semibold">Scores</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-3 gap-2.5">
                  <ScoreRing label="Overall" score={referenceScore} />
                  {scoreHighlights.map((item) => (
                    <ScoreRing key={item.label} label={item.label} score={item.score} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem className="border-border/60" value="takeaways">
              <AccordionTrigger className="text-xs font-semibold">Takeaways</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="rounded-[calc(var(--theme-radius)-4px)] border border-border/60 bg-background-alt/60 px-3.5 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Best for</p>
                  <p className="mt-2.5 text-[0.95rem] leading-7 text-foreground">{reference.bestFor}</p>
                </div>
                <div className="space-y-2">
                  {conciseWhatWorks.map((item) => (
                    <div
                      className="rounded-[calc(var(--theme-radius)-6px)] border border-border/60 bg-panel/45 px-3.5 py-2.5 text-sm leading-6 text-foreground"
                      key={item}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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
  const researchSet = report.benchmarkReferences.slice(0, REPORT_COMPETITOR_REFERENCE_LIMIT);
  const averageReferenceScore =
    researchSet.reduce((total, reference) => {
      const snapshot = report.competitorSnapshots.find((item) => item.id === reference.id);

      return total + (snapshot?.overallScore ?? getBenchmarkReferenceScore(reference));
    }, 0) / Math.max(researchSet.length, 1);
  const lowestCategories = [...report.categoryScores]
    .sort((left, right) => left.score - right.score)
    .slice(0, 3);

  return (
    <section className="presentation-section" id="research">
      <div className="mx-auto w-full max-w-[min(100%,96rem)] space-y-8 px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Competitor research"
          title="Four stronger sites worth studying"
          description="These scored references show what a stronger buying experience looks like when the same model is applied consistently in a comparable industry."
        />

        <div className="grid gap-5 lg:grid-cols-[minmax(19rem,24rem)_minmax(0,1fr)] xl:grid-cols-[minmax(20rem,26rem)_minmax(0,1fr)]">
          <Card className="h-fit">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-2 text-accent">
                <Medal className="size-4" />
                Research summary
              </div>
              <CardTitle className="text-3xl">Where this site is leaving room on the table</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-hidden rounded-[calc(var(--theme-radius)-4px)] border border-border/70 bg-background-alt/70">
                <ResearchPreview
                  alt={`${report.title} preview`}
                  fallbackSrc={report.previewSet.fallbackCurrent.desktop}
                  src={currentSnapshot?.previewImage ?? report.previewSet.current.desktop}
                />
                <div className="space-y-3 p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[calc(var(--theme-radius)-6px)] border border-border/70 bg-panel/50 px-3 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                        Score
                      </p>
                      <p className="mt-2 font-display text-[2.35rem] leading-[0.92] tracking-[-0.05em] text-foreground">
                        {report.overallScore.toFixed(1)}
                      </p>
                    </div>
                    <div className="rounded-[calc(var(--theme-radius)-6px)] border border-border/70 bg-panel/50 px-3 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                        Average
                      </p>
                      <p className="mt-2 font-display text-[2.35rem] leading-[0.92] tracking-[-0.05em] text-foreground">
                        {averageReferenceScore.toFixed(1)}
                      </p>
                    </div>
                  </div>
                  <p className="text-base leading-7 text-muted">
                  {currentSnapshot?.note ?? report.executiveSummary}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Biggest gaps to close</p>
                {lowestCategories.map((item) => {
                  const Icon = scoreCategoryIcons[item.key];

                  return (
                    <div
                      className="rounded-[calc(var(--theme-radius)-6px)] border border-border/70 bg-panel/55 px-4 py-3"
                      key={item.key}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full border"
                          style={{
                            backgroundColor: `${scoreCategoryPalette[item.key]}1f`,
                            borderColor: `${scoreCategoryPalette[item.key]}55`,
                            color: scoreCategoryPalette[item.key],
                          }}
                        >
                          <Icon className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">{item.label}</p>
                          <p className="mt-1 text-sm leading-6 text-muted">{strengthCopy[item.key]}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
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

          <div className="min-w-0">
            <AuditHorizontalRail
              aria-label="Competitor research examples"
              railClassName="[grid-auto-columns:minmax(22.5rem,26rem)] lg:[grid-auto-columns:minmax(24rem,30rem)]"
            >
              {researchSet.map((reference) => (
                <CompetitorCard
                  fallbackImage={report.previewSet.fallbackCurrent.desktop}
                  key={reference.id}
                  reference={reference}
                  referenceSnapshot={report.competitorSnapshots.find((item) => item.id === reference.id)}
                />
              ))}
            </AuditHorizontalRail>
          </div>
        </div>
      </div>
    </section>
  );
}
