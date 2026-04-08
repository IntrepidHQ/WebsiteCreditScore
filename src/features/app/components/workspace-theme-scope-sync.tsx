"use client";

import { useLayoutEffect, useRef } from "react";

import type { AgencyBranding, ThemeTokens } from "@/lib/types/audit";
import { setThemePersistScope, themeScopedStorage } from "@/lib/theme/theme-scoped-storage";
import { useThemeStore } from "@/store/theme-store";

const THEME_STORE_KEY = "premium-audit-theme-store";

export function WorkspaceThemeScopeSync({
  userId,
  savedTheme,
  savedBranding,
}: {
  userId: string;
  savedTheme?: ThemeTokens | null;
  savedBranding?: AgencyBranding | null;
}) {
  const previousUserId = useRef<string | null>(null);

  useLayoutEffect(() => {
    setThemePersistScope(userId);

    if (previousUserId.current !== userId) {
      previousUserId.current = userId;

      // Check synchronously whether this user already has local theme data.
      // If not, seed the store with the server-saved theme so the user sees
      // the same look they configured on their last device/browser.
      const hasLocalData = Boolean(themeScopedStorage.getItem(THEME_STORE_KEY));

      if (!hasLocalData && savedTheme) {
        useThemeStore.setState((current) => ({
          tokens: savedTheme,
          branding: savedBranding
            ? { ...current.branding, ...savedBranding }
            : current.branding,
          presetId: null,
        }));
      }

      // Rehydrate from localStorage (writes server-seeded state back to local
      // storage as a side effect when hasLocalData was false above).
      void useThemeStore.persist.rehydrate();
    }
  }, [userId, savedTheme, savedBranding]);

  return null;
}
