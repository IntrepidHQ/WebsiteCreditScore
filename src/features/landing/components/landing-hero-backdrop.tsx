"use client";

import { useEffect, useId, useMemo, useState } from "react";

import { Aurora } from "@/components/ui/aurora";
import { useMotionSettings } from "@/hooks/use-motion-settings";
import { useThemeStore } from "@/store/theme-store";
import { cn } from "@/lib/utils/cn";

const distance01 = (ax: number, ay: number, bx: number, by: number) => {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
};

export const LandingHeroBackdrop = ({ className }: { className?: string }) => {
  const mode = useThemeStore((state) => state.tokens.mode);
  const surfaces = useThemeStore((state) => state.tokens.surfaces);
  const { reduceMotion } = useMotionSettings();
  const reactId = useId();
  const uid = reactId.replace(/:/g, "");
  const [pointer, setPointer] = useState({ x: 0.5, y: 0.26 });

  const colorStops = useMemo(() => {
    if (mode === "light") {
      return [surfaces.accent, surfaces.background, surfaces.muted];
    }

    return [surfaces.glow, surfaces.background, surfaces.panel];
  }, [mode, surfaces]);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const onMove = (event: MouseEvent) => {
      const hero = document.getElementById("generate");

      if (!hero) {
        return;
      }

      const rect = hero.getBoundingClientRect();

      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        return;
      }

      const x = (event.clientX - rect.left) / Math.max(rect.width, 1);
      const y = (event.clientY - rect.top) / Math.max(rect.height, 1);
      setPointer({ x, y });
    };

    window.addEventListener("mousemove", onMove);

    return () => window.removeEventListener("mousemove", onMove);
  }, [reduceMotion]);

  const mx = pointer.x;
  const my = pointer.y;

  const squareOpacity = 0.08 + 0.12 * (1 - Math.min(1, distance01(mx, my, 0.1, 0.08) / 1.25));
  const triangleOpacity = 0.06 + 0.12 * (1 - Math.min(1, distance01(mx, my, 0.92, 0.2) / 1.25));
  const webOpacity = 0.05 + 0.11 * (1 - Math.min(1, distance01(mx, my, 0.52, 0.92) / 1.25));

  const panX = (mx - 0.5) * 36;
  const panY = (my - 0.5) * 28;

  const accentSpot =
    mode === "light"
      ? `radial-gradient(circle at ${mx * 100}% ${my * 100}%, color-mix(in srgb, var(--theme-accent) 20%, transparent), transparent 52%)`
      : `radial-gradient(circle at ${mx * 100}% ${my * 100}%, color-mix(in srgb, var(--theme-accent) 30%, transparent), transparent 58%)`;

  return (
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

      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full text-border"
        style={{ color: "color-mix(in srgb, var(--theme-border) 70%, transparent)" }}
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
        </defs>

        <rect fill={`url(#${uid}-sq)`} height="100%" style={{ opacity: squareOpacity }} width="100%" />
        <rect
          fill={`url(#${uid}-tri)`}
          height="100%"
          style={{ opacity: triangleOpacity }}
          transform={`translate(${panX.toFixed(1)} ${panY.toFixed(1)})`}
          width="100%"
        />
        <rect fill={`url(#${uid}-hex)`} height="100%" style={{ opacity: webOpacity }} width="100%" />
      </svg>

      <div
        aria-hidden
        className="absolute inset-0 opacity-80 mix-blend-soft-light [mask-image:linear-gradient(180deg,black_0%,black_42%,transparent_92%)] [-webkit-mask-image:linear-gradient(180deg,black_0%,black_42%,transparent_92%)]"
        style={{ backgroundImage: accentSpot }}
      />

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
    </div>
  );
};
