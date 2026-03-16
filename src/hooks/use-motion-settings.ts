"use client";

import { useEffect, useMemo, useState } from "react";

import { useThemeStore } from "@/store/theme-store";

export function useMotionSettings() {
  const motionPreference = useThemeStore((state) => state.motionPreference);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return useMemo(
    () => ({
      prefersReducedMotion,
      reduceMotion:
        motionPreference === "reduced" ||
        (motionPreference === "system" && prefersReducedMotion),
    }),
    [motionPreference, prefersReducedMotion],
  );
}
