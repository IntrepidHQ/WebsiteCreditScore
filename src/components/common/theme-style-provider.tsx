"use client";

import { useEffect } from "react";

import { createThemeTokens, getThemeCssVariables } from "@/lib/utils/theme";
import { useThemeStore } from "@/store/theme-store";

export function ThemeStyleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const tokens = useThemeStore((state) => state.tokens);

  useEffect(() => {
    const normalizedTokens = createThemeTokens(tokens);
    const variables = getThemeCssVariables(normalizedTokens);

    Object.entries(variables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });

    document.documentElement.dataset.themeMode = normalizedTokens.mode;
    document.documentElement.style.colorScheme = normalizedTokens.mode;
  }, [tokens]);

  return <>{children}</>;
}
