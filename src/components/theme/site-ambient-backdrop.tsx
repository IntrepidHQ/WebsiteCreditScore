"use client";

import { useMemo } from "react";

import { Aurora } from "@/components/ui/aurora";
import { useThemeStore } from "@/store/theme-store";
import { cn } from "@/lib/utils/cn";

/**
 * Fixed viewport wash so the marketing aurora + a hint of lattice persist behind every route.
 * The animated node grid stays in the hero (magnifier / WebGPU); this layer avoids double canvas cost.
 */
export const SiteAmbientBackdrop = () => {
  const mode = useThemeStore((s) => s.tokens.mode);
  const surfaces = useThemeStore((s) => s.tokens.surfaces);

  const colorStops = useMemo(() => {
    if (mode === "light") {
      return [surfaces.accent, surfaces.background, surfaces.muted];
    }
    return [surfaces.glow, surfaces.background, surfaces.panel];
  }, [mode, surfaces]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-[100dvh] min-h-[100dvh] w-full overflow-hidden"
    >
      <Aurora
        amplitude={mode === "light" ? 0.22 : 0.35}
        blend={mode === "light" ? 0.58 : 0.4}
        className={cn("h-full w-full", mode === "light" ? "opacity-50" : "opacity-70")}
        colorStops={colorStops}
        speed={0.25}
      />
      <div
        className={cn(
          "absolute inset-0 mix-blend-soft-light",
          mode === "light" ? "opacity-[0.1]" : "opacity-[0.14]",
        )}
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--theme-muted) 42%, transparent) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />
    </div>
  );
};
