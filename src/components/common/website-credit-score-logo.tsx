"use client";

import type { CSSProperties } from "react";

import { cn } from "@/lib/utils/cn";
import { contrastRatio, pickReadableTextColor } from "@/lib/utils/theme";
import { useThemeStore } from "@/store/theme-store";

export function WebsiteCreditScoreLogo({
  compact = false,
  size,
  className,
}: {
  compact?: boolean;
  size?: "default" | "compact" | "header";
  className?: string;
}) {
  const branding = useThemeStore((state) => state.branding);
  const tokens = useThemeStore((state) => state.tokens);

  const preferredLogoColor = branding.logoColor?.trim() || tokens.surfaces.foreground;
  const logoColor =
    contrastRatio(preferredLogoColor, tokens.surfaces.background) >= 4.5
      ? preferredLogoColor
      : pickReadableTextColor(tokens.surfaces.background);
  const logoScale = branding.logoScale || 1;
  const resolvedSize = size ?? (compact ? "compact" : "default");
  const baseWidth =
    resolvedSize === "compact"
      ? "11.5rem"
      : resolvedSize === "header"
        ? "clamp(11.75rem, 52vw, 18.75rem)"
        : "18.75rem";

  return (
    <span
      aria-label="WebsiteCreditScore.com"
      className={cn("inline-block shrink-0 align-middle", className)}
      role="img"
      style={
        {
          aspectRatio: "536 / 94",
          backgroundColor: logoColor,
          WebkitMaskImage: "url('/brand/website-credit-score-white.svg')",
          WebkitMaskPosition: "center",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskSize: "contain",
          maskImage: "url('/brand/website-credit-score-white.svg')",
          maskPosition: "center",
          maskRepeat: "no-repeat",
          maskSize: "contain",
          width: `calc(${baseWidth} * ${logoScale})`,
        } as CSSProperties
      }
    />
  );
}
