import type {
  AgencyBranding,
  HeroGridPattern,
  ThemeColorHarmony,
  ThemeFontProfile,
  ThemeFontStackId,
  ThemeMode,
  ThemePreset,
  ThemeSurfaceFinish,
  ThemeTokens,
} from "@/lib/types/audit";
import { getAllThemePresetSeeds } from "@/lib/benchmarks/library";

type ThemeTokensInput = Partial<ThemeTokens> & { fontProfile?: ThemeFontProfile };

const THEME_FONT_STACK_IDS: ThemeFontStackId[] = [
  "instrument-serif",
  "space-grotesk",
  "manrope",
  "inter",
  "playfair-display",
  "dm-sans",
  "jetbrains-mono",
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
    helper: "Premium editorial display (Google font via Next)",
  },
  {
    id: "playfair-display",
    label: "Playfair Display",
    helper: "High-contrast editorial serif (Google font via Next)",
  },
  {
    id: "space-grotesk",
    label: "Space Grotesk",
    helper: "Geometric sans for headlines or UI (Google font via Next)",
  },
  {
    id: "manrope",
    label: "Manrope",
    helper: "Rounded UI sans (Google font via Next)",
  },
  {
    id: "dm-sans",
    label: "DM Sans",
    helper: "Friendly geometric sans (Google font via Next)",
  },
  {
    id: "inter",
    label: "Inter",
    helper: "Neutral UI sans (Google font via Next)",
  },
  {
    id: "jetbrains-mono",
    label: "JetBrains Mono",
    helper: "Technical monospace (Google font via Next)",
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

export type ThemeHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export const THEME_HEADING_LEVELS: ThemeHeadingLevel[] = [1, 2, 3, 4, 5, 6];

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
    case "instrument-serif":
      return `var(--font-instrument-serif), "Instrument Serif", Georgia, "Times New Roman", serif`;
    case "playfair-display":
      return `var(--font-playfair-display), "Playfair Display", Georgia, "Times New Roman", serif`;
    case "space-grotesk":
      return `var(--font-space-grotesk), "Space Grotesk", ui-sans-serif, sans-serif`;
    case "manrope":
      return `var(--font-manrope), "Manrope", ui-sans-serif, system-ui, sans-serif`;
    case "dm-sans":
      return `var(--font-dm-sans), "DM Sans", ui-sans-serif, system-ui, sans-serif`;
    case "inter":
      return `var(--font-inter), "Inter", ui-sans-serif, system-ui, sans-serif`;
    case "jetbrains-mono":
      return `var(--font-jetbrains-mono), "JetBrains Mono", ui-monospace, SFMono-Regular, monospace`;
    case "system-serif":
      return `ui-serif, Georgia, "Times New Roman", serif`;
    case "system-sans":
      return `ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`;
    default:
      return `var(--font-instrument-serif), "Instrument Serif", Georgia, "Times New Roman", serif`;
  }
}

function buildMonochromaticSurfaces(accentHex: string, mode: ThemeMode) {
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

function buildComplementarySurfaces(accentHex: string, mode: ThemeMode) {
  const accentRgb = hexToRgb(accentHex);
  const { h } = rgbToHsl(accentRgb.red, accentRgb.green, accentRgb.blue);
  const comp = (h + 180) % 360;
  const isDark = mode === "dark";

  const background = isDark ? hslToHex(comp, 24, 7) : hslToHex(comp, 20, 97);
  const backgroundAlt = isDark
    ? hslToHex((comp + 12) % 360, 22, 10)
    : hslToHex(h, 18, 95);
  const panel = isDark ? hslToHex((comp + 6) % 360, 20, 12) : hslToHex(h, 24, 100);
  const elevated = isDark
    ? hslToHex((comp + 2) % 360, 16, 16)
    : hslToHex(h, 14, 92);
  const border = isDark ? hslToHex(comp, 16, 24) : hslToHex(h, 22, 82);
  const foreground = isDark ? "#f4f7fb" : "#101723";
  const muted = isDark ? "#a7b4c8" : "#5f6878";
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

function buildAnalogousSurfaces(accentHex: string, mode: ThemeMode) {
  const accentRgb = hexToRgb(accentHex);
  const { h } = rgbToHsl(accentRgb.red, accentRgb.green, accentRgb.blue);
  const left = (h - 32 + 360) % 360;
  const right = (h + 32) % 360;
  const isDark = mode === "dark";

  const background = isDark ? hslToHex(left, 24, 7) : hslToHex(left, 22, 98);
  const backgroundAlt = isDark
    ? hslToHex(h, 22, 10)
    : hslToHex(h, 20, 96);
  const panel = isDark ? hslToHex(right, 22, 12) : hslToHex(right, 18, 100);
  const elevated = isDark
    ? hslToHex(h, 18, 16)
    : hslToHex((h + 12) % 360, 12, 92);
  const border = isDark ? hslToHex(h, 16, 24) : hslToHex(h, 22, 82);
  const foreground = isDark ? "#f4f7fb" : "#101723";
  const muted = isDark ? "#9aa8bd" : "#5f6878";
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

function hueStep(h: number, delta: number) {
  return ((h + delta) % 360 + 360) % 360;
}

function buildSplitComplementarySurfaces(accentHex: string, mode: ThemeMode) {
  const accentRgb = hexToRgb(accentHex);
  const { h } = rgbToHsl(accentRgb.red, accentRgb.green, accentRgb.blue);
  const comp = hueStep(h, 180);
  const splitA = hueStep(comp, -30);
  const splitB = hueStep(comp, 30);
  const isDark = mode === "dark";

  const background = isDark ? hslToHex(splitA, 24, 7) : hslToHex(splitA, 20, 97);
  const backgroundAlt = isDark
    ? hslToHex(splitB, 22, 10)
    : hslToHex(splitB, 18, 95);
  const panel = isDark ? hslToHex(h, 22, 12) : hslToHex(h, 24, 100);
  const elevated = isDark
    ? hslToHex(splitB, 18, 16)
    : hslToHex(h, 14, 92);
  const border = isDark ? hslToHex(splitA, 16, 24) : hslToHex(h, 22, 82);
  const foreground = isDark ? "#f4f7fb" : "#101723";
  const muted = isDark ? "#a0aec2" : "#5f6878";
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

function buildTriadicSurfaces(accentHex: string, mode: ThemeMode) {
  const accentRgb = hexToRgb(accentHex);
  const { h } = rgbToHsl(accentRgb.red, accentRgb.green, accentRgb.blue);
  const t1 = hueStep(h, 120);
  const t2 = hueStep(h, 240);
  const isDark = mode === "dark";

  const background = isDark ? hslToHex(t1, 24, 7) : hslToHex(t1, 22, 97);
  const backgroundAlt = isDark
    ? hslToHex(t2, 22, 10)
    : hslToHex(t2, 20, 95);
  const panel = isDark ? hslToHex(h, 22, 12) : hslToHex(h, 24, 100);
  const elevated = isDark
    ? hslToHex(t2, 18, 16)
    : hslToHex(t1, 12, 92);
  const border = isDark ? hslToHex(t1, 16, 24) : hslToHex(h, 22, 82);
  const foreground = isDark ? "#f4f7fb" : "#101723";
  const muted = isDark ? "#a7b4c8" : "#5f6878";
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

function buildTetradicSurfaces(accentHex: string, mode: ThemeMode) {
  const accentRgb = hexToRgb(accentHex);
  const { h } = rgbToHsl(accentRgb.red, accentRgb.green, accentRgb.blue);
  const a = h;
  const b = hueStep(h, 180);
  const c = hueStep(h, 90);
  const d = hueStep(h, 270);
  const isDark = mode === "dark";

  const background = isDark ? hslToHex(c, 24, 7) : hslToHex(c, 20, 97);
  const backgroundAlt = isDark
    ? hslToHex(d, 22, 10)
    : hslToHex(d, 18, 95);
  const panel = isDark ? hslToHex(a, 22, 12) : hslToHex(a, 24, 100);
  const elevated = isDark
    ? hslToHex(b, 18, 16)
    : hslToHex(b, 14, 92);
  const border = isDark ? hslToHex(c, 16, 24) : hslToHex(a, 22, 82);
  const foreground = isDark ? "#f4f7fb" : "#101723";
  const muted = isDark ? "#a7b4c8" : "#5f6878";
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

function buildSquareSurfaces(accentHex: string, mode: ThemeMode) {
  const accentRgb = hexToRgb(accentHex);
  const { h } = rgbToHsl(accentRgb.red, accentRgb.green, accentRgb.blue);
  const s0 = h;
  const s1 = hueStep(h, 90);
  const s2 = hueStep(h, 180);
  const s3 = hueStep(h, 270);
  const isDark = mode === "dark";

  const background = isDark ? hslToHex(s1, 24, 7) : hslToHex(s1, 20, 97);
  const backgroundAlt = isDark
    ? hslToHex(s2, 22, 10)
    : hslToHex(s2, 18, 95);
  const panel = isDark ? hslToHex(s3, 22, 12) : hslToHex(s3, 18, 100);
  const elevated = isDark
    ? hslToHex(s0, 18, 16)
    : hslToHex(s0, 12, 92);
  const border = isDark ? hslToHex(s1, 16, 24) : hslToHex(s0, 22, 82);
  const foreground = isDark ? "#f4f7fb" : "#101723";
  const muted = isDark ? "#a7b4c8" : "#5f6878";
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

function buildSurfacePalette(accentHex: string, mode: ThemeMode, harmony: ThemeColorHarmony) {
  if (harmony === "complementary") {
    return buildComplementarySurfaces(accentHex, mode);
  }

  if (harmony === "analogous") {
    return buildAnalogousSurfaces(accentHex, mode);
  }

  if (harmony === "split-complementary") {
    return buildSplitComplementarySurfaces(accentHex, mode);
  }

  if (harmony === "triadic") {
    return buildTriadicSurfaces(accentHex, mode);
  }

  if (harmony === "tetradic") {
    return buildTetradicSurfaces(accentHex, mode);
  }

  if (harmony === "square") {
    return buildSquareSurfaces(accentHex, mode);
  }

  return buildMonochromaticSurfaces(accentHex, mode);
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

export const isThemeColorHarmony = (value: unknown): value is ThemeColorHarmony =>
  value === "monochromatic" ||
  value === "complementary" ||
  value === "analogous" ||
  value === "split-complementary" ||
  value === "triadic" ||
  value === "tetradic" ||
  value === "square";

const isThemeSurfaceFinish = (value: unknown): value is ThemeSurfaceFinish =>
  value === "solid" || value === "glassmorphic";

const HERO_GRID_PATTERN_IDS: HeroGridPattern[] = [
  "signal",
  "squares",
  "triangles",
  "hex",
  "web",
  "quantum",
];

export function isHeroGridPattern(value: unknown): value is HeroGridPattern {
  return typeof value === "string" && (HERO_GRID_PATTERN_IDS as string[]).includes(value);
}

/** Settings + landing hero lattice presets (robot-components–style layering). */
export const HERO_GRID_PATTERN_OPTIONS: Array<{
  id: HeroGridPattern;
  label: string;
  description: string;
}> = [
  { id: "signal", label: "Signal", description: "Accent crosshairs that track pointer position." },
  { id: "squares", label: "Squares", description: "Classic square lattice with soft vignette." },
  { id: "triangles", label: "Triangles", description: "Triangular mesh that parallax-shifts subtly." },
  { id: "hex", label: "Hex", description: "Honeycomb wireframe for technical depth." },
  { id: "web", label: "Web stack", description: "Squares + triangles + hex combined at low opacity." },
  { id: "quantum", label: "Quantum drift", description: "Diagonal hatch with slow animated shear." },
];

/** Tooltip copy stays technical; keep visible labels short. */
export const THEME_COLOR_HARMONY_OPTIONS: Array<{
  id: ThemeColorHarmony;
  label: string;
  srLabel: string;
  tooltip: string;
}> = [
  {
    id: "monochromatic",
    label: "Mono",
    srLabel: "Monochromatic harmony",
    tooltip: "One hue family: backgrounds track the accent with small lightness shifts.",
  },
  {
    id: "complementary",
    label: "Comp",
    srLabel: "Complementary harmony",
    tooltip: "Accent plus its opposite on the wheel for maximum hue contrast.",
  },
  {
    id: "analogous",
    label: "Analog",
    srLabel: "Analogous harmony",
    tooltip: "Neighboring hues (about ±32°) for smooth fields with less tension than complements.",
  },
  {
    id: "split-complementary",
    label: "Split",
    srLabel: "Split complementary harmony",
    tooltip:
      "Split-complementary: a variation on complementary color that uses the base color plus the two colors adjacent to its complement. High contrast with less tension than a strict complementary pair.",
  },
  {
    id: "triadic",
    label: "Triad",
    srLabel: "Triadic harmony",
    tooltip:
      "Triadic: three colors equally spaced around the wheel (a triangle), for example red, yellow, and blue. Vibrant, balanced, and harmonious.",
  },
  {
    id: "tetradic",
    label: "Tetra",
    srLabel: "Tetradic rectangular harmony",
    tooltip:
      "Tetradic (rectangular): four colors arranged as two complementary pairs, for example blue/orange and yellow/purple. Very dynamic; keep one color dominant.",
  },
  {
    id: "square",
    label: "Square",
    srLabel: "Square harmony",
    tooltip:
      "Square: four colors evenly spaced around the wheel (a square). Similar energy to tetradic; pick a lead hue for large fields.",
  },
];

export function getHarmonyPreviewSwatches(accentHex: string, harmony: ThemeColorHarmony): string[] {
  const { red, green, blue } = hexToRgb(accentHex);
  const { h } = rgbToHsl(red, green, blue);
  const comp = hueStep(h, 180);

  if (harmony === "monochromatic") {
    return [hslToHex(hueStep(h, 18), 26, 12), hslToHex(hueStep(h, 28), 22, 18), accentHex];
  }

  if (harmony === "complementary") {
    return [hslToHex(comp, 24, 10), hslToHex(hueStep(comp, 12), 20, 16), accentHex];
  }

  if (harmony === "analogous") {
    return [hslToHex(hueStep(h, -32), 24, 10), hslToHex(hueStep(h, 32), 22, 16), accentHex];
  }

  if (harmony === "split-complementary") {
    return [
      hslToHex(hueStep(comp, -30), 24, 10),
      hslToHex(hueStep(comp, 30), 22, 16),
      accentHex,
    ];
  }

  if (harmony === "triadic") {
    return [hslToHex(hueStep(h, 120), 24, 10), hslToHex(hueStep(h, 240), 22, 16), accentHex];
  }

  if (harmony === "tetradic") {
    return [hslToHex(hueStep(h, 90), 24, 10), hslToHex(hueStep(h, 270), 22, 16), accentHex];
  }

  if (harmony === "square") {
    return [hslToHex(hueStep(h, 90), 24, 10), hslToHex(hueStep(h, 180), 22, 16), accentHex];
  }

  return [hslToHex(hueStep(h, 18), 26, 12), hslToHex(hueStep(h, 28), 22, 18), accentHex];
}

export function createThemeTokens(options?: ThemeTokensInput) {
  const mode = options?.mode ?? "dark";
  /** Canonical accent from the picker / presets (hue shift is applied on top for surfaces). */
  const userAccent = options?.accentColor ?? "#f7b21b";
  const hueShift = clamp(options?.accentHueShift ?? 0, -24, 24);
  const shiftedAccent = rotateHexHue(userAccent, hueShift);
  const colorHarmony: ThemeColorHarmony = isThemeColorHarmony(options?.colorHarmony)
    ? options.colorHarmony
    : "monochromatic";
  const surfaceFinish: ThemeSurfaceFinish = isThemeSurfaceFinish(options?.surfaceFinish)
    ? options.surfaceFinish
    : "solid";
  const { fontDisplay, fontBody } = resolveThemeFontStacks(options);

  const headingClamp = (value: number | undefined) => clamp(value ?? 1, 0.72, 1.45);

  const tokens: ThemeTokens = {
    mode,
    accentColor: userAccent,
    colorHarmony,
    surfaceFinish,
    accentHueShift: hueShift,
    fontDisplay,
    fontBody,
    headingScaleH1: headingClamp(options?.headingScaleH1),
    headingScaleH2: headingClamp(options?.headingScaleH2),
    headingScaleH3: headingClamp(options?.headingScaleH3),
    headingScaleH4: headingClamp(options?.headingScaleH4),
    headingScaleH5: headingClamp(options?.headingScaleH5),
    headingScaleH6: headingClamp(options?.headingScaleH6),
    fontScale: clamp(options?.fontScale ?? 1, 0.9, 1.15),
    lineHeightScale: clamp(options?.lineHeightScale ?? 1, 0.9, 1.15),
    glowIntensity: clamp(options?.glowIntensity ?? 1, 0.55, 1.45),
    radius: clamp(options?.radius ?? 12, 8, 20),
    shadowIntensity: clamp(options?.shadowIntensity ?? 0.82, 0.3, 1.2),
    shadowSpread: clamp(
      typeof options?.shadowSpread === "number" && Number.isFinite(options.shadowSpread)
        ? options.shadowSpread
        : 0,
      0,
      20,
    ),
    spacingDensity: clamp(options?.spacingDensity ?? 1, 0.82, 1.18),
    heroGridPattern: isHeroGridPattern(options?.heroGridPattern) ? options.heroGridPattern : "web",
    surfaces: buildSurfacePalette(shiftedAccent, mode, colorHarmony),
  };

  return ensureAccessibleAccent(tokens);
}

const RANDOM_SURFACE_FINISHES: ThemeSurfaceFinish[] = ["solid", "glassmorphic"];

const pickRandomHarmony = (): ThemeColorHarmony => {
  const options = THEME_COLOR_HARMONY_OPTIONS.map((item) => item.id);
  return options[Math.floor(Math.random() * options.length)]!;
};

const pickRandomHeadingScale = () => clamp(0.78 + Math.random() * 0.42, 0.72, 1.45);

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
    colorHarmony: pickRandomHarmony(),
    surfaceFinish: RANDOM_SURFACE_FINISHES[Math.floor(Math.random() * RANDOM_SURFACE_FINISHES.length)]!,
    accentHueShift: Math.round(Math.random() * 48 - 24),
    fontDisplay,
    fontBody,
    headingScaleH1: pickRandomHeadingScale(),
    headingScaleH2: pickRandomHeadingScale(),
    headingScaleH3: pickRandomHeadingScale(),
    headingScaleH4: pickRandomHeadingScale(),
    headingScaleH5: pickRandomHeadingScale(),
    headingScaleH6: pickRandomHeadingScale(),
    fontScale: clamp(0.94 + Math.random() * 0.16, 0.92, 1.12),
    lineHeightScale: clamp(0.94 + Math.random() * 0.18, 0.92, 1.12),
    glowIntensity: clamp(0.75 + Math.random() * 0.55, 0.65, 1.35),
    radius: Math.round(clamp(8 + Math.random() * 10, 8, 18)),
    shadowIntensity: clamp(0.55 + Math.random() * 0.45, 0.45, 1),
    shadowSpread: Math.round(Math.random() * 14),
    spacingDensity: clamp(0.88 + Math.random() * 0.22, 0.84, 1.12),
    heroGridPattern: HERO_GRID_PATTERN_IDS[Math.floor(Math.random() * HERO_GRID_PATTERN_IDS.length)]!,
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
      colorHarmony: preset.options.colorHarmony,
      surfaceFinish: preset.options.surfaceFinish,
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
    "--theme-shadow": (() => {
      const spreadA = Math.round(tokens.shadowSpread);
      const spreadB = Math.round(tokens.shadowSpread * 0.55);
      return tokens.mode === "dark"
        ? `0 22px 80px ${spreadA}px rgba(0, 0, 0, ${0.22 * tokens.shadowIntensity}), 0 10px 28px ${spreadB}px rgba(0, 0, 0, ${0.16 * tokens.shadowIntensity})`
        : `0 24px 64px ${spreadA}px rgba(16, 23, 35, ${0.14 * tokens.shadowIntensity}), 0 8px 24px ${spreadB}px rgba(16, 23, 35, ${0.08 * tokens.shadowIntensity})`;
    })(),
    "--theme-shadow-spread": `${tokens.shadowSpread}px`,
    "--theme-spacing-density": `${tokens.spacingDensity}`,
    "--theme-heading-scale-h1": `${tokens.headingScaleH1}`,
    "--theme-heading-scale-h2": `${tokens.headingScaleH2}`,
    "--theme-heading-scale-h3": `${tokens.headingScaleH3}`,
    "--theme-heading-scale-h4": `${tokens.headingScaleH4}`,
    "--theme-heading-scale-h5": `${tokens.headingScaleH5}`,
    "--theme-heading-scale-h6": `${tokens.headingScaleH6}`,
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

    const colorHarmony = isThemeColorHarmony(data.tokens.colorHarmony)
      ? data.tokens.colorHarmony
      : undefined;

    const surfaceFinish = isThemeSurfaceFinish(data.tokens.surfaceFinish)
      ? data.tokens.surfaceFinish
      : undefined;

    const fontDisplay = isThemeFontStackId(data.tokens.fontDisplay)
      ? data.tokens.fontDisplay
      : undefined;
    const fontBody = isThemeFontStackId(data.tokens.fontBody) ? data.tokens.fontBody : undefined;

    const tokens = createThemeTokens({
      mode: data.tokens.mode ?? "dark",
      accentColor,
      colorHarmony,
      surfaceFinish,
      accentHueShift,
      fontDisplay,
      fontBody,
      fontProfile: legacyProfile,
      headingScaleH1: data.tokens.headingScaleH1,
      headingScaleH2: data.tokens.headingScaleH2,
      headingScaleH3: data.tokens.headingScaleH3,
      headingScaleH4: data.tokens.headingScaleH4,
      headingScaleH5: data.tokens.headingScaleH5,
      headingScaleH6: data.tokens.headingScaleH6,
      fontScale: data.tokens.fontScale,
      lineHeightScale: data.tokens.lineHeightScale,
      glowIntensity: data.tokens.glowIntensity,
      radius: data.tokens.radius,
      shadowIntensity: data.tokens.shadowIntensity,
      shadowSpread:
        typeof data.tokens.shadowSpread === "number" && Number.isFinite(data.tokens.shadowSpread)
          ? clamp(data.tokens.shadowSpread, 0, 20)
          : undefined,
      spacingDensity: data.tokens.spacingDensity,
      heroGridPattern: isHeroGridPattern(data.tokens.heroGridPattern)
        ? data.tokens.heroGridPattern
        : undefined,
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
