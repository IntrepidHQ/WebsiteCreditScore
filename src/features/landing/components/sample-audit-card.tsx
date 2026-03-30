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

  return (
    <Link href={`/audit/${audit.id}`} className="block h-full">
      <Card className="group h-full overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-accent/30">
        <PreviewImage
          alt={`${audit.title} preview`}
          className="aspect-[16/10]"
          errorLabel="Preview unavailable"
          fallbackSrc={audit.fallbackPreviewImage}
          imageClassName="transition duration-500 group-hover:scale-[1.02]"
          loadingLabel="Capturing desktop screenshot"
          src={audit.previewImage}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background/35 via-transparent to-transparent" />
        </PreviewImage>
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Badge variant="accent">{audit.profile.replace("-", " ")}</Badge>
            <div className="flex items-center gap-3">
              {typeof audit.score === "number" ? (
                <span className="font-sans text-lg font-semibold tracking-[-0.03em] text-foreground">
                  {audit.score} / 10
                </span>
              ) : null}
              <ArrowUpRight className="size-4 text-muted transition group-hover:text-accent" />
            </div>
          </div>
          <CardTitle className="font-display text-[2rem]">{audit.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="line-clamp-2 text-base leading-7 text-muted">{audit.summary}</p>
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
