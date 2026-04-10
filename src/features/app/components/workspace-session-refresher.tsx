"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const COOLDOWN_MS = 45_000;
/** Ignore quick tab blinks so we do not refetch RSC before cookies settle after focus. */
const MIN_HIDDEN_MS = 5_000;

/**
 * When the user returns to a workspace tab, RSC trees may still reflect an old
 * session (e.g. signed out elsewhere, or OAuth just completed). A throttled
 * `router.refresh()` re-reads cookies after middleware has refreshed tokens.
 */
export const WorkspaceSessionRefresher = () => {
  const router = useRouter();
  const lastAtRef = useRef(0);
  const hiddenAtRef = useRef<number | null>(null);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAtRef.current = Date.now();
        return;
      }

      if (document.visibilityState !== "visible") {
        return;
      }

      const hiddenAt = hiddenAtRef.current;
      hiddenAtRef.current = null;
      const hiddenMs = hiddenAt == null ? MIN_HIDDEN_MS : Date.now() - hiddenAt;
      if (hiddenMs < MIN_HIDDEN_MS) {
        return;
      }

      const now = Date.now();
      if (now - lastAtRef.current < COOLDOWN_MS) {
        return;
      }
      lastAtRef.current = now;
      router.refresh();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [router]);

  return null;
};
