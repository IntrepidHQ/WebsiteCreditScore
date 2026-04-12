"use client";

import { BrandWordmarkLink } from "@/components/common/brand-wordmark-link";
import { useThemeStore } from "@/store/theme-store";

/**
 * Picks `on-light` / `on-dark` from the active workspace theme so the static SVG
 * wordmark stays readable as users switch between light and dark palettes.
 */
export const BrandWordmarkLinkThemed = ({ className }: { className?: string }) => {
  const mode = useThemeStore((state) => state.tokens.mode);
  const variant = mode === "light" ? "on-light" : "on-dark";

  return <BrandWordmarkLink className={className} variant={variant} />;
};
