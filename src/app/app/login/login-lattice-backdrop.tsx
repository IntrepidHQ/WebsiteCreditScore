"use client";

import { useEffect, useId, useState } from "react";

import { HeroGridSurface } from "@/features/landing/components/hero-grid-surface";
import { useMotionSettings } from "@/hooks/use-motion-settings";
import { useThemeStore } from "@/store/theme-store";
import { cn } from "@/lib/utils/cn";

/**
 * Theme-driven lattice behind the login layout (matches landing hero pattern).
 */
export const LoginLatticeBackdrop = () => {
  const heroGridPattern = useThemeStore((state) => state.tokens.heroGridPattern);
  const { reduceMotion } = useMotionSettings();
  const reactId = useId();
  const uid = reactId.replace(/:/g, "");
  const [pointer, setPointer] = useState({ x: 0.5, y: 0.32 });

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const root = document.getElementById("app-login-root");

    if (!root) {
      return;
    }

    const onMove = (event: MouseEvent) => {
      const rect = root.getBoundingClientRect();

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

    return () => {
      window.removeEventListener("mousemove", onMove);
    };
  }, [reduceMotion]);

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        "mask-image-[linear-gradient(180deg,black_0%,black_78%,transparent_100%)] [-webkit-mask-image:linear-gradient(180deg,black_0%,black_78%,transparent_100%)]",
      )}
    >
      <HeroGridSurface
        className="text-border"
        pattern={heroGridPattern}
        pointer={pointer}
        reduceMotion={reduceMotion}
        uid={`login-${uid}`}
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-background)_86%,transparent)_0%,color-mix(in_srgb,var(--theme-background)_96%,transparent)_55%,var(--theme-background)_100%)]"
      />
      <div
        className="absolute inset-0 opacity-75 mix-blend-soft-light"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 12%, color-mix(in srgb, var(--theme-accent) 18%, transparent), transparent 58%)",
        }}
      />
    </div>
  );
};
