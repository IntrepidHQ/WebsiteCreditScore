"use client";

import { useEffect, useId, useMemo, useState } from "react";

import { Aurora } from "@/components/ui/aurora";
import { HeroGridSurface } from "@/features/landing/components/hero-grid-surface";
import { useMotionSettings } from "@/hooks/use-motion-settings";
import { useThemeStore } from "@/store/theme-store";
import { cn } from "@/lib/utils/cn";

export const LandingHeroBackdrop = ({ className }: { className?: string }) => {
  const mode = useThemeStore((state) => state.tokens.mode);
  const surfaces = useThemeStore((state) => state.tokens.surfaces);
  const heroGridPattern = useThemeStore((state) => state.tokens.heroGridPattern);
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

      <HeroGridSurface
        className="text-border"
        pattern={heroGridPattern}
        pointer={pointer}
        reduceMotion={reduceMotion}
        uid={uid}
      />

      <div
        aria-hidden
        className="absolute inset-0 opacity-80 mix-blend-soft-light [mask-image:linear-gradient(180deg,black_0%,black_42%,transparent_92%)] [-webkit-mask-image:linear-gradient(180deg,black_0%,black_42%,transparent_92%)]"
        style={{ backgroundImage: accentSpot }}
      />
    </div>
  );
};
