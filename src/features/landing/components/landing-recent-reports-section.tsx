import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/common/section-heading";
import { SampleAuditCard } from "@/features/landing/components/sample-audit-card";
import type { SampleAuditCard as SampleAuditCardType } from "@/lib/types/audit";

export function LandingRecentReportsSection({
  samples,
  eyebrow = "Recent scans",
  title = "Recent scans that show what stronger websites do differently",
  description = "Each scan starts with a live site and ends with a clearer view of what is helping, what is hurting, and what to fix first.",
}: {
  samples: SampleAuditCardType[];
  eyebrow?: string;
  title?: string;
  description?: string;
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
            description={description}
            eyebrow={eyebrow}
            title={title}
          />
          <div className="flex flex-wrap gap-3">
            <div className="rounded-full border border-border/60 bg-panel/40 px-4 py-2 text-sm text-foreground">
              {samples.length} recent scans
            </div>
            <div className="rounded-full border border-border/60 bg-panel/40 px-4 py-2 text-sm text-foreground">
              Average score {averageScore}
            </div>
            <Badge variant="accent">Built from live sites</Badge>
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
