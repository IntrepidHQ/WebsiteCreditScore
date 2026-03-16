"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect } from "react";

import { getThemeCssVariables, createThemeTokens } from "@/lib/utils/theme";
import { useThemeStore } from "@/store/theme-store";

export function WorkspaceThemeFrame({
  children,
}: {
  children: ReactNode;
}) {
  const tokens = useThemeStore((state) => state.tokens);
  const scopedTokens = createThemeTokens({
    ...tokens,
    mode: "dark",
  });
  const scopedVariables = getThemeCssVariables(scopedTokens);

  useEffect(() => {
    const previousValues = new Map<string, string>();

    Object.entries(scopedVariables).forEach(([key, value]) => {
      previousValues.set(key, document.documentElement.style.getPropertyValue(key));
      document.documentElement.style.setProperty(key, value);
    });

    const previousMode = document.documentElement.dataset.themeMode;
    const previousColorScheme = document.documentElement.style.colorScheme;

    document.documentElement.dataset.themeMode = "dark";
    document.documentElement.style.colorScheme = "dark";

    return () => {
      previousValues.forEach((value, key) => {
        if (value) {
          document.documentElement.style.setProperty(key, value);
        } else {
          document.documentElement.style.removeProperty(key);
        }
      });

      if (previousMode) {
        document.documentElement.dataset.themeMode = previousMode;
      } else {
        delete document.documentElement.dataset.themeMode;
      }

      document.documentElement.style.colorScheme = previousColorScheme;
    };
  }, [scopedVariables]);

  return (
    <div
      data-theme-mode="dark"
      style={scopedVariables as CSSProperties}
    >
      {children}
    </div>
  );
}
