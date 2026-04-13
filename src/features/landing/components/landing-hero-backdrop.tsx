"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Aurora } from "@/components/ui/aurora";
import { NodeGridBackdrop } from "@/features/landing/components/node-grid/node-grid-backdrop";
import { MagnifierDomLens } from "@/features/landing/components/node-grid/magnifier-dom-lens";
import { MagnifierGridOcclusion } from "@/features/landing/components/node-grid/magnifier-grid-occlusion";
import { useMotionSettings } from "@/hooks/use-motion-settings";
import { useThemeStore } from "@/store/theme-store";
import { cn } from "@/lib/utils/cn";
import type { HeroNodeGridPreset } from "@/lib/types/audit";
import type { GridType } from "@/features/landing/components/node-grid/grid-types";

type PresetConfig = {
  gridType: GridType;
  gridCellSize: number;
  strokeScale: number;
};

const PRESET_MAP: Record<HeroNodeGridPreset, PresetConfig> = {
  waves: { gridType: "waves", gridCellSize: 16, strokeScale: 0.45 },
  flux: { gridType: "flux", gridCellSize: 16, strokeScale: 0.45 },
  truss: { gridType: "triangular", gridCellSize: 16, strokeScale: 0.45 },
};

const MAG_RADIUS = 88;
const MAG_ZOOM = 1.85;

export const LandingHeroBackdrop = ({ className }: { className?: string }) => {
  const mode = useThemeStore((state) => state.tokens.mode);
  const surfaces = useThemeStore((state) => state.tokens.surfaces);
  const heroNodeGridPreset = useThemeStore(
    (state) => state.tokens.heroNodeGridPreset ?? "waves",
  );
  const heroNodeGridGridType = useThemeStore((state) => state.tokens.heroNodeGridGridType);
  const heroNodeGridCellSize = useThemeStore((state) => state.tokens.heroNodeGridCellSize);
  const heroNodeGridStrokeScale = useThemeStore((state) => state.tokens.heroNodeGridStrokeScale);
  const { reduceMotion } = useMotionSettings();

  const preset = PRESET_MAP[heroNodeGridPreset] ?? PRESET_MAP.waves;
  // heroNodeGridGridType (set by canvas tuner) overrides the preset's implied grid type
  const effectiveGridType: GridType =
    (heroNodeGridGridType as GridType | null) ?? preset.gridType;

  // Aurora color stops
  const colorStops = useMemo(() => {
    if (mode === "light") {
      return [surfaces.accent, surfaces.background, surfaces.muted];
    }
    return [surfaces.glow, surfaces.background, surfaces.panel];
  }, [mode, surfaces]);

  // Mouse tracking — shared between accent spot and magnifier
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);
  const [isOverHero, setIsOverHero] = useState(false);
  const [gridCanvas, setGridCanvas] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (reduceMotion) return;

    const onMove = (event: MouseEvent) => {
      const hero = document.getElementById("generate");
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      setIsOverHero(inside);
      if (inside) {
        mousePosRef.current = { x: event.clientX, y: event.clientY };
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduceMotion]);

  // Accent spot follows mouse within the hero section
  const [pointer, setPointer] = useState({ x: 0.5, y: 0.26 });
  useEffect(() => {
    if (reduceMotion) return;
    const onMove = (event: MouseEvent) => {
      const hero = document.getElementById("generate");
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        return;
      }
      setPointer({
        x: (event.clientX - rect.left) / Math.max(rect.width, 1),
        y: (event.clientY - rect.top) / Math.max(rect.height, 1),
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduceMotion]);

  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement | null) => {
    setGridCanvas((prev) => (prev === canvas ? prev : canvas));
  }, []);

  const { x: mx, y: my } = pointer;
  const accentSpot =
    mode === "light"
      ? `radial-gradient(circle at ${mx * 100}% ${my * 100}%, color-mix(in srgb, var(--theme-accent) 20%, transparent), transparent 52%)`
      : `radial-gradient(circle at ${mx * 100}% ${my * 100}%, color-mix(in srgb, var(--theme-accent) 30%, transparent), transparent 58%)`;

  const isDark = mode !== "light";

  return (
    <>
      {/* Static backdrop layer — positioned behind page content */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 -top-24 -z-10 h-[calc(min(44rem,120vh)+6rem)]",
          className,
        )}
      >
        <Aurora
          amplitude={mode === "light" ? 0.22 : 0.35}
          blend={mode === "light" ? 0.58 : 0.4}
          className={cn(mode === "light" ? "opacity-50" : "opacity-70")}
          colorStops={colorStops}
          speed={0.25}
        />

        <NodeGridBackdrop
          gridCellSize={heroNodeGridCellSize}
          gridType={effectiveGridType}
          linkHoverFromPointer={false}
          onCanvasReady={handleCanvasReady}
          strokeScale={heroNodeGridStrokeScale}
          withNoiseOverlay={false}
        />

        <div
          aria-hidden
          className="absolute inset-0 opacity-80 mix-blend-soft-light [mask-image:linear-gradient(180deg,black_0%,black_42%,transparent_92%)] [-webkit-mask-image:linear-gradient(180deg,black_0%,black_42%,transparent_92%)]"
          style={{ backgroundImage: accentSpot }}
        />
      </div>

      {/* Magnifier — rendered as fixed-position overlays, visible only on hover */}
      {!reduceMotion && isOverHero ? (
        <>
          <MagnifierGridOcclusion
            active={isOverHero}
            mousePosRef={mousePosRef}
            radius={MAG_RADIUS}
            theme={isDark ? "dark" : "light"}
          />
          <MagnifierDomLens
            mousePosRef={mousePosRef}
            radius={MAG_RADIUS}
            sourceCanvas={gridCanvas}
            zoom={MAG_ZOOM}
          />
        </>
      ) : null}
    </>
  );
};
