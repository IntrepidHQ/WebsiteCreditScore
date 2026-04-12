import type { AuditCategoryKey, AuditCategoryScore } from "@/lib/types/audit";
import { clampVisualScore } from "@/lib/utils/score-visuals";
import { getCachedReport, getRecentScans } from "@/lib/utils/scan-cache";

export type LoginShowcaseBreakdownItem = Pick<
  AuditCategoryScore,
  "key" | "label" | "score" | "weight"
>;

export type LoginShowcasePayload = {
  title: string;
  hostDisplay: string;
  overallScore: number;
  /** Primary rail categories shown beside the dial + bars. */
  breakdown: LoginShowcaseBreakdownItem[];
  /** Remaining scored categories for the compact rail. */
  secondaryBreakdown: LoginShowcaseBreakdownItem[];
  /** True when category rows came from a cached full report (not synthesized). */
  hasFullBreakdown: boolean;
};

/** Keys surfaced in the dial + breakdown bars row. */
export const LOGIN_SHOWCASE_PRIMARY_KEYS: AuditCategoryKey[] = [
  "visual-design",
  "ux-conversion",
  "mobile-experience",
  "trust-credibility",
];

/** Keys listed in the right-hand column (order matches typical audit depth). */
export const LOGIN_SHOWCASE_SECONDARY_KEYS: AuditCategoryKey[] = [
  "seo-readiness",
  "accessibility",
  "security-posture",
];

/** Angular order for the radar (seven axes). */
export const LOGIN_SHOWCASE_RADAR_KEYS: AuditCategoryKey[] = [
  "visual-design",
  "ux-conversion",
  "mobile-experience",
  "seo-readiness",
  "accessibility",
  "trust-credibility",
  "security-posture",
];

const hashSeed = (input: string) => {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const approxBreakdownFromOverall = (
  overall: number,
  seed: string,
): LoginShowcaseBreakdownItem[] => {
  const spec: Array<Pick<LoginShowcaseBreakdownItem, "key" | "label" | "weight">> = [
    { key: "visual-design", label: "Visual design", weight: 1.05 },
    { key: "ux-conversion", label: "UX / conversion", weight: 1.15 },
    { key: "mobile-experience", label: "Mobile experience", weight: 1.0 },
    { key: "trust-credibility", label: "Trust / credibility", weight: 1.1 },
  ];

  let h = hashSeed(seed);

  return spec.map((entry) => {
    const jitter = (h & 15) / 10 - 0.75;
    h = Math.imul(h, 48271) >>> 0;
    const score = clampVisualScore(overall + jitter * 0.55);

    return {
      key: entry.key,
      label: entry.label,
      weight: entry.weight,
      score,
    };
  });
};

const approxSecondaryFromOverall = (
  overall: number,
  seed: string,
): LoginShowcaseBreakdownItem[] => {
  const spec: Array<Pick<LoginShowcaseBreakdownItem, "key" | "label" | "weight">> = [
    { key: "seo-readiness", label: "SEO readiness", weight: 1.0 },
    { key: "accessibility", label: "Accessibility", weight: 1.0 },
    { key: "security-posture", label: "Security posture", weight: 0.95 },
  ];

  let h = hashSeed(`${seed}:secondary`);

  return spec.map((entry) => {
    const jitter = (h & 15) / 10 - 0.8;
    h = Math.imul(h, 48271) >>> 0;
    const score = clampVisualScore(overall + jitter * 0.5);

    return {
      key: entry.key,
      label: entry.label,
      weight: entry.weight,
      score,
    };
  });
};

const hostFromNormalizedUrl = (normalizedUrl: string) => {
  const trimmed = normalizedUrl.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(withProtocol).hostname.replace(/^www\./i, "");
  } catch {
    return trimmed.replace(/^https?:\/\//i, "").split("/")[0] ?? trimmed;
  }
};

const pickBreakdownFromReport = (
  categoryScores: AuditCategoryScore[],
  overallScore: number,
  seed: string,
): LoginShowcaseBreakdownItem[] => {
  const approx = approxBreakdownFromOverall(overallScore, seed);

  return LOGIN_SHOWCASE_PRIMARY_KEYS.map((key, index) => {
    const row = categoryScores.find((entry) => entry.key === key);
    const fallback = approx[index]!;

    if (!row) {
      return fallback;
    }

    return {
      key: row.key,
      label: row.label,
      score: row.score,
      weight: row.weight,
    };
  });
};

const pickSecondaryFromReport = (
  categoryScores: AuditCategoryScore[],
  overallScore: number,
  seed: string,
): LoginShowcaseBreakdownItem[] => {
  const approx = approxSecondaryFromOverall(overallScore, seed);

  return LOGIN_SHOWCASE_SECONDARY_KEYS.map((key, index) => {
    const row = categoryScores.find((entry) => entry.key === key);
    const fallback = approx[index]!;

    if (!row) {
      return fallback;
    }

    return {
      key: row.key,
      label: row.label,
      score: row.score,
      weight: row.weight,
    };
  });
};

export const buildLoginShowcaseRadarItems = (
  payload: LoginShowcasePayload,
): Array<Pick<AuditCategoryScore, "key" | "label" | "score">> => {
  const map = new Map<string, LoginShowcaseBreakdownItem>();
  payload.breakdown.forEach((row) => map.set(row.key, row));
  payload.secondaryBreakdown.forEach((row) => map.set(row.key, row));

  return LOGIN_SHOWCASE_RADAR_KEYS.map((key) => {
    const hit = map.get(key);

    if (hit) {
      return { key: hit.key, label: hit.label, score: hit.score };
    }

    return {
      key,
      label: key,
      score: payload.overallScore,
    };
  });
};

const FALLBACK_SHOWCASE: LoginShowcasePayload = {
  title: "Live audit preview",
  hostDisplay: "websitecreditscore.com",
  overallScore: 6.4,
  breakdown: approxBreakdownFromOverall(6.4, "fallback"),
  secondaryBreakdown: approxSecondaryFromOverall(6.4, "fallback"),
  hasFullBreakdown: false,
};

/**
 * Picks a recent public scan (optionally hydrated from the short-lived scan cache)
 * for the login page “live scores” rail.
 */
export const resolveLoginShowcaseFromRecentScans = async (): Promise<LoginShowcasePayload> => {
  const scans = await getRecentScans();

  if (!scans.length) {
    return FALLBACK_SHOWCASE;
  }

  const shuffled = [...scans];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const probeLimit = Math.min(16, shuffled.length);
  const hydrated = await Promise.all(
    shuffled.slice(0, probeLimit).map(async (scan) => ({
      scan,
      report: await getCachedReport(scan.normalizedUrl),
    })),
  );

  const cacheHits = hydrated.filter(
    (entry) => entry.report?.categoryScores?.length,
  ) as Array<{ scan: (typeof scans)[number]; report: NonNullable<(typeof hydrated)[number]["report"]> }>;

  if (cacheHits.length) {
    const pick = cacheHits[Math.floor(Math.random() * cacheHits.length)]!;
    const report = pick.report;
    const breakdown = pickBreakdownFromReport(
      report.categoryScores,
      report.overallScore,
      report.normalizedUrl,
    );
    const secondaryBreakdown = pickSecondaryFromReport(
      report.categoryScores,
      report.overallScore,
      report.normalizedUrl,
    );
    const missingAnyCategory = LOGIN_SHOWCASE_PRIMARY_KEYS.some(
      (key) => !report.categoryScores.some((entry) => entry.key === key),
    );

    return {
      title: report.title,
      hostDisplay: hostFromNormalizedUrl(report.normalizedUrl),
      overallScore: report.overallScore,
      breakdown,
      secondaryBreakdown,
      hasFullBreakdown: !missingAnyCategory,
    };
  }

  const scan = shuffled[0]!;

  return {
    title: scan.title,
    hostDisplay: hostFromNormalizedUrl(scan.normalizedUrl),
    overallScore: scan.score,
    breakdown: approxBreakdownFromOverall(scan.score, scan.normalizedUrl),
    secondaryBreakdown: approxSecondaryFromOverall(scan.score, scan.normalizedUrl),
    hasFullBreakdown: false,
  };
};
