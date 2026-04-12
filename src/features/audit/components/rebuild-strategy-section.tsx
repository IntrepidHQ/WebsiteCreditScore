"use client";

import { useEffect, useRef } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuditHorizontalRail } from "@/features/audit/components/audit-horizontal-rail";
import { useMotionSettings } from "@/hooks/use-motion-settings";
import type { AuditReport } from "@/lib/types/audit";

export function RebuildStrategySection({ report }: { report: AuditReport }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { reduceMotion } = useMotionSettings();

  useEffect(() => {
    if (reduceMotion || !sectionRef.current) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from("[data-phase-card]", {
        y: 36,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 74%",
          once: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reduceMotion]);

  return (
    <section ref={sectionRef} className="presentation-section" id="strategy">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Rebuild strategy"
          title="A phased plan that bridges diagnosis and purchase"
          description="This turns the audit from critique into an executable phased plan."
        />
        <p className="text-sm text-muted lg:hidden">
          Swipe or scroll sideways to review the phased plan.
        </p>
        <AuditHorizontalRail aria-label="Rebuild strategy phases">
          {report.rebuildPhases.map((phase) => (
            <Card
              data-phase-card
              key={phase.id}
              className="flex h-full min-w-[19rem] max-w-[23rem] flex-col"
            >
              <CardHeader className="space-y-1.5 pb-4">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="accent">{phase.timeline}</Badge>
                  <span className="text-xs uppercase tracking-[0.18em] text-muted">
                    Phase
                  </span>
                </div>
                <CardTitle className="text-[clamp(2.2rem,1.95rem+0.45vw,2.75rem)] leading-[0.98] tracking-[-0.04em]">
                  {phase.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4 pt-0">
                <p className="text-base leading-8 text-muted">{phase.summary}</p>
                <div className="space-y-2.5">
                  {phase.deliverables.map((deliverable) => (
                    <div
                      className="rounded-[calc(var(--theme-radius)-6px)] border border-border/70 bg-background-alt/70 px-4 py-3 text-sm text-foreground"
                      key={deliverable}
                    >
                      {deliverable}
                    </div>
                  ))}
                </div>
                <div className="mt-auto rounded-[calc(var(--theme-radius)-2px)] border border-accent/20 bg-accent/8 p-4 text-sm leading-6 text-foreground">
                  {phase.outcome}
                </div>
              </CardContent>
            </Card>
          ))}
        </AuditHorizontalRail>
      </div>
    </section>
  );
}
