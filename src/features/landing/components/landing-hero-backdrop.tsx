"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { LightRaysHeroCanvas } from "@/features/landing/components/light-rays/light-rays-hero-canvas";
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

export const LandingHeroBackdrop = ({
  className,
  magnifierMirror,
}: {
  className?: string;
  /** Non-interactive duplicate of hero foreground for the magnifier lens. */
  magnifierMirror?: ReactNode;
}) => {
  const mode = useThemeStore((state) => state.tokens.mode);
  const heroBackdropKind = useThemeStore((state) => state.tokens.heroBackdropKind);
  const heroNodeGridPreset = useThemeStore(
    (state) => state.tokens.heroNodeGridPreset ?? "waves",
  );
  const heroNodeGridGridType = useThemeStore((state) => state.tokens.heroNodeGridGridType);
  const heroNodeGridCellSize = useThemeStore((state) => state.tokens.heroNodeGridCellSize);
  const heroNodeGridStrokeScale = useThemeStore((state) => state.tokens.heroNodeGridStrokeScale);
  const accentColor = useThemeStore((state) => state.branding.accentOverride || state.tokens.accentColor);
  const cursorEffects = useThemeStore((state) => state.cursorEffects);
  const { reduceMotion } = useMotionSettings();

  const preset = PRESET_MAP[heroNodeGridPreset] ?? PRESET_MAP.waves;
  const effectiveGridType: GridType =
    (heroNodeGridGridType as GridType | null) ?? preset.gridType;

  const mousePosRef = useRef<{ x: number; y: number } | null>(null);
  const [isOverHero, setIsOverHero] = useState(false);
  const [gridCanvas, setGridCanvas] = useState<HTMLCanvasElement | null>(null);
  const [webGpuCanvas, setWebGpuCanvas] = useState<HTMLCanvasElement | null>(null);
  const [webGpuSupported, setWebGpuSupported] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (typeof navigator === "undefined" || !("gpu" in navigator)) return;
      const gpu = navigator.gpu;
      if (!gpu) return;
      try {
        const adapter = await gpu.requestAdapter();
        if (!cancelled && adapter) {
          setWebGpuSupported(true);
        }
      } catch {
        if (!cancelled) setWebGpuSupported(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const useLightRays = heroBackdropKind === "lightRays" && webGpuSupported;

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

  const magnifierLensActive =
    !reduceMotion && cursorEffects.heroMagnifierLens === true && isOverHero;

  useEffect(() => {
    const hero = document.getElementById("generate");
    if (!hero) return;
    if (magnifierLensActive) {
      hero.setAttribute("data-hero-magnifier-active", "true");
    } else {
      hero.removeAttribute("data-hero-magnifier-active");
    }
    return () => hero.removeAttribute("data-hero-magnifier-active");
  }, [magnifierLensActive]);

  const sourceCanvasForLens = useLightRays ? webGpuCanvas : gridCanvas;

  useEffect(() => {
    if (!useLightRays) {
      setWebGpuCanvas(null);
    }
  }, [useLightRays]);

  return (
    <>
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 -top-24 -z-10 min-h-[min(52rem,115vh)] h-[calc(min(48rem,125vh)+4rem)]",
          className,
        )}
      >
        {useLightRays ? (
          <div className="absolute inset-0 -z-10 min-h-[min(44rem,120vh)] w-full">
            <LightRaysHeroCanvas
              accentHex={accentColor}
              className="h-full min-h-[inherit] w-full"
              mode={mode}
              onGpuCanvas={setWebGpuCanvas}
            />
          </div>
        ) : (
          <NodeGridBackdrop
            gridCellSize={heroNodeGridCellSize}
            gridType={effectiveGridType}
            linkHoverFromPointer={false}
            onCanvasReady={handleCanvasReady}
            strokeScale={heroNodeGridStrokeScale}
            withNoiseOverlay={false}
          />
        )}

        <div
          aria-hidden
          className="absolute inset-0 opacity-55 mix-blend-soft-light [mask-image:linear-gradient(180deg,black_0%,black_32%,rgba(0,0,0,0.45)_55%,rgba(0,0,0,0.12)_82%,transparent_100%)] [-webkit-mask-image:linear-gradient(180deg,black_0%,black_32%,rgba(0,0,0,0.45)_55%,rgba(0,0,0,0.12)_82%,transparent_100%)]"
          style={{ backgroundImage: accentSpot }}
        />
      </div>

      {magnifierLensActive ? (
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
            sourceCanvas={sourceCanvasForLens}
            zoom={MAG_ZOOM}
          >
            {magnifierMirror}
          </MagnifierDomLens>
        </>
      ) : null}
    </>
  );
};
