export type Tier = "quick" | "standard" | "deep";
export type TierMode = "standard" | "max";

export interface TierPricing {
  unitCents: number;       // single-scan price
  bundleCents: number;     // 10-pack price
  bundleSize: number;      // number of credits in a bundle (10)
  searches: number;        // displayed search budget
  citedSources: string;    // displayed cited-source range
}

export const BUNDLE_SIZE = 10;

export const PRICING: Record<TierMode, Record<Tier, TierPricing>> = {
  standard: {
    quick:    { unitCents:  100, bundleCents:   800, bundleSize: BUNDLE_SIZE, searches: 8,   citedSources: "12+" },
    standard: { unitCents:  300, bundleCents:  2500, bundleSize: BUNDLE_SIZE, searches: 14,  citedSources: "20+" },
    deep:     { unitCents:  600, bundleCents:  5000, bundleSize: BUNDLE_SIZE, searches: 20,  citedSources: "30+" },
  },
  max: {
    quick:    { unitCents: 1000, bundleCents:  8000, bundleSize: BUNDLE_SIZE, searches: 50,  citedSources: "50+" },
    standard: { unitCents: 2000, bundleCents: 17500, bundleSize: BUNDLE_SIZE, searches: 100, citedSources: "80+" },
    deep:     { unitCents: 4000, bundleCents: 35000, bundleSize: BUNDLE_SIZE, searches: 200, citedSources: "150+" },
  },
};

export function tierLabel(tier: Tier, mode: TierMode): string {
  if (mode === "max") {
    return tier === "quick" ? "Trench Scan" : tier === "standard" ? "Mantle Scan" : "Core Scan";
  }
  return tier === "quick" ? "Aerial Scan" : tier === "standard" ? "Surface Scan" : "Deep Scan";
}

export function isTier(t: unknown): t is Tier {
  return t === "quick" || t === "standard" || t === "deep";
}

export function isTierMode(m: unknown): m is TierMode {
  return m === "standard" || m === "max";
}

export function priceCents(tier: Tier, mode: TierMode, quantity: number): number {
  const p = PRICING[mode][tier];
  if (quantity >= p.bundleSize) {
    const bundles = Math.floor(quantity / p.bundleSize);
    const remainder = quantity - bundles * p.bundleSize;
    return bundles * p.bundleCents + remainder * p.unitCents;
  }
  return quantity * p.unitCents;
}
