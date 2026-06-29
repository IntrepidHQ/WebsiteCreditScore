import type { Tier, TierMode } from "@/lib/pricing";
import { PRICING, tierLabel } from "@/lib/pricing";

export type ScanDepthKey = "aerial" | "surface" | "deep" | "trench" | "mantle" | "core";

export interface ScanDepthProfile {
  key: ScanDepthKey;
  tier: Tier;
  mode: TierMode;
  label: string;
  searches: number;
  citedSources: string;
  valuePromise: string;
  unlocks: string[];
}

export function scanDepthKey(tier: Tier, mode: TierMode): ScanDepthKey {
  if (mode === "max") {
    return tier === "quick" ? "trench" : tier === "standard" ? "mantle" : "core";
  }
  return tier === "quick" ? "aerial" : tier === "standard" ? "surface" : "deep";
}

export const SCAN_DEPTH_PROFILES: Record<ScanDepthKey, ScanDepthProfile> = {
  aerial: {
    key: "aerial",
    tier: "quick",
    mode: "standard",
    label: "Aerial Scan",
    searches: PRICING.standard.quick.searches,
    citedSources: PRICING.standard.quick.citedSources,
    valuePromise: "Fast top-down credibility read with the full 10-dimension scorecard.",
    unlocks: ["10 scored dimensions", "core flags", "executive summary", "source list"],
  },
  surface: {
    key: "surface",
    tier: "standard",
    mode: "standard",
    label: "Surface Scan",
    searches: PRICING.standard.standard.searches,
    citedSources: PRICING.standard.standard.citedSources,
    valuePromise: "Richer evidence trail with competitor and context framing.",
    unlocks: ["denser evidence", "confidence signals", "competitor framing", "timeline preview"],
  },
  deep: {
    key: "deep",
    tier: "deep",
    mode: "standard",
    label: "Deep Scan",
    searches: PRICING.standard.deep.searches,
    citedSources: PRICING.standard.deep.citedSources,
    valuePromise: "High-stakes diligence with regulatory, legal, and media context.",
    unlocks: ["expanded peers", "company timeline", "legal/media sections", "deeper risk reasoning"],
  },
  trench: {
    key: "trench",
    tier: "quick",
    mode: "max",
    label: "Trench Scan",
    searches: PRICING.max.quick.searches,
    citedSources: PRICING.max.quick.citedSources,
    valuePromise: "MAX-mode breadth with source clustering and benchmark positioning.",
    unlocks: ["MAX coverage badge", "source clusters", "coverage summary", "benchmark positioning"],
  },
  mantle: {
    key: "mantle",
    tier: "standard",
    mode: "max",
    label: "Mantle Scan",
    searches: PRICING.max.standard.searches,
    citedSources: PRICING.max.standard.citedSources,
    valuePromise: "Narrative risk map and market context for serious due diligence.",
    unlocks: ["risk map", "market context", "competitor table", "score-change evidence"],
  },
  core: {
    key: "core",
    tier: "deep",
    mode: "max",
    label: "Core Scan",
    searches: PRICING.max.deep.searches,
    citedSources: PRICING.max.deep.citedSources,
    valuePromise: "Decision-ready dossier with boardroom-style synthesis and benchmark gaps.",
    unlocks: ["decision memo", "risk matrix", "benchmark gap analysis", "source taxonomy"],
  },
};

export function getScanDepthProfile(tier: Tier, mode: TierMode): ScanDepthProfile {
  return SCAN_DEPTH_PROFILES[scanDepthKey(tier, mode)] ?? {
    ...SCAN_DEPTH_PROFILES.aerial,
    label: tierLabel(tier, mode),
  };
}
