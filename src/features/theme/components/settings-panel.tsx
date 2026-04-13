"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { IconArrowBackUp, IconArrowForwardUp, IconLayout2, IconSparkles } from "@tabler/icons-react";
import { Download, RefreshCcw, Shuffle, Sparkles, Upload, Check, AlertCircle, Cloud } from "lucide-react";

import { saveWorkspaceThemeAction } from "@/app/app/actions";
import { THEME_SAVE_NO_SESSION } from "@/lib/theme/workspace-theme-save";

import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { WebsiteCreditScoreLogo } from "@/components/common/website-credit-score-logo";
import { HeroGridSurface } from "@/features/landing/components/hero-grid-surface";
import { NodeGridBackdrop } from "@/features/landing/components/node-grid/node-grid-backdrop";
import { cn } from "@/lib/utils/cn";
import type { HeroNodeGridPreset } from "@/lib/types/audit";
import { NODE_GRID_ORDER, gridTypeLabel } from "@/features/landing/components/node-grid/grid-types";
import type { GridType } from "@/features/landing/components/node-grid/grid-types";
import {
  getContrastChecks,
  getHarmonyPreviewSwatches,
  getThemePresets,
  HERO_GRID_PATTERN_OPTIONS,
  isHeroGridPattern,
  isThemeFontStackId,
  rotateHexHue,
  THEME_COLOR_HARMONY_OPTIONS,
  THEME_FONT_STACK_OPTIONS,
  THEME_HEADING_LEVELS,
} from "@/lib/utils/theme";
import { useThemeStore } from "@/store/theme-store";

type HeroPresetConfig = {
  id: HeroNodeGridPreset;
  label: string;
  description: string;
  gridType: "waves" | "flux" | "triangular";
  gridCellSize: number;
  strokeScale: number;
};

const HERO_NODE_GRID_PRESETS: HeroPresetConfig[] = [
  {
    id: "waves",
    label: "Waves",
    description: "Flowing sine lattice — organic, movement-focused.",
    gridType: "waves",
    gridCellSize: 16,
    strokeScale: 0.45,
  },
  {
    id: "flux",
    label: "Flux",
    description: "Turbulent field lines — energetic, forward momentum.",
    gridType: "flux",
    gridCellSize: 16,
    strokeScale: 0.45,
  },
  {
    id: "truss",
    label: "Truss",
    description: "Triangular mesh — structural, engineering precision.",
    gridType: "triangular",
    gridCellSize: 16,
    strokeScale: 0.45,
  },
];

/** Maps a GridType back to the nearest named preset (for the preset card highlight). */
const gridTypeToHeroPreset = (g: GridType): HeroNodeGridPreset => {
  if (g === "triangular") return "truss";
  if (g === "flux") return "flux";
  if (g === "waves") return "waves";
  // Any non-standard type (e.g. hexagonal, spiral) maps to the closest visual preset
  return "waves";
};

const heroPresetToGridType = (id: HeroNodeGridPreset): GridType => {
  const match = HERO_NODE_GRID_PRESETS.find((p) => p.id === id);
  return match?.gridType ?? "waves";
};

const FONT_SELECT_CLASSES =
  "h-10 w-full max-w-md rounded-[calc(var(--theme-radius)-2px)] border border-border/70 bg-panel/70 px-3 text-sm text-foreground shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const ACCENT_SWATCHES = [
  "#f7b21b",
  "#ff8a5b",
  "#74f0b4",
  "#8fb2ff",
  "#c084fc",
  "#ff7fb8",
  "#38bdf8",
  "#f472b6",
  "#22d3ee",
  "#a3e635",
  "#fb7185",
  "#eab308",
  "#818cf8",
  "#f97316",
  "#34d399",
  "#e879f9",
];

const normalizeHex = (value: string) => {
  const v = value.trim();
  if (!v) {
    return "";
  }
  const withHash = v.startsWith("#") ? v : `#${v}`;
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(withHash) ? withHash.toLowerCase() : v;
};

const isValidHex = (value: string) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());

function SettingRow({
  titleId,
  label,
  description,
  children,
}: {
  titleId: string;
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  const surfaceFinish = useThemeStore((state) => state.tokens.surfaceFinish);

  return (
    <div
      className={cn(
        "grid gap-4 rounded-[calc(var(--theme-radius))] p-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]",
        surfaceFinish === "glassmorphic"
          ? "theme-glass-surface"
          : "border border-border/70 bg-panel/60",
      )}
    >
      <div>
        <p className="font-semibold text-foreground" id={titleId}>
          {label}
        </p>
        <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}

function BrandingField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {children}
    </label>
  );
}

export function SettingsPanel() {
  const modeLabelId = useId();
  const accentLabelId = useId();
  const logoColorLabelId = useId();
  const logoScaleLabelId = useId();
  const fontScaleLabelId = useId();
  const displayTitleScaleLabelId = useId();
  const radiusLabelId = useId();
  const shadowLabelId = useId();
  const shadowSpreadLabelId = useId();
  const livePreviewLatticeReactId = useId();
  const livePreviewLatticeUid = livePreviewLatticeReactId.replace(/:/g, "");
  const spacingLabelId = useId();
  const lineHeightLabelId = useId();
  const glowIntensityLabelId = useId();
  const motionLabelId = useId();
  const accentHueLabelId = useId();
  const colorHarmonyLabelId = useId();
  const surfaceFinishLabelId = useId();
  const glassFillOpacityLabelId = useId();
  const glassStrokeOpacityLabelId = useId();
  const dropShadowLabelId = useId();
  const headerFontLabelId = useId();
  const bodyFontLabelId = useId();
  const headingScalesLabelId = useId();
  const layoutDensityLabelId = useId();
  const presetsGroupId = useId();
  const presetSelectId = useId();
  const headerFontSelectId = useId();
  const bodyFontSelectId = useId();
  const importInputId = useId();
  const heroNodeGridPresetsGroupId = useId();
  const heroLatticeBackgroundsLabelId = useId();
  const heroLatticeBackgroundsSelectId = useId();
  const canvasTunerGridLabelId = useId();
  const canvasTunerGridSelectId = useId();
  const canvasTunerCellLabelId = useId();
  const canvasTunerStrokeLabelId = useId();

  const tokens = useThemeStore((state) => state.tokens);
  const branding = useThemeStore((state) => state.branding);
  const motionPreference = useThemeStore((state) => state.motionPreference);
  const presetId = useThemeStore((state) => state.presetId);
  const setMode = useThemeStore((state) => state.setMode);
  const setAccentColor = useThemeStore((state) => state.setAccentColor);
  const setLogoColor = useThemeStore((state) => state.setLogoColor);
  const setLogoScale = useThemeStore((state) => state.setLogoScale);
  const setFontScale = useThemeStore((state) => state.setFontScale);
  const setDisplayTitleScale = useThemeStore((state) => state.setDisplayTitleScale);
  const setRadius = useThemeStore((state) => state.setRadius);
  const setShadowIntensity = useThemeStore((state) => state.setShadowIntensity);
  const setShadowSpread = useThemeStore((state) => state.setShadowSpread);
  const setSpacingDensity = useThemeStore((state) => state.setSpacingDensity);
  const setHeroGridPattern = useThemeStore((state) => state.setHeroGridPattern);
  const setHeroNodeGridPreset = useThemeStore((state) => state.setHeroNodeGridPreset);
  const applyHeroNodeGridCanvas = useThemeStore((state) => state.applyHeroNodeGridCanvas);
  const setLineHeightScale = useThemeStore((state) => state.setLineHeightScale);
  const setGlowIntensity = useThemeStore((state) => state.setGlowIntensity);
  const setFontDisplay = useThemeStore((state) => state.setFontDisplay);
  const setFontBody = useThemeStore((state) => state.setFontBody);
  const setHeadingScale = useThemeStore((state) => state.setHeadingScale);
  const setAccentHueShift = useThemeStore((state) => state.setAccentHueShift);
  const setColorHarmony = useThemeStore((state) => state.setColorHarmony);
  const setSurfaceFinish = useThemeStore((state) => state.setSurfaceFinish);
  const setGlassFillOpacity = useThemeStore((state) => state.setGlassFillOpacity);
  const setGlassStrokeOpacity = useThemeStore((state) => state.setGlassStrokeOpacity);
  const setDropShadowEnabled = useThemeStore((state) => state.setDropShadowEnabled);
  const undoTheme = useThemeStore((state) => state.undoTheme);
  const redoTheme = useThemeStore((state) => state.redoTheme);
  const canUndo = useThemeStore((state) => state.undoStack.length > 0);
  const canRedo = useThemeStore((state) => state.redoStack.length > 0);
  const applyLayoutDensity = useThemeStore((state) => state.applyLayoutDensity);
  const setMotionPreference = useThemeStore((state) => state.setMotionPreference);
  const applyPreset = useThemeStore((state) => state.applyPreset);
  const clearPresetSelection = useThemeStore((state) => state.clearPresetSelection);
  const updateBranding = useThemeStore((state) => state.updateBranding);
  const randomizeTheme = useThemeStore((state) => state.randomizeTheme);
  const restoreDefaults = useThemeStore((state) => state.restoreDefaults);
  const exportThemeJson = useThemeStore((state) => state.exportThemeJson);
  const importThemeJson = useThemeStore((state) => state.importThemeJson);
  const presets = getThemePresets();
  const contrast = getContrastChecks(tokens);

  const [settingsTab, setSettingsTab] = useState("appearance");
  const [showCanvasBuilder, setShowCanvasBuilder] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncTone, setSyncTone] = useState<"neutral" | "success" | "warning" | "danger">("neutral");
  const [importError, setImportError] = useState<string | null>(null);
  const [tunerGridType, setTunerGridType] = useState<GridType>("waves");
  const [tunerCell, setTunerCell] = useState(16);
  const [tunerStroke, setTunerStroke] = useState(0.45);
  const canvasBuilderWasOpenRef = useRef(false);

  useEffect(() => {
    if (showCanvasBuilder && !canvasBuilderWasOpenRef.current) {
      // Prefer the exact stored grid type (set by a previous tuner apply); fall back to preset
      const activeType = (tokens.heroNodeGridGridType as GridType | null) ?? heroPresetToGridType(tokens.heroNodeGridPreset);
      setTunerGridType(activeType);
      setTunerCell(tokens.heroNodeGridCellSize);
      setTunerStroke(tokens.heroNodeGridStrokeScale);
    }
    canvasBuilderWasOpenRef.current = showCanvasBuilder;
  }, [
    showCanvasBuilder,
    tokens.heroNodeGridCellSize,
    tokens.heroNodeGridGridType,
    tokens.heroNodeGridPreset,
    tokens.heroNodeGridStrokeScale,
  ]);

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) {
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }

      if (event.key === "z" || event.key === "Z") {
        event.preventDefault();
        if (event.shiftKey) {
          redoTheme();
        } else {
          undoTheme();
        }
        return;
      }

      if (event.key === "y" || event.key === "Y") {
        event.preventDefault();
        redoTheme();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [redoTheme, undoTheme]);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncDismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSave = useCallback(async () => {
    const { tokens: nextTokens, branding: nextBranding } = useThemeStore.getState();
    setSyncTone("neutral");
    setSyncMessage("Saving…");
    const result = await saveWorkspaceThemeAction(nextTokens, nextBranding);
    if (result.ok) {
      setSyncTone("success");
      setSyncMessage("Saved to your workspace.");
      if (syncDismissRef.current) {
        clearTimeout(syncDismissRef.current);
      }
      syncDismissRef.current = setTimeout(() => setSyncMessage(null), 2800);
      return;
    }
    if (result.error === THEME_SAVE_NO_SESSION) {
      setSyncTone("neutral");
      setSyncMessage("Stored in this browser only. Sign in under Workspace to sync across devices.");
      return;
    }
    setSyncTone("danger");
    setSyncMessage(result.error);
  }, []);

  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      void runSave();
    }, 1200);
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [tokens, branding, runSave]);

  const handleSaveNow = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    void runSave();
  }, [runSave]);

  const handleImportFile = useCallback(
    (fileList: FileList | null) => {
      const file = fileList?.[0];
      if (!file) {
        return;
      }
      setImportError(null);
      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === "string" ? reader.result : "";
        const ok = importThemeJson(text);
        if (!ok) {
          setImportError("That file is not valid theme JSON.");
          return;
        }
        setSyncTone("success");
        setSyncMessage("Theme imported — syncing…");
      };
      reader.onerror = () => setImportError("Could not read file.");
      reader.readAsText(file);
    },
    [importThemeJson],
  );

  const downloadTheme = useCallback(() => {
    const blob = new Blob([exportThemeJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "websitecreditscore-theme.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }, [exportThemeJson]);

  const handleApplyCanvasTuner = useCallback(() => {
    applyHeroNodeGridCanvas({
      heroNodeGridPreset: gridTypeToHeroPreset(tunerGridType),
      // Store the exact grid type so the hero uses it directly (not just the nearest preset)
      heroNodeGridGridType: tunerGridType,
      heroNodeGridCellSize: tunerCell,
      heroNodeGridStrokeScale: tunerStroke,
    });
    setShowCanvasBuilder(false);
  }, [applyHeroNodeGridCanvas, tunerCell, tunerGridType, tunerStroke]);

  return (
    <TooltipProvider>
    <section className="space-y-8" id="settings-panel">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] 2xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="space-y-8">
          <SectionHeading
            contentMaxWidthClassName="w-full max-w-[min(100%,88rem)]"
            eyebrow="Studio settings"
            title="Theme & proposal identity"
            description="Presets, typography, layout density, and agency fields. Sync from Workspace when signed in; otherwise they stay in this browser."
          />

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                <div>
                  <Badge variant="accent">Theme controls</Badge>
                  <CardTitle className="mt-3 text-3xl">Visual system</CardTitle>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {syncMessage ? (
                    <span
                      className={cn(
                        "inline-flex max-w-[min(100%,22rem)] items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
                        syncTone === "success" &&
                          "border-success/30 bg-success/10 text-foreground",
                        syncTone === "danger" && "border-danger/40 bg-danger/10 text-danger",
                        syncTone === "neutral" &&
                          "border-border/70 bg-panel/70 text-muted",
                      )}
                      role="status"
                    >
                      {syncTone === "success" ? (
                        <Check aria-hidden className="size-3.5 shrink-0 text-success" />
                      ) : null}
                      {syncTone === "danger" ? (
                        <AlertCircle aria-hidden className="size-3.5 shrink-0" />
                      ) : null}
                      {syncTone === "neutral" && syncMessage.includes("browser") ? (
                        <Cloud aria-hidden className="size-3.5 shrink-0" />
                      ) : null}
                      <span className="leading-snug">{syncMessage}</span>
                    </span>
                  ) : null}
                  <Button onClick={() => void handleSaveNow()} size="sm" type="button" variant="default">
                    Save now
                  </Button>
                  <Button onClick={randomizeTheme} size="sm" type="button" variant="secondary">
                    <Shuffle className="size-4" />
                    Random
                  </Button>
                  <Button
                    aria-label="Undo last theme change"
                    disabled={!canUndo}
                    onClick={() => undoTheme()}
                    size="sm"
                    type="button"
                    variant="secondary"
                  >
                    <IconArrowBackUp aria-hidden className="size-4" />
                  </Button>
                  <Button
                    aria-label="Redo theme change"
                    disabled={!canRedo}
                    onClick={() => redoTheme()}
                    size="sm"
                    type="button"
                    variant="secondary"
                  >
                    <IconArrowForwardUp aria-hidden className="size-4" />
                  </Button>
                  <Button onClick={restoreDefaults} size="sm" type="button" variant="secondary">
                    <RefreshCcw className="size-4" />
                    Reset
                  </Button>
                  <Button onClick={downloadTheme} size="sm" type="button" variant="secondary">
                    <Download className="size-4" />
                    Export
                  </Button>
                  <input
                    accept="application/json,.json"
                    className="sr-only"
                    id={importInputId}
                    onChange={(e) => {
                      handleImportFile(e.target.files);
                      e.target.value = "";
                    }}
                    type="file"
                  />
                  <Button asChild size="sm" type="button" variant="outline">
                    <label className="inline-flex cursor-pointer items-center gap-2" htmlFor={importInputId}>
                      <Upload className="size-4" />
                      Import
                    </label>
                  </Button>
                </div>
              </div>
              {importError ? (
                <p className="text-sm text-danger" role="alert">
                  {importError}
                </p>
              ) : null}
            </CardHeader>
            <CardContent>
              <Tabs className="space-y-6" onValueChange={setSettingsTab} value={settingsTab}>
                <TabsList className="flex w-full flex-wrap gap-1 sm:w-auto">
                  <TabsTrigger value="appearance">Look &amp; color</TabsTrigger>
                  <TabsTrigger value="typography">Typography</TabsTrigger>
                  <TabsTrigger value="layout">Layout &amp; depth</TabsTrigger>
                  <TabsTrigger value="backgrounds">Backgrounds</TabsTrigger>
                  <TabsTrigger value="branding">Agency</TabsTrigger>
                </TabsList>

                <TabsContent className="space-y-4" value="appearance">
                  <SettingRow
                    titleId={accentLabelId}
                    label="Accent color"
                    description="Pick a swatch or enter a hex. Contrast readouts update live for body text and CTA labels."
                  >
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2" role="group" aria-label="Accent swatches">
                        {ACCENT_SWATCHES.map((hex) => (
                          <button
                            aria-label={`Use accent ${hex}`}
                            aria-pressed={tokens.accentColor.toLowerCase() === hex.toLowerCase()}
                            className={cn(
                              "size-9 rounded-full border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                              tokens.accentColor.toLowerCase() === hex.toLowerCase()
                                ? "border-foreground scale-105"
                                : "border-transparent hover:scale-105",
                            )}
                            key={hex}
                            onClick={() => setAccentColor(hex)}
                            style={{ backgroundColor: hex }}
                            type="button"
                          />
                        ))}
                      </div>
                      <div className="flex flex-wrap items-end gap-3">
                        <label className="grid gap-1 text-xs font-medium text-muted">
                          Hex
                          <Input
                            key={tokens.accentColor}
                            aria-labelledby={accentLabelId}
                            autoComplete="off"
                            className="max-w-[8.5rem] font-mono text-sm"
                            defaultValue={tokens.accentColor}
                            onBlur={(e) => {
                              const next = normalizeHex(e.target.value);
                              if (isValidHex(next)) {
                                setAccentColor(next);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.currentTarget.blur();
                              }
                            }}
                            spellCheck={false}
                          />
                        </label>
                        <div className="flex items-center gap-2 pb-0.5">
                          <Input
                            aria-label="Accent color picker"
                            className="h-10 w-14 cursor-pointer p-1"
                            onChange={(event) => setAccentColor(event.target.value)}
                            type="color"
                            value={tokens.accentColor}
                          />
                          <span className="text-sm text-muted">{tokens.accentColor}</span>
                        </div>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-background-alt/50 px-3 py-2 text-xs text-muted">
                        <span className="font-medium text-foreground">Contrast: </span>
                        Body {contrast.foregroundOnBackground.toFixed(2)}:1 · Accent button{" "}
                        {contrast.accentOnAccentForeground.toFixed(2)}:1
                        {contrast.accentOnAccentForeground < 4.5 ? (
                          <span className="text-warning"> — consider a deeper accent for small text on buttons.</span>
                        ) : null}
                      </div>
                    </div>
                  </SettingRow>

                  <SettingRow
                    titleId={accentHueLabelId}
                    label="Accent hue shift"
                    description="Nudge generated surfaces (background wash, panels, glow) without changing your saved brand hex. Picking a new swatch or hex resets this to 0°."
                  >
                    <div className="flex flex-wrap items-center gap-4">
                      <Slider
                        aria-labelledby={accentHueLabelId}
                        className="max-w-md flex-1"
                        max={24}
                        min={-24}
                        onValueChange={(value) => setAccentHueShift(value[0] ?? 0)}
                        step={1}
                        value={[tokens.accentHueShift]}
                      />
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <span
                          aria-hidden="true"
                          className="size-8 rounded-full border border-border/60"
                          style={{
                            backgroundColor: rotateHexHue(tokens.accentColor, tokens.accentHueShift),
                          }}
                        />
                        <span className="font-mono text-xs text-foreground">
                          {tokens.accentHueShift > 0 ? "+" : ""}
                          {tokens.accentHueShift}°
                        </span>
                      </div>
                    </div>
                  </SettingRow>

                  <div className="space-y-6">
                    <div className="rounded-[calc(var(--theme-radius))] border border-border/70 bg-panel/40 p-4">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground" id={colorHarmonyLabelId}>
                            Surface harmony
                          </p>
                          <p className="mt-1 text-xs text-muted">
                            Short labels; full definitions on focus or hover.
                          </p>
                        </div>
                        <div
                          aria-labelledby={colorHarmonyLabelId}
                          className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7"
                          role="group"
                        >
                          {THEME_COLOR_HARMONY_OPTIONS.map((option) => {
                            const selected = tokens.colorHarmony === option.id;
                            const swatches = getHarmonyPreviewSwatches(tokens.accentColor, option.id);

                            return (
                              <Tooltip key={option.id}>
                                <TooltipTrigger asChild>
                                  <button
                                    aria-label={`${option.srLabel}. ${option.tooltip}`}
                                    aria-pressed={selected}
                                    className={cn(
                                      "aspect-square w-full rounded-[calc(var(--theme-radius)-2px)] border p-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                      selected
                                        ? "border-accent/60 bg-accent/10 shadow-sm"
                                        : "border-border/70 bg-panel/50 hover:border-accent/25",
                                    )}
                                    onClick={() => setColorHarmony(option.id)}
                                    type="button"
                                  >
                                    <span aria-hidden className="flex h-full flex-col gap-2">
                                      <span className="grid min-h-0 flex-1 grid-cols-3 gap-1">
                                        {swatches.map((swatch, index) => (
                                          <span
                                            aria-hidden
                                            className="rounded-[6px] border border-border/40"
                                            key={`${option.id}-${index}`}
                                            style={{ backgroundColor: swatch }}
                                          />
                                        ))}
                                      </span>
                                      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground">
                                        {option.label}
                                      </span>
                                    </span>
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-sm leading-snug">{option.tooltip}</TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[calc(var(--theme-radius))] border border-border/70 bg-panel/40 p-4">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground" id={surfaceFinishLabelId}>
                            Panel finish
                          </p>
                          <p className="mt-1 text-xs text-muted">Solid fills or glass highlights on studio tiles.</p>
                        </div>
                        <div
                          aria-labelledby={surfaceFinishLabelId}
                          className="grid max-w-md grid-cols-2 gap-3"
                          role="group"
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                aria-label="Solid panel finish. Flat fills with standard borders."
                                aria-pressed={tokens.surfaceFinish === "solid"}
                                className={cn(
                                  "aspect-square w-full rounded-[calc(var(--theme-radius)-2px)] border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                  tokens.surfaceFinish === "solid"
                                    ? "border-accent/60 bg-accent/10 shadow-sm"
                                    : "border-border/70 bg-panel/50 hover:border-accent/25",
                                )}
                                onClick={() => setSurfaceFinish("solid")}
                                type="button"
                              >
                                <span aria-hidden className="flex h-full flex-col gap-2">
                                  <span className="flex min-h-0 flex-1 items-center justify-center rounded-md border border-border/70 bg-panel/70">
                                    <IconLayout2 aria-hidden className="size-5 text-muted" />
                                  </span>
                                  <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground">
                                    Solid
                                  </span>
                                </span>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              Flat fills and normal borders — lowest visual noise, fastest to parse.
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                aria-label="Glassmorphic panel finish. Frosted wash with hairline rim; pooled drop shadows off."
                                aria-pressed={tokens.surfaceFinish === "glassmorphic"}
                                className={cn(
                                  "aspect-square w-full rounded-[calc(var(--theme-radius)-2px)] border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                  tokens.surfaceFinish === "glassmorphic"
                                    ? "border-accent/60 bg-accent/10 shadow-sm"
                                    : "border-border/70 bg-panel/50 hover:border-accent/25",
                                )}
                                onClick={() => setSurfaceFinish("glassmorphic")}
                                type="button"
                              >
                                <span aria-hidden className="flex h-full flex-col gap-2">
                                  <span className="theme-glass-swatch-preview flex min-h-0 flex-1 items-center justify-center rounded-md">
                                    <IconSparkles aria-hidden className="size-5 text-muted" />
                                  </span>
                                  <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground">
                                    Glass
                                  </span>
                                </span>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              Frosted washes with a continuous hairline rim — card drop shadows stay off so edges read
                              like dock icons.
                            </TooltipContent>
                          </Tooltip>
                        </div>

                        {tokens.surfaceFinish === "glassmorphic" ? (
                          <div className="grid gap-4 rounded-[calc(var(--theme-radius)-4px)] border border-border/60 bg-panel/50 p-3">
                            <div>
                              <p className="text-xs font-semibold text-foreground" id={glassFillOpacityLabelId}>
                                Glass fill opacity
                              </p>
                              <p className="mt-1 text-[11px] leading-snug text-muted">
                                Softens the translucent panel wash — independent from rim stroke strength.
                              </p>
                              <Slider
                                aria-labelledby={glassFillOpacityLabelId}
                                className="mt-3"
                                max={0.92}
                                min={0.22}
                                onValueChange={(value) => setGlassFillOpacity(value[0] ?? 0.58)}
                                step={0.01}
                                value={[tokens.glassFillOpacity]}
                              />
                              <p className="mt-2 text-sm text-muted">
                                Current value: {(tokens.glassFillOpacity * 100).toFixed(0)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-foreground" id={glassStrokeOpacityLabelId}>
                                Glass stroke opacity
                              </p>
                              <p className="mt-1 text-[11px] leading-snug text-muted">
                                Hairline borders and top rim on glass tiles — tune without changing fill depth.
                              </p>
                              <Slider
                                aria-labelledby={glassStrokeOpacityLabelId}
                                className="mt-3"
                                max={1}
                                min={0.12}
                                onValueChange={(value) => setGlassStrokeOpacity(value[0] ?? 0.55)}
                                step={0.01}
                                value={[tokens.glassStrokeOpacity]}
                              />
                              <p className="mt-2 text-sm text-muted">
                                Current value: {(tokens.glassStrokeOpacity * 100).toFixed(0)}%
                              </p>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                  <div className="rounded-[calc(var(--theme-radius))] border border-border/70 bg-panel/40 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground" id={presetsGroupId}>
                          Color preset
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          Applies palette, surfaces, and bundled typography. Changes apply site-wide immediately.
                        </p>
                      </div>
                      {presetId ? (
                        <span className="shrink-0 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-foreground">
                          Preset active
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full border border-border/70 bg-panel/60 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-muted">
                          Custom
                        </span>
                      )}
                    </div>
                    <label className="mt-4 grid gap-2" htmlFor={presetSelectId}>
                      <span className="sr-only">Choose a color preset</span>
                      <select
                        aria-labelledby={presetsGroupId}
                        className={FONT_SELECT_CLASSES}
                        id={presetSelectId}
                        onChange={(event) => {
                          const value = event.target.value;
                          if (value === "custom") {
                            clearPresetSelection();
                            return;
                          }
                          applyPreset(value);
                        }}
                        value={presetId ?? "custom"}
                      >
                        <option value="custom">Custom (manual tweaks)</option>
                        {presets.map((preset) => (
                          <option key={preset.id} value={preset.id}>
                            {preset.name} · {preset.mode}
                          </option>
                        ))}
                      </select>
                    </label>
                    <details className="mt-4 rounded-[calc(var(--theme-radius)-2px)] border border-border/60 bg-panel/30 p-3">
                      <summary className="cursor-pointer text-xs font-semibold text-foreground">
                        Browse all presets
                      </summary>
                      <div
                        aria-label="Preset cards"
                        className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3"
                        role="group"
                      >
                        {presets.map((preset) => {
                          const selected = presetId === preset.id;
                          return (
                            <button
                              aria-pressed={selected}
                              className={cn(
                                "rounded-[10px] border p-3.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                selected
                                  ? "border-accent/50 bg-accent/10 shadow-sm"
                                  : "border-border/70 bg-panel/50 hover:border-accent/25 hover:bg-panel/70",
                              )}
                              key={preset.id}
                              onClick={() => applyPreset(preset.id)}
                              type="button"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold leading-tight text-foreground sm:text-[0.95rem]">
                                    {preset.name}
                                  </p>
                                  <p className="mt-1 text-[10px] font-medium uppercase leading-snug tracking-[0.06em] text-muted">
                                    {preset.mode} · {preset.accentFamily}
                                  </p>
                                </div>
                                <span
                                  aria-hidden="true"
                                  className="mt-0.5 h-9 w-1.5 shrink-0 rounded-full border border-border/50"
                                  style={{ backgroundColor: preset.tokens.surfaces.accent }}
                                />
                              </div>
                              <p className="mt-2 line-clamp-2 text-xs leading-snug text-muted">{preset.mood}</p>
                              <p className="mt-2 line-clamp-2 text-[10px] font-medium uppercase leading-snug tracking-[0.05em] text-muted">
                                {preset.recommendedUseCase}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </details>
                  </div>

                  <SettingRow
                    titleId={modeLabelId}
                    label="Theme mode"
                    description="Light and dark share the same token structure; surfaces rebuild from your accent."
                  >
                    <div
                      aria-labelledby={modeLabelId}
                      className="inline-flex rounded-[10px] border border-border bg-panel/70 p-1"
                      role="group"
                    >
                      {(["dark", "light"] as const).map((m) => (
                        <button
                          aria-pressed={tokens.mode === m}
                          className={cn(
                            "rounded-[8px] px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                            tokens.mode === m
                              ? "bg-elevated text-foreground shadow-sm"
                              : "text-muted hover:text-foreground",
                          )}
                          key={m}
                          onClick={() => setMode(m)}
                          type="button"
                        >
                          {m === "dark" ? "Dark" : "Light"}
                        </button>
                      ))}
                    </div>
                  </SettingRow>
                  </div>
                </TabsContent>

                <TabsContent className="space-y-4" value="typography">
                  <SettingRow
                    titleId={headerFontLabelId}
                    label="Header font (display)"
                    description="Used for large headlines and `.font-display` across the marketing shell, workspace, and packet preview. Instrument Serif is the default editorial look."
                  >
                    <div className="grid gap-2">
                      <label className="sr-only" htmlFor={headerFontSelectId}>
                        Header font
                      </label>
                      <select
                        aria-labelledby={headerFontLabelId}
                        className={FONT_SELECT_CLASSES}
                        id={headerFontSelectId}
                        onChange={(event) => {
                          const value = event.target.value;
                          if (isThemeFontStackId(value)) {
                            setFontDisplay(value);
                          }
                        }}
                        value={tokens.fontDisplay}
                      >
                        {THEME_FONT_STACK_OPTIONS.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-muted">
                        {THEME_FONT_STACK_OPTIONS.find((item) => item.id === tokens.fontDisplay)?.helper}
                      </p>
                    </div>
                  </SettingRow>

                  <SettingRow
                    titleId={bodyFontLabelId}
                    label="Body font (UI)"
                    description="Paragraphs, buttons, and dense UI. Manrope matches the default product chrome; switch to system stacks for zero webfont shift."
                  >
                    <div className="grid gap-2">
                      <label className="sr-only" htmlFor={bodyFontSelectId}>
                        Body font
                      </label>
                      <select
                        aria-labelledby={bodyFontLabelId}
                        className={FONT_SELECT_CLASSES}
                        id={bodyFontSelectId}
                        onChange={(event) => {
                          const value = event.target.value;
                          if (isThemeFontStackId(value)) {
                            setFontBody(value);
                          }
                        }}
                        value={tokens.fontBody}
                      >
                        {THEME_FONT_STACK_OPTIONS.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-muted">
                        {THEME_FONT_STACK_OPTIONS.find((item) => item.id === tokens.fontBody)?.helper}
                      </p>
                    </div>
                  </SettingRow>

                  <SettingRow
                    titleId={headingScalesLabelId}
                    label="Heading scale (H1–H6)"
                    description="Per-level multipliers for semantic HTML headings. Tailwind text-* utilities on the same tag still win when present. Changes apply instantly via theme variables."
                  >
                    <div className="grid gap-4">
                      <div
                        aria-labelledby={headingScalesLabelId}
                        className="grid gap-4 sm:grid-cols-2"
                        role="group"
                      >
                        {THEME_HEADING_LEVELS.map((level) => {
                          const value =
                            level === 1
                              ? tokens.headingScaleH1
                              : level === 2
                                ? tokens.headingScaleH2
                                : level === 3
                                  ? tokens.headingScaleH3
                                  : level === 4
                                    ? tokens.headingScaleH4
                                    : level === 5
                                      ? tokens.headingScaleH5
                                      : tokens.headingScaleH6;
                          const sliderId = `heading-scale-h${level}`;
                          return (
                            <div className="grid gap-2" key={level}>
                              <div className="flex items-center justify-between gap-2">
                                <label className="text-sm font-semibold text-foreground" htmlFor={sliderId}>
                                  H{level}
                                </label>
                                <span className="font-mono text-xs text-muted">{value.toFixed(2)}×</span>
                              </div>
                              <Slider
                                aria-label={`Scale for heading H${level}`}
                                id={sliderId}
                                max={1.45}
                                min={0.72}
                                onValueChange={(next) => setHeadingScale(level, next[0] ?? 1)}
                                step={0.01}
                                value={[value]}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <div className="rounded-[calc(var(--theme-radius))] border border-border/70 bg-panel/50 p-4">
                        <p className="text-xs font-semibold text-muted">Live preview</p>
                        <div className="mt-3 space-y-2 text-foreground">
                          <h1 className="font-display border-b border-border/40 pb-1">Heading 1 preview</h1>
                          <h2 className="font-display border-b border-border/40 pb-1">Heading 2 preview</h2>
                          <h3 className="border-b border-border/40 pb-1">Heading 3 preview</h3>
                          <h4 className="border-b border-border/40 pb-1">Heading 4 preview</h4>
                          <h5 className="border-b border-border/40 pb-1">Heading 5 preview</h5>
                          <h6 className="border-b border-border/40 pb-1">Heading 6 preview</h6>
                        </div>
                      </div>
                    </div>
                  </SettingRow>

                  <SettingRow
                    titleId={fontScaleLabelId}
                    label="Font scale"
                    description="Overall type size for decks, packets, and dense dashboards."
                  >
                    <Slider
                      aria-labelledby={fontScaleLabelId}
                      max={1.15}
                      min={0.9}
                      onValueChange={(value) => setFontScale(value[0] ?? 1)}
                      step={0.01}
                      value={[tokens.fontScale]}
                    />
                    <p className="mt-2 text-sm text-muted">Current value: {tokens.fontScale.toFixed(2)}</p>
                  </SettingRow>

                  <SettingRow
                    titleId={displayTitleScaleLabelId}
                    label="Display titles"
                    description="Hero, section, and audit report display-serif headlines (the big clamp-based titles). Separate from body font scale and semantic H1–H6."
                  >
                    <Slider
                      aria-labelledby={displayTitleScaleLabelId}
                      max={1.35}
                      min={0.72}
                      onValueChange={(value) => setDisplayTitleScale(value[0] ?? 1)}
                      step={0.01}
                      value={[tokens.displayTitleScale]}
                    />
                    <p className="mt-2 text-sm text-muted">
                      Current value: {tokens.displayTitleScale.toFixed(2)}×
                    </p>
                    <p className="theme-display-title-section mt-4 font-display font-semibold leading-[0.9] tracking-[-0.05em] text-foreground">
                      Section title preview
                    </p>
                  </SettingRow>

                  <SettingRow
                    titleId={lineHeightLabelId}
                    label="Line height"
                    description="Paragraph rhythm — higher values feel more editorial."
                  >
                    <Slider
                      aria-labelledby={lineHeightLabelId}
                      max={1.15}
                      min={0.9}
                      onValueChange={(value) => setLineHeightScale(value[0] ?? 1)}
                      step={0.01}
                      value={[tokens.lineHeightScale]}
                    />
                    <p className="mt-2 text-sm text-muted">
                      Current value: {tokens.lineHeightScale.toFixed(2)}
                    </p>
                  </SettingRow>
                  <SettingRow
                    titleId={motionLabelId}
                    label="Reduce motion"
                    description="Prefer less animation in previews and when presenting to motion-sensitive clients."
                  >
                    <div className="flex items-center justify-between rounded-[calc(var(--theme-radius))] border border-border/70 bg-background-alt/70 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Motion</p>
                        <p className="text-xs text-muted">
                          {motionPreference === "reduced" ? "Reduced" : "Follow system"}
                        </p>
                      </div>
                      <Switch
                        aria-labelledby={motionLabelId}
                        checked={motionPreference === "reduced"}
                        onCheckedChange={(checked) =>
                          setMotionPreference(checked ? "reduced" : "system")
                        }
                      />
                    </div>
                  </SettingRow>
                </TabsContent>

                <TabsContent className="space-y-4" value="layout">
                  <SettingRow
                    titleId={layoutDensityLabelId}
                    label="Layout presets"
                    description="One-click bundles for type size, line height, spacing, radius, and shadow. You can still fine-tune each slider below."
                  >
                    <div
                      aria-labelledby={layoutDensityLabelId}
                      className="flex flex-wrap gap-2"
                      role="group"
                    >
                      {(
                        [
                          { id: "compact" as const, label: "Compact" },
                          { id: "comfortable" as const, label: "Comfortable" },
                          { id: "spacious" as const, label: "Spacious" },
                        ] as const
                      ).map((item) => (
                        <Button
                          key={item.id}
                          onClick={() => applyLayoutDensity(item.id)}
                          size="sm"
                          type="button"
                          variant="secondary"
                        >
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </SettingRow>

                  <SettingRow
                    titleId={radiusLabelId}
                    label="Border radius"
                    description="From sharp editorial cards to softer product surfaces."
                  >
                    <Slider
                      aria-labelledby={radiusLabelId}
                      max={20}
                      min={8}
                      onValueChange={(value) => setRadius(value[0] ?? 12)}
                      step={1}
                      value={[tokens.radius]}
                    />
                    <p className="mt-2 text-sm text-muted">Current value: {tokens.radius}px</p>
                  </SettingRow>

                  <SettingRow
                    titleId={shadowLabelId}
                    label="Shadow intensity"
                    description="Depth and “stage lighting” for stacked cards."
                  >
                    <Slider
                      aria-labelledby={shadowLabelId}
                      max={1.2}
                      min={0.3}
                      onValueChange={(value) => setShadowIntensity(value[0] ?? 0.8)}
                      step={0.01}
                      value={[tokens.shadowIntensity]}
                    />
                    <p className="mt-2 text-sm text-muted">
                      Current value: {tokens.shadowIntensity.toFixed(2)}
                    </p>
                  </SettingRow>

                  <SettingRow
                    titleId={shadowSpreadLabelId}
                    label="Shadow spread"
                    description="Extra box-shadow spread (px) layered with intensity — pushes halos outward without changing blur as much."
                  >
                    <Slider
                      aria-labelledby={shadowSpreadLabelId}
                      max={20}
                      min={0}
                      onValueChange={(value) => setShadowSpread(value[0] ?? 0)}
                      step={1}
                      value={[tokens.shadowSpread]}
                    />
                    <p className="mt-2 text-sm text-muted">Current value: {tokens.shadowSpread}px</p>
                  </SettingRow>

                  <SettingRow
                    titleId={dropShadowLabelId}
                    label="Card drop shadows"
                    description={
                      tokens.surfaceFinish === "glassmorphic"
                        ? "Glass finish keeps depth in strokes and washes — pooled shadows stay off (switch disabled)."
                        : "Turn off for flatter decks; intensity and spread sliders only apply when this is on."
                    }
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <Switch
                          aria-labelledby={dropShadowLabelId}
                          checked={tokens.dropShadowEnabled}
                          disabled={tokens.surfaceFinish === "glassmorphic"}
                          id={`${dropShadowLabelId}-switch`}
                          onCheckedChange={(checked) => setDropShadowEnabled(checked)}
                        />
                        <label
                          className={cn(
                            "text-sm font-medium text-foreground",
                            tokens.surfaceFinish === "glassmorphic" && "text-muted",
                          )}
                          htmlFor={`${dropShadowLabelId}-switch`}
                        >
                          {tokens.dropShadowEnabled ? "On" : "Off"}
                        </label>
                      </div>
                      <p className="text-xs text-muted sm:max-w-[min(100%,18rem)] sm:text-right">
                        {tokens.surfaceFinish === "glassmorphic"
                          ? "No drop shadow (glass)"
                          : tokens.dropShadowEnabled
                            ? "Shadows follow intensity + spread."
                            : "No drop shadow — cards rely on borders only."}
                      </p>
                    </div>
                  </SettingRow>

                  <SettingRow
                    titleId={spacingLabelId}
                    label="Spacing density"
                    description="Tighten or loosen vertical rhythm between sections."
                  >
                    <Slider
                      aria-labelledby={spacingLabelId}
                      max={1.18}
                      min={0.82}
                      onValueChange={(value) => setSpacingDensity(value[0] ?? 1)}
                      step={0.01}
                      value={[tokens.spacingDensity]}
                    />
                    <p className="mt-2 text-sm text-muted">
                      Current value: {tokens.spacingDensity.toFixed(2)}
                    </p>
                  </SettingRow>
                  <SettingRow
                    titleId={glowIntensityLabelId}
                    label="Ambient glow"
                    description="Accent wash in page backgrounds — pull back for flatter enterprise decks."
                  >
                    <Slider
                      aria-labelledby={glowIntensityLabelId}
                      max={1.45}
                      min={0.55}
                      onValueChange={(value) => setGlowIntensity(value[0] ?? 1)}
                      step={0.01}
                      value={[tokens.glowIntensity]}
                    />
                    <p className="mt-2 text-sm text-muted">
                      Current value: {tokens.glowIntensity.toFixed(2)}
                    </p>
                  </SettingRow>
                </TabsContent>

                <TabsContent className="space-y-4" value="backgrounds">
                  <SettingRow
                    titleId={heroNodeGridPresetsGroupId}
                    label="Landing hero node canvas"
                    description="Pick a recipe for the animated dot grid behind the marketing hero. Open the canvas tuner to adjust cell spacing and stroke, then Apply."
                  >
                    <div
                      aria-labelledby={heroNodeGridPresetsGroupId}
                      className="grid gap-3 sm:grid-cols-3"
                      role="group"
                    >
                      {HERO_NODE_GRID_PRESETS.map((item) => {
                        const selected = tokens.heroNodeGridPreset === item.id;
                        return (
                          <button
                            aria-label={`${item.label}. ${item.description}`}
                            aria-pressed={selected}
                            className={cn(
                              "overflow-hidden rounded-[calc(var(--theme-radius))] border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                              selected
                                ? "border-accent/60 bg-accent/10 shadow-sm"
                                : "border-border/70 bg-panel/50 hover:border-accent/25 hover:bg-panel/65",
                            )}
                            key={item.id}
                            onClick={() => setHeroNodeGridPreset(item.id)}
                            type="button"
                          >
                            <div className="relative h-28 w-full overflow-hidden rounded-md border border-border/50 bg-background/40">
                              <NodeGridBackdrop
                                className="relative h-full min-h-0 w-full"
                                gridCellSize={item.gridCellSize}
                                gridType={item.gridType}
                                inline
                                linkHoverFromPointer={false}
                                strokeScale={item.strokeScale}
                                withNoiseOverlay={false}
                              />
                            </div>
                            <p className="mt-2 text-sm font-semibold text-foreground">{item.label}</p>
                            <p className="mt-1 text-xs leading-snug text-muted">{item.description}</p>
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <Button
                        onClick={() => setShowCanvasBuilder(true)}
                        type="button"
                        variant="secondary"
                      >
                        Open canvas tuner
                      </Button>
                      <p className="max-w-prose text-xs text-muted">
                        Preview grid type, cell size, and stroke. Apply saves to the live hero and theme export.
                      </p>
                    </div>
                  </SettingRow>

                  <SettingRow
                    titleId={heroLatticeBackgroundsLabelId}
                    label="Studio lattice (live preview)"
                    description="Layered SVG mesh behind the packet preview card on the right. Separate from the hero canvas."
                  >
                    <label className="grid gap-2" htmlFor={heroLatticeBackgroundsSelectId}>
                      <span className="sr-only">Choose studio lattice pattern</span>
                      <select
                        aria-labelledby={heroLatticeBackgroundsLabelId}
                        className={FONT_SELECT_CLASSES}
                        id={heroLatticeBackgroundsSelectId}
                        onChange={(event) => {
                          const value = event.target.value;
                          if (isHeroGridPattern(value)) {
                            setHeroGridPattern(value);
                          }
                        }}
                        value={tokens.heroGridPattern}
                      >
                        {HERO_GRID_PATTERN_OPTIONS.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label} — {item.description}
                          </option>
                        ))}
                      </select>
                    </label>
                  </SettingRow>
                </TabsContent>

                <TabsContent className="space-y-4" value="branding">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <BrandingField label="Agency name">
                      <Input
                        autoComplete="organization"
                        value={branding.agencyName}
                        onChange={(event) => updateBranding({ agencyName: event.target.value })}
                      />
                    </BrandingField>
                    <BrandingField label="Logo mark (short)">
                      <Input
                        value={branding.logoMark}
                        onChange={(event) => updateBranding({ logoMark: event.target.value })}
                        placeholder="WCS"
                      />
                    </BrandingField>
                    <BrandingField label="Contact name">
                      <Input
                        autoComplete="name"
                        value={branding.contactName}
                        onChange={(event) => updateBranding({ contactName: event.target.value })}
                      />
                    </BrandingField>
                    <BrandingField label="Contact title">
                      <Input
                        value={branding.contactTitle}
                        onChange={(event) => updateBranding({ contactTitle: event.target.value })}
                      />
                    </BrandingField>
                    <BrandingField label="Contact email">
                      <Input
                        autoComplete="email"
                        type="email"
                        value={branding.contactEmail}
                        onChange={(event) => updateBranding({ contactEmail: event.target.value })}
                      />
                    </BrandingField>
                    <BrandingField label="Contact phone">
                      <Input
                        autoComplete="tel"
                        value={branding.contactPhone}
                        onChange={(event) => updateBranding({ contactPhone: event.target.value })}
                      />
                    </BrandingField>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <BrandingField label="Headshot URL">
                      <Input
                        type="url"
                        value={branding.headshot}
                        onChange={(event) => updateBranding({ headshot: event.target.value })}
                      />
                    </BrandingField>
                    <BrandingField label="Proposal accent override">
                      <p className="text-xs text-muted">
                        Optional — overrides the theme accent for proposal chrome only when set.
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Input
                          className="h-10 w-14 cursor-pointer p-1"
                          onChange={(event) => updateBranding({ accentOverride: event.target.value })}
                          type="color"
                          value={branding.accentOverride || tokens.accentColor}
                        />
                        <Input
                          className="font-mono text-sm"
                          onChange={(e) => updateBranding({ accentOverride: e.target.value })}
                          placeholder="#hex or leave empty"
                          value={branding.accentOverride}
                        />
                      </div>
                    </BrandingField>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SettingRow
                      titleId={logoColorLabelId}
                      label="Logo color"
                      description="Wordmark / mark color on headers and packet covers."
                    >
                      <div className="flex items-center gap-3">
                        <Input
                          aria-labelledby={logoColorLabelId}
                          className="max-w-44"
                          type="color"
                          value={branding.logoColor || tokens.surfaces.foreground}
                          onChange={(event) => setLogoColor(event.target.value)}
                        />
                        <span className="text-sm text-muted">
                          {branding.logoColor || tokens.surfaces.foreground}
                        </span>
                      </div>
                    </SettingRow>
                    <SettingRow
                      titleId={logoScaleLabelId}
                      label="Logo size"
                      description="Scale the mark without changing header layout."
                    >
                      <Slider
                        aria-labelledby={logoScaleLabelId}
                        max={1.5}
                        min={0.75}
                        onValueChange={(value) => setLogoScale(value[0] ?? 1)}
                        step={0.01}
                        value={[branding.logoScale ?? 1]}
                      />
                      <p className="mt-2 text-sm text-muted">
                        Current value: {((branding.logoScale ?? 1) * 100).toFixed(0)}%
                      </p>
                    </SettingRow>
                  </div>
                </TabsContent>
              </Tabs>

              <Dialog onOpenChange={setShowCanvasBuilder} open={showCanvasBuilder}>
                <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Canvas tuner</DialogTitle>
                    <DialogDescription>
                      Preview the hero node grid. Apply saves grid type (Waves, Flux, or Truss), cell spacing, and
                      stroke to your theme.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="relative mt-2 h-[min(70vh,640px)] w-full overflow-hidden rounded-[calc(var(--theme-radius))] border border-border/70 bg-background">
                    <NodeGridBackdrop
                      key={`${tunerGridType}-${tunerCell}-${tunerStroke}`}
                      className="h-full min-h-0 w-full"
                      gridCellSize={tunerCell}
                      gridType={tunerGridType}
                      inline
                      linkHoverFromPointer={false}
                      strokeScale={tunerStroke}
                      withNoiseOverlay={false}
                    />
                  </div>
                  <div className="mt-4 grid gap-4">
                    <label className="grid gap-2" htmlFor={canvasTunerGridSelectId}>
                      <span className="text-sm font-semibold text-foreground" id={canvasTunerGridLabelId}>
                        Grid type
                      </span>
                      <select
                        aria-labelledby={canvasTunerGridLabelId}
                        className={FONT_SELECT_CLASSES}
                        id={canvasTunerGridSelectId}
                        onChange={(event) => {
                          const value = event.target.value as GridType;
                          setTunerGridType(value);
                        }}
                        value={tunerGridType}
                      >
                        {NODE_GRID_ORDER.map((type) => (
                          <option key={type} value={type}>
                            {gridTypeLabel(type)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-sm font-semibold text-foreground" htmlFor={canvasTunerCellLabelId}>
                          Cell size (px)
                        </label>
                        <span className="font-mono text-xs text-muted">{Math.round(tunerCell)}</span>
                      </div>
                      <Slider
                        aria-labelledby={canvasTunerCellLabelId}
                        id={canvasTunerCellLabelId}
                        max={120}
                        min={16}
                        onValueChange={(value) => setTunerCell(value[0] ?? 16)}
                        step={1}
                        value={[tunerCell]}
                      />
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-sm font-semibold text-foreground" htmlFor={canvasTunerStrokeLabelId}>
                          Stroke scale
                        </label>
                        <span className="font-mono text-xs text-muted">{tunerStroke.toFixed(2)}</span>
                      </div>
                      <Slider
                        aria-labelledby={canvasTunerStrokeLabelId}
                        id={canvasTunerStrokeLabelId}
                        max={4}
                        min={0.25}
                        onValueChange={(value) => setTunerStroke(value[0] ?? 0.45)}
                        step={0.05}
                        value={[tunerStroke]}
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap justify-end gap-2">
                    <Button onClick={() => setShowCanvasBuilder(false)} type="button" variant="outline">
                      Cancel
                    </Button>
                    <Button onClick={handleApplyCanvasTuner} type="button" variant="default">
                      Apply
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <Card className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[min(11.5rem,46%)] min-h-[9.5rem]">
              <HeroGridSurface
                className="text-border opacity-95"
                pattern={tokens.heroGridPattern}
                reduceMotion
                uid={`live-${livePreviewLatticeUid}`}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/15 via-background/78 to-background" />
            </div>
            <CardHeader className="relative z-[1]">
              <div className="flex items-center gap-2 text-accent">
                <Sparkles className="size-4" />
                Live preview
              </div>
              <CardTitle className="text-3xl">Packet styling</CardTitle>
              <p className="text-sm text-muted">
                Reflects accent, radius, shadows, lattice, spacing, and{" "}
                <span className="text-foreground">Typography</span> (header + body fonts) from the tabs — updates
                apply instantly site-wide.
              </p>
            </CardHeader>
            <CardContent className="relative z-[1] space-y-4">
              <div className="rounded-[calc(var(--theme-radius-lg))] border border-border/70 bg-panel/70 p-5 shadow-[var(--theme-shadow)]">
                <div className="rounded-[calc(var(--theme-radius))] border border-accent/20 bg-accent/8 p-4">
                  <div className="space-y-3">
                    <WebsiteCreditScoreLogo compact />
                    <div>
                      <p className="font-semibold text-foreground">{branding.agencyName}</p>
                      <p className="text-xs uppercase tracking-[0.16em] text-muted">
                        {branding.logoMark ? `${branding.logoMark} · ` : null}
                        packet preview
                      </p>
                    </div>
                  </div>
                  <h3 className="mt-4 font-display text-3xl font-semibold tracking-[-0.03em] text-foreground">
                    Clearer offer. Stronger proof. Lower-friction next step.
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Judge hierarchy, density, and tone before the packet goes out.
                  </p>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[calc(var(--theme-radius))] border border-border/70 bg-elevated/80 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Mini packet header</p>
                    <div className="mt-3 space-y-2">
                      <div className="h-2.5 w-28 rounded-full bg-accent/70" />
                      <div className="h-4 w-full rounded-full bg-foreground/14" />
                      <div className="h-4 w-3/4 rounded-full bg-foreground/10" />
                    </div>
                  </div>
                  <div className="rounded-[calc(var(--theme-radius))] border border-border/70 bg-elevated/80 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Score stack</p>
                    <div className="mt-3 grid gap-2">
                      <div className="rounded-[calc(var(--theme-radius)-4px)] border border-border/70 bg-panel px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Current score</p>
                        <p className="mt-1 font-display text-2xl font-semibold text-foreground whitespace-nowrap">4.2 / 10</p>
                      </div>
                      <div className="rounded-[calc(var(--theme-radius)-4px)] border border-border/70 bg-panel px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Projected score</p>
                        <p className="mt-1 font-display text-2xl font-semibold text-foreground whitespace-nowrap">8.9 / 10</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[calc(var(--theme-radius))] border border-border/70 bg-background-alt/70 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Surface rhythm</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-[calc(var(--theme-radius)-4px)] border border-border/70 bg-panel px-3 py-3 text-sm text-foreground">
                      Executive summary
                    </div>
                    <div className="rounded-[calc(var(--theme-radius)-4px)] border border-border/70 bg-elevated px-3 py-3 text-sm text-foreground">
                      Scope line items
                    </div>
                    <div className="rounded-[calc(var(--theme-radius)-4px)] border border-accent/25 bg-accent/8 px-3 py-3 text-sm text-foreground">
                      Primary CTA
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[calc(var(--theme-radius))] border border-border/70 bg-panel/55 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Semantic score bars</p>
                  <p className="mt-1 text-xs text-muted">Preview-only; matches traffic-light scoring in reports.</p>
                  <div className="mt-4 space-y-2.5">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                        <span>On-page clarity</span>
                        <span className="tabular-nums text-foreground">8.6</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-background/55">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: "86%",
                            background:
                              "linear-gradient(90deg, rgba(34,197,94,0.95), rgba(34,197,94,0.35))",
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                        <span>Trust signals</span>
                        <span className="tabular-nums text-foreground">6.2</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-background/55">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: "62%",
                            background:
                              "linear-gradient(90deg, rgba(234,179,8,0.95), rgba(234,179,8,0.35))",
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                        <span>Conversion friction</span>
                        <span className="tabular-nums text-foreground">4.1</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-background/55">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: "41%",
                            background:
                              "linear-gradient(90deg, rgba(239,68,68,0.95), rgba(239,68,68,0.32))",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
    </TooltipProvider>
  );
}
