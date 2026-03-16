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

export default function PlatformPage() {
  const samples = getSampleAuditCards();

  return (
    <main className="presentation-section pt-10" id="main-content">
      <section className="pb-8">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:px-8">
          <div className="space-y-6">
            <Badge variant="accent">Platform</Badge>
            <h1 className="font-display text-5xl font-semibold tracking-[-0.05em] text-foreground sm:text-6xl">
              One workflow for auditing, pitching, and scoping service-business sites.
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-muted">
              Keep the explanation short. Let the live examples carry the proof.
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
              <div className="space-y-2 text-sm leading-7 text-muted">
                <p>Audit the live site.</p>
                <p>Generate the packet and intro email.</p>
                <p>Qualify scope before wireframes or build.</p>
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
            description="The product explanation is brief. The examples do the selling."
          />
          <div className="grid gap-5 lg:grid-cols-3">
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
