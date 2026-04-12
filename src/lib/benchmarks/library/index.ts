import type {
  AuditCategoryKey,
  BenchmarkReference,
  BenchmarkSite,
  BenchmarkTier,
  BenchmarkVertical,
  ReportProfileType,
  ThemeColorHarmony,
  ThemeFontStackId,
  ThemeSurfaceFinish,
} from "@/lib/types/audit";

import { benchmarkRubrics } from "./benchmark-rubrics";
import { benchmarkSites } from "./benchmark-sites";
import { patternNotes } from "./pattern-notes";

const primaryVerticals: BenchmarkVertical[] = [
  "service-providers",
  "private-healthcare",
];

export function getPrimaryBenchmarkVerticals() {
  return primaryVerticals;
}

export function getBenchmarkRubric(vertical: BenchmarkVertical) {
  return benchmarkRubrics[vertical];
}

export function getBenchmarkRubricForProfile(profile: ReportProfileType) {
  return benchmarkRubrics[getBenchmarkVerticalForProfile(profile)];
}

export function getCriterionForProfileCategory(
  profile: ReportProfileType,
  category: AuditCategoryKey,
) {
  return getBenchmarkRubricForProfile(profile).criteria.find(
    (criterion) => criterion.category === category,
  );
}

export function getBenchmarkSites(vertical: BenchmarkVertical) {
  return benchmarkSites.filter((site) => site.vertical === vertical);
}

export function getBenchmarkSitesByFocus(
  vertical: BenchmarkVertical,
  focusArea: NonNullable<BenchmarkSite["focusArea"]>,
) {
  return getBenchmarkSites(vertical).filter((site) => site.focusArea === focusArea);
}

export function getBenchmarkDesignNotes(vertical: BenchmarkVertical) {
  return patternNotes[vertical];
}

export function getBenchmarkVerticalForProfile(
  profile: ReportProfileType,
): BenchmarkVertical {
  if (profile === "healthcare") {
    return "private-healthcare";
  }

  if (profile === "local-service") {
    return "service-providers";
  }

  return "product-saas";
}

export function buildBenchmarkReferencesForProfile(
  profile: ReportProfileType,
): BenchmarkReference[] {
  return buildBenchmarkReferencesForVertical(getBenchmarkVerticalForProfile(profile));
}

export function buildBenchmarkReferencesForVertical(
  vertical: BenchmarkVertical,
): BenchmarkReference[] {
  return getBenchmarkSites(vertical).map((site) => ({
    id: site.id,
    siteId: site.id,
    vertical: site.vertical,
    focusArea: site.focusArea,
    tier: site.tier,
    name: site.name,
    url: site.url,
    sourceLabel: site.sourceLabel,
    note: site.note,
    previewImage: site.desktopPreviewImage,
    mobilePreviewImage: site.mobilePreviewImage,
    targetScore: getBenchmarkTargetScore(site.tier),
    strengths: site.strengths,
    whatWorks: site.whatWorks,
    bestFor: site.bestFor,
    reusablePatterns: site.reusablePatterns,
  }));
}

export function getBenchmarkTargetScore(tier: BenchmarkTier) {
  if (tier === "flagship") {
    return 9.2;
  }

  if (tier === "reference") {
    return 8.8;
  }

  return 8.4;
}

export function getDesignPatternNotesForProfile(profile: ReportProfileType) {
  return getBenchmarkDesignNotes(getBenchmarkVerticalForProfile(profile));
}

type ThemePresetSeedOptions = {
  accentColor: string;
  fontScale: number;
  radius: number;
  shadowIntensity: number;
  spacingDensity: number;
  /** Defaults to monochromatic when omitted (older presets). */
  colorHarmony?: ThemeColorHarmony;
  surfaceFinish?: ThemeSurfaceFinish;
  fontDisplay?: ThemeFontStackId;
  fontBody?: ThemeFontStackId;
};

export function getAllThemePresetSeeds(): Array<{
  id: string;
  name: string;
  mode: "dark" | "light";
  accentFamily: string;
  mood: string;
  recommendedUseCase: string;
  options: ThemePresetSeedOptions;
}> {
  return [
    {
      id: "signal-dark",
      name: "Signal Dark",
      mode: "dark",
      accentFamily: "WebsiteCreditScore amber",
      mood: "Confident, warm, and premium.",
      recommendedUseCase: "Default audit and packet workspace.",
      options: {
        accentColor: "#f7b21b",
        fontScale: 1.02,
        radius: 10,
        shadowIntensity: 0.88,
        spacingDensity: 0.98,
        fontDisplay: "instrument-serif",
        fontBody: "manrope",
      },
    },
    {
      id: "blueprint-dark",
      name: "Blueprint Dark",
      mode: "dark",
      accentFamily: "Blueprint blue",
      mood: "Sharper, more technical, and calm.",
      recommendedUseCase: "Benchmark analysis and technical review flows.",
      options: {
        accentColor: "#7da8ff",
        fontScale: 1.01,
        radius: 9,
        shadowIntensity: 0.8,
        spacingDensity: 0.96,
        fontDisplay: "space-grotesk",
        fontBody: "manrope",
      },
    },
    {
      id: "atelier-dark",
      name: "Atelier Dark",
      mode: "dark",
      accentFamily: "Verdant mint",
      mood: "Editorial, composed, and studio-like.",
      recommendedUseCase: "Presentation-heavy reviews and benchmark storytelling.",
      options: {
        accentColor: "#7adbb3",
        fontScale: 1.04,
        radius: 11,
        shadowIntensity: 0.82,
        spacingDensity: 1.02,
        fontDisplay: "instrument-serif",
        fontBody: "manrope",
      },
    },
    {
      id: "ledger-light",
      name: "Ledger Light",
      mode: "light",
      accentFamily: "Ledger gold",
      mood: "Clean, bright, and proposal-friendly.",
      recommendedUseCase: "Client packet previews and lighter presentation modes.",
      options: {
        accentColor: "#c58512",
        fontScale: 1.01,
        radius: 10,
        shadowIntensity: 0.72,
        spacingDensity: 0.98,
        fontDisplay: "instrument-serif",
        fontBody: "system-sans",
      },
    },
    {
      id: "clinic-light",
      name: "Clinic Light",
      mode: "light",
      accentFamily: "Clinic blue",
      mood: "Calm, precise, and trustworthy.",
      recommendedUseCase: "Dental and healthcare proposal reviews.",
      options: {
        accentColor: "#4f7ff0",
        fontScale: 1.02,
        radius: 10,
        shadowIntensity: 0.68,
        spacingDensity: 1,
        fontDisplay: "instrument-serif",
        fontBody: "manrope",
      },
    },
    {
      id: "workshop-light",
      name: "Workshop Light",
      mode: "light",
      accentFamily: "Workshop sage",
      mood: "Practical, grounded, and refined.",
      recommendedUseCase: "Service-business audits and internal benchmark reviews.",
      options: {
        accentColor: "#1f9b74",
        fontScale: 1,
        radius: 9,
        shadowIntensity: 0.65,
        spacingDensity: 0.96,
        fontDisplay: "space-grotesk",
        fontBody: "manrope",
      },
    },
    {
      id: "tide-dark",
      name: "Tide Dark",
      mode: "dark",
      accentFamily: "Cyan signal",
      mood: "Crisp, modern, and high-contrast.",
      recommendedUseCase: "Productized audits and SaaS-style scorecards.",
      options: {
        accentColor: "#22d3ee",
        fontScale: 1,
        radius: 10,
        shadowIntensity: 0.84,
        spacingDensity: 1,
        fontDisplay: "space-grotesk",
        fontBody: "manrope",
      },
    },
    {
      id: "noir-dark",
      name: "Noir Dark",
      mode: "dark",
      accentFamily: "Violet ink",
      mood: "Cinematic, luxe, and slightly playful.",
      recommendedUseCase: "Creative proposals and premium positioning decks.",
      options: {
        accentColor: "#c4b5fd",
        fontScale: 1.03,
        radius: 12,
        shadowIntensity: 0.9,
        spacingDensity: 1.02,
        fontDisplay: "instrument-serif",
        fontBody: "system-sans",
      },
    },
    {
      id: "folio-light",
      name: "Folio Light",
      mode: "light",
      accentFamily: "Indigo ribbon",
      mood: "Bright, structured, and confident.",
      recommendedUseCase: "Agency pitch packets and multi-page audits.",
      options: {
        accentColor: "#4f46e5",
        fontScale: 1.02,
        radius: 11,
        shadowIntensity: 0.7,
        spacingDensity: 1,
        fontDisplay: "space-grotesk",
        fontBody: "manrope",
      },
    },
    {
      id: "editorial-light",
      name: "Editorial Light",
      mode: "light",
      accentFamily: "Rose editorial",
      mood: "Warm paper, magazine-like pacing.",
      recommendedUseCase: "Story-led reviews and narrative-heavy packets.",
      options: {
        accentColor: "#e11d48",
        fontScale: 1.05,
        radius: 12,
        shadowIntensity: 0.66,
        spacingDensity: 1.04,
        fontDisplay: "instrument-serif",
        fontBody: "system-serif",
      },
    },
    {
      id: "lagoon-complementary",
      name: "Lagoon Complementary",
      mode: "dark",
      accentFamily: "Teal signal",
      mood: "Cool complementary depth with a crisp teal accent.",
      recommendedUseCase: "High-contrast audits when you want the canvas to feel cooler than the accent.",
      options: {
        accentColor: "#2dd4bf",
        colorHarmony: "complementary",
        fontScale: 1.01,
        radius: 10,
        shadowIntensity: 0.86,
        spacingDensity: 1,
        fontDisplay: "space-grotesk",
        fontBody: "manrope",
      },
    },
    {
      id: "orchard-analogous",
      name: "Orchard Analogous",
      mode: "dark",
      accentFamily: "Amber grove",
      mood: "Layered warm/cool analogous fields with a honey accent.",
      recommendedUseCase: "Story-first audits and competitor rails that benefit from richer background separation.",
      options: {
        accentColor: "#fbbf24",
        colorHarmony: "analogous",
        fontScale: 1.02,
        radius: 11,
        shadowIntensity: 0.84,
        spacingDensity: 1.01,
        fontDisplay: "instrument-serif",
        fontBody: "manrope",
      },
    },
    {
      id: "meadow-analogous",
      name: "Meadow Analogous",
      mode: "light",
      accentFamily: "Leaf green",
      mood: "Soft analogous daylight with a confident green accent.",
      recommendedUseCase: "Client-facing packets where you want airy light surfaces with subtle hue motion.",
      options: {
        accentColor: "#16a34a",
        colorHarmony: "analogous",
        fontScale: 1.01,
        radius: 10,
        shadowIntensity: 0.7,
        spacingDensity: 1,
        fontDisplay: "instrument-serif",
        fontBody: "manrope",
      },
    },
  ];
}
