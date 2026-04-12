import { describe, expect, it } from "vitest";

import {
  createRandomTheme,
  createThemeTokens,
  getThemePresets,
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
    expect(cssVars["--theme-font-display-stack"]).toContain("Instrument");
    expect(cssVars["--theme-font-sans-stack"]).toContain("Manrope");
    expect(cssVars["--theme-heading-scale-h1"]).toBe("1");
    expect(cssVars["--theme-heading-scale-h6"]).toBe("1");
  });

  it("maps display and body font stacks independently", () => {
    const tokens = createThemeTokens({
      fontDisplay: "space-grotesk",
      fontBody: "system-sans",
    });
    const cssVars = getThemeCssVariables(tokens);

    expect(tokens.fontDisplay).toBe("space-grotesk");
    expect(tokens.fontBody).toBe("system-sans");
    expect(cssVars["--theme-font-display-stack"]).toContain("Space Grotesk");
    expect(cssVars["--theme-font-sans-stack"]).toContain("ui-sans-serif");
  });

  it("applies accent hue shift only to derived surfaces, not the stored brand hex", () => {
    const base = createThemeTokens({ accentColor: "#f7b21b", accentHueShift: 0 });
    const shifted = createThemeTokens({ accentColor: "#f7b21b", accentHueShift: 12 });

    expect(base.accentColor).toBe(shifted.accentColor);
    expect(shifted.surfaces.background).not.toBe(base.surfaces.background);
  });

  it("builds a cohesive random theme in the requested mode", () => {
    const tokens = createRandomTheme("light");

    expect(tokens.mode).toBe("light");
    expect(tokens.radius).toBeGreaterThanOrEqual(8);
    expect(tokens.radius).toBeLessThanOrEqual(18);
  });

  it("exposes named presets with balanced dark and light options", () => {
    const presets = getThemePresets();
    const dark = presets.filter((preset) => preset.mode === "dark");
    const light = presets.filter((preset) => preset.mode === "light");

    expect(presets).toHaveLength(13);
    expect(dark).toHaveLength(7);
    expect(light).toHaveLength(6);
    expect(new Set(presets.map((preset) => preset.id)).size).toBe(13);
    expect(
      presets.every(
        (preset) =>
          getContrastChecks(preset.tokens).foregroundOnBackground > 4.5 &&
          getContrastChecks(preset.tokens).accentOnAccentForeground > 4.5,
      ),
    ).toBe(true);
  });

  it("shifts surface hues for complementary harmony while keeping contrast", () => {
    const mono = createThemeTokens({
      mode: "dark",
      accentColor: "#2dd4bf",
      colorHarmony: "monochromatic",
    });
    const comp = createThemeTokens({
      mode: "dark",
      accentColor: "#2dd4bf",
      colorHarmony: "complementary",
    });

    expect(mono.colorHarmony).toBe("monochromatic");
    expect(comp.colorHarmony).toBe("complementary");
    expect(comp.surfaces.background).not.toBe(mono.surfaces.background);
    expect(getContrastChecks(comp).foregroundOnBackground).toBeGreaterThan(4.5);
    expect(getContrastChecks(comp).accentOnAccentForeground).toBeGreaterThan(4.5);
  });
});
