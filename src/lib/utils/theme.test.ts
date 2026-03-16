import { describe, expect, it } from "vitest";

import {
  createRandomTheme,
  createThemeTokens,
  getContrastChecks,
  getThemeCssVariables,
} from "@/lib/utils/theme";

describe("theme generation", () => {
  it("creates an accessible default token set", () => {
    const tokens = createThemeTokens({
      mode: "dark",
      accentColor: "#ff8a5b",
    });
    const contrast = getContrastChecks(tokens);

    expect(tokens.mode).toBe("dark");
    expect(contrast.foregroundOnBackground).toBeGreaterThan(4.5);
    expect(contrast.accentOnAccentForeground).toBeGreaterThan(4.5);
  });

  it("uses a dark foreground on the default yellow accent", () => {
    const tokens = createThemeTokens({
      mode: "dark",
      accentColor: "#f7b21b",
    });

    expect(tokens.surfaces.accentForeground).toBe("#08111b");
  });

  it("exports css variables for runtime theming", () => {
    const tokens = createThemeTokens();
    const cssVars = getThemeCssVariables(tokens);

    expect(cssVars["--theme-accent"]).toBe(tokens.surfaces.accent);
    expect(cssVars["--theme-radius"]).toBe(`${tokens.radius}px`);
  });

  it("builds a cohesive random theme in the requested mode", () => {
    const tokens = createRandomTheme("light");

    expect(tokens.mode).toBe("light");
    expect(tokens.radius).toBeGreaterThanOrEqual(8);
    expect(tokens.radius).toBeLessThanOrEqual(18);
  });
});
