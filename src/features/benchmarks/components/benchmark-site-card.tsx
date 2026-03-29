"use client";

import { BarChart3, Layers3, Monitor, Smartphone, Sparkles } from "lucide-react";

import { PreviewImage } from "@/components/common/preview-image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BenchmarkReference, BenchmarkScan } from "@/lib/types/audit";

export function BenchmarkSiteCard({
  reference,
  scan,
  fallbackImage,
}: {
  reference: BenchmarkReference;
  scan: BenchmarkScan | undefined;
  fallbackImage: string;
}) {
  const strongestCategories = (scan?.categoryScores ?? reference.measuredCategoryScores ?? [])
    .slice()
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);

  return (
    <Card className="overflow-hidden">
      <div className="grid gap-0 border-b border-border/70 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="relative">
          <Tabs defaultValue="desktop">
            <div className="absolute left-3 top-3 z-10">
              <TabsList className="bg-background/70 backdrop-blur-md">
                <TabsTrigger value="desktop">
                  <Monitor className="size-4" />
                  Desktop
                </TabsTrigger>
                <TabsTrigger value="mobile">
                  <Smartphone className="size-4" />
                  Mobile
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="desktop">
              <PreviewImage
                alt={`${reference.name} desktop benchmark preview`}
                className="aspect-[16/10]"
                fallbackSrc={fallbackImage}
                loadingLabel="Capturing desktop screenshot"
                src={reference.previewImage}
              />
            </TabsContent>
            <TabsContent value="mobile">
              <PreviewImage
                alt={`${reference.name} mobile benchmark preview`}
                className="aspect-[16/10]"
                fallbackSrc={fallbackImage}
                loadingLabel="Capturing mobile screenshot"
                src={reference.mobilePreviewImage}
              />
            </TabsContent>
          </Tabs>
        </div>
        <div className="grid gap-3 bg-background-alt/60 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Scanned score</p>
            <p className="mt-2 font-display text-4xl font-semibold text-foreground">
              {(scan?.overallScore ?? reference.measuredScore ?? reference.targetScore).toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Design score</p>
            <p className="mt-2 font-display text-4xl font-semibold text-accent">
              {(scan?.designScore ?? reference.measuredScore ?? reference.targetScore).toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Animation score</p>
            <p className="mt-2 font-display text-4xl font-semibold text-foreground">
              {(scan?.animationScore ?? reference.measuredAnimationScore ?? 0).toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Tier</p>
            <Badge className="mt-2 w-fit" variant="accent">
              {reference.tier}
            </Badge>
          </div>
        </div>
      </div>

      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral">{reference.sourceLabel}</Badge>
          <Badge variant="accent">Why this is still a benchmark</Badge>
        </div>
        <CardTitle>{reference.name}</CardTitle>
        <p className="text-sm leading-6 text-muted">{reference.note}</p>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-[8px] border border-border/70 bg-background-alt/70 p-4">
            <div className="flex items-center gap-2 text-accent">
              <Sparkles className="size-4" />
              <p className="text-xs uppercase tracking-[0.18em]">What works</p>
            </div>
            <div className="mt-3 space-y-2">
              {reference.whatWorks.map((item) => (
                <p className="text-sm leading-6 text-foreground" key={item}>
                  {item}
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-[8px] border border-border/70 bg-background-alt/70 p-4">
            <div className="flex items-center gap-2 text-accent">
              <Layers3 className="size-4" />
              <p className="text-xs uppercase tracking-[0.18em]">What is reusable</p>
            </div>
            <div className="mt-3 space-y-2">
              {reference.reusablePatterns.map((item) => (
                <p className="text-sm leading-6 text-foreground" key={item}>
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="rounded-[8px] border border-border/70 bg-panel/55 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Best for</p>
            <p className="mt-2 text-sm leading-6 text-foreground">{reference.bestFor}</p>
          </div>
          <div className="rounded-[8px] border border-border/70 bg-panel/55 p-4">
            <div className="flex items-center gap-2 text-accent">
              <BarChart3 className="size-4" />
              <p className="text-xs uppercase tracking-[0.18em]">Strongest winning categories</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {strongestCategories.map((category) => (
                <Badge className="normal-case tracking-normal" key={category.key} variant="neutral">
                  {category.label} {category.score.toFixed(1)}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
