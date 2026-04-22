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
import { AuditHorizontalRail } from "@/features/audit/components/audit-horizontal-rail";
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
    title: "Lead friction",
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
    title: "Security posture",
    description:
      "What we can infer from HTTPS and response headers in a quick scan — not a penetration test.",
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
  const { reduceMotion } = useMotionSettings();
  const meta = sectionMeta[section];
  const Icon = meta.icon;

  useEffect(() => {
    if (reduceMotion || !sectionRef.current) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from("[data-finding-card]", {
        y: 20,
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
    <section
      ref={sectionRef}
      className="presentation-section"
      id={section === "what-working" ? "findings" : undefined}
    >
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:px-8">
        <div className="space-y-4 lg:pr-8">
          <Badge variant="accent">{meta.title}</Badge>
          <div className="space-y-4">
            <div className="inline-flex size-14 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
              <Icon className="size-6" />
            </div>
            <h2 className="font-display text-[clamp(3.25rem,2.6rem+1vw,4.8rem)] font-semibold tracking-[-0.04em] leading-[0.9]">
              {meta.title}
            </h2>
            <p className="text-[1.08rem] leading-[1.95rem] text-muted">{meta.description}</p>
          </div>
        </div>

        <div className="min-w-0 space-y-3">
          <p className="text-sm text-muted lg:hidden">
            Swipe or scroll sideways to move through these findings.
          </p>
          <AuditHorizontalRail aria-label={`${meta.title} cards`}>
            {findings.length === 0 ? (
              <Card className="h-full min-w-[20rem] max-w-[25rem] border-dashed border-border/80 bg-background-alt/40">
                <CardContent className="p-6 sm:p-7">
                  <p className="text-sm leading-6 text-muted">
                    Nothing flagged here.
                  </p>
                </CardContent>
              </Card>
            ) : null}
            {findings.map((finding) => (
              <Card
                data-finding-card
                key={finding.id}
                className="h-full min-w-[20rem] max-w-[25rem]"
              >
                <CardHeader className="space-y-4 p-6 pb-0 sm:p-7 sm:pb-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={severityBadge(finding.severity)}>{finding.severity}</Badge>
                    <Badge variant="neutral">{finding.confidenceLevel}</Badge>
                    <Badge variant="neutral">{finding.category.replace("-", " ")}</Badge>
                  </div>
                  <CardTitle className="font-display text-[clamp(2.4rem,1.9rem+0.8vw,3.6rem)] leading-[0.9]">
                    {finding.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-4">
                  <div className="hidden space-y-5 md:block">
                    <p className="text-[1.08rem] leading-[1.95rem] text-muted">{finding.summary}</p>
                    {finding.evidence.length > 0 && finding.evidence[0] && (
                      <div className="flex items-start gap-2.5 rounded-[calc(var(--theme-radius)-4px)] border border-border/50 bg-background-alt/40 px-3.5 py-3">
                        <div className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                        <p className="text-sm leading-7 text-muted">
                          <span className="font-semibold text-foreground">{finding.evidence[0].label}: </span>
                          {finding.evidence[0].detail}
                        </p>
                      </div>
                    )}
                    <div className="rounded-[calc(var(--theme-radius)-2px)] border border-border/70 bg-background-alt/70 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                        Business impact
                      </p>
                      <p className="mt-2 text-[1.04rem] leading-[1.9rem] text-foreground">
                        {finding.businessImpact}
                      </p>
                    </div>
                    <div className="rounded-[calc(var(--theme-radius)-2px)] border border-accent/20 bg-accent/8 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
                        Recommendation
                      </p>
                      <p className="mt-2 text-[1.04rem] leading-[1.9rem] text-foreground">
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
                                  className="rounded-[calc(var(--theme-radius)-6px)] border border-border/70 bg-panel/55 px-4 py-3 text-base leading-7 text-muted"
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
                                  <p className="mt-3 text-[1.04rem] leading-[1.9rem] text-foreground">
                                    {item.claim}
                                  </p>
                                  <p className="mt-2 text-[1rem] leading-[1.85rem] text-muted">{item.notes}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  <div className="md:hidden">
                    <Accordion collapsible defaultValue="overview" type="single">
                      <AccordionItem className="border-border/60" value="overview">
                        <AccordionTrigger className="text-sm font-semibold">Overview</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-[1.02rem] leading-[1.9rem] text-muted">{finding.summary}</p>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem className="border-border/60" value="actions">
                        <AccordionTrigger className="text-sm font-semibold">Actions</AccordionTrigger>
                        <AccordionContent className="space-y-3">
                          <div className="rounded-[calc(var(--theme-radius)-2px)] border border-border/70 bg-background-alt/70 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                              Business impact
                            </p>
                            <p className="mt-2 text-[1.02rem] leading-[1.85rem] text-foreground">
                              {finding.businessImpact}
                            </p>
                          </div>
                          <div className="rounded-[calc(var(--theme-radius)-2px)] border border-accent/20 bg-accent/8 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
                              Recommendation
                            </p>
                            <p className="mt-2 text-[1.02rem] leading-[1.85rem] text-foreground">
                              {finding.recommendation}
                            </p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem className="border-border/60" value="evidence">
                        <AccordionTrigger className="text-sm font-semibold">Evidence</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              {finding.evidence.map((evidence) => (
                                <div
                                  className="rounded-[calc(var(--theme-radius)-6px)] border border-border/70 bg-panel/55 px-3 py-3 text-sm leading-7 text-muted"
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
                                  className="rounded-[calc(var(--theme-radius)-6px)] border border-border/70 bg-panel/55 px-3 py-3"
                                  key={item.id}
                                >
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="accent">{item.impactLabel}</Badge>
                                    <span className="text-[10px] uppercase tracking-[0.16em] text-muted">
                                      {item.sourceLabel}
                                    </span>
                                  </div>
                                  <p className="mt-2 text-sm leading-7 text-foreground">{item.claim}</p>
                                  <p className="mt-2 text-xs leading-6 text-muted">{item.notes}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </CardContent>
              </Card>
            ))}
          </AuditHorizontalRail>
        </div>
      </div>
    </section>
  );
}
