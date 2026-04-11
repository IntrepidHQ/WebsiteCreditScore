"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Download, RefreshCcw, Shuffle, Sparkles, Upload, Check, AlertCircle, Cloud } from "lucide-react";

import { saveWorkspaceThemeAction } from "@/app/app/actions";
import { THEME_SAVE_NO_SESSION } from "@/lib/theme/workspace-theme-save";

import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WebsiteCreditScoreLogo } from "@/components/common/website-credit-score-logo";
import { cn } from "@/lib/utils/cn";
import type { ThemeFontProfile } from "@/lib/types/audit";
import { getContrastChecks, getThemePresets, rotateHexHue } from "@/lib/utils/theme";
import { useThemeStore } from "@/store/theme-store";

const ACCENT_SWATCHES = [
  "#f7b21b",
  "#ff8a5b",
  "#74f0b4",
  "#8fb2ff",
  "#c084fc",
  "#ff7fb8",
  "#38bdf8",
  "#f472b6",
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

const FONT_PROFILE_OPTIONS: Array<{
  id: ThemeFontProfile;
  label: string;
  description: string;
}> = [
  { id: "instrument", label: "Editorial", description: "Serif display + Manrope UI" },
  { id: "precision", label: "Product", description: "Space Grotesk display + Manrope" },
  { id: "terminal", label: "Systems", description: "Space Grotesk throughout" },
];

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
  return (
    <div className="grid gap-4 rounded-[calc(var(--theme-radius))] border border-border/70 bg-panel/60 p-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
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
  const radiusLabelId = useId();
  const shadowLabelId = useId();
  const spacingLabelId = useId();
  const lineHeightLabelId = useId();
  const glowIntensityLabelId = useId();
  const motionLabelId = useId();
  const accentHueLabelId = useId();
  const fontProfileLabelId = useId();
  const layoutDensityLabelId = useId();
  const presetsGroupId = useId();
  const importInputId = useId();

  const tokens = useThemeStore((state) => state.tokens);
  const branding = useThemeStore((state) => state.branding);
  const motionPreference = useThemeStore((state) => state.motionPreference);
  const presetId = useThemeStore((state) => state.presetId);
  const setMode = useThemeStore((state) => state.setMode);
  const setAccentColor = useThemeStore((state) => state.setAccentColor);
  const setLogoColor = useThemeStore((state) => state.setLogoColor);
  const setLogoScale = useThemeStore((state) => state.setLogoScale);
  const setFontScale = useThemeStore((state) => state.setFontScale);
  const setRadius = useThemeStore((state) => state.setRadius);
  const setShadowIntensity = useThemeStore((state) => state.setShadowIntensity);
  const setSpacingDensity = useThemeStore((state) => state.setSpacingDensity);
  const setLineHeightScale = useThemeStore((state) => state.setLineHeightScale);
  const setGlowIntensity = useThemeStore((state) => state.setGlowIntensity);
  const setFontProfile = useThemeStore((state) => state.setFontProfile);
  const setAccentHueShift = useThemeStore((state) => state.setAccentHueShift);
  const applyLayoutDensity = useThemeStore((state) => state.applyLayoutDensity);
  const setMotionPreference = useThemeStore((state) => state.setMotionPreference);
  const applyPreset = useThemeStore((state) => state.applyPreset);
  const updateBranding = useThemeStore((state) => state.updateBranding);
  const randomizeTheme = useThemeStore((state) => state.randomizeTheme);
  const restoreDefaults = useThemeStore((state) => state.restoreDefaults);
  const exportThemeJson = useThemeStore((state) => state.exportThemeJson);
  const importThemeJson = useThemeStore((state) => state.importThemeJson);
  const presets = getThemePresets();
  const contrast = getContrastChecks(tokens);

  const [settingsTab, setSettingsTab] = useState("appearance");
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncTone, setSyncTone] = useState<"neutral" | "success" | "warning" | "danger">("neutral");
  const [importError, setImportError] = useState<string | null>(null);

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

  return (
    <section className="space-y-8" id="settings-panel">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] 2xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="space-y-8">
          <SectionHeading
            contentMaxWidthClassName="w-full max-w-[min(100%,88rem)]"
            eyebrow="Studio settings"
            title="Theme & proposal identity"
            description="Presets, typography, layout density, and agency fields stay in sync with your workspace when signed in — or locally on this device on the public theme page."
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
                  <TabsTrigger value="branding">Agency</TabsTrigger>
                </TabsList>

                <TabsContent className="space-y-4" value="appearance">
                  <div className="rounded-[calc(var(--theme-radius))] border border-border/70 bg-panel/40 p-4">
                    <p className="text-sm font-semibold text-foreground" id={presetsGroupId}>
                      Presets
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Starting points — tweak tabs to the right for fine control.
                    </p>
                    <div
                      aria-labelledby={presetsGroupId}
                      className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3"
                      role="radiogroup"
                    >
                      {presets.map((preset) => {
                        const selected = presetId === preset.id;
                        return (
                          <button
                            aria-checked={selected}
                            className={cn(
                              "rounded-[10px] border p-3.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                              selected
                                ? "border-accent/50 bg-accent/10 shadow-sm"
                                : "border-border/70 bg-panel/50 hover:border-accent/25 hover:bg-panel/70",
                            )}
                            key={preset.id}
                            onClick={() => applyPreset(preset.id)}
                            role="radio"
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

                  <SettingRow
                    titleId={accentLabelId}
                    label="Accent color"
                    description="Swatches for quick picks; hex field for exact brand colors. Contrast targets: text on background and CTA label on accent."
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
                    description="Nudge the generated surfaces (background wash, panels, glow) without changing your saved brand hex. Picking a new swatch or hex resets this to 0°."
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
                </TabsContent>

                <TabsContent className="space-y-4" value="typography">
                  <SettingRow
                    titleId={fontProfileLabelId}
                    label="Type pairing"
                    description="Display vs UI sans stacks used across the workspace and packet preview. Instrument keeps a premium editorial feel; Product and Systems lean crisper."
                  >
                    <div
                      aria-labelledby={fontProfileLabelId}
                      className="grid gap-2 sm:grid-cols-3"
                      role="group"
                    >
                      {FONT_PROFILE_OPTIONS.map((option) => {
                        const active = tokens.fontProfile === option.id;
                        return (
                          <button
                            aria-pressed={active}
                            className={cn(
                              "rounded-[calc(var(--theme-radius))] border px-3 py-3 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                              active
                                ? "border-accent/45 bg-accent/10 text-foreground"
                                : "border-border/70 bg-panel/50 text-muted hover:border-accent/25 hover:text-foreground",
                            )}
                            key={option.id}
                            onClick={() => setFontProfile(option.id)}
                            type="button"
                          >
                            <p className="font-semibold text-foreground">{option.label}</p>
                            <p className="mt-1 text-xs leading-snug text-muted">{option.description}</p>
                          </button>
                        );
                      })}
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
            </CardContent>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2 text-accent">
                <Sparkles className="size-4" />
                Live preview
              </div>
              <CardTitle className="text-3xl">Packet styling</CardTitle>
              <p className="text-sm text-muted">
                Reflects accent, radius, shadows, and spacing from the{" "}
                <span className="text-foreground">Look &amp; color</span> and{" "}
                <span className="text-foreground">Layout</span> tabs.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">Mini packet header</p>
                    <div className="mt-3 space-y-2">
                      <div className="h-2.5 w-28 rounded-full bg-accent/70" />
                      <div className="h-4 w-full rounded-full bg-foreground/14" />
                      <div className="h-4 w-3/4 rounded-full bg-foreground/10" />
                    </div>
                  </div>
                  <div className="rounded-[calc(var(--theme-radius))] border border-border/70 bg-elevated/80 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">Score stack</p>
                    <div className="mt-3 grid gap-2">
                      <div className="rounded-[calc(var(--theme-radius)-4px)] border border-border/70 bg-panel px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Current score</p>
                        <p className="mt-1 font-display text-2xl font-semibold text-foreground">4.2 / 10</p>
                      </div>
                      <div className="rounded-[calc(var(--theme-radius)-4px)] border border-border/70 bg-panel px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Projected score</p>
                        <p className="mt-1 font-display text-2xl font-semibold text-foreground">8.9 / 10</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[calc(var(--theme-radius))] border border-border/70 bg-background-alt/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Surface rhythm</p>
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
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  );
}
