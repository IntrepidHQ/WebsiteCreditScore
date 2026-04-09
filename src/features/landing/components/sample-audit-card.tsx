"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { PreviewImage } from "@/components/common/preview-image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SampleAuditCard as SampleAuditCardType } from "@/lib/types/audit";

function formatScannedAt(input?: string) {
  if (!input) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(input));
}

export function SampleAuditCard({ audit }: { audit: SampleAuditCardType }) {
  const scannedAt = formatScannedAt(audit.scannedAt);
  const summary = audit.executiveSummary ?? audit.summary;
  const auditHref = audit.url
    ? `/audit/${audit.id}?url=${encodeURIComponent(audit.url)}`
    : `/audit/${audit.id}`;

  return (
    <Link href={auditHref} className="block h-full">
      <Card className="group h-full overflow-hidden rounded-[24px] border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_88%,transparent),color-mix(in_srgb,var(--theme-background-alt)_96%,transparent))] shadow-[0_20px_60px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-1 hover:border-accent/30">
        <PreviewImage
          alt={`${audit.title} preview`}
          className="aspect-[21/10]"
          errorLabel="Preview unavailable"
          fallbackSrc={audit.fallbackPreviewImage}
          imageClassName="transition duration-500 group-hover:scale-[1.02]"
          loadingLabel="Capturing desktop screenshot"
          src={audit.previewImage}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background/35 via-transparent to-transparent" />
        </PreviewImage>
        <CardHeader className="space-y-2 pb-2">
          <div className="flex items-center justify-between gap-3">
            <Badge variant="accent">{audit.profile.replace("-", " ")}</Badge>
            <div className="flex items-center gap-3">
              {typeof audit.score === "number" ? (
                <span className="font-sans text-xl font-semibold tracking-[-0.03em] text-foreground">
                  {audit.score} / 10
                </span>
              ) : null}
              <ArrowUpRight className="size-4 text-muted transition group-hover:text-accent" />
            </div>
          </div>
          <CardTitle className="font-display text-[clamp(2.4rem,1.9rem+0.8vw,3.4rem)] leading-[0.92]">
            {audit.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 pt-0">
          <p className="line-clamp-3 text-[1rem] leading-7 text-muted">{summary}</p>
          <p className="truncate text-xs uppercase tracking-[0.18em] text-muted">{audit.url}</p>
          {scannedAt ? (
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              Scored {scannedAt}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
