/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { Target } from "lucide-react";

import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuditReport } from "@/lib/types/audit";
import { getTenOutOfTenNotes } from "@/lib/mock/report-enhancements";

function BenchmarkPreview({
  image,
  fallbackImage,
  alt,
}: {
  image: string;
  fallbackImage: string;
  alt: string;
}) {
  const [src, setSrc] = useState(image);

  useEffect(() => {
    setSrc(image);
  }, [image]);

  return (
    <div className="relative aspect-[16/10] overflow-hidden border-b border-border/70 bg-background-alt">
      <img
        alt={alt}
        className="h-full w-full object-cover object-top"
        onError={() => {
          if (src !== fallbackImage) {
            setSrc(fallbackImage);
          }
        }}
        src={src}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/45 via-transparent to-transparent" />
    </div>
  );
}

export function BenchmarkSection({ report }: { report: AuditReport }) {
  const notes = getTenOutOfTenNotes();

  return (
    <section className="presentation-section" id="benchmarks">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Reference bar"
          title="What a high-scoring site looks like"
          description="Use these live references as a concrete benchmark for what 9+ clarity, polish, and trust can look like."
        />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <Card>
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-2 text-accent">
                <Target className="size-4" />
                10/10 benchmark
              </div>
              <CardTitle className="text-3xl">Aspirational, not imaginary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notes.map((note) => (
                <div
                  className="rounded-[calc(var(--theme-radius)-4px)] border border-border/70 bg-background-alt/70 px-4 py-3 text-sm leading-6 text-muted"
                  key={note}
                >
                  {note}
                </div>
              ))}
            </CardContent>
          </Card>

          <div aria-label="Benchmark references" className="horizontal-rail gap-4" tabIndex={0}>
            {report.benchmarkReferences.map((reference) => (
              <Card className="min-w-[21rem] overflow-hidden" key={reference.id}>
                <BenchmarkPreview
                  alt={`${reference.name} benchmark preview`}
                  fallbackImage={report.previewSet.fallbackCurrent}
                  image={reference.previewImage}
                />
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="accent">Target score {reference.targetScore}</Badge>
                    <span className="text-xs uppercase tracking-[0.18em] text-muted">
                      {reference.sourceLabel}
                    </span>
                  </div>
                  <CardTitle>{reference.name}</CardTitle>
                  <p className="text-sm leading-6 text-muted">{reference.note}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">{reference.url}</p>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {reference.strengths.map((strength) => (
                    <Badge className="normal-case tracking-normal" key={strength} variant="neutral">
                      {strength.replace(/-/g, " ")}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
