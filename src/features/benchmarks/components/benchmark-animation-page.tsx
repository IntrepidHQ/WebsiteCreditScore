"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Clock3, Layers3, PlayCircle } from "lucide-react";

import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAnimationGuidance,
  getAnimationPatterns,
} from "@/lib/benchmarks/motion";

export function BenchmarkAnimationPage() {
  const patterns = getAnimationPatterns();
  const guidance = getAnimationGuidance();
  const totalPoints = patterns.reduce((sum, pattern) => sum + pattern.pointValue, 0);

  return (
    <div className="grid gap-8">
      <SectionHeading
        eyebrow="Benchmark library"
        title="Animation"
        description="WebsiteCreditScore.com scores motion by usefulness, restraint, and accessibility. A site can score a 10 without being flashy, but it should not score well if motion is absent or distracting."
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button asChild size="sm" variant="secondary">
          <Link href="/app/benchmarks">
            <ArrowLeft className="size-4" />
            Back to benchmarks
          </Link>
        </Button>
        <Button asChild size="sm" variant="ghost">
          <Link href="https://gsap.com/docs/v3/" rel="noreferrer" target="_blank">
            GSAP docs
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
        <Button asChild size="sm" variant="ghost">
          <Link href="https://motion.dev/magazine/web-animation-performance-tier-list" rel="noreferrer" target="_blank">
            Motion.dev performance
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2 text-accent">
              <PlayCircle className="size-4" />
              <span className="text-xs uppercase tracking-[0.18em]">Animation score</span>
            </div>
            <CardTitle className="text-[clamp(3rem,2.3rem+1vw,4.4rem)] leading-[0.9]">
              Purposeful motion beats decorative motion
            </CardTitle>
            <p className="text-[1.05rem] leading-[1.9rem] text-muted">
              The benchmark score is designed to reward a few high-quality interactions instead of demanding constant movement. No motion is a zero. A calm, well-scoped system can still reach 10.
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[10px] border border-accent/25 bg-accent/8 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">How the score works</p>
              <div className="mt-3 space-y-2 text-[1.02rem] leading-[1.9rem] text-foreground">
                <p>0: no meaningful motion signals.</p>
                <p>3 to 4: basic feedback and one useful transition.</p>
                <p>6 to 7: a coherent motion system with restraint.</p>
                <p>9 to 10: purposeful, accessible, and performant.</p>
              </div>
            </div>
            <div className="rounded-[10px] border border-border/70 bg-background-alt/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Point budget</p>
              <p className="mt-2 font-display text-[clamp(3.5rem,2.8rem+1vw,5rem)] font-semibold text-accent">
                {totalPoints}
              </p>
              <p className="mt-2 text-[1.02rem] leading-[1.9rem] text-foreground">
                The common patterns below add up to a 10-point motion model. You do not need all of them to score well.
              </p>
            </div>
            <div className="rounded-[10px] border border-border/70 bg-background-alt/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Use GSAP when</p>
              <div className="mt-3 space-y-2 text-[1.02rem] leading-[1.9rem] text-foreground">
                <p>You need timelines that coordinate multiple pieces.</p>
                <p>You need ScrollTrigger or FLIP-style layout transitions.</p>
                <p>You need scoped animation cleanup in React.</p>
              </div>
            </div>
            <div className="rounded-[10px] border border-border/70 bg-background-alt/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Core rule</p>
              <p className="mt-2 text-[1.02rem] leading-[1.9rem] text-foreground">
                Use transforms and opacity first. Keep motion short, consistent, and easy to disable.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2 text-accent">
              <Layers3 className="size-4" />
              <span className="text-xs uppercase tracking-[0.18em]">Best practice</span>
            </div>
            <CardTitle className="text-[clamp(2.8rem,2.1rem+0.9vw,4rem)] leading-[0.9]">
              What good motion does
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {guidance.map((item) => (
              <div
                className="rounded-[10px] border border-border/70 bg-background-alt/70 p-4"
                key={item.id}
              >
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{item.source}</p>
                <p className="mt-2 text-[1.02rem] font-semibold text-foreground">{item.title}</p>
                <p className="mt-2 text-[1.02rem] leading-[1.9rem] text-muted">{item.summary}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {patterns.map((pattern) => (
          <Card key={pattern.id}>
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent">+{pattern.pointValue} points</Badge>
                <Badge variant="neutral">{pattern.id.replace(/-/g, " ")}</Badge>
              </div>
              <CardTitle className="text-2xl">{pattern.title}</CardTitle>
              <p className="text-sm leading-6 text-muted">{pattern.summary}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[10px] border border-border/70 bg-background-alt/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Example</p>
                <p className="mt-2 text-sm leading-6 text-foreground">{pattern.example}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[10px] border border-border/70 bg-panel/55 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Best practice</p>
                  <p className="mt-2 text-sm leading-6 text-foreground">{pattern.bestPractice}</p>
                </div>
                <div className="rounded-[10px] border border-border/70 bg-panel/55 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Watch out for</p>
                  <p className="mt-2 text-sm leading-6 text-foreground">{pattern.caution}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {pattern.signals.map((signal) => (
                  <Badge className="normal-case tracking-normal" key={signal} variant="neutral">
                    {signal.replace(/-/g, " ")}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2 text-accent">
              <Clock3 className="size-4" />
              <span className="text-xs uppercase tracking-[0.18em]">Practical checklist</span>
            </div>
            <CardTitle className="text-[clamp(2.8rem,2.1rem+0.9vw,4rem)] leading-[0.9]">
              Motion that reads well in 2026
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-[1.02rem] leading-[1.9rem] text-foreground">Keep motion purposeful and sparse.</p>
            <p className="text-[1.02rem] leading-[1.9rem] text-foreground">Test on mobile, low-power devices, and multiple browsers.</p>
            <p className="text-[1.02rem] leading-[1.9rem] text-foreground">Honor reduced-motion preferences and avoid motion-only meaning.</p>
            <p className="text-[1.02rem] leading-[1.9rem] text-foreground">Prefer composited transforms and opacity over layout-heavy effects.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2 text-accent">
              <PlayCircle className="size-4" />
              <span className="text-xs uppercase tracking-[0.18em]">Score interpretation</span>
            </div>
            <CardTitle className="text-[clamp(2.8rem,2.1rem+0.9vw,4rem)] leading-[0.9]">
              What a 10 actually means
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-[1.02rem] leading-[1.9rem] text-muted">
              A 10 is not a site with a lot of motion. It is a site with enough motion to improve usability, enough restraint to stay fast, and enough accessibility support to remain comfortable when motion is reduced.
            </p>
            <div className="grid gap-2 text-[1.02rem] leading-[1.9rem] text-foreground">
              <p>0-2: no meaningful motion system or distracting decorative motion only.</p>
              <p>3-5: a few useful interactions, but still inconsistent or incomplete.</p>
              <p>6-8: a coherent motion system that supports the interface.</p>
              <p>9-10: purposeful, lightweight motion with accessibility built in.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
