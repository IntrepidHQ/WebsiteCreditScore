"use client";

import { BarChart3 } from "lucide-react";

import { PreviewImage } from "@/components/common/preview-image";
import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuditHorizontalRail } from "@/features/audit/components/audit-horizontal-rail";
import type { AuditReport } from "@/lib/types/audit";
import { getScoreTone } from "@/lib/utils/scores";

const barClasses = {
  success: "bg-success",
  accent: "bg-accent",
  warning: "bg-warning",
  danger: "bg-danger",
} as const;

function ComparisonPreview({
  alt,
  image,
  fallbackImage,
}: {
  alt: string;
  image: string;
  fallbackImage: string;
}) {
  return (
    <PreviewImage
      alt={alt}
      className="aspect-[16/10] border-b border-border/70"
      fallbackSrc={fallbackImage}
      loadingLabel="Capturing desktop screenshot"
      src={image}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/40 via-transparent to-transparent" />
    </PreviewImage>
  );
}

export function ComparisonSection({ report }: { report: AuditReport }) {
  return (
    <section className="presentation-section" id="comparison">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Comparison set"
          title="See the current site next to live reference sites"
          description="A quick side-by-side makes the opportunity easier to explain."
        />
        <p className="text-sm text-muted lg:hidden">
          Swipe or scroll sideways to compare screenshots and headline metrics.
        </p>
        <AuditHorizontalRail aria-label="Comparison cards">
          {report.competitorSnapshots.map((snapshot) => (
            <Card key={snapshot.id} className="min-w-[20rem] overflow-hidden">
              <ComparisonPreview
                alt={`${snapshot.name} preview`}
                fallbackImage={report.previewSet.fallbackCurrent.desktop}
                image={snapshot.previewImage}
              />
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant={snapshot.relationship === "your-site" ? "accent" : "neutral"}>
                    {snapshot.relationship === "your-site" ? "Current site" : "Reference site"}
                  </Badge>
                  <BarChart3 className="size-4 text-accent" />
                </div>
                <CardTitle>{snapshot.name}</CardTitle>
                <p className="text-sm leading-6 text-muted">{snapshot.note}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-muted">{snapshot.url}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {snapshot.metrics.map((metric) => (
                  <div key={metric.id} className="space-y-2">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-muted">{metric.label}</span>
                      <span className="font-semibold text-foreground">{metric.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-background-alt">
                      <div
                        className={`h-full rounded-full ${barClasses[getScoreTone(metric.value / 10)]}`}
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </AuditHorizontalRail>
      </div>
    </section>
  );
}
