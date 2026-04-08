/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

type PreviewPhase = "loading" | "loaded" | "fallback" | "error";

export function PreviewImage({
  alt,
  src,
  fallbackSrc,
  className,
  imageClassName,
  scrollable = false,
  loadingLabel = "Capturing preview",
  fallbackLabel = "Using site image",
  errorLabel = "Preview unavailable",
  priority = false,
  children,
}: {
  alt: string;
  src: string;
  fallbackSrc?: string;
  className?: string;
  imageClassName?: string;
  scrollable?: boolean;
  loadingLabel?: string;
  fallbackLabel?: string;
  errorLabel?: string;
  /** When true, load immediately (e.g. audit hero) for faster visible preview. */
  priority?: boolean;
  children?: ReactNode;
}) {
  return (
    <PreviewImageInner
      alt={alt}
      className={className}
      errorLabel={errorLabel}
      fallbackLabel={fallbackLabel}
      fallbackSrc={fallbackSrc}
      imageClassName={imageClassName}
      key={`${src}::${fallbackSrc ?? ""}`}
      loadingLabel={loadingLabel}
      priority={priority}
      scrollable={scrollable}
      src={src}
    >
      {children}
    </PreviewImageInner>
  );
}

function PreviewImageInner({
  alt,
  src,
  fallbackSrc,
  className,
  imageClassName,
  scrollable = false,
  loadingLabel = "Capturing preview",
  fallbackLabel = "Using site image",
  errorLabel = "Preview unavailable",
  priority = false,
  children,
}: {
  alt: string;
  src: string;
  fallbackSrc?: string;
  className?: string;
  imageClassName?: string;
  scrollable?: boolean;
  loadingLabel?: string;
  fallbackLabel?: string;
  errorLabel?: string;
  priority?: boolean;
  children?: ReactNode;
}) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [phase, setPhase] = useState<PreviewPhase>("loading");
  const [usingFallback, setUsingFallback] = useState(false);

  return (
    <div
      className={cn(
        "relative bg-background-alt",
        scrollable ? "overflow-y-auto overscroll-y-contain" : "overflow-hidden",
        className,
      )}
    >
      {phase === "error" ? (
        <div className="absolute inset-0 grid place-items-center bg-background-alt px-6 text-center">
          <p className="text-sm leading-6 text-muted">{errorLabel}</p>
        </div>
      ) : (
        <img
          alt={alt}
          className={cn(
            scrollable
              ? "block h-auto w-full max-w-none object-top"
              : "absolute inset-0 h-full w-full object-cover object-top",
            imageClassName,
          )}
          decoding="async"
          fetchPriority={priority ? "high" : "low"}
          loading={priority || currentSrc.startsWith("/api/preview") ? "eager" : "lazy"}
          onError={() => {
            if (fallbackSrc && currentSrc !== fallbackSrc) {
              setCurrentSrc(fallbackSrc);
              setUsingFallback(true);
              setPhase("loading");
              return;
            }

            setPhase("error");
          }}
          onLoad={() => {
            setPhase(usingFallback ? "fallback" : "loaded");
          }}
          src={currentSrc}
        />
      )}
      {children}
      {phase === "loading" ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-background/45 backdrop-blur-[1px]">
          <Badge variant="neutral">{usingFallback ? fallbackLabel : loadingLabel}</Badge>
        </div>
      ) : null}
      {phase === "fallback" ? (
        <div className="pointer-events-none absolute left-3 top-3">
          <Badge variant="neutral">{fallbackLabel}</Badge>
        </div>
      ) : null}
    </div>
  );
}
