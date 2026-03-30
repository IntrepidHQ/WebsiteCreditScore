"use client";

import { useEffect, useRef } from "react";
import {
  ArrowRight,
  Info,
  Monitor,
  Smartphone,
  Sparkles,
} from "lucide-react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { DevicePreview } from "@/components/common/device-preview";
import { ScoreMeter } from "@/components/common/score-meter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AuditReport } from "@/lib/types/audit";
import { useMotionSettings } from "@/hooks/use-motion-settings";
import {
  describeScore,
  getScoreBandLabel,
  getScoreMethodologyNotes,
  getScoreTone,
} from "@/lib/utils/scores";
import { useUiStore } from "@/store/ui-store";

const scoreSurfaceClasses = {
  success: "border-success/25 bg-success/10",
  accent: "border-accent/25 bg-accent/10",
  warning: "border-warning/25 bg-warning/10",
  danger: "border-danger/25 bg-danger/10",
} as const;

const scoreTextClasses = {
  success: "text-success",
  accent: "text-accent",
  warning: "text-warning",
  danger: "text-danger",
} as const;

export function AuditHeroSection({ report }: { report: AuditReport }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { reduceMotion } = useMotionSettings();
  const previewDevice = useUiStore((state) => state.previewDevice);
  const setPreviewDevice = useUiStore((state) => state.setPreviewDevice);
  const setContactModalOpen = useUiStore((state) => state.setContactModalOpen);
  const overallTone = getScoreTone(report.overallScore);
  const methodologyNotes = getScoreMethodologyNotes();
  const observedFacts = report.siteObservation.verifiedFacts.filter((fact) => {
    if (fact.type === "about") {
      return false;
    }

    if (fact.type === "phone" || fact.type === "email") {
      return true;
    }

    const value = fact.value.trim();

    return value.length > 3 && !/^(years?)$/i.test(value);
  });
  const observedActions = report.siteObservation.primaryCtas.filter((cta) => {
    const value = cta.trim();

    return value.length > 2 && !/^(years?)$/i.test(value);
  });

  useEffect(() => {
    if (reduceMotion || !sectionRef.current) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from("[data-hero-chip]", {
        y: 18,
        opacity: 0,
        duration: 0.55,
        stagger: 0.06,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          once: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reduceMotion]);

  return (
    <section ref={sectionRef} className="presentation-section pt-8" id="overview">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:gap-8">
          <div className="space-y-5">
            <Badge variant="accent">Live audit</Badge>
            <div className="space-y-3">
              <h1 className="font-display text-[clamp(4rem,3.35rem+1.2vw,5.1rem)] font-semibold tracking-[-0.055em] text-foreground">
                {report.title}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-muted">
                {report.executiveSummary}
              </p>
            </div>
            <div className="grid gap-2.5 sm:flex sm:flex-wrap">
              <Button asChild className="w-full sm:w-auto" size="lg">
                <a
                  href={`/packet/${report.id}?url=${encodeURIComponent(report.normalizedUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Client Packet
                  <ArrowRight className="size-4" />
                </a>
              </Button>
              <Button asChild className="w-full sm:w-auto" size="lg" variant="secondary">
                <a href={`/brief/${report.id}?url=${encodeURIComponent(report.normalizedUrl)}`}>
                  Open Creative Brief
                  <ArrowRight className="size-4" />
                </a>
              </Button>
              <Button
                className="w-full sm:w-auto"
                size="lg"
                onClick={() => setContactModalOpen(true)}
                variant="outline"
              >
                Book Strategy Call
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div
              className={`glass-panel rounded-[10px] border ${scoreSurfaceClasses[overallTone]} p-5 sm:p-6`}
            >
              <ScoreMeter
                className="max-w-none"
                compact
                label="Overall score"
                score={report.overallScore}
              />
              <p className="mt-4 max-w-[34rem] text-[1.15rem] leading-9 text-muted sm:text-[1.25rem]">
                {describeScore(report.overallScore)}
              </p>

              <Accordion collapsible type="single" className="mt-4">
                <AccordionItem
                  value="overall-methodology"
                  className="border-0 bg-transparent px-0"
                >
                  <AccordionTrigger className="py-0 pr-8 text-[1.7rem] font-semibold leading-tight [&>svg]:right-0 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2 sm:text-[1.9rem]">
                    How this score was calculated
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="space-y-3">
                      {methodologyNotes.map((note) => (
                        <div
                          className="rounded-[calc(var(--theme-radius)-4px)] bg-panel/40 px-4 py-3 text-[1.1rem] leading-9 text-muted sm:text-[1.2rem]"
                          key={note}
                        >
                          {note}
                        </div>
                      ))}
                      <div className="flex items-start gap-3 rounded-[calc(var(--theme-radius)-4px)] bg-accent/8 px-4 py-3 text-[1.1rem] leading-9 text-foreground sm:text-[1.2rem]">
                        <Info className="mt-0.5 size-4 shrink-0 text-accent" />
                        <p>
                          Heuristic score, not a lab measurement. Another evaluator may
                          weight code, accessibility, or polish differently.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="glass-panel rounded-[10px] border border-border/70 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Website preview</p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted">
                    <Sparkles className="size-4 text-accent" />
                    {report.normalizedUrl}
                  </div>
                </div>
                <Tabs
                  onValueChange={(value) =>
                    setPreviewDevice(value === "mobile" ? "mobile" : "desktop")
                  }
                  value={previewDevice}
                >
                  <TabsList className="w-full sm:w-auto">
                    <TabsTrigger className="flex-1 justify-center sm:flex-none" value="desktop">
                      <Monitor className="mr-2 size-4" />
                      Desktop
                    </TabsTrigger>
                    <TabsTrigger className="flex-1 justify-center sm:flex-none" value="mobile">
                      <Smartphone className="mr-2 size-4" />
                      Mobile
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            <DevicePreview
              alt={`${report.title} preview`}
              device={previewDevice}
              fallbackImage={report.previewSet.fallbackCurrent[previewDevice]}
              highlight
              image={report.previewSet.current[previewDevice]}
              label={
                previewDevice === "mobile"
                  ? report.previewSet.mobileLabel
                  : report.previewSet.desktopLabel
              }
            />
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)]">
          <div className="space-y-4">
            <div className="glass-panel rounded-[10px] border border-border/70 p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Profile</p>
              <p className="mt-3 font-display text-2xl font-semibold">
                {report.clientProfile.industryLabel}
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">
                Audience: {report.clientProfile.audience}
              </p>
              <div className="mt-4 grid gap-3">
                <div className="rounded-[calc(var(--theme-radius)-2px)] border border-border/70 bg-background-alt/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Primary goal</p>
                  <p className="mt-2 text-sm leading-6 text-foreground">
                    {report.clientProfile.primaryGoal}
                  </p>
                </div>
                <div className="rounded-[calc(var(--theme-radius)-2px)] border border-border/70 bg-background-alt/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Trust drivers</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {report.clientProfile.trustDrivers.map((driver) => (
                      <Badge className="normal-case tracking-normal" key={driver} variant="neutral">
                        {driver}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-panel rounded-[10px] border border-border/70 p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Observed on page</p>
              <div className="mt-3 space-y-4">
                <p className="text-base leading-8 text-foreground">
                  {report.siteObservation.aboutSnippet ||
                    "No high-confidence business summary was detected, so the audit is leaning more heavily on the visible interface and navigation structure."}
                </p>
                <div className="grid gap-3 lg:grid-cols-2">
                  {observedFacts.slice(0, 4).map((fact) => (
                    <div
                      className="rounded-[calc(var(--theme-radius)-2px)] border border-border/70 bg-background-alt/70 px-4 py-3"
                      key={fact.id}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{fact.label}</p>
                        <Badge
                          className="shrink-0"
                          variant={fact.confidence === "verified" ? "accent" : "neutral"}
                        >
                          {fact.confidence}
                        </Badge>
                      </div>
                      <p className="mt-2 text-base leading-8 text-foreground">{fact.value}</p>
                      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                        {fact.source.replace(/-/g, " ")}
                      </p>
                    </div>
                  ))}
                  <div className="rounded-[calc(var(--theme-radius)-2px)] border border-border/70 bg-background-alt/70 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Actions seen</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(observedActions.length
                        ? observedActions
                        : ["No strong CTA detected"]).map((cta) => (
                        <Badge className="normal-case tracking-normal" key={cta} variant="neutral">
                          {cta}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Accordion
              aria-label="Category score breakdown"
              className="grid gap-3 xl:grid-cols-2"
              type="multiple"
            >
              {report.categoryScores.map((score) => {
                const tone = getScoreTone(score.score);

                return (
                  <AccordionItem
                    className="rounded-[10px] border-border/70 bg-panel/72"
                    data-hero-chip
                    key={score.key}
                    value={score.key}
                  >
                    <AccordionTrigger className="relative flex flex-col items-start gap-4 py-5 pr-10 text-left [&>svg]:absolute [&>svg]:bottom-5 [&>svg]:right-0 [&>svg]:top-auto">
                      <div className="grid w-full gap-3">
                        <p className="font-display text-[2.15rem] font-semibold leading-[1] text-foreground">
                          {score.label}
                        </p>
                        <span
                          className={`block font-display text-[2.45rem] font-semibold leading-none tracking-[-0.04em] ${scoreTextClasses[tone]}`}
                        >
                          {score.score}
                        </span>
                        <p className="text-lg font-normal leading-8 text-muted">{score.summary}</p>
                        <div className="flex items-center gap-3">
                          <Badge variant={tone}>{getScoreBandLabel(score.score)}</Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-0">
                      <div className="space-y-3">
                        {score.details.map((detail) => (
                          <div
                            className="rounded-[calc(var(--theme-radius)-4px)] border border-border/70 bg-background-alt/70 px-4 py-3 text-lg leading-8 text-muted"
                            key={detail}
                          >
                            {detail}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
