"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type {
  AgencyBranding,
  HeroBackdropKind,
  HeroGridPattern,
  HeroNodeGridPreset,
  ThemeColorHarmony,
  ThemeFontStackId,
  ThemeMode,
  ThemeSurfaceFinish,
  ThemeTokens,
} from "@/lib/types/audit";
import type { ThemeHeadingLevel } from "@/lib/utils/theme";
import { themeScopedStorage } from "@/lib/theme/theme-scoped-storage";
import {
  createRandomTheme,
  createThemeTokens,
  defaultBranding,
  exportThemePayload,
  getThemePresets,
  parseThemeImportPayload,
} from "@/lib/utils/theme";

type MotionPreference = "system" | "reduced";

export type CursorEffectsSettings = {
  /** Marketing hero magnifier lens (cursor effect). */
  heroMagnifierLens: boolean;
};

type ThemeSnapshot = {
  tokens: ThemeTokens;
  branding: AgencyBranding;
  presetId: string | null;
};

interface ThemeState {
  tokens: ThemeTokens;
  branding: AgencyBranding;
  motionPreference: MotionPreference;
  cursorEffects: CursorEffectsSettings;
  presetId: string | null;
  undoStack: ThemeSnapshot[];
  redoStack: ThemeSnapshot[];
  setMode: (mode: ThemeMode) => void;
  setAccentColor: (accentColor: string) => void;
  setFontScale: (fontScale: number) => void;
  setDisplayTitleScale: (displayTitleScale: number) => void;
  setLineHeightScale: (lineHeightScale: number) => void;
  setGlowIntensity: (glowIntensity: number) => void;
  setRadius: (radius: number) => void;
  setShadowIntensity: (shadowIntensity: number) => void;
  setShadowSpread: (shadowSpread: number) => void;
  setSpacingDensity: (spacingDensity: number) => void;
  setHeroGridPattern: (heroGridPattern: HeroGridPattern) => void;
  setHeroBackdropKind: (heroBackdropKind: HeroBackdropKind) => void;
  setHeroNodeGridPreset: (heroNodeGridPreset: HeroNodeGridPreset) => void;
  applyHeroNodeGridCanvas: (payload: {
    heroNodeGridPreset: HeroNodeGridPreset;
    heroNodeGridGridType: string | null;
    heroNodeGridCellSize: number;
    heroNodeGridStrokeScale: number;
  }) => void;
  setFontDisplay: (fontDisplay: ThemeFontStackId) => void;
  setFontBody: (fontBody: ThemeFontStackId) => void;
  setHeadingScale: (level: ThemeHeadingLevel, scale: number) => void;
  setAccentHueShift: (accentHueShift: number) => void;
  setColorHarmony: (colorHarmony: ThemeColorHarmony) => void;
  setSurfaceFinish: (surfaceFinish: ThemeSurfaceFinish) => void;
  setGlassFillOpacity: (glassFillOpacity: number) => void;
  setGlassStrokeOpacity: (glassStrokeOpacity: number) => void;
  setDropShadowEnabled: (dropShadowEnabled: boolean) => void;
  applyLayoutDensity: (density: "compact" | "comfortable" | "spacious") => void;
  setMotionPreference: (preference: MotionPreference) => void;
  setCursorEffectHeroMagnifierLens: (enabled: boolean) => void;
  setLogoColor: (logoColor: string) => void;
  setLogoScale: (logoScale: number) => void;
  applyPreset: (presetId: string) => void;
  clearPresetSelection: () => void;
  randomizeTheme: () => void;
  restoreDefaults: () => void;
  updateBranding: (patch: Partial<AgencyBranding>) => void;
  exportThemeJson: () => string;
  importThemeJson: (raw: string) => boolean;
  undoTheme: () => void;
  redoTheme: () => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

const cloneSnapshot = (state: {
  tokens: ThemeTokens;
  branding: AgencyBranding;
  presetId: string | null;
}): ThemeSnapshot => ({
  tokens: JSON.parse(JSON.stringify(state.tokens)) as ThemeTokens,
  branding: JSON.parse(JSON.stringify(state.branding)) as AgencyBranding,
  presetId: state.presetId,
});

const defaultTokens = createThemeTokens();
const themePresets = getThemePresets();

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      tokens: defaultTokens,
      branding: defaultBranding,
      motionPreference: "system",
      cursorEffects: { heroMagnifierLens: true },
      presetId: themePresets[0]?.id ?? null,
      undoStack: [],
      redoStack: [],
      undoTheme: () =>
        set((state) => {
          if (!state.undoStack.length) {
            return state;
          }

          const previous = state.undoStack[state.undoStack.length - 1]!;
          const current = cloneSnapshot(state);

          return {
            tokens: createThemeTokens(previous.tokens),
            branding: previous.branding,
            presetId: previous.presetId,
            undoStack: state.undoStack.slice(0, -1),
            redoStack: [current, ...state.redoStack].slice(0, 50),
          };
        }),
      redoTheme: () =>
        set((state) => {
          if (!state.redoStack.length) {
            return state;
          }

          const [next, ...rest] = state.redoStack;
          const current = cloneSnapshot(state);

          return {
            tokens: createThemeTokens(next.tokens),
            branding: next.branding,
            presetId: next.presetId,
            redoStack: rest,
            undoStack: [...state.undoStack, current].slice(-50),
          };
        }),
      setMode: (mode) =>
        set((state) => ({
          presetId: null,
          tokens: createThemeTokens({
            ...state.tokens,
            mode,
            accentColor: state.branding.accentOverride || state.tokens.accentColor,
          }),
          undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
          redoStack: [],
        })),
      setAccentColor: (accentColor) =>
        set((state) => ({
          presetId: null,
          tokens: createThemeTokens({
            ...state.tokens,
            accentColor,
            accentHueShift: 0,
          }),
          undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
          redoStack: [],
        })),
      setFontDisplay: (fontDisplay) =>
        set((state) => ({
          presetId: null,
          tokens: createThemeTokens({
            ...state.tokens,
            fontDisplay,
          }),
          undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
          redoStack: [],
        })),
      setFontBody: (fontBody) =>
        set((state) => ({
          presetId: null,
          tokens: createThemeTokens({
            ...state.tokens,
            fontBody,
          }),
          undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
          redoStack: [],
        })),
      setHeadingScale: (level, scale) =>
        set((state) => {
          const base = { ...state.tokens };
          if (level === 1) {
            base.headingScaleH1 = scale;
          } else if (level === 2) {
            base.headingScaleH2 = scale;
          } else if (level === 3) {
            base.headingScaleH3 = scale;
          } else if (level === 4) {
            base.headingScaleH4 = scale;
          } else if (level === 5) {
            base.headingScaleH5 = scale;
          } else {
            base.headingScaleH6 = scale;
          }

          return {
            presetId: null,
            tokens: createThemeTokens(base),
            undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
            redoStack: [],
          };
        }),
      setAccentHueShift: (accentHueShift) =>
        set((state) => ({
          presetId: null,
          tokens: createThemeTokens({
            ...state.tokens,
            accentHueShift,
          }),
          undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
          redoStack: [],
        })),
      setColorHarmony: (colorHarmony) =>
        set((state) => ({
          presetId: null,
          tokens: createThemeTokens({
            ...state.tokens,
            colorHarmony,
          }),
          undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
          redoStack: [],
        })),
      setSurfaceFinish: (surfaceFinish) =>
        set((state) => ({
          tokens: createThemeTokens({
            ...state.tokens,
            surfaceFinish,
            dropShadowEnabled: surfaceFinish === "glassmorphic" ? false : state.tokens.dropShadowEnabled,
          }),
          undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
          redoStack: [],
        })),
      setGlassFillOpacity: (glassFillOpacity) =>
        set((state) => ({
          presetId: null,
          tokens: createThemeTokens({
            ...state.tokens,
            glassFillOpacity,
          }),
          undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
          redoStack: [],
        })),
      setGlassStrokeOpacity: (glassStrokeOpacity) =>
        set((state) => ({
          presetId: null,
          tokens: createThemeTokens({
            ...state.tokens,
            glassStrokeOpacity,
          }),
          undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
          redoStack: [],
        })),
      setDropShadowEnabled: (dropShadowEnabled) =>
        set((state) => {
          const next =
            state.tokens.surfaceFinish === "glassmorphic" ? false : dropShadowEnabled;

          return {
            presetId: null,
            tokens: createThemeTokens({
              ...state.tokens,
              dropShadowEnabled: next,
            }),
            undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
            redoStack: [],
          };
        }),
      applyLayoutDensity: (density) =>
        set((state) => {
          const base = {
            ...state.tokens,
            accentColor: state.branding.accentOverride || state.tokens.accentColor,
          };
          if (density === "compact") {
            return {
              presetId: null,
              tokens: createThemeTokens({
                ...base,
                fontScale: 0.94,
                lineHeightScale: 0.96,
                spacingDensity: 0.9,
                radius: 9,
                shadowIntensity: 0.72,
              }),
              undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
              redoStack: [],
            };
          }
          if (density === "spacious") {
            return {
              presetId: null,
              tokens: createThemeTokens({
                ...base,
                fontScale: 1.06,
                lineHeightScale: 1.06,
                spacingDensity: 1.08,
                radius: 14,
                shadowIntensity: 0.92,
              }),
              undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
              redoStack: [],
            };
          }
          return {
            presetId: null,
            tokens: createThemeTokens({
              ...base,
              fontScale: 1,
              lineHeightScale: 1,
              spacingDensity: 1,
              radius: 12,
              shadowIntensity: 0.82,
            }),
            undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
            redoStack: [],
          };
        }),
      setFontScale: (fontScale) =>
        set((state) => ({
          presetId: null,
          tokens: createThemeTokens({
            ...state.tokens,
            fontScale,
          }),
          undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
          redoStack: [],
        })),
      setDisplayTitleScale: (displayTitleScale) =>
        set((state) => ({
          presetId: null,
          tokens: createThemeTokens({
            ...state.tokens,
            displayTitleScale,
          }),
          undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
          redoStack: [],
        })),
      setLineHeightScale: (lineHeightScale) =>
        set((state) => ({
          presetId: null,
          tokens: createThemeTokens({
            ...state.tokens,
            lineHeightScale,
          }),
          undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
          redoStack: [],
        })),
      setGlowIntensity: (glowIntensity) =>
        set((state) => ({
          presetId: null,
          tokens: createThemeTokens({
            ...state.tokens,
            glowIntensity,
          }),
          undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
          redoStack: [],
        })),
      setRadius: (radius) =>
        set((state) => ({
          presetId: null,
          tokens: createThemeTokens({
            ...state.tokens,
            radius,
          }),
          undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
          redoStack: [],
        })),
      setShadowIntensity: (shadowIntensity) =>
        set((state) => ({
          presetId: null,
          tokens: createThemeTokens({
            ...state.tokens,
            shadowIntensity,
          }),
          undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
          redoStack: [],
        })),
      setShadowSpread: (shadowSpread) =>
        set((state) => ({
          presetId: null,
          tokens: createThemeTokens({
            ...state.tokens,
            shadowSpread,
          }),
          undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
          redoStack: [],
        })),
      setSpacingDensity: (spacingDensity) =>
        set((state) => ({
          presetId: null,
          tokens: createThemeTokens({
            ...state.tokens,
            spacingDensity,
          }),
          undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
          redoStack: [],
        })),
      setHeroGridPattern: (heroGridPattern) =>
        set((state) => ({
          presetId: null,
          tokens: createThemeTokens({
            ...state.tokens,
            heroGridPattern,
          }),
          undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
          redoStack: [],
        })),
      setHeroBackdropKind: (heroBackdropKind) =>
        set((state) => ({
          presetId: null,
          tokens: createThemeTokens({
            ...state.tokens,
            heroBackdropKind,
          }),
          undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
          redoStack: [],
        })),
      setHeroNodeGridPreset: (heroNodeGridPreset) =>
        set((state) => ({
          presetId: null,
          tokens: createThemeTokens({
            ...state.tokens,
            heroNodeGridPreset,
            // Clicking a preset card resets any custom grid type from the tuner
            heroNodeGridGridType: null,
          }),
          undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
          redoStack: [],
        })),
      applyHeroNodeGridCanvas: (payload) =>
        set((state) => ({
          presetId: null,
          tokens: createThemeTokens({
            ...state.tokens,
            heroNodeGridPreset: payload.heroNodeGridPreset,
            heroNodeGridGridType: payload.heroNodeGridGridType,
            heroNodeGridCellSize: payload.heroNodeGridCellSize,
            heroNodeGridStrokeScale: payload.heroNodeGridStrokeScale,
          }),
          undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
          redoStack: [],
        })),
      setMotionPreference: (motionPreference) => set({ motionPreference }),
      setCursorEffectHeroMagnifierLens: (heroMagnifierLens) =>
        set({ cursorEffects: { heroMagnifierLens } }),
      setLogoColor: (logoColor) =>
        set((state) => ({
          branding: { ...state.branding, logoColor },
          undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
          redoStack: [],
        })),
      setLogoScale: (logoScale) =>
        set((state) => ({
          branding: {
            ...state.branding,
            logoScale: clamp(logoScale, 0.75, 1.5),
          },
          undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
          redoStack: [],
        })),
      applyPreset: (presetId) =>
        set((state) => {
          const preset = themePresets.find((item) => item.id === presetId);

          if (!preset) {
            return state;
          }

          return {
            presetId,
            tokens: createThemeTokens({
              ...preset.tokens,
              accentColor:
                state.branding.accentOverride || preset.tokens.accentColor,
              accentHueShift: 0,
            }),
            undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
            redoStack: [],
          };
        }),
      clearPresetSelection: () => set({ presetId: null }),
      randomizeTheme: () =>
        set((state) => ({
          presetId: null,
          tokens: createRandomTheme(state.tokens.mode),
          undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
          redoStack: [],
        })),
      restoreDefaults: () =>
        set((state) => ({
          tokens: defaultTokens,
          branding: defaultBranding,
          motionPreference: "system",
          cursorEffects: { heroMagnifierLens: true },
          presetId: themePresets[0]?.id ?? null,
          undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
          redoStack: [],
        })),
      updateBranding: (patch) =>
        set((state) => {
          const branding = { ...state.branding, ...patch };
          const accentColor = branding.accentOverride || state.tokens.accentColor;

          return {
            branding,
            tokens: createThemeTokens({
              ...state.tokens,
              accentColor,
            }),
            undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
            redoStack: [],
          };
        }),
      exportThemeJson: () => exportThemePayload(get().tokens, get().branding),
      importThemeJson: (raw) => {
        const parsed = parseThemeImportPayload(raw);
        if (!parsed) {
          return false;
        }
        set((state) => ({
          presetId: null,
          tokens: parsed.tokens,
          branding: parsed.branding,
          undoStack: [...state.undoStack, cloneSnapshot(state)].slice(-50),
          redoStack: [],
        }));
        return true;
      },
    }),
    {
      name: "premium-audit-theme-store",
      storage: createJSONStorage(() => themeScopedStorage),
      partialize: (state) => ({
        tokens: state.tokens,
        branding: state.branding,
        motionPreference: state.motionPreference,
        cursorEffects: state.cursorEffects,
        presetId: state.presetId,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<ThemeState>;
        const persistedBranding = persisted.branding
          ? {
              ...defaultBranding,
              ...persisted.branding,
              logoColor: persisted.branding.logoColor ?? defaultBranding.logoColor,
              logoScale: persisted.branding.logoScale ?? defaultBranding.logoScale,
            }
          : currentState.branding;

        return {
          ...currentState,
          ...persisted,
          branding: persistedBranding,
          cursorEffects: {
            heroMagnifierLens:
              persisted.cursorEffects?.heroMagnifierLens !== false,
          },
          tokens: persisted.tokens
            ? createThemeTokens(persisted.tokens)
            : currentState.tokens,
          presetId: persisted.presetId ?? currentState.presetId,
          undoStack: [],
          redoStack: [],
        };
      },
    },
  ),
);
