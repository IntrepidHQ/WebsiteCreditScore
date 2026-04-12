"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { PreviewImage } from "@/components/common/preview-image";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import type { SampleAuditCard as SampleAuditCardType } from "@/lib/types/audit";

export function SampleAuditCard({ audit }: { audit: SampleAuditCardType }) {
  const auditHref = audit.url
    ? `/audit/${audit.id}?url=${encodeURIComponent(audit.url)}`
    : `/audit/${audit.id}`;

  return (
    <Link href={auditHref} className="group block h-full">
      <SpotlightCard
        className="h-full rounded-[20px] border border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_88%,transparent),color-mix(in_srgb,var(--theme-background-alt)_96%,transparent))] shadow-[0_20px_60px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-1 hover:border-accent/30"
        spotlightColor="rgba(247,178,27,0.10)"
      >
        {/* Screenshot area */}
        <div className="relative overflow-hidden rounded-t-[18px]">
          <PreviewImage
            alt={`${audit.title} preview`}
            className="aspect-[4/3]"
            errorLabel="Preview unavailable"
            fallbackSrc={audit.fallbackPreviewImage}
            imageClassName="transition duration-500 group-hover:scale-[1.04]"
            loadingLabel="Capturing screenshot"
            src={audit.previewImage}
          >
            {/* Top fade */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background/30 via-transparent to-transparent" />
            {/* Hover URL overlay */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-background/90 via-background/60 to-transparent px-3 pb-3 pt-8 transition duration-300 group-hover:translate-y-0">
              <p className="truncate text-[11px] uppercase tracking-[0.16em] text-muted">
                {audit.url}
              </p>
            </div>
          </PreviewImage>
          {/* Score badge */}
          {typeof audit.score === "number" && (
            <div className="absolute bottom-3 right-3 rounded-full border border-border/60 bg-background/90 px-2.5 py-1 backdrop-blur-sm">
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {audit.score}
                <span className="text-muted">/10</span>
              </span>
            </div>
          )}
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <p className="truncate text-sm font-semibold text-foreground">{audit.title}</p>
          <ArrowUpRight className="size-4 shrink-0 text-muted transition group-hover:text-accent" />
        </div>
      </SpotlightCard>
    </Link>
  );
}
