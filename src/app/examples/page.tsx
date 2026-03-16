import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSampleAuditCards } from "@/lib/mock/report-builder";
import { SampleAuditCard } from "@/features/landing/components/sample-audit-card";

export default function ExamplesPage() {
  const samples = getSampleAuditCards();

  return (
    <main className="presentation-section pt-10" id="main-content">
      <section className="pb-8">
        <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Examples"
            title="Real website examples"
            description="Each sample is grounded in a live site."
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
            eyebrow="Open the workflow"
            title="Review the audit, packet, and brief together"
            description="Open the sample flow and review the pieces together."
          />
          <Card className="overflow-hidden">
            <CardContent className="flex flex-col gap-5 p-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <Badge variant="accent">Next step</Badge>
                <h2 className="font-display text-4xl font-semibold tracking-[-0.03em] text-foreground">
                  Open the sample audit, packet, and brief together
                </h2>
                <p className="max-w-3xl text-base leading-7 text-muted">
                  The audit shows the full review. The packet and brief show the shorter client-facing path that follows.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/audit/mark-deford-md">
                    Open sample audit
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/brief/mark-deford-md">
                    <FileText className="size-4" />
                    Open brief
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
