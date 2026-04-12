import type { AuditCategoryKey, AuditCategoryScore } from "@/lib/types/audit";

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
