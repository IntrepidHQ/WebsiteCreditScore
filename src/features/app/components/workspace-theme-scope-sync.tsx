"use client";

import { useLayoutEffect, useRef } from "react";

import { setThemePersistScope } from "@/lib/theme/theme-scoped-storage";
import { useThemeStore } from "@/store/theme-store";

export function WorkspaceThemeScopeSync({ userId }: { userId: string }) {
  const previousUserId = useRef<string | null>(null);

  useLayoutEffect(() => {
    setThemePersistScope(userId);

    if (previousUserId.current !== userId) {
      previousUserId.current = userId;
      void useThemeStore.persist.rehydrate();
    }
  }, [userId]);

  return null;
}
