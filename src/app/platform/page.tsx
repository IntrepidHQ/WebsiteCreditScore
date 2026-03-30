import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSampleAuditCards } from "@/lib/mock/report-builder";
import { SampleAuditCard } from "@/features/landing/components/sample-audit-card";

const verticalCards = [
  {
    title: "Private practices",
    description:
      "Trust, provider credibility, insurance clarity, and mobile appointment paths drive the packet narrative.",
  },
  {
    title: "Home services",
    description:
      "Speed to reassurance, proof of workmanship, service area depth, and estimate flow shape the offer.",
  },
  {
    title: "Other service professionals",
    description:
      "The specifics change by niche, but the delivery spine stays consistent: message, trust, CTA flow, and operational clarity.",
  },
] as const;

const capabilitySteps = [
  {
    step: "01",
    title: "Audit the live site",
    detail: "Capture the current experience, key signals, and score drivers.",
  },
  {
    step: "02",
    title: "Generate the packet and intro email",
    detail: "Turn the audit into a sendable close asset without rewriting it by hand.",
  },
  {
    step: "03",
    title: "Qualify scope before wireframes or build",
    detail: "Use discovery answers to tighten scope before production starts.",
  },
] as const;

export default function PlatformPage() {
  const samples = getSampleAuditCards();

  return (
    <main className="presentation-section pt-10" id="main-content">
      <section className="pb-8">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:px-8">
          <div className="space-y-6">
            <Badge variant="accent">Platform</Badge>
            <h1 className="font-display text-[clamp(4rem,2.75rem+4vw,7.75rem)] font-semibold tracking-[-0.055em] text-foreground">
              One workflow for auditing, pitching, and scoping service-business sites.
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-muted">
              Live examples carry the proof.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/audit/mark-deford-md">
                  Open sample audit
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/brief/mark-deford-md">
                  Review brief workflow
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="space-y-5 p-8">
              <Badge variant="neutral">Essential capability</Badge>
              <div className="space-y-3">
                {capabilitySteps.map((item) => (
                  <div
                    className="grid gap-3 rounded-[8px] border border-border/70 bg-background-alt/60 px-4 py-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start"
                    key={item.step}
                  >
                    <div className="inline-flex w-fit items-center rounded-[6px] border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                      {item.step}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="text-sm leading-6 text-muted">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="presentation-section py-8">
        <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Example reports"
            title="Use real sites to show the workflow"
            description="Real sites do the selling."
          />
          <div className="grid gap-5 xl:grid-cols-2">
            {samples.map((audit) => (
              <SampleAuditCard audit={audit} key={audit.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="presentation-section py-8">
        <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Core steps"
            title="Keep the process reusable"
            description="The business type changes. The close flow does not."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {verticalCards.map((card) => (
              <Card className="h-full" key={card.title}>
                <CardContent className="space-y-3 p-6">
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                    <CheckCircle2 className="size-4 text-success" />
                    {card.title}
                  </div>
                  <p className="text-sm leading-7 text-muted">{card.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
