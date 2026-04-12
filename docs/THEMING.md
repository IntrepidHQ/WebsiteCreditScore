# Theming

WebsiteCreditScore.com applies workspace styling through CSS variables (`--theme-*`) that are written at runtime from a persisted `ThemeTokens` object (`src/store/theme-store.ts`, merged on load via `createThemeTokens` in `src/lib/utils/theme.ts`).

## Tokens and contrast

- **Body text** uses `surfaces.foreground` on `surfaces.background`. The generator keeps this contrast above **4.5:1** in normal presets.
- **Primary buttons** use `surfaces.accent` with `surfaces.accentForeground`. `ensureAccessibleAccent` nudges the accent if label-on-fill contrast falls below **4.5:1**.
- **Semantic colors** (`success`, `warning`, `danger`) are fixed ramps so status UI stays predictable across harmonies.

## Color harmony models

`ThemeTokens.colorHarmony` controls how **background, panel, elevated, and border** hues are derived from the accent:

| Harmony           | What it does                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| `monochromatic`   | Surfaces stay in the same hue family as the accent (classic studio wash). Default for older saves. |
| `complementary`   | Surfaces lean into the **opposite** hue on the wheel while the accent hex stays your brand color.  |
| `analogous`       | Surfaces alternate **~±32°** from the accent for layered fields without neon edges.                  |

Changing harmony **does not** change your stored `accentColor`; it only rebuilds neutral surfaces. Pair harmony with **Accent hue shift** in Settings for finer tuning.

## Presets

Named presets live in `getAllThemePresetSeeds()` (`src/lib/benchmarks/library/index.ts`). Each seed can set `colorHarmony` (optional; defaults to monochromatic). Try:

- **Lagoon Complementary** — teal accent on cooler complementary canvas.
- **Orchard Analogous** — amber accent with warm analogous depth.
- **Meadow Analogous** — green accent on a light analogous daylight base.

## Import / export

Theme JSON includes `tokens.colorHarmony` when exported from Settings. Imports run through `parseThemeImportPayload`, which rebuilds surfaces with `createThemeTokens` so partial files remain valid.

## Where variables land

`getThemeCssVariables` maps tokens to `--theme-background`, `--theme-accent`, etc. `ThemeStyleProvider` applies them to the document (see `src/components/common/theme-style-provider.tsx`). Tailwind theme tokens read those CSS variables (`src/app/globals.css`, `@theme inline`).
