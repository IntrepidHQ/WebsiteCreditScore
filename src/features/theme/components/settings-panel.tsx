"use client";

import { useId } from "react";
import { Download, RefreshCcw, Shuffle, Sparkles } from "lucide-react";

import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WebsiteCreditScoreLogo } from "@/components/common/website-credit-score-logo";
import { getThemePresets } from "@/lib/utils/theme";
import { useThemeStore } from "@/store/theme-store";

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
  const setMotionPreference = useThemeStore((state) => state.setMotionPreference);
  const applyPreset = useThemeStore((state) => state.applyPreset);
  const updateBranding = useThemeStore((state) => state.updateBranding);
  const randomizeTheme = useThemeStore((state) => state.randomizeTheme);
  const restoreDefaults = useThemeStore((state) => state.restoreDefaults);
  const exportThemeJson = useThemeStore((state) => state.exportThemeJson);
  const presets = getThemePresets();

  function downloadTheme() {
    const blob = new Blob([exportThemeJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "premium-audit-theme.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="space-y-8" id="settings-panel">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-8">
          <SectionHeading
            eyebrow="Studio settings"
            title="Tune the packet before it goes out"
            description="Adjust the visual system and agency details so outreach, packet previews, and internal review all stay consistent."
          />

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Badge variant="accent">Theme controls</Badge>
                  <CardTitle className="mt-3 text-3xl">Visual system</CardTitle>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={randomizeTheme} variant="secondary">
                    <Shuffle className="size-4" />
                    Random theme
                  </Button>
                  <Button onClick={restoreDefaults} variant="secondary">
                    <RefreshCcw className="size-4" />
                    Restore defaults
                  </Button>
                  <Button onClick={downloadTheme}>
                    <Download className="size-4" />
                    Export JSON
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
                {presets.map((preset) => (
                  <button
                    className={`rounded-[10px] border p-4 text-left transition ${
                      presetId === preset.id
                        ? "border-accent/40 bg-accent/8"
                        : "border-border/70 bg-panel/50 hover:border-accent/25 hover:bg-panel/70"
                    }`}
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{preset.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
                          {preset.mode} · {preset.accentFamily}
                        </p>
                      </div>
                      <span
                        aria-hidden="true"
                        className="size-5 rounded-full border border-border/60"
                        style={{ backgroundColor: preset.tokens.surfaces.accent }}
                      />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted">{preset.mood}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">
                      {preset.recommendedUseCase}
                    </p>
                  </button>
                ))}
              </div>

              <SettingRow
                titleId={modeLabelId}
                label="Theme mode"
                description="Switch between light and dark while preserving the same semantic token structure."
              >
                <Tabs
                  aria-labelledby={modeLabelId}
                  onValueChange={(value) => setMode(value === "light" ? "light" : "dark")}
                  value={tokens.mode}
                >
                  <TabsList className="w-full sm:w-auto">
                    <TabsTrigger className="flex-1 justify-center sm:flex-none" value="dark">
                      Dark
                    </TabsTrigger>
                    <TabsTrigger className="flex-1 justify-center sm:flex-none" value="light">
                      Light
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </SettingRow>

              <SettingRow
                titleId={accentLabelId}
                label="Accent color"
                description="Use a controlled accent to shift the deck’s personality without breaking contrast."
              >
                <div className="flex items-center gap-3">
                  <Input
                    aria-labelledby={accentLabelId}
                    className="max-w-44"
                    type="color"
                    value={tokens.accentColor}
                    onChange={(event) => setAccentColor(event.target.value)}
                  />
                  <span className="text-sm text-muted">{tokens.accentColor}</span>
                </div>
              </SettingRow>

              <SettingRow
                titleId={fontScaleLabelId}
                label="Font scale"
                description="Adjust overall density for larger presentations or smaller screens."
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
                label="Text breathing room"
                description="Tune paragraph line-height for denser or more relaxed reading."
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
                titleId={radiusLabelId}
                label="Border radius"
                description="Move from sharper editorial cards to softer luxury surfaces."
              >
                <Slider
                  aria-labelledby={radiusLabelId}
                  max={16}
                  min={6}
                  onValueChange={(value) => setRadius(value[0] ?? 12)}
                  step={1}
                  value={[tokens.radius]}
                />
                <p className="mt-2 text-sm text-muted">Current value: {tokens.radius}px</p>
              </SettingRow>

              <SettingRow
                titleId={shadowLabelId}
                label="Shadow intensity"
                description="Control how much depth and stage lighting the presentation uses."
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
                description="Widen or tighten layout rhythm across cards, grids, and sections."
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
                label="Ambient glow intensity"
                description="Control how much accent glow appears in page background gradients."
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

              <SettingRow
                titleId={motionLabelId}
                label="Reduce motion"
                description="Use a calmer presentation style when you want less motion in reviews or exported previews."
              >
                <div className="flex items-center justify-between rounded-[calc(var(--theme-radius))] border border-border/70 bg-background-alt/70 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Motion setting</p>
                    <p className="text-xs text-muted">
                      Current mode: {motionPreference === "reduced" ? "Reduced" : "System"}
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Badge variant="accent">Agency branding mode</Badge>
              <CardTitle className="mt-3 text-3xl">Proposal identity</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <BrandingField label="Agency name">
                  <Input
                    autoComplete="organization"
                    value={branding.agencyName}
                    onChange={(event) => updateBranding({ agencyName: event.target.value })}
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
                <BrandingField label="Accent override">
                  <Input
                    type="color"
                    value={branding.accentOverride || tokens.accentColor}
                    onChange={(event) => updateBranding({ accentOverride: event.target.value })}
                  />
                </BrandingField>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <SettingRow
                  titleId={logoColorLabelId}
                  label="Logo color"
                  description="Keep the wordmark high-contrast while matching the current theme."
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
                  description="Scale the logo up or down without changing the header layout."
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
              <CardTitle className="text-3xl">Packet styling preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[calc(var(--theme-radius-lg))] border border-border/70 bg-panel/70 p-5 shadow-[var(--theme-shadow)]">
                <div className="rounded-[calc(var(--theme-radius))] border border-accent/20 bg-accent/8 p-4">
                  <div className="space-y-3">
                    <WebsiteCreditScoreLogo compact />
                    <div>
                      <p className="font-semibold text-foreground">{branding.agencyName}</p>
                      <p className="text-xs uppercase tracking-[0.16em] text-muted">
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
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">
                      Mini packet header
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="h-2.5 w-28 rounded-full bg-accent/70" />
                      <div className="h-4 w-full rounded-full bg-foreground/14" />
                      <div className="h-4 w-3/4 rounded-full bg-foreground/10" />
                    </div>
                  </div>
                  <div className="rounded-[calc(var(--theme-radius))] border border-border/70 bg-elevated/80 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">
                      Score stack
                    </p>
                    <div className="mt-3 grid gap-2">
                      <div className="rounded-[calc(var(--theme-radius)-4px)] border border-border/70 bg-panel px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
                          Current score
                        </p>
                        <p className="mt-1 font-display text-2xl font-semibold text-foreground">
                          4.2 / 10
                        </p>
                      </div>
                      <div className="rounded-[calc(var(--theme-radius)-4px)] border border-border/70 bg-panel px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
                          Projected score
                        </p>
                        <p className="mt-1 font-display text-2xl font-semibold text-foreground">
                          8.9 / 10
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[calc(var(--theme-radius))] border border-border/70 bg-background-alt/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">
                    Surface rhythm
                  </p>
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
