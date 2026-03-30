"use client";

import { useEffect, useMemo, useState } from "react";

import { useThemeStore } from "@/store/theme-store";

function getSystemReducedMotionPreference() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useMotionSettings() {
  const motionPreference = useThemeStore((state) => state.motionPreference);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    getSystemReducedMotionPreference,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(mediaQuery.matches);
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
