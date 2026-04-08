import type {
  AuditCategoryKey,
  BenchmarkReference,
  BenchmarkSite,
  BenchmarkTier,
  BenchmarkVertical,
  ReportProfileType,
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

export function getAllThemePresetSeeds() {
  return [
    {
      id: "signal-dark",
      name: "Signal Dark",
      mode: "dark" as const,
      accentFamily: "WebsiteCreditScore amber",
      mood: "Confident, warm, and premium.",
      recommendedUseCase: "Default audit and packet workspace.",
      options: { accentColor: "#f7b21b", fontScale: 1.02, radius: 10, shadowIntensity: 0.88, spacingDensity: 0.98 },
    },
    {
      id: "blueprint-dark",
      name: "Blueprint Dark",
      mode: "dark" as const,
      accentFamily: "Blueprint blue",
      mood: "Sharper, more technical, and calm.",
      recommendedUseCase: "Benchmark analysis and technical review flows.",
      options: { accentColor: "#7da8ff", fontScale: 1.01, radius: 9, shadowIntensity: 0.8, spacingDensity: 0.96 },
    },
    {
      id: "atelier-dark",
      name: "Atelier Dark",
      mode: "dark" as const,
      accentFamily: "Verdant mint",
      mood: "Editorial, composed, and studio-like.",
      recommendedUseCase: "Presentation-heavy reviews and benchmark storytelling.",
      options: { accentColor: "#7adbb3", fontScale: 1.04, radius: 11, shadowIntensity: 0.82, spacingDensity: 1.02 },
    },
    {
      id: "ledger-light",
      name: "Ledger Light",
      mode: "light" as const,
      accentFamily: "Ledger gold",
      mood: "Clean, bright, and proposal-friendly.",
      recommendedUseCase: "Client packet previews and lighter presentation modes.",
      options: { accentColor: "#c58512", fontScale: 1.01, radius: 10, shadowIntensity: 0.72, spacingDensity: 0.98 },
    },
    {
      id: "clinic-light",
      name: "Clinic Light",
      mode: "light" as const,
      accentFamily: "Clinic blue",
      mood: "Calm, precise, and trustworthy.",
      recommendedUseCase: "Dental and healthcare proposal reviews.",
      options: { accentColor: "#4f7ff0", fontScale: 1.02, radius: 10, shadowIntensity: 0.68, spacingDensity: 1 },
    },
    {
      id: "workshop-light",
      name: "Workshop Light",
      mode: "light" as const,
      accentFamily: "Workshop sage",
      mood: "Practical, grounded, and refined.",
      recommendedUseCase: "Service-business audits and internal benchmark reviews.",
      options: { accentColor: "#1f9b74", fontScale: 1, radius: 9, shadowIntensity: 0.65, spacingDensity: 0.96 },
    },
  ];
}
