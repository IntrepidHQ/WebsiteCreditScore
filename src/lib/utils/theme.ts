import type {
  AgencyBranding,
  ThemeFontProfile,
  ThemeFontStackId,
  ThemeMode,
  ThemePreset,
  ThemeTokens,
} from "@/lib/types/audit";
import { getAllThemePresetSeeds } from "@/lib/benchmarks/library";

type ThemeTokensInput = Partial<ThemeTokens> & { fontProfile?: ThemeFontProfile };

const THEME_FONT_STACK_IDS: ThemeFontStackId[] = [
  "instrument-serif",
  "space-grotesk",
  "manrope",
  "system-serif",
  "system-sans",
];

export const THEME_FONT_STACK_OPTIONS: Array<{
  id: ThemeFontStackId;
  label: string;
  helper: string;
}> = [
  {
    id: "instrument-serif",
    label: "Instrument Serif",
    helper: "Premium editorial display (loaded via Next font)",
  },
  {
    id: "space-grotesk",
    label: "Space Grotesk",
    helper: "Geometric sans for headlines or UI",
  },
  {
    id: "manrope",
    label: "Manrope",
    helper: "Rounded UI sans (loaded via Next font)",
  },
  {
    id: "system-serif",
    label: "System serif",
    helper: "Georgia / Times — no webfont download",
  },
  {
    id: "system-sans",
    label: "System sans",
    helper: "Native UI stack — fastest, neutral",
  },
];

export function isThemeFontStackId(value: unknown): value is ThemeFontStackId {
  return typeof value === "string" && (THEME_FONT_STACK_IDS as string[]).includes(value);
}

function resolveThemeFontStacks(input?: ThemeTokensInput): {
  fontDisplay: ThemeFontStackId;
  fontBody: ThemeFontStackId;
} {
  const display = isThemeFontStackId(input?.fontDisplay) ? input.fontDisplay : null;
  const body = isThemeFontStackId(input?.fontBody) ? input.fontBody : null;
  if (display && body) {
    return { fontDisplay: display, fontBody: body };
  }
  if (display && !body) {
    return { fontDisplay: display, fontBody: "manrope" };
  }
  if (!display && body) {
    return { fontDisplay: "instrument-serif", fontBody: body };
  }

  const legacy = input?.fontProfile;
  if (legacy === "precision") {
    return { fontDisplay: "space-grotesk", fontBody: "manrope" };
  }
  if (legacy === "terminal") {
    return { fontDisplay: "space-grotesk", fontBody: "space-grotesk" };
  }
  if (legacy === "instrument") {
    return { fontDisplay: "instrument-serif", fontBody: "manrope" };
  }

  return { fontDisplay: "instrument-serif", fontBody: "manrope" };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hexToRgb(hex: string) {
  const value = hex.replace("#", "");
  const normalized =
    value.length === 3
      ? value
          .split("")
          .map((segment) => `${segment}${segment}`)
          .join("")
      : value;

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return { red, green, blue };
}

function rgbToHsl(red: number, green: number, blue: number) {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue = 0;
  let saturation = 0;
  const lightness = (max + min) / 2;

  if (delta !== 0) {
    const divisor = 1 - Math.abs(2 * lightness - 1) || 1;
    saturation = delta / divisor;

    switch (max) {
      case r:
        hue = 60 * (((g - b) / delta) % 6);
        break;
      case g:
        hue = 60 * ((b - r) / delta + 2);
        break;
      default:
        hue = 60 * ((r - g) / delta + 4);
        break;
    }
  }

  return {
    h: Math.round((hue + 360) % 360),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  };
}

function rgbChannelToLinear(value: number) {
  const normalized = value / 255;

  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

export function contrastRatio(hexA: string, hexB: string) {
  const colorA = hexToRgb(hexA);
  const colorB = hexToRgb(hexB);

  const lumA =
    0.2126 * rgbChannelToLinear(colorA.red) +
    0.7152 * rgbChannelToLinear(colorA.green) +
    0.0722 * rgbChannelToLinear(colorA.blue);
  const lumB =
    0.2126 * rgbChannelToLinear(colorB.red) +
    0.7152 * rgbChannelToLinear(colorB.green) +
    0.0722 * rgbChannelToLinear(colorB.blue);

  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);

  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

export function pickReadableTextColor(
  backgroundHex: string,
  light = "#ffffff",
  dark = "#08111b",
) {
  const lightContrast = contrastRatio(light, backgroundHex);
  const darkContrast = contrastRatio(dark, backgroundHex);

  return lightContrast >= darkContrast ? light : dark;
}

function hslToHex(h: number, s: number, l: number) {
  const saturation = s / 100;
  const lightness = l / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const hueSegment = h / 60;
  const x = chroma * (1 - Math.abs((hueSegment % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;

  if (hueSegment >= 0 && hueSegment < 1) {
    r = chroma;
    g = x;
  } else if (hueSegment < 2) {
    r = x;
    g = chroma;
  } else if (hueSegment < 3) {
    g = chroma;
    b = x;
  } else if (hueSegment < 4) {
    g = x;
    b = chroma;
  } else if (hueSegment < 5) {
    r = x;
    b = chroma;
  } else {
    r = chroma;
    b = x;
  }

  const match = lightness - chroma / 2;
  const toHex = (channel: number) =>
    Math.round((channel + match) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Rotate a hex accent by hue degrees (for fine brand tuning). */
export function rotateHexHue(hex: string, degrees: number) {
  if (!degrees) {
    return hex;
  }

  try {
    const { red, green, blue } = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(red, green, blue);
    const nextHue = (h + degrees + 360) % 360;
    return hslToHex(nextHue, s, l);
  } catch {
    return hex;
  }
}

export function getThemeFontStack(stack: ThemeFontStackId): string {
  switch (stack) {
    case "space-grotesk":
      return `var(--font-space-grotesk), "Space Grotesk", ui-sans-serif, sans-serif`;
    case "manrope":
      return `var(--font-manrope), "Manrope", ui-sans-serif, system-ui, sans-serif`;
    case "system-serif":
      return `ui-serif, Georgia, "Times New Roman", serif`;
    case "system-sans":
      return `ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`;
    default:
      return `var(--font-instrument-serif), "Instrument Serif", Georgia, "Times New Roman", serif`;
  }
}

function buildSurfacePalette(accentHex: string, mode: ThemeMode) {
  const accentRgb = hexToRgb(accentHex);
  const { h } = rgbToHsl(accentRgb.red, accentRgb.green, accentRgb.blue);
  const isDark = mode === "dark";

  const background = isDark ? hslToHex((h + 18) % 360, 26, 7) : hslToHex(h, 28, 98);
  const backgroundAlt = isDark
    ? hslToHex((h + 24) % 360, 24, 10)
    : hslToHex((h + 8) % 360, 38, 95);
  const panel = isDark ? hslToHex((h + 12) % 360, 22, 12) : hslToHex(h, 26, 100);
  const elevated = isDark
    ? hslToHex((h + 6) % 360, 18, 16)
    : hslToHex((h + 2) % 360, 42, 92);
  const border = isDark ? hslToHex(h, 16, 24) : hslToHex(h, 24, 82);
  const foreground = isDark ? "#f4f7fb" : "#101723";
  const muted = isDark ? "#98a6ba" : "#5f6878";
  const accent = accentHex;
  const accentSoft = isDark
    ? hslToHex(h, 68, 18)
    : hslToHex(h, 88, 95);
  const accentForeground = pickReadableTextColor(accentHex);
  const glow = isDark ? hslToHex(h, 74, 58) : hslToHex(h, 82, 62);
  const success = isDark ? "#3dd598" : "#138a5f";
  const warning = isDark ? "#ffcf66" : "#b66b00";
  const danger = isDark ? "#ff8b8b" : "#b83232";

  return {
    background,
    backgroundAlt,
    panel,
    elevated,
    border,
    foreground,
    muted,
    accent,
    accentSoft,
    accentForeground,
    glow,
    success,
    warning,
    danger,
  };
}

function ensureAccessibleAccent(tokens: ThemeTokens) {
  const contrast = contrastRatio(
    tokens.surfaces.accentForeground,
    tokens.surfaces.accent,
  );

  if (contrast >= 4.5) {
    return tokens;
  }

  const accentRgb = hexToRgb(tokens.accentColor);
  const accentHsl = rgbToHsl(accentRgb.red, accentRgb.green, accentRgb.blue);
  const preferredForeground = pickReadableTextColor(tokens.accentColor);
  const adjustedAccent =
    preferredForeground === "#ffffff"
      ? hslToHex(accentHsl.h, 72, tokens.mode === "dark" ? 50 : 38)
      : hslToHex(accentHsl.h, 82, tokens.mode === "dark" ? 68 : 58);

  return {
    ...tokens,
    surfaces: {
      ...tokens.surfaces,
      accent: adjustedAccent,
      accentForeground: pickReadableTextColor(adjustedAccent),
    },
  };
}

export const defaultBranding: AgencyBranding = {
  agencyName: "WebsiteCreditScore.com",
  logoMark: "WCS",
  logoColor: "",
  logoScale: 1,
  contactName: "WebsiteCreditScore.com Team",
  contactTitle: "Website Strategy",
  contactEmail: "",
  contactPhone: "",
  headshot: "/previews/agency-avatar.svg",
  accentOverride: "",
};

export function createThemeTokens(options?: ThemeTokensInput) {
  const mode = options?.mode ?? "dark";
  /** Canonical accent from the picker / presets (hue shift is applied on top for surfaces). */
  const userAccent = options?.accentColor ?? "#f7b21b";
  const hueShift = clamp(options?.accentHueShift ?? 0, -24, 24);
  const shiftedAccent = rotateHexHue(userAccent, hueShift);
  const { fontDisplay, fontBody } = resolveThemeFontStacks(options);

  const tokens: ThemeTokens = {
    mode,
    accentColor: userAccent,
    accentHueShift: hueShift,
    fontDisplay,
    fontBody,
    fontScale: clamp(options?.fontScale ?? 1, 0.9, 1.15),
    lineHeightScale: clamp(options?.lineHeightScale ?? 1, 0.9, 1.15),
    glowIntensity: clamp(options?.glowIntensity ?? 1, 0.55, 1.45),
    radius: clamp(options?.radius ?? 12, 8, 20),
    shadowIntensity: clamp(options?.shadowIntensity ?? 0.82, 0.3, 1.2),
    spacingDensity: clamp(options?.spacingDensity ?? 1, 0.82, 1.18),
    surfaces: buildSurfacePalette(shiftedAccent, mode),
  };

  return ensureAccessibleAccent(tokens);
}

export function createRandomTheme(mode: ThemeMode) {
  const curatedAccents = [
    "#f7b21b",
    "#ff8a5b",
    "#74f0b4",
    "#ffd26f",
    "#8fb2ff",
    "#ff7fb8",
  ];
  const accentColor =
    curatedAccents[Math.floor(Math.random() * curatedAccents.length)];
  const fontDisplay =
    THEME_FONT_STACK_IDS[Math.floor(Math.random() * THEME_FONT_STACK_IDS.length)]!;
  const fontBody =
    THEME_FONT_STACK_IDS[Math.floor(Math.random() * THEME_FONT_STACK_IDS.length)]!;

  return createThemeTokens({
    mode,
    accentColor,
    fontDisplay,
    fontBody,
    fontScale: clamp(0.94 + Math.random() * 0.16, 0.92, 1.12),
    lineHeightScale: clamp(0.94 + Math.random() * 0.18, 0.92, 1.12),
    glowIntensity: clamp(0.75 + Math.random() * 0.55, 0.65, 1.35),
    radius: Math.round(clamp(8 + Math.random() * 10, 8, 18)),
    shadowIntensity: clamp(0.55 + Math.random() * 0.45, 0.45, 1),
    spacingDensity: clamp(0.88 + Math.random() * 0.22, 0.84, 1.12),
  });
}

export function getThemePresets(): ThemePreset[] {
  return getAllThemePresetSeeds().map((preset) => ({
    id: preset.id,
    name: preset.name,
    mode: preset.mode,
    accentFamily: preset.accentFamily,
    mood: preset.mood,
    recommendedUseCase: preset.recommendedUseCase,
    tokens: createThemeTokens({
      mode: preset.mode,
      accentColor: preset.options.accentColor,
      fontDisplay: preset.options.fontDisplay,
      fontBody: preset.options.fontBody,
      fontScale: preset.options.fontScale,
      lineHeightScale: 1,
      glowIntensity: 1,
      radius: preset.options.radius,
      shadowIntensity: preset.options.shadowIntensity,
      spacingDensity: preset.options.spacingDensity,
    }),
  }));
}

export function getThemeCssVariables(tokens: ThemeTokens) {
  const displayStack = getThemeFontStack(tokens.fontDisplay);
  const bodyStack = getThemeFontStack(tokens.fontBody);

  return {
    "--theme-font-display-stack": displayStack,
    "--theme-font-sans-stack": bodyStack,
    "--theme-background": tokens.surfaces.background,
    "--theme-background-alt": tokens.surfaces.backgroundAlt,
    "--theme-panel": tokens.surfaces.panel,
    "--theme-elevated": tokens.surfaces.elevated,
    "--theme-border": tokens.surfaces.border,
    "--theme-foreground": tokens.surfaces.foreground,
    "--theme-muted": tokens.surfaces.muted,
    "--theme-accent": tokens.surfaces.accent,
    "--theme-accent-soft": tokens.surfaces.accentSoft,
    "--theme-accent-foreground": tokens.surfaces.accentForeground,
    "--theme-panel-foreground": pickReadableTextColor(tokens.surfaces.panel),
    "--theme-elevated-foreground": pickReadableTextColor(tokens.surfaces.elevated),
    "--theme-glow": tokens.surfaces.glow,
    "--theme-success": tokens.surfaces.success,
    "--theme-warning": tokens.surfaces.warning,
    "--theme-danger": tokens.surfaces.danger,
    "--theme-font-scale": `${tokens.fontScale}`,
    "--theme-line-height-scale": `${tokens.lineHeightScale}`,
    "--theme-glow-intensity": `${tokens.glowIntensity}`,
    "--theme-radius": `${tokens.radius}px`,
    "--theme-radius-lg": `${Math.round(tokens.radius * 1.2)}px`,
    "--theme-shadow":
      tokens.mode === "dark"
        ? `0 22px 80px rgba(0, 0, 0, ${0.22 * tokens.shadowIntensity}), 0 10px 28px rgba(0, 0, 0, ${0.16 * tokens.shadowIntensity})`
        : `0 24px 64px rgba(16, 23, 35, ${0.14 * tokens.shadowIntensity}), 0 8px 24px rgba(16, 23, 35, ${0.08 * tokens.shadowIntensity})`,
    "--theme-spacing-density": `${tokens.spacingDensity}`,
  };
}

export function exportThemePayload(
  tokens: ThemeTokens,
  branding: AgencyBranding,
) {
  return JSON.stringify({ tokens, branding }, null, 2);
}

/**
 * Parse exported theme JSON (or a minimal `{ tokens, branding }` object).
 * Rebuilds surfaces via `createThemeTokens` so partial payloads stay valid.
 */
export function parseThemeImportPayload(raw: string): {
  tokens: ThemeTokens;
  branding: AgencyBranding;
} | null {
  try {
    const data = JSON.parse(raw) as {
      tokens?: Partial<ThemeTokens> & {
        mode?: ThemeMode;
        accentColor?: string;
        fontProfile?: ThemeFontProfile;
      };
      branding?: Partial<AgencyBranding>;
    };

    if (!data.tokens || typeof data.tokens !== "object") {
      return null;
    }

    const branding: AgencyBranding = {
      ...defaultBranding,
      ...data.branding,
      logoColor: data.branding?.logoColor ?? defaultBranding.logoColor ?? "",
      logoScale:
        typeof data.branding?.logoScale === "number"
          ? data.branding.logoScale
          : defaultBranding.logoScale,
    };

    const accentFromBranding = branding.accentOverride?.trim();
    const accentColor =
      accentFromBranding ||
      (typeof data.tokens.accentColor === "string" && data.tokens.accentColor.trim()
        ? data.tokens.accentColor.trim()
        : "#f7b21b");

    const legacyProfile: ThemeFontProfile | undefined =
      data.tokens.fontProfile === "precision" || data.tokens.fontProfile === "terminal"
        ? data.tokens.fontProfile
        : data.tokens.fontProfile === "instrument"
          ? "instrument"
          : undefined;
    const accentHueShift =
      typeof data.tokens.accentHueShift === "number" && Number.isFinite(data.tokens.accentHueShift)
        ? clamp(data.tokens.accentHueShift, -24, 24)
        : 0;

    const fontDisplay = isThemeFontStackId(data.tokens.fontDisplay)
      ? data.tokens.fontDisplay
      : undefined;
    const fontBody = isThemeFontStackId(data.tokens.fontBody) ? data.tokens.fontBody : undefined;

    const tokens = createThemeTokens({
      mode: data.tokens.mode ?? "dark",
      accentColor,
      accentHueShift,
      fontDisplay,
      fontBody,
      fontProfile: legacyProfile,
      fontScale: data.tokens.fontScale,
      lineHeightScale: data.tokens.lineHeightScale,
      glowIntensity: data.tokens.glowIntensity,
      radius: data.tokens.radius,
      shadowIntensity: data.tokens.shadowIntensity,
      spacingDensity: data.tokens.spacingDensity,
    });

    return { tokens, branding };
  } catch {
    return null;
  }
}

export function getContrastChecks(tokens: ThemeTokens) {
  return {
    foregroundOnBackground: contrastRatio(
      tokens.surfaces.foreground,
      tokens.surfaces.background,
    ),
    accentOnAccentForeground: contrastRatio(
      tokens.surfaces.accentForeground,
      tokens.surfaces.accent,
    ),
  };
}
