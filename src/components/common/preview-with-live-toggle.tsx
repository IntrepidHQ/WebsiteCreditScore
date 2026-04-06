"use client";

import type { ReactNode } from "react";

import { ExternalLink } from "lucide-react";

import { PreviewImage } from "@/components/common/preview-image";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils/cn";

/**
 * Screenshot (cached /api/preview) plus optional in-app “live” view.
 * Most production sites send `X-Frame-Options` or CSP `frame-ancestors` and cannot be embedded;
 * the live tab is best-effort; “Open in new tab” always works.
 */
export function PreviewWithLiveToggle({
  normalizedUrl,
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
  normalizedUrl: string;
  screenshotSrc: string;
  fallbackSrc?: string;
  alt: string;
  /** Root tabs wrapper */
  className?: string;
  /** Aspect box for screenshot + live iframe */
  previewClassName?: string;
  imageClassName?: string;
  loadingLabel?: string;
  fallbackLabel?: string;
  screenshotOverlay?: ReactNode;
}) {
  return (
    <Tabs className={cn("w-full", className)} defaultValue="screenshot">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <TabsList aria-label="Preview mode" className="max-w-full flex-wrap">
          <TabsTrigger value="screenshot">Screenshot</TabsTrigger>
          <TabsTrigger value="live">Live site</TabsTrigger>
        </TabsList>
        <Button asChild size="sm" variant="outline">
          <a
            className="inline-flex items-center gap-1.5"
            href={normalizedUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Open in new tab
            <ExternalLink aria-hidden className="size-3.5" />
          </a>
        </Button>
      </div>
      <TabsContent className="mt-0" value="screenshot">
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
      </TabsContent>
      <TabsContent className="mt-0" value="live">
        <div className="space-y-2">
          <p className="text-[11px] leading-5 text-muted">
            In-app view only works when the site allows embedding. Banks, auth flows, and apps like
            Claude often block iframes—use Open in new tab for the real page.
          </p>
          <div
            className={cn(
              "overflow-hidden rounded-[14px] border border-border/60 bg-background-alt shadow-sm",
              "min-h-[220px] w-full",
              previewClassName,
            )}
          >
            <iframe
              className="h-full min-h-[220px] w-full bg-background"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              src={normalizedUrl}
              title={`Live preview: ${alt}`}
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
