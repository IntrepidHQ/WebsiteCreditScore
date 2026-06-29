/**
 * DNS-safe slug derivation for StrategyPresentation client subdomains.
 *
 * Pure + dependency-free so it is unit-testable and importable from anywhere.
 * The signing/secret-handling logic lives in sp-webhook.ts (server-only).
 */

/** Derive a DNS-safe slug from a domain (e.g. "Saunders Wood.com" → "saunderswood"). */
export function deriveClientSlug(domain: string): string {
  const base = domain
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .replace(/\.[a-z]{2,}$/i, "") // strip TLD
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63);
  return base || "client";
}
