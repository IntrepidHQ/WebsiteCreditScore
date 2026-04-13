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

  // Mouse tracking for hover glow on the canvas
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (reduceMotion) return;
    const onMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduceMotion]);

  // Normalize accent to a plain 6-digit hex (DotGridCanvas expects #rrggbb)
  const accentHex = /^#[0-9a-fA-F]{6}$/.test(accentColor ?? "")
    ? accentColor
    : "#f7b21b";

  return (
    <div
      aria-hidden
      className={[
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className ?? "",
      ]
        .join(" ")
        .trim()}
    >
      {withNoiseOverlay && !reduceMotion && <NoiseOverlay />}
      {!reduceMotion && (
        <DotGridCanvas
          key={`${gridType}-${isDark}`}
          accentHex={accentHex}
          connectionDrag={null}
          connections={[]}
          cutConnections={[]}
          externalMousePosRef={mousePosRef}
          gridType={gridType}
          mousePos={null}
          onCutAnimationComplete={() => {}}
          panelHeight={0}
          panelWidth={0}
          panelX={-9999}
          panelY={-9999}
          panels={[]}
          pulses={[]}
          sliceTrail={[]}
          theme={isDark ? "dark" : "light"}
        />
      )}
      {/* Gradient vignette fades the grid into the page background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--theme-background) 0%, transparent) 0%, color-mix(in srgb, var(--theme-background) 60%, transparent) 70%, var(--theme-background) 100%)",
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
