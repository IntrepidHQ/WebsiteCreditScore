"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AgencyBranding, ThemeFontProfile, ThemeMode, ThemeTokens } from "@/lib/types/audit";
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

interface ThemeState {
  tokens: ThemeTokens;
  branding: AgencyBranding;
  motionPreference: MotionPreference;
  presetId: string | null;
  setMode: (mode: ThemeMode) => void;
  setAccentColor: (accentColor: string) => void;
  setFontScale: (fontScale: number) => void;
  setLineHeightScale: (lineHeightScale: number) => void;
  setGlowIntensity: (glowIntensity: number) => void;
  setRadius: (radius: number) => void;
  setShadowIntensity: (shadowIntensity: number) => void;
  setSpacingDensity: (spacingDensity: number) => void;
  setFontProfile: (fontProfile: ThemeFontProfile) => void;
  setAccentHueShift: (accentHueShift: number) => void;
  applyLayoutDensity: (density: "compact" | "comfortable" | "spacious") => void;
  setMotionPreference: (preference: MotionPreference) => void;
  setLogoColor: (logoColor: string) => void;
  setLogoScale: (logoScale: number) => void;
  applyPreset: (presetId: string) => void;
  randomizeTheme: () => void;
  restoreDefaults: () => void;
  updateBranding: (patch: Partial<AgencyBranding>) => void;
  exportThemeJson: () => string;
  importThemeJson: (raw: string) => boolean;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

const defaultTokens = createThemeTokens();
const themePresets = getThemePresets();

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      tokens: defaultTokens,
      branding: defaultBranding,
      motionPreference: "system",
      presetId: themePresets[0]?.id ?? null,
      setMode: (mode) =>
        set((state) => ({
          presetId: null,
          tokens: createThemeTokens({
            ...state.tokens,
            mode,
            accentColor: state.branding.accentOverride || state.tokens.accentColor,
          }),
        })),
      setAccentColor: (accentColor) =>
        set((state) => ({
          presetId: null,
          tokens: createThemeTokens({
            ...state.tokens,
            accentColor,
            accentHueShift: 0,
          }),
        })),
      setFontProfile: (fontProfile) =>
        set((state) => ({
          presetId: null,
          tokens: createThemeTokens({
            ...state.tokens,
            fontProfile,
          }),
        })),
      setAccentHueShift: (accentHueShift) =>
        set((state) => ({
          presetId: null,
          tokens: createThemeTokens({
            ...state.tokens,
            accentHueShift,
          }),
        })),
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
          };
        }),
      setFontScale: (fontScale) =>
        set((state) => ({
          presetId: null,
          tokens: createThemeTokens({
            ...state.tokens,
            fontScale,
          }),
        })),
      setLineHeightScale: (lineHeightScale) =>
        set((state) => ({
          presetId: null,
          tokens: createThemeTokens({
            ...state.tokens,
            lineHeightScale,
          }),
        })),
      setGlowIntensity: (glowIntensity) =>
        set((state) => ({
          presetId: null,
          tokens: createThemeTokens({
            ...state.tokens,
            glowIntensity,
          }),
        })),
      setRadius: (radius) =>
        set((state) => ({
          presetId: null,
          tokens: createThemeTokens({
            ...state.tokens,
            radius,
          }),
        })),
      setShadowIntensity: (shadowIntensity) =>
        set((state) => ({
          presetId: null,
          tokens: createThemeTokens({
            ...state.tokens,
            shadowIntensity,
          }),
        })),
      setSpacingDensity: (spacingDensity) =>
        set((state) => ({
          presetId: null,
          tokens: createThemeTokens({
            ...state.tokens,
            spacingDensity,
          }),
        })),
      setMotionPreference: (motionPreference) => set({ motionPreference }),
      setLogoColor: (logoColor) =>
        set((state) => ({
          branding: { ...state.branding, logoColor },
        })),
      setLogoScale: (logoScale) =>
        set((state) => ({
          branding: {
            ...state.branding,
            logoScale: clamp(logoScale, 0.75, 1.5),
          },
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
              fontProfile: state.tokens.fontProfile,
            }),
          };
        }),
      randomizeTheme: () =>
        set((state) => ({
          presetId: null,
          tokens: createRandomTheme(state.tokens.mode),
        })),
      restoreDefaults: () =>
        set({
          tokens: defaultTokens,
          branding: defaultBranding,
          motionPreference: "system",
          presetId: themePresets[0]?.id ?? null,
        }),
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
          };
        }),
      exportThemeJson: () => exportThemePayload(get().tokens, get().branding),
      importThemeJson: (raw) => {
        const parsed = parseThemeImportPayload(raw);
        if (!parsed) {
          return false;
        }
        set({
          presetId: null,
          tokens: parsed.tokens,
          branding: parsed.branding,
        });
        return true;
      },
    }),
    {
      name: "premium-audit-theme-store",
      storage: createJSONStorage(() => themeScopedStorage),
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
          tokens: persisted.tokens
            ? createThemeTokens(persisted.tokens)
            : currentState.tokens,
          presetId: persisted.presetId ?? currentState.presetId,
        };
      },
    },
  ),
);
