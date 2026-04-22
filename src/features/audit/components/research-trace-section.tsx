"use client";

import { Check, FileSearch, Minus, ScanLine, XCircle } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuditReport } from "@/lib/types/audit";
import { cn } from "@/lib/utils/cn";

export function ResearchTraceSection({ report }: { report: AuditReport }) {
  const { researchTrace, provenance } = report;
  const isEstimated = provenance.mode !== "live-observed";

  return (
    <section className="presentation-section" id="research-trace">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:px-8">
        <div className="space-y-4 lg:pr-8">
          <Badge variant="accent">Research Trace</Badge>
          <div className="space-y-4">
            <div className="inline-flex size-14 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
              <ScanLine className="size-6" />
            </div>
            <h2 className="font-display text-[clamp(3.25rem,2.6rem+1vw,4.8rem)] font-semibold tracking-[-0.04em] leading-[0.9]">
              How this was researched
            </h2>
            <p className="text-[1.08rem] leading-[1.95rem] text-muted">
              Every finding is grounded in signals pulled directly from the live site. Here is exactly what was analyzed and what was found at each step.
            </p>
          </div>
          {isEstimated && (
            <div className="rounded-xl border border-warning/25 bg-warning/8 p-4">
              <p className="text-sm leading-6 text-muted">
                <span className="font-semibold text-warning">Estimated mode.</span>{" "}
                Live signals were unavailable for this scan. Analysis is based on heuristic baselines.
              </p>
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-4">
          <Card>
            <CardContent className="p-0">
              <Accordion collapsible type="single">
                {researchTrace.steps.map((step) => (
                  <AccordionItem
                    className="border-border/60 last:border-0"
                    key={step.pass}
                    value={`pass-${step.pass}`}
                  >
                    <AccordionTrigger className="px-5 py-4 hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <div
                          className={cn(
                            "flex size-6 shrink-0 items-center justify-center rounded-full",
                            step.status === "complete"
                              ? "bg-success/15 text-success"
                              : "bg-warning/15 text-warning",
                          )}
                        >
                          {step.status === "complete" ? (
                            <Check className="size-3.5" />
                          ) : (
                            <Minus className="size-3.5" />
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                            Pass {step.pass}
                          </p>
                          <p className="text-base font-semibold text-foreground">{step.label}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-5">
                      <div className="space-y-3 pl-9">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                            Analyzed
                          </p>
                          <p className="mt-1 text-sm leading-6 text-muted">{step.what}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                            Found
                          </p>
                          <p className="mt-1 text-sm font-medium leading-6 text-foreground">{step.found}</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="px-5 pb-3 pt-5">
                <div className="flex items-center gap-2">
                  <FileSearch className="size-4 text-accent" />
                  <CardTitle className="text-sm font-semibold">Extracted from site</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 px-5 pb-5">
                {researchTrace.extractedElements.heroText ? (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                      Hero text
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm font-medium text-foreground">
                      &ldquo;{researchTrace.extractedElements.heroText}&rdquo;
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                      Hero text
                    </p>
                    <p className="mt-1 text-sm text-muted">Not detected</p>
                  </div>
                )}

                {researchTrace.extractedElements.ctaLabels.length > 0 ? (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                      CTAs found
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {researchTrace.extractedElements.ctaLabels.map((cta, i) => (
                        <span
                          className="rounded border border-border/70 bg-background-alt/60 px-2 py-0.5 text-xs font-medium"
                          key={i}
                        >
                          {cta}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                      CTAs found
                    </p>
                    <p className="mt-1 text-sm text-muted">None detected</p>
                  </div>
                )}

                {researchTrace.extractedElements.trustSignals.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                      Trust signals
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {researchTrace.extractedElements.trustSignals.map((signal, i) => (
                        <li className="line-clamp-1 text-xs text-muted" key={i}>
                          {signal}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="px-5 pb-3 pt-5">
                <div className="flex items-center gap-2">
                  <XCircle className="size-4 text-danger" />
                  <CardTitle className="text-sm font-semibold">Missing signals</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {researchTrace.missingSignals.length === 0 ? (
                  <p className="text-sm text-muted">No critical signals missing.</p>
                ) : (
                  <ul className="space-y-2">
                    {researchTrace.missingSignals.map((signal, i) => (
                      <li className="flex items-start gap-2" key={i}>
                        <XCircle className="mt-0.5 size-3.5 shrink-0 text-danger" />
                        <p className="text-sm leading-6 text-muted">{signal}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
