"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

import { getThemePersistScope, setThemePersistScope } from "@/lib/theme/theme-scoped-storage";

/**
 * Public /settings must always persist under the anonymous scope so theme works
 * without a healthy workspace session (stale user scope would write to the wrong key).
 */
export const PublicThemeSettingsScope = ({ children }: { children: ReactNode }) => {
  const previousScopeRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    previousScopeRef.current = getThemePersistScope();
    setThemePersistScope(null);

    return () => {
      const previous = previousScopeRef.current;
      setThemePersistScope(previous && previous !== "anon" ? previous : null);
    };
  }, []);

  return children;
};
