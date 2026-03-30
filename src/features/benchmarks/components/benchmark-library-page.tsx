"use client";

import Link from "next/link";
import { ArrowUpRight, Compass, Palette, ScanSearch, Target } from "lucide-react";

import { BenchmarkSiteCard } from "@/features/benchmarks/components/benchmark-site-card";
import { PreviewImage } from "@/components/common/preview-image";
import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  selectFeaturedBenchmarkReferences,
  sortBenchmarkReferencesByRecentScan,
} from "@/lib/benchmarks/scans";
import type {
  BenchmarkReference,
  BenchmarkScan,
  BenchmarkVertical,
  DesignDimensionScore,
  DesignElementKey,
  DesignPatternNote,
  DesignPrincipleKey,
} from "@/lib/types/audit";

function averageScores<Key extends string>(
  scans: BenchmarkScan[],
  select: (scan: BenchmarkScan) => DesignDimensionScore<Key>[],
) {
  const all = scans.flatMap(select);

  return Array.from(new Map(all.map((item) => [item.key, item])).values()).map((item) => {
    const matching = all.filter((entry) => entry.key === item.key);
    const average =
      matching.reduce((sum, entry) => sum + entry.score, 0) / matching.length;

    return {
      ...item,
      score: Number(average.toFixed(1)),
    };
  });
}

function formatTimestamp(input: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(input));
}

function ScoreRows<Key extends string>({
  title,
  items,
}: {
  title: string;
  items: DesignDimensionScore<Key>[];
}) {
  return (
    <div className="rounded-[10px] border border-border/70 bg-background-alt/70 p-5">
      <p className="text-[0.82rem] font-semibold uppercase tracking-[0.18em] text-muted">{title}</p>
      <div className="mt-4 grid gap-2">
        {items.map((item) => (
          <div
            className="flex items-start justify-between gap-4 rounded-[8px] border border-border/60 bg-panel/55 px-3.5 py-3"
            key={item.key}
          >
            <div className="min-w-0">
              <p className="text-[1.02rem] font-semibold text-foreground">{item.label}</p>
              <p className="mt-1 text-[1.12rem] leading-[1.95rem] text-muted">{item.description}</p>
            </div>
            <p className="font-sans text-[2.2rem] font-semibold tracking-[-0.04em] text-accent">
              {item.score}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PatternNotes({
  notes,
}: {
  notes: DesignPatternNote[];
}) {
  return (
      <div className="grid gap-4 lg:grid-cols-3">
      {notes.map((note) => (
        <Card key={note.id}>
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2 text-accent">
              <Compass className="size-4" />
              <span className="text-xs uppercase tracking-[0.18em]">{note.source}</span>
            </div>
            <CardTitle className="text-[clamp(3rem,2.3rem+0.9vw,4.2rem)] leading-[0.9]">
              {note.title}
            </CardTitle>
            <p className="text-[1.08rem] leading-[1.95rem] text-muted">{note.summary}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {note.takeaways.map((takeaway) => (
                <p className="text-[1.08rem] leading-[1.95rem] text-foreground" key={takeaway}>
                  {takeaway}
                </p>
              ))}
            </div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              {note.applicability}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function BenchmarkLibraryPage({
  snapshots,
  fallbackImage,
}: {
  snapshots: Array<{
    vertical: BenchmarkVertical;
    label: string;
    rubric: {
      title: string;
      summary: string;
      fastLifts: string[];
      criteria: Array<{
        id: string;
        category: string;
        title: string;
        description: string;
        whyItMatters: string;
        signals: string[];
      }>;
    };
    references: BenchmarkReference[];
    scans: BenchmarkScan[];
    notes: DesignPatternNote[];
  }>;
  fallbackImage: string;
}) {
  return (
    <div className="grid gap-8">
      <SectionHeading
        eyebrow="Benchmark library"
        title="2026 Web Design Benchmarks"
        description="Live-measured references first. The 9+ examples stay at the top and the scan feed stays newest-first."
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild size="sm" variant="secondary">
          <Link href="/app/benchmarks/animation">
            <ArrowUpRight className="size-4" />
            Animation
          </Link>
        </Button>
        <Button asChild size="sm" variant="ghost">
          <Link href="/app/seo">
            <ScanSearch className="size-4" />
            SEO
          </Link>
        </Button>
        <p className="max-w-2xl text-sm leading-6 text-muted">
          Purposeful motion lifts the score. The gated SEO add-on covers keyword ranking and AI searchability.
        </p>
      </div>

      <Tabs defaultValue={snapshots[0]?.vertical}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {snapshots.map((snapshot) => (
            <TabsTrigger key={snapshot.vertical} value={snapshot.vertical}>
              {snapshot.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {snapshots.map((snapshot) => {
          const scanBySiteId = new Map(snapshot.scans.map((scan) => [scan.siteId, scan]));
          const designElementScores = averageScores<DesignElementKey>(
            snapshot.scans,
            (scan) => scan.designElementScores,
          );
          const designPrincipleScores = averageScores<DesignPrincipleKey>(
            snapshot.scans,
            (scan) => scan.designPrincipleScores,
          );
          const averageDesignScore = snapshot.scans.length
            ? Number(
                (
                  snapshot.scans.reduce((sum, scan) => sum + scan.designScore, 0) /
                  snapshot.scans.length
                ).toFixed(1),
              )
            : 0;
          const averageAnimationScore = snapshot.scans.length
            ? Number(
              (
                  snapshot.scans.reduce((sum, scan) => sum + scan.animationScore, 0) /
                  snapshot.scans.length
                ).toFixed(1),
              )
            : 0;
          const featuredReferences = selectFeaturedBenchmarkReferences(
            snapshot.references,
            snapshot.scans,
            {
              limit: 3,
              minScore: 9,
              ...(snapshot.vertical === "service-providers"
                ? { focusArea: "woodworking" as const }
                : {}),
            },
          );
          const historyReferences = sortBenchmarkReferencesByRecentScan(
            snapshot.references,
            snapshot.scans,
          );

          return (
            <TabsContent className="grid gap-8 pt-4" key={snapshot.vertical} value={snapshot.vertical}>
              <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <Card>
                  <CardHeader className="space-y-3">
                    <div className="flex items-center gap-2 text-accent">
                      <Target className="size-4" />
                      <span className="text-xs uppercase tracking-[0.18em]">10/10 rubric</span>
                    </div>
                    <CardTitle className="text-[clamp(3.2rem,2.5rem+1vw,4.6rem)] leading-[0.92]">
                      {snapshot.rubric.title}
                    </CardTitle>
                    <p className="text-sm leading-6 text-muted">{snapshot.rubric.summary}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-[10px] border border-accent/25 bg-accent/8 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">
                        What raises score fastest
                      </p>
                      <div className="mt-3 space-y-2">
                        {snapshot.rubric.fastLifts.map((item) => (
                          <p className="text-sm leading-6 text-foreground" key={item}>
                            {item}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-3">
                      {snapshot.rubric.criteria.map((criterion) => (
                        <div
                          className="rounded-[10px] border border-border/70 bg-background-alt/60 p-4"
                          key={criterion.id}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="neutral">{criterion.category.replace(/-/g, " ")}</Badge>
                            <p className="text-sm font-semibold text-foreground">{criterion.title}</p>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-muted">{criterion.description}</p>
                          <p className="mt-2 text-sm leading-6 text-foreground">{criterion.whyItMatters}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {criterion.signals.map((signal) => (
                              <Badge className="normal-case tracking-normal" key={signal} variant="neutral">
                                {signal}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="space-y-3">
                    <div className="flex items-center gap-2 text-accent">
                      <Palette className="size-4" />
                      <span className="text-xs uppercase tracking-[0.18em]">Design score framework</span>
                    </div>
                    <CardTitle className="text-[clamp(3.2rem,2.5rem+1vw,4.6rem)] leading-[0.92]">
                      Quantifying the subjective parts of UI
                    </CardTitle>
                    <p className="text-sm leading-6 text-muted">
                      WebsiteCreditScore.com averages the elements of art and the principles of design into a benchmark-side Design Score so visual quality can be discussed with named criteria instead of taste alone.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-[10px] border border-accent/25 bg-accent/8 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">Average design score</p>
                      <p className="mt-2 font-display text-5xl font-semibold text-accent">
                        {averageDesignScore}
                      </p>
                      <p className="mt-2 text-base leading-7 text-foreground">
                        This is the average design benchmark score across the measured reference set for this vertical.
                      </p>
                      <p className="mt-2 text-base leading-7 text-muted">
                        Animation average: {averageAnimationScore}. Purposeful motion is counted as part of the design score, not as a decorative extra.
                      </p>
                    </div>
                    <div className="grid gap-4 xl:grid-cols-2">
                      <ScoreRows items={designElementScores} title="Elements of art" />
                      <ScoreRows items={designPrincipleScores} title="Principles of design" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4">
                <div className="flex flex-col gap-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Featured examples</p>
                  <p className="max-w-3xl text-sm leading-6 text-muted">
                    These are the 9+ benchmarks we want clients to beat. We scan a broader pool, then only surface the strongest examples here.
                  </p>
                </div>
                {featuredReferences.length ? (
                  <div className="grid gap-5 xl:grid-cols-3">
                    {featuredReferences.map((reference) => (
                      <BenchmarkSiteCard
                        fallbackImage={fallbackImage}
                        key={reference.id}
                        reference={reference}
                        scan={scanBySiteId.get(reference.siteId)}
                      />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-5 text-sm leading-6 text-muted">
                      We’re still scanning enough high-quality candidates to keep this section at 9+ only.
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="grid gap-4">
                <div className="flex flex-col gap-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Public scan history</p>
                  <p className="max-w-3xl text-sm leading-6 text-muted">
                    Newest scans first. Every live reference stays cataloged here.
                  </p>
                </div>
                <div className="grid gap-3">
                {historyReferences.map((reference) => {
                  const scan = scanBySiteId.get(reference.siteId);
                  const score = scan?.overallScore ?? reference.measuredScore ?? reference.targetScore;

                  return (
                    <Card key={reference.id}>
                      <div className="grid gap-0 lg:grid-cols-[14rem_minmax(0,1fr)_16rem]">
                        <div className="overflow-hidden border-b border-border/70 lg:border-b-0 lg:border-r">
                          <PreviewImage
                            alt={`${reference.name} scan preview`}
                            className="aspect-[4/3] h-full min-h-40"
                            fallbackSrc={fallbackImage}
                            loadingLabel="Capturing benchmark screenshot"
                            src={reference.previewImage}
                          />
                        </div>
                          <CardHeader className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="accent">
                                {scan?.scoreSource === "measured" ? "Scored" : "Reference"} {score.toFixed(1)}
                              </Badge>
                              <Badge className="whitespace-nowrap" variant="neutral">
                                {reference.tier}
                              </Badge>
                            </div>
                            <CardTitle className="font-display text-[clamp(2.9rem,2.2rem+0.9vw,4.1rem)] leading-[0.9]">
                              {reference.name}
                            </CardTitle>
                            <p className="text-[1.08rem] leading-[1.95rem] text-muted">{reference.note}</p>
                            <p className="text-xs uppercase tracking-[0.18em] text-muted">
                              {reference.sourceLabel}
                            </p>
                            <p className="text-xs uppercase tracking-[0.18em] text-muted">
                              Scored {formatTimestamp(scan?.scannedAt ?? new Date().toISOString())}
                            </p>
                          </CardHeader>
                          <CardContent className="flex flex-wrap items-start gap-2 lg:justify-end lg:pt-6">
                            {reference.strengths.map((strength) => (
                              <Badge className="normal-case tracking-normal" key={strength} variant="neutral">
                                {strength.replace(/-/g, " ")}
                              </Badge>
                            ))}
                          </CardContent>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <PatternNotes notes={snapshot.notes} />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
