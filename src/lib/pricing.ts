export type Tier = "quick" | "standard" | "deep";
export type TierMode = "standard" | "max";

export interface TierPricing {
  unitCents: number;       // single-scan price
  packCents: Record<number, number>;
  searches: number;        // displayed search budget
  citedSources: string;    // displayed cited-source range
}

export const BUNDLE_SIZE = 10;
export const PACK_QUANTITIES = [5, 10, 20] as const;

export const PRICING: Record<TierMode, Record<Tier, TierPricing>> = {
  standard: {
    quick:    { unitCents: 100, packCents: { 5: 400, 10: 700, 20: 1300 }, searches: 8,  citedSources: "12+" },
    standard: { unitCents: 160, packCents: { 5: 625, 10: 1125, 20: 2000 }, searches: 14, citedSources: "20+" },
    deep:     { unitCents: 210, packCents: { 5: 825, 10: 1500, 20: 2700 }, searches: 20, citedSources: "30+" },
  },
  max: {
    quick:    { unitCents: 450, packCents: { 5: 1750, 10: 3150, 20: 5600 }, searches: 50,  citedSources: "50+" },
    standard: { unitCents: 825, packCents: { 5: 3200, 10: 5700, 20: 10200 }, searches: 100, citedSources: "80+" },
    deep:     { unitCents: 1500, packCents: { 5: 5800, 10: 10400, 20: 18500 }, searches: 200, citedSources: "150+" },
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
  if (quantity in p.packCents) {
    return p.packCents[quantity];
  }
  return quantity * p.unitCents;
}

export function priceLookupKey(tier: Tier, mode: TierMode, quantity: number): string {
  const scan =
    mode === "max"
      ? tier === "quick" ? "trench" : tier === "standard" ? "mantle" : "core"
      : tier === "quick" ? "aerial" : tier === "standard" ? "surface" : "deep";

  return `wcs_${scan}_${quantity}`;
}
