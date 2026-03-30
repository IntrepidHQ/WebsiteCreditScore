"use client";

import { useEffect, useRef } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { DevicePreview } from "@/components/common/device-preview";
import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMotionSettings } from "@/hooks/use-motion-settings";
import type { AuditReport } from "@/lib/types/audit";

function OpportunityCard({
  opportunity,
}: {
  opportunity: AuditReport["opportunities"][number];
}) {
  return (
    <Card className="h-full w-full min-w-0">
      <CardHeader className="space-y-2">
        <Badge variant="accent">{opportunity.impactLabel}</Badge>
        <CardTitle className="text-[clamp(2.25rem,2rem+0.45vw,2.85rem)] leading-[0.98] tracking-[-0.04em]">
          {opportunity.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-muted">{opportunity.summary}</p>
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <div className="rounded-[calc(var(--theme-radius))] border border-border/70 bg-background-alt/75 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Before</p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              {opportunity.currentState}
            </p>
          </div>
          <div className="rounded-[calc(var(--theme-radius))] border border-accent/20 bg-accent/8 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-accent">After</p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              {opportunity.futureState}
            </p>
          </div>
        </div>
        <div className="rounded-[10px] border border-border/70 bg-panel/55 px-4 py-3">
          <p className="text-sm text-foreground">{opportunity.claim}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">
            {opportunity.sourceLabel}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function BeforeAfterSection({ report }: { report: AuditReport }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { reduceMotion } = useMotionSettings();

  useEffect(() => {
    if (reduceMotion || !sectionRef.current) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from("[data-opportunity-card]", {
        y: 18,
        opacity: 0,
        duration: 0.55,
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
    <section ref={sectionRef} className="presentation-section" id="vision">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 sm:px-6 xl:grid-cols-[minmax(0,0.97fr)_minmax(0,1.03fr)] xl:items-start xl:gap-8 lg:px-8">
        <div className="space-y-4 xl:space-y-5">
          <SectionHeading
            eyebrow="Before / after vision"
            title="What the upgraded site could actually feel like"
            description="Show the direction early so the client can react to structure and flow before design production begins."
          />
          <div className="grid gap-4 min-[900px]:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <DevicePreview
              alt={`${report.title} current site`}
              device="desktop"
              fallbackImage={report.previewSet.fallbackCurrent.desktop}
              image={report.previewSet.current.desktop}
              label="Current capture"
            />
            <DevicePreview
              alt={`${report.title} upgraded concept`}
              device="desktop"
              fallbackImage={report.previewSet.fallbackFuture.desktop}
              highlight
              image={report.previewSet.future.desktop}
              label="Design direction"
              treatment="future"
            />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted md:hidden">
            Swipe or scroll sideways to compare upgrade opportunities.
          </p>
          <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            {report.opportunities.map((opportunity) => (
              <div data-opportunity-card key={opportunity.id}>
                <OpportunityCard opportunity={opportunity} />
              </div>
            ))}
          </div>
          <div
            aria-label="Upgrade opportunity cards"
            className="horizontal-rail [grid-auto-columns:minmax(20rem,22rem)] gap-4 md:hidden"
            tabIndex={0}
          >
            {report.opportunities.map((opportunity) => (
              <div data-opportunity-card key={opportunity.id}>
                <OpportunityCard opportunity={opportunity} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
