/**
 * Google PageSpeed Insights / Lighthouse metric fetcher.
 *
 * Runs a real Lighthouse audit via the PSI API and extracts Core Web Vitals
 * plus the overall performance score. Results are merged into SiteObservation
 * so they flow through scoring, the AI prompt, and the PDF packet.
 *
 * Requires GOOGLE_PAGESPEED_API_KEY in the environment. Returns null
 * gracefully when the key is absent, the site times out, or the API fails.
 */

export interface PageSpeedMetrics {
  /** Lighthouse performance score 0-100 (mobile strategy) */
  performanceScore: number;
  /** Largest Contentful Paint in milliseconds */
  lcp: number;
  /** Cumulative Layout Shift score (0–1, lower is better) */
  cls: number;
  /** First Contentful Paint in milliseconds */
  fcp: number;
  /** Total Blocking Time in milliseconds */
  tbt: number;
  /** Speed Index in milliseconds */
  speedIndex: number;
  /** Time to Interactive in milliseconds */
  tti: number;
  /** Strategy used for the audit */
  strategy: "mobile" | "desktop";
}

function extractNumeric(
  audits: Record<string, { numericValue?: number } | undefined>,
  key: string,
): number {
  return audits[key]?.numericValue ?? 0;
}

export async function fetchPageSpeedMetrics(
  url: string,
  strategy: "mobile" | "desktop" = "mobile",
): Promise<PageSpeedMetrics | null> {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY?.trim();
  if (!apiKey) return null;

  try {
    const apiUrl =
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` +
      `?url=${encodeURIComponent(url)}` +
      `&strategy=${strategy}` +
      `&category=performance` +
      `&key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(apiUrl, {
      signal: AbortSignal.timeout(30000),
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn(`[pagespeed] API returned ${response.status} for ${url}`);
      return null;
    }

    const data = (await response.json()) as {
      categories?: { performance?: { score?: number } };
      lighthouseResult?: {
        audits?: Record<string, { numericValue?: number } | undefined>;
      };
    };

    const score = data.categories?.performance?.score;
    const audits = data.lighthouseResult?.audits ?? {};

    if (score == null) {
      console.warn("[pagespeed] No performance score in response");
      return null;
    }

    return {
      performanceScore: Math.round(score * 100),
      lcp: Math.round(extractNumeric(audits, "largest-contentful-paint")),
      cls: Number((extractNumeric(audits, "cumulative-layout-shift")).toFixed(3)),
      fcp: Math.round(extractNumeric(audits, "first-contentful-paint")),
      tbt: Math.round(extractNumeric(audits, "total-blocking-time")),
      speedIndex: Math.round(extractNumeric(audits, "speed-index")),
      tti: Math.round(extractNumeric(audits, "interactive")),
      strategy,
    };
  } catch (err) {
    console.warn("[pagespeed] Fetch failed:", err);
    return null;
  }
}

/** Human-readable LCP label for display. */
export function lcpLabel(ms: number): string {
  if (ms === 0) return "—";
  if (ms < 2500) return `${(ms / 1000).toFixed(1)}s ✓`;
  if (ms < 4000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 1000).toFixed(1)}s ✗`;
}

/** Human-readable CLS label. */
export function clsLabel(cls: number): string {
  if (cls === 0) return "—";
  if (cls < 0.1) return `${cls.toFixed(3)} ✓`;
  if (cls < 0.25) return `${cls.toFixed(3)}`;
  return `${cls.toFixed(3)} ✗`;
}

/** Human-readable FCP label. */
export function fcpLabel(ms: number): string {
  if (ms === 0) return "—";
  return `${(ms / 1000).toFixed(1)}s`;
}

/** Performance score tone for coloring. */
export function perfScoreTone(score: number): "good" | "needs-improvement" | "poor" {
  if (score >= 90) return "good";
  if (score >= 50) return "needs-improvement";
  return "poor";
}
