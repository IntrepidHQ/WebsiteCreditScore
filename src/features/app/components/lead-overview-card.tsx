import type { ReactNode } from "react";

import { PreviewImage } from "@/components/common/preview-image";
import { ScoreMeter } from "@/components/common/score-meter";
import { cn } from "@/lib/utils/cn";

export function LeadOverviewCard({
  actions,
  currentScore,
  fallbackImage,
  loadingLabel = "Capturing preview",
  meta,
  previewAlt,
  previewClassName,
  previewFallbackLabel = "Using site image",
  previewImage,
  projectedScore,
  scoreLabel = "Current score",
  scoreValueClassName,
  summary,
  title,
  titleClassName,
}: {
  actions?: ReactNode;
  currentScore: number;
  fallbackImage: string;
  loadingLabel?: string;
  meta?: ReactNode;
  previewAlt: string;
  previewClassName?: string;
  previewFallbackLabel?: string;
  previewImage: string;
  projectedScore?: number;
  scoreLabel?: string;
  scoreValueClassName?: string;
  summary: string;
  title: string;
  titleClassName?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[14px] border border-border/70 bg-panel/72 shadow-[var(--theme-shadow)]",
        previewClassName,
      )}
    >
      <PreviewImage
        alt={previewAlt}
        className="aspect-[16/6] h-full min-h-36 sm:min-h-40"
        fallbackLabel={previewFallbackLabel}
        loadingLabel={loadingLabel}
        src={previewImage || fallbackImage}
      />

      <div className="grid gap-6 p-6 sm:p-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(17rem,0.85fr)] lg:items-start">
        <div className="min-w-0 space-y-3">
          <p
            className={cn(
              "font-display text-[clamp(2.9rem,2.2rem+1.2vw,4.4rem)] font-semibold leading-[0.94] tracking-[-0.055em] text-foreground",
              titleClassName,
            )}
          >
            {title}
          </p>
          <p className="max-w-3xl text-[1.18rem] leading-[2rem] text-muted sm:text-[1.24rem]">
            {summary}
          </p>
          {meta ? <div>{meta}</div> : null}
        </div>

        <div className="flex min-w-0 flex-col gap-4 lg:border-l lg:border-border/60 lg:pl-6">
          {actions ? <div className="flex flex-wrap items-center gap-2 lg:justify-end">{actions}</div> : null}
          <ScoreMeter
            className="max-w-[17.5rem] lg:ml-auto"
            compact
            label={scoreLabel}
            projectedScore={projectedScore}
            score={currentScore}
            valueClassName={cn("tracking-[-0.06em]", scoreValueClassName)}
          />
        </div>
      </div>
    </div>
  );
}
