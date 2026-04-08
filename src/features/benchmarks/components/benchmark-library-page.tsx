"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  LineChart,
  Palette,
  ScanSearch,
  Target,
} from "lucide-react";

import { PreviewImage } from "@/components/common/preview-image";
import { ScoreDial } from "@/components/common/score-dial";
import {
  scoreCategoryIcons,
  scoreCategoryPalette,
} from "@/components/common/score-category-meta";
import { SectionHeading } from "@/components/common/section-heading";
import { BenchmarkSiteCard } from "@/features/benchmarks/components/benchmark-site-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  selectFeaturedBenchmarkReferences,
  sortBenchmarkReferencesByRecentScan,
} from "@/lib/benchmarks/scans-core";
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

function labelize(input: string) {
  return input.replace(/-/g, " ");
}

function ScoreInsightCards<Key extends string>({
  title,
  items,
}: {
  title: string;
  items: DesignDimensionScore<Key>[];
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 text-accent">
        <LineChart className="size-4" />
        <p className="text-xs uppercase tracking-[0.18em] text-muted">{title}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <article
            className="rounded-[22px] border border-border/60 bg-panel/45 p-4"
            key={item.key}
          >
            <div className="flex items-start justify-between gap-3">
              <Badge variant="neutral">{labelize(item.key)}</Badge>
              <p className="font-sans text-[1.8rem] font-semibold tracking-[-0.05em] text-accent">
                {item.score.toFixed(1)}
              </p>
            </div>
            <h3 className="mt-4 text-lg font-semibold leading-6 text-foreground">
              {item.label}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PatternNotes({ notes }: { notes: DesignPatternNote[] }) {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      {notes.map((note) => (
        <article
          className="rounded-[24px] border border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_84%,transparent),color-mix(in_srgb,var(--theme-background-alt)_95%,transparent))] p-5"
          key={note.id}
        >
          <div className="space-y-3">
            <Badge variant="neutral">{note.category}</Badge>
            <h3 className="font-display text-[clamp(2.3rem,1.9rem+0.55vw,3rem)] leading-[0.94] tracking-[-0.04em] text-foreground">
              {note.title}
            </h3>
            <p className="text-sm leading-6 text-muted">{note.summary}</p>
          </div>
          <div className="mt-5 space-y-2">
            {note.takeaways.map((takeaway) => (
              <p className="text-sm leading-6 text-foreground" key={takeaway}>
                {takeaway}
              </p>
            ))}
          </div>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            {note.applicability}
          </p>
        </article>
      ))}
    </section>
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
      <div className="pt-2">
        <SectionHeading
          eyebrow="Benchmark library"
          title="2026 Web Design Benchmarks"
          description="Measured standouts stay pinned at the top. The full scan feed below stays current so the benchmark set keeps earning its place."
        />
      </div>

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
          const strictFeaturedReferences = selectFeaturedBenchmarkReferences(
            snapshot.references,
            snapshot.scans,
            {
              limit: 3,
              minScore: snapshot.vertical === "fintech" ? 8.8 : 9,
              ...(snapshot.vertical === "service-providers"
                ? { focusArea: "woodworking" as const }
                : {}),
            },
          );
          const historyReferences = sortBenchmarkReferencesByRecentScan(
            snapshot.references,
            snapshot.scans,
          );
          const featuredReferences = strictFeaturedReferences.length
            ? strictFeaturedReferences
            : historyReferences.slice(0, 3);
          const heroReference = featuredReferences[0] ?? historyReferences[0];

          return (
            <TabsContent
              className="grid gap-10 pt-5"
              key={snapshot.vertical}
              value={snapshot.vertical}
            >
              <div className="grid gap-8 xl:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
                <div className="space-y-8">
                  <section className="space-y-4 border-l border-accent/20 pl-4 sm:pl-5">
                    <div className="flex items-center gap-2 text-accent">
                      <Target className="size-4" />
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">
                        10/10 rubric
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h2 className="font-display text-[clamp(3rem,2.45rem+0.9vw,4.4rem)] leading-[0.92] tracking-[-0.05em] text-foreground">
                        {snapshot.rubric.title}
                      </h2>
                      <p className="max-w-2xl text-[1.02rem] leading-7 text-muted">
                        {snapshot.rubric.summary}
                      </p>
                    </div>
                    <div className="grid gap-3">
                      {snapshot.rubric.fastLifts.map((item) => (
                        <div
                          className="rounded-[18px] border border-border/60 bg-background-alt/55 px-4 py-3 text-sm leading-6 text-foreground"
                          key={item}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">
                        What the score rewards
                      </p>
                      <h2 className="font-display text-[clamp(2.7rem,2.2rem+0.8vw,3.6rem)] leading-[0.94] tracking-[-0.04em] text-foreground">
                        The criteria that decide whether a site really clears the bar
                      </h2>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {snapshot.rubric.criteria.map((criterion) => {
                        const Icon =
                          scoreCategoryIcons[criterion.category as keyof typeof scoreCategoryIcons];
                        const color =
                          scoreCategoryPalette[
                            criterion.category as keyof typeof scoreCategoryPalette
                          ];

                        return (
                          <article
                            className="rounded-[24px] border border-border/60 bg-panel/45 p-5"
                            key={criterion.id}
                          >
                            <div className="space-y-4">
                              <Badge variant="neutral">
                                {criterion.category.replace(/-/g, " ")}
                              </Badge>
                              <div className="flex items-start gap-3">
                                <span
                                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-[14px] border"
                                  style={{
                                    backgroundColor: `${color}18`,
                                    borderColor: `${color}55`,
                                    color,
                                  }}
                                >
                                  <Icon className="size-4.5" />
                                </span>
                                <div className="min-w-0">
                                  <h3 className="text-xl font-semibold leading-7 text-foreground">
                                    {criterion.title}
                                  </h3>
                                </div>
                              </div>
                              <p className="text-sm leading-6 text-muted">
                                {criterion.description}
                              </p>
                              <p className="text-sm leading-6 text-foreground">
                                {criterion.whyItMatters}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {criterion.signals.map((signal) => (
                                  <Badge
                                    className="normal-case tracking-normal"
                                    key={signal}
                                    variant="neutral"
                                  >
                                    {signal}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                </div>

                <div className="space-y-5">
                  <section className="overflow-hidden rounded-[28px] border border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_84%,transparent),color-mix(in_srgb,var(--theme-background-alt)_96%,transparent))]">
                    {heroReference ? (
                      <a href={heroReference.url} rel="noreferrer" target="_blank">
                        <PreviewImage
                          alt={`${heroReference.name} benchmark preview`}
                          className="aspect-[16/8.8]"
                          fallbackLabel="Benchmark example"
                          fallbackSrc={fallbackImage}
                          loadingLabel="Capturing benchmark screenshot"
                          src={heroReference.previewImage}
                        />
                      </a>
                    ) : null}
                    <div className="space-y-5 p-5 sm:p-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-accent">
                          <Palette className="size-4" />
                          <p className="text-xs uppercase tracking-[0.18em] text-muted">
                            Design score framework
                          </p>
                        </div>
                        <h2 className="font-display text-[clamp(2.8rem,2.2rem+0.9vw,3.9rem)] leading-[0.94] tracking-[-0.04em] text-foreground">
                          Quantifying the subjective parts of UI
                        </h2>
                        <p className="text-sm leading-6 text-muted">
                          The design score averages the elements of art and principles of design into something named, comparable, and easier to critique than taste alone.
                        </p>
                      </div>

                      <div className="grid gap-4 xl:grid-cols-[15.5rem_minmax(0,1fr)]">
                        <ScoreDial
                          bandLabel={`${snapshot.label} avg`}
                          label="Average design score"
                          score={averageDesignScore}
                        />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-[22px] border border-border/60 bg-background-alt/60 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                              Animation average
                            </p>
                            <p className="mt-3 font-display text-[2.8rem] leading-[0.92] tracking-[-0.05em] text-foreground">
                              {averageAnimationScore.toFixed(1)}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-muted">
                              Motion is scored for usefulness, restraint, and accessibility.
                            </p>
                          </div>
                          <div className="rounded-[22px] border border-border/60 bg-background-alt/60 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                              Reference set
                            </p>
                            <p className="mt-3 font-display text-[2.8rem] leading-[0.92] tracking-[-0.05em] text-foreground">
                              {snapshot.scans.length}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-muted">
                              Live-scored references grounding this vertical right now.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <ScoreInsightCards
                      items={designElementScores}
                      title="Elements of art"
                    />
                    <ScoreInsightCards
                      items={designPrincipleScores}
                      title="Principles of design"
                    />
                  </div>
                </div>
              </div>

              <section className="grid gap-4">
                <div className="flex flex-col gap-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">
                    Featured examples
                  </p>
                  <p className="max-w-3xl text-sm leading-6 text-muted">
                    These are the strongest measured references in this vertical right now. They stay featured because they still outperform the broader scan set.
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
                  <div className="rounded-[22px] border border-border/60 bg-panel/45 p-5 text-sm leading-6 text-muted">
                    We’re still scanning enough high-quality candidates to keep this section limited to the strongest references.
                  </div>
                )}
              </section>

              <section className="grid gap-4">
                <div className="flex flex-col gap-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">
                    Measured scan feed
                  </p>
                  <p className="max-w-3xl text-sm leading-6 text-muted">
                    Newest-first reference scans. The benchmark set stays honest by showing the measured history, not just a polished shortlist.
                  </p>
                </div>

                <div className="grid gap-3">
                  {historyReferences.map((reference) => {
                    const scan = scanBySiteId.get(reference.siteId);
                    const score = scan?.overallScore ?? reference.measuredScore ?? reference.targetScore;

                    return (
                      <article
                        className="overflow-hidden rounded-[22px] border border-border/60 bg-panel/45"
                        key={reference.id}
                      >
                        <div className="grid gap-0 lg:grid-cols-[14rem_minmax(0,1fr)_17rem]">
                          <a
                            className="block overflow-hidden border-b border-border/70 lg:border-b-0 lg:border-r"
                            href={reference.url}
                            rel="noreferrer"
                            target="_blank"
                          >
                            <PreviewImage
                              alt={`${reference.name} scan preview`}
                              className="aspect-[4/3] h-full min-h-40"
                              fallbackSrc={fallbackImage}
                              loadingLabel="Capturing benchmark screenshot"
                              src={reference.previewImage}
                            />
                          </a>

                          <div className="space-y-2 p-5">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="accent">
                                {scan?.scoreSource === "measured" ? "Scored" : "Reference"} {score.toFixed(1)}
                              </Badge>
                              <Badge className="whitespace-nowrap" variant="neutral">
                                {reference.tier}
                              </Badge>
                            </div>
                            <h3 className="font-display text-[clamp(2.45rem,1.95rem+0.7vw,3.4rem)] leading-[0.92] tracking-[-0.04em] text-foreground">
                              <a
                                className="transition hover:text-accent"
                                href={reference.url}
                                rel="noreferrer"
                                target="_blank"
                              >
                                {reference.name}
                              </a>
                            </h3>
                            <p className="text-sm leading-6 text-muted">{reference.note}</p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                              <span>{reference.sourceLabel}</span>
                              <span>
                                Scored {formatTimestamp(scan?.scannedAt ?? new Date().toISOString())}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-start gap-2 border-t border-border/70 p-5 lg:justify-end lg:border-l lg:border-t-0">
                            {reference.strengths.map((strength) => (
                              <Badge
                                className="normal-case tracking-normal"
                                key={strength}
                                variant="neutral"
                              >
                                {labelize(strength)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex flex-col gap-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">
                    Design history and style notes
                  </p>
                  <p className="max-w-3xl text-sm leading-6 text-muted">
                    These notes keep the benchmark set from turning into a template pack. They connect the examples to repeatable design judgment.
                  </p>
                </div>
                <PatternNotes notes={snapshot.notes} />
              </section>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
