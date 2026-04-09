"use client";

import type { ReactNode } from "react";

import { PreviewImage } from "@/components/common/preview-image";
import { cn } from "@/lib/utils/cn";

/**
 * Workspace preview: screenshot only (`/api/preview` or stored URL). Live iframes are not used
 * (embedding is blocked on most real sites and adds clutter).
 */
export function PreviewWithLiveToggle({
  screenshotSrc,
  fallbackSrc,
  alt,
  className,
  previewClassName = "aspect-[16/11] w-full",
  imageClassName,
  loadingLabel,
  fallbackLabel,
  screenshotOverlay,
}: {
  screenshotSrc: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  previewClassName?: string;
  imageClassName?: string;
  loadingLabel?: string;
  fallbackLabel?: string;
  screenshotOverlay?: ReactNode;
}) {
  return (
    <div className={cn("w-full", className)}>
      <PreviewImage
        alt={alt}
        className={cn("overflow-hidden rounded-[14px]", previewClassName)}
        fallbackLabel={fallbackLabel}
        fallbackSrc={fallbackSrc}
        imageClassName={imageClassName}
        loadingLabel={loadingLabel}
        src={screenshotSrc}
      >
        {screenshotOverlay}
      </PreviewImage>
    </div>
  );
}
