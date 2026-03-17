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
  getScoreMethodologyNotes,
  getScoreTone,
} from "@/lib/utils/scores";
import { useUiStore } from "@/store/ui-store";
import { AnimatedScore } from "@/features/audit/components/animated-score";

const scoreSurfaceClasses = {
  success: "border-success/25 bg-success/10",
  warning: "border-warning/25 bg-warning/10",
  danger: "border-danger/25 bg-danger/10",
} as const;

const scoreTextClasses = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
} as const;

export function AuditHeroSection({ report }: { report: AuditReport }) {
  const sectionRef = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
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
    if (reduceMotion || !sectionRef.current || !previewRef.current) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const desktopOnly = window.matchMedia("(min-width: 1024px)").matches;

    if (!desktopOnly) {
      return;
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top+=96",
        end: "bottom bottom-=120",
        pin: previewRef.current,
        pinSpacing: false,
      });

      gsap.from("[data-hero-chip]", {
        y: 24,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
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
    <section ref={sectionRef} className="presentation-section pt-10" id="overview">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:px-8">
        <div className="space-y-8">
          <div className="space-y-5">
            <Badge variant="accent">Live audit</Badge>
            <div className="space-y-4">
              <h1 className="font-display text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-6xl">
                {report.title}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted">
                {report.executiveSummary}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a
                  href={`/packet/${report.id}?url=${encodeURIComponent(report.normalizedUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Client Packet
                  <ArrowRight className="size-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a href={`/brief/${report.id}?url=${encodeURIComponent(report.normalizedUrl)}`}>
                  Open Creative Brief
                  <ArrowRight className="size-4" />
                </a>
              </Button>
              <Button size="lg" onClick={() => setContactModalOpen(true)} variant="outline">
                Book Strategy Call
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            <div
              className={`glass-panel rounded-[10px] border ${scoreSurfaceClasses[overallTone]} p-6`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Overall score</p>
                  <div className="mt-3 flex items-end gap-3">
                    <div
                      aria-hidden="true"
                      className={`font-display text-6xl font-semibold tracking-[-0.04em] ${scoreTextClasses[overallTone]}`}
                    >
                      <AnimatedScore score={report.overallScore} />
                    </div>
                    <span className="sr-only">{report.overallScore} out of 10</span>
                    <span className="pb-2 text-sm text-muted">/ 10</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    {describeScore(report.overallScore)}
                  </p>
                </div>
                <Badge variant={overallTone}>{overallTone}</Badge>
              </div>

              <Accordion collapsible type="single" className="mt-5">
                <AccordionItem
                  value="overall-methodology"
                  className="border-0 bg-transparent px-0"
                >
                  <AccordionTrigger className="py-0 pr-8 text-sm [&>svg]:right-0 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2">
                    How this score was calculated
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="space-y-3">
                      {methodologyNotes.map((note) => (
                        <div
                          className="rounded-[calc(var(--theme-radius)-4px)] bg-panel/40 px-4 py-3 text-sm leading-6 text-muted"
                          key={note}
                        >
                          {note}
                        </div>
                      ))}
                      <div className="flex items-start gap-3 rounded-[calc(var(--theme-radius)-4px)] bg-accent/8 px-4 py-3 text-sm leading-6 text-foreground">
                        <Info className="mt-0.5 size-4 shrink-0 text-accent" />
                        <p>
                          This is a heuristic audit, not a lab score. Another evaluator may
                          land higher or lower depending on how heavily it weights code,
                          accessibility, or brand polish.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="glass-panel rounded-[10px] p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Profile</p>
              <p className="mt-3 font-display text-2xl font-semibold">
                {report.clientProfile.industryLabel}
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">
                Audience: {report.clientProfile.audience}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
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

            <div className="glass-panel rounded-[10px] p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Observed on page</p>
              <div className="mt-3 space-y-4">
                <p className="text-sm leading-6 text-foreground">
                  {report.siteObservation.aboutSnippet || "No high-confidence business summary was detected, so the audit is leaning more heavily on the visible interface and navigation structure."}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {observedFacts.slice(0, 4).map((fact) => (
                    <div className="rounded-[calc(var(--theme-radius)-2px)] border border-border/70 bg-background-alt/70 px-4 py-3" key={fact.id}>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted">{fact.label}</p>
                        <Badge variant={fact.confidence === "verified" ? "accent" : "neutral"}>
                          {fact.confidence}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-foreground">{fact.value}</p>
                      <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-muted">
                        {fact.source.replace(/-/g, " ")}
                      </p>
                    </div>
                  ))}
                  <div className="rounded-[calc(var(--theme-radius)-2px)] border border-border/70 bg-background-alt/70 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">Actions seen</p>
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
          </div>

          <Accordion
            aria-label="Category score breakdown"
            className="grid gap-4 md:grid-cols-2"
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
                  <AccordionTrigger className="relative items-start gap-3 py-5 pr-8 [&>svg]:absolute [&>svg]:right-0 [&>svg]:top-5 [&>svg]:translate-y-0">
                    <div className="w-full space-y-4">
                      <p className="max-w-[12ch] text-2xl font-semibold leading-tight text-foreground">
                        {score.label}
                      </p>
                      <span
                        className={`block font-display text-5xl leading-none ${scoreTextClasses[tone]}`}
                      >
                        {score.score}
                      </span>
                      <p className="text-sm leading-7 text-muted">{score.summary}</p>
                      <div className="flex items-center gap-3">
                        <Badge variant={tone}>{tone}</Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {score.details.map((detail) => (
                        <div
                          className="rounded-[calc(var(--theme-radius)-4px)] border border-border/70 bg-background-alt/70 px-4 py-3 text-sm leading-6 text-muted"
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

        <div ref={previewRef} className="space-y-4">
          <div className="glass-panel rounded-[10px] p-5">
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
                <TabsList>
                  <TabsTrigger value="desktop">
                    <Monitor className="mr-2 size-4" />
                    Desktop
                  </TabsTrigger>
                  <TabsTrigger value="mobile">
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
    </section>
  );
}
