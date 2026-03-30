import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/common/section-heading";
import { SampleAuditCard } from "@/features/landing/components/sample-audit-card";
import type { SampleAuditCard as SampleAuditCardType } from "@/lib/types/audit";

export function LandingRecentReportsSection({
  samples,
}: {
  samples: SampleAuditCardType[];
}) {
  const scoredSamples = samples.filter((sample) => typeof sample.score === "number");
  const averageScore = scoredSamples.length
    ? (
        scoredSamples.reduce((sum, sample) => sum + (sample.score ?? 0), 0) /
        scoredSamples.length
      ).toFixed(1)
    : "0.0";

  return (
    <section className="presentation-section py-8" id="reports">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <SectionHeading
            description="These examples prove the score is grounded in live sites, not abstract advice. Each one is there to show how the review becomes a stronger redesign conversation."
            eyebrow="Recent scans"
            title="Real scored examples, kept public on purpose"
          />
          <div className="flex flex-wrap gap-3">
            <div className="rounded-full border border-border/60 bg-panel/40 px-4 py-2 text-sm text-foreground">
              {samples.length} public samples
            </div>
            <div className="rounded-full border border-border/60 bg-panel/40 px-4 py-2 text-sm text-foreground">
              Average score {averageScore}
            </div>
            <Badge variant="accent">Live site grounded</Badge>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {samples.map((audit) => (
            <SampleAuditCard audit={audit} key={audit.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
