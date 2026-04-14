"use client";

import { useEffect, useRef, useState } from "react";

import { useMotionSettings } from "@/hooks/use-motion-settings";
import { useThemeStore } from "@/store/theme-store";

import { DotGridCanvas, NoiseOverlay } from "./dot-grid-canvas";
import type { GridType } from "./grid-types";

export type { GridType };

type Props = {
  gridType?: GridType;
  withNoiseOverlay?: boolean;
  /** Additional className applied to the wrapper div */
  className?: string;
  /** Pixel spacing for grid cells (default 40). Forwarded to DotGridCanvas. */
  gridCellSize?: number;
  /** Stroke width multiplier (default 1). Forwarded to DotGridCanvas. */
  strokeScale?: number;
  /** Called once when the backing HTMLCanvasElement is ready (or null on unmount). */
  onCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
  /**
   * When true, renders as a `relative` element in document flow (for preview cards).
   * Default (false) uses `absolute inset-0 -z-10` — behind all page content.
   */
  inline?: boolean;
  /**
   * When true (default), pointer position is forwarded to the canvas so neighbor links brighten near the cursor.
   * Set false for marketing hero backgrounds to avoid playground-style hover strokes.
   */
  linkHoverFromPointer?: boolean;
};

/**
 * Full canvas animated background using the robot-components DotGridCanvas engine.
 * Reads accent color and dark/light mode from the app's theme store.
 * Drop-in replacement for HeroGridSurface — renders behind all content.
 */
export function NodeGridBackdrop({
  gridType = "constellation",
  withNoiseOverlay = true,
  className,
  gridCellSize,
  strokeScale,
  onCanvasReady,
  inline = false,
  linkHoverFromPointer = true,
}: Props) {
  const { reduceMotion } = useMotionSettings();
  const accentColor = useThemeStore((s) => s.branding.accentOverride || s.tokens.accentColor);

  // Resolve whether the current document is in dark mode by reading the
  // `data-color-scheme` attribute the app's ThemeStyleProvider writes onto <html>.
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    const read = () => {
      const scheme = document.documentElement.dataset.colorScheme;
      setIsDark(scheme !== "light");
    };
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-color-scheme"] });
    return () => obs.disconnect();
  }, []);

  const mousePosRef = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (reduceMotion || !linkHoverFromPointer) return;
    const onMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduceMotion, linkHoverFromPointer]);

  // Normalize accent to a plain 6-digit hex (DotGridCanvas expects #rrggbb)
  const accentHex = /^#[0-9a-fA-F]{6}$/.test(accentColor ?? "")
    ? accentColor
    : "#f7b21b";

  return (
    <div
      aria-hidden
      className={[
        "pointer-events-none overflow-hidden",
        inline ? "relative" : "absolute inset-0 -z-10",
        className ?? "",
      ]
        .join(" ")
        .trim()}
    >
      {withNoiseOverlay && !reduceMotion && <NoiseOverlay />}
      {!reduceMotion && (
        <DotGridCanvas
          key={`${gridType}-${isDark}-${gridCellSize}-${strokeScale}`}
          accentHex={accentHex}
          connectionDrag={null}
          connections={[]}
          cutConnections={[]}
          externalMousePosRef={linkHoverFromPointer ? mousePosRef : null}
          gridCellSize={gridCellSize}
          gridType={gridType}
          mousePos={null}
          onCanvasReady={onCanvasReady}
          onCutAnimationComplete={() => {}}
          panelHeight={0}
          panelWidth={0}
          panelX={-9999}
          panelY={-9999}
          panels={[]}
          pulses={[]}
          sliceTrail={[]}
          strokeScale={strokeScale}
          theme={isDark ? "dark" : "light"}
        />
      )}
      {/* Gradient vignette — extra mid-stops so the fade never reads as a hard horizontal band */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--theme-background) 0%, transparent) 0%, color-mix(in srgb, var(--theme-background) 18%, transparent) 38%, color-mix(in srgb, var(--theme-background) 52%, transparent) 62%, color-mix(in srgb, var(--theme-background) 82%, transparent) 84%, color-mix(in srgb, var(--theme-background) 96%, transparent) 94%, var(--theme-background) 100%)",
        }}
      />
      {/* Subtle radial accent glow at the top */}
      <div
        className="absolute inset-0 opacity-60 mix-blend-soft-light"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--theme-accent) 22%, transparent), transparent 55%)",
        }}
      />
    </div>
  );
}
