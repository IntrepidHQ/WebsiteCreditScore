"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, BadgeCheck, ShieldAlert, Sparkles, Zap } from "lucide-react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMotionSettings } from "@/hooks/use-motion-settings";
import type { Finding, FindingSection as FindingSectionKey } from "@/lib/types/audit";

const sectionMeta: Record<
  FindingSectionKey,
  { title: string; description: string; icon: typeof Sparkles }
> = {
  "what-working": {
    title: "What’s Working",
    description:
      "Lead with fairness. The strongest proposals start by preserving what already builds trust.",
    icon: BadgeCheck,
  },
  "costing-leads": {
    title: "What’s Costing You Leads",
    description:
      "These are the areas where the current site is creating friction, hesitation, or a weaker first impression than the business deserves.",
    icon: AlertTriangle,
  },
  "technical-seo": {
    title: "Technical and SEO Findings",
    description:
      "Search structure and technical clarity should support conversion, not live in a separate silo.",
    icon: Zap,
  },
  "security-posture": {
    title: "Security Posture",
    description:
      "These are passive, observable trust and hardening indicators presented without fear-based framing.",
    icon: ShieldAlert,
  },
};

function severityBadge(severity: Finding["severity"]) {
  if (severity === "high") {
    return "danger" as const;
  }

  if (severity === "medium") {
    return "warning" as const;
  }

  return "success" as const;
}

export function FindingsSection({
  section,
  findings,
}: {
  section: FindingSectionKey;
  findings: Finding[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const { reduceMotion } = useMotionSettings();
  const meta = sectionMeta[section];
  const Icon = meta.icon;

  useEffect(() => {
    if (reduceMotion || !sectionRef.current || !introRef.current) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const desktopOnly = window.matchMedia("(min-width: 1024px)").matches;

    const ctx = gsap.context(() => {
      gsap.from("[data-finding-card]", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          once: true,
        },
      });

      if (desktopOnly) {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top+=110",
          end: "bottom bottom-=120",
          pin: introRef.current,
          pinSpacing: false,
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      className="presentation-section"
      id={section === "what-working" ? "findings" : undefined}
    >
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:px-8">
        <div ref={introRef} className="space-y-4 lg:pr-8">
          <Badge variant="accent">{meta.title}</Badge>
          <div className="space-y-4">
            <div className="inline-flex size-14 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
              <Icon className="size-6" />
            </div>
            <h2 className="font-display text-4xl font-semibold tracking-[-0.03em]">
              {meta.title}
            </h2>
            <p className="text-base leading-7 text-muted">{meta.description}</p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted lg:hidden">
            Swipe or scroll sideways to move through these findings.
          </p>
          <div aria-label={`${meta.title} cards`} className="horizontal-rail" tabIndex={0}>
            {findings.map((finding) => (
              <Card
                data-finding-card
                key={finding.id}
                className="h-full min-w-[20rem] max-w-[25rem]"
              >
                <CardHeader className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={severityBadge(finding.severity)}>{finding.severity}</Badge>
                    <Badge variant="neutral">{finding.confidenceLevel}</Badge>
                    <Badge variant="neutral">{finding.category.replace("-", " ")}</Badge>
                  </div>
                  <CardTitle className="text-3xl">{finding.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <p className="text-sm leading-7 text-muted">{finding.summary}</p>
                  <div className="rounded-[calc(var(--theme-radius)-2px)] border border-border/70 bg-background-alt/70 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">
                      Business impact
                    </p>
                    <p className="mt-2 text-sm leading-6 text-foreground">
                      {finding.businessImpact}
                    </p>
                  </div>
                  <div className="rounded-[calc(var(--theme-radius)-2px)] border border-accent/20 bg-accent/8 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-accent">
                      Recommendation
                    </p>
                    <p className="mt-2 text-sm leading-6 text-foreground">
                      {finding.recommendation}
                    </p>
                  </div>
                  <Accordion collapsible type="single">
                    <AccordionItem className="bg-background-alt/60 px-4" value="evidence">
                      <AccordionTrigger>Evidence and scoring support</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            {finding.evidence.map((evidence) => (
                              <div
                                className="rounded-[calc(var(--theme-radius)-6px)] border border-border/70 bg-panel/55 px-4 py-3 text-sm leading-6 text-muted"
                                key={evidence.id}
                              >
                                <span className="font-semibold text-foreground">
                                  {evidence.label}:{" "}
                                </span>
                                {evidence.detail}
                              </div>
                            ))}
                          </div>
                          <div className="space-y-2">
                            {finding.benchmark.map((item) => (
                              <div
                                className="rounded-[calc(var(--theme-radius)-6px)] border border-border/70 bg-panel/55 px-4 py-3"
                                key={item.id}
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge variant="accent">{item.impactLabel}</Badge>
                                  <span className="text-xs uppercase tracking-[0.18em] text-muted">
                                    {item.sourceLabel}
                                  </span>
                                </div>
                                <p className="mt-3 text-sm leading-6 text-foreground">
                                  {item.claim}
                                </p>
                                <p className="mt-2 text-xs leading-5 text-muted">{item.notes}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
