"use client";

import { Badge } from "@/components/ui/badge";
import { PreviewImage } from "@/components/common/preview-image";
import { cn } from "@/lib/utils/cn";

type PreviewTreatment = "current" | "future";

function TreatmentOverlay({ treatment }: { treatment: PreviewTreatment }) {
  if (treatment === "current") {
    return (
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background/35 via-transparent to-transparent" />
    );
  }

  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--theme-accent)_18%,transparent),transparent_42%,color-mix(in_srgb,var(--theme-glow)_16%,transparent))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-background/50 via-transparent to-transparent" />
      <div className="pointer-events-none absolute bottom-4 left-4 rounded-[calc(var(--theme-radius)-6px)] border border-accent/25 bg-panel/82 px-3 py-2 backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
          Direction overlay
        </p>
        <p className="mt-1 text-xs text-foreground">Sharper hierarchy, cleaner CTA path</p>
      </div>
    </>
  );
}

export function DevicePreview({
  image,
  fallbackImage,
  alt,
  label,
  device,
  highlight = false,
  treatment = "current",
}: {
  image: string;
  fallbackImage?: string;
  alt: string;
  label: string;
  device: "desktop" | "mobile";
  highlight?: boolean;
  treatment?: PreviewTreatment;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[10px] border border-border/70 bg-panel/75 p-3 shadow-[var(--theme-shadow)] backdrop-blur-sm",
        highlight && "ring-1 ring-accent/30",
        device === "mobile" && "mx-auto max-w-[18rem]",
      )}
    >
      <div className="mb-3 flex items-center justify-between px-1.5">
        <Badge variant={highlight ? "accent" : "neutral"}>{label}</Badge>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-danger/80" />
          <span className="size-2 rounded-full bg-warning/80" />
          <span className="size-2 rounded-full bg-success/80" />
        </div>
      </div>
      <PreviewImage
        alt={alt}
        className={cn(
          "rounded-[6px] border border-border/70",
          device === "desktop" ? "aspect-[16/10] max-h-[44rem]" : "aspect-[9/18] max-h-[44rem]",
        )}
        fallbackLabel="Using site image"
        fallbackSrc={fallbackImage}
        imageClassName={cn(
          "transition duration-700",
          treatment === "future" && "scale-[1.02] saturate-[1.06]",
        )}
        loadingLabel={device === "mobile" ? "Capturing mobile screenshot" : "Capturing desktop screenshot"}
        scrollable
        src={image}
      >
        <TreatmentOverlay treatment={treatment} />
      </PreviewImage>
    </div>
  );
}
