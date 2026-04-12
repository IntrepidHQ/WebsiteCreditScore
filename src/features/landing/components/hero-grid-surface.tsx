"use client";

import type { HeroGridPattern } from "@/lib/types/audit";
import { cn } from "@/lib/utils/cn";

const distance01 = (ax: number, ay: number, bx: number, by: number) => {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
};

type HeroGridSurfaceProps = {
  pattern: HeroGridPattern;
  uid: string;
  pointer?: { x: number; y: number };
  reduceMotion?: boolean;
  className?: string;
};

/**
 * Layered SVG lattice used on the marketing hero and in Settings live preview.
 * Patterns mirror the previous always-on stack, now selectable per theme.
 */
export const HeroGridSurface = ({
  pattern,
  uid,
  pointer = { x: 0.5, y: 0.26 },
  reduceMotion,
  className,
}: HeroGridSurfaceProps) => {
  const mx = pointer.x;
  const my = pointer.y;

  const squareOpacity = 0.08 + 0.12 * (1 - Math.min(1, distance01(mx, my, 0.1, 0.08) / 1.25));
  const triangleOpacity = 0.06 + 0.12 * (1 - Math.min(1, distance01(mx, my, 0.92, 0.2) / 1.25));
  const webOpacity = 0.05 + 0.11 * (1 - Math.min(1, distance01(mx, my, 0.52, 0.92) / 1.25));

  const panX = (mx - 0.5) * 36;
  const panY = (my - 0.5) * 28;

  const showSquares = pattern === "squares" || pattern === "web";
  const showTriangles = pattern === "triangles" || pattern === "web";
  const showHex = pattern === "hex" || pattern === "web";
  const showSignal = pattern === "signal" || pattern === "web";
  const showQuantum = pattern === "quantum";

  const gridStroke = "color-mix(in srgb, var(--theme-border) 70%, transparent)";

  return (
    <>
      <svg
        aria-hidden
        className={cn("absolute inset-0 h-full w-full text-border", className)}
        style={{ color: gridStroke }}
      >
        <defs>
          <pattern height="34" id={`${uid}-sq`} patternUnits="userSpaceOnUse" width="34">
            <rect fill="none" height="33" stroke="currentColor" strokeOpacity="0.55" width="33" x="0.5" y="0.5" />
          </pattern>
          <pattern height="56" id={`${uid}-tri`} patternUnits="userSpaceOnUse" width="64">
            <path
              d="M32 2 L62 52 H2 Z"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.45"
              strokeWidth="0.9"
            />
          </pattern>
          <pattern height="96" id={`${uid}-hex`} patternUnits="userSpaceOnUse" width="56">
            <path
              d="M28 4 L52 18 L52 46 L28 60 L4 46 L4 18 Z"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.35"
              strokeWidth="0.8"
            />
          </pattern>
          <pattern height="40" id={`${uid}-quantum`} patternTransform="skewX(-8)" patternUnits="userSpaceOnUse" width="40">
            <path d="M0 40 L40 0" fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="0.75" />
            <path d="M-10 20 L30 -20" fill="none" stroke="currentColor" strokeOpacity="0.28" strokeWidth="0.65" />
          </pattern>
        </defs>

        {showSquares ? (
          <rect fill={`url(#${uid}-sq)`} height="100%" style={{ opacity: squareOpacity }} width="100%" />
        ) : null}

        {showTriangles ? (
          <rect
            fill={`url(#${uid}-tri)`}
            height="100%"
            style={{ opacity: triangleOpacity }}
            transform={`translate(${panX.toFixed(1)} ${panY.toFixed(1)})`}
            width="100%"
          />
        ) : null}

        {showHex ? (
          <rect fill={`url(#${uid}-hex)`} height="100%" style={{ opacity: webOpacity }} width="100%" />
        ) : null}

        {showQuantum ? (
          <rect
            className={cn(!reduceMotion && "hero-quantum-grid")}
            fill={`url(#${uid}-quantum)`}
            height="100%"
            style={{ opacity: 0.09 + webOpacity * 0.35 }}
            width="100%"
          />
        ) : null}
      </svg>

      {showSignal ? (
        <svg aria-hidden className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          <line
            stroke="color-mix(in srgb, var(--theme-accent) 40%, transparent)"
            strokeWidth="0.7"
            x1={`${mx * 100}%`}
            x2="100%"
            y1={`${my * 100}%`}
            y2="0%"
          />
          <line
            stroke="color-mix(in srgb, var(--theme-accent) 32%, transparent)"
            strokeWidth="0.7"
            x1={`${mx * 100}%`}
            x2="0%"
            y1={`${my * 100}%`}
            y2="100%"
          />
          <line
            stroke="color-mix(in srgb, var(--theme-border) 48%, transparent)"
            strokeWidth="0.7"
            x1={`${mx * 100}%`}
            x2="50%"
            y1={`${my * 100}%`}
            y2="100%"
          />
        </svg>
      ) : null}
    </>
  );
};
