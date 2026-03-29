"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AgencyBranding, ThemeMode, ThemeTokens } from "@/lib/types/audit";
import {
  createRandomTheme,
  createThemeTokens,
  defaultBranding,
  exportThemePayload,
  getThemePresets,
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
  setRadius: (radius: number) => void;
  setShadowIntensity: (shadowIntensity: number) => void;
  setSpacingDensity: (spacingDensity: number) => void;
  setMotionPreference: (preference: MotionPreference) => void;
  applyPreset: (presetId: string) => void;
  randomizeTheme: () => void;
  restoreDefaults: () => void;
  updateBranding: (patch: Partial<AgencyBranding>) => void;
  exportThemeJson: () => string;
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
          }),
        })),
      setFontScale: (fontScale) =>
        set((state) => ({
          presetId: null,
          tokens: createThemeTokens({
            ...state.tokens,
            fontScale,
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
    }),
    {
      name: "premium-audit-theme-store",
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<ThemeState>;

        return {
          ...currentState,
          ...persisted,
          tokens: persisted.tokens
            ? createThemeTokens(persisted.tokens)
            : currentState.tokens,
          presetId: persisted.presetId ?? currentState.presetId,
        };
      },
    },
  ),
);
