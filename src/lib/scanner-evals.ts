import type { DimensionKey, WCSReport } from "@/lib/schema";

export type CalibrationCase = {
  domain: string;
  category: "enterprise" | "saas" | "commerce" | "nonprofit" | "local_service" | "new_business" | "inactive";
  expectedOverall: readonly [number, number];
  expectedDimensions?: Partial<Record<DimensionKey, readonly [number, number]>>;
  note: string;
};

/**
 * Fixed regression set for scanner changes. Ranges acknowledge that a trust
 * report is evidence-led judgment, while still catching major model drift.
 */
export const CALIBRATION_CASES: readonly CalibrationCase[] = [
  {
    domain: "apple.com",
    category: "enterprise",
    expectedOverall: [85, 100],
    expectedDimensions: { reputation: [70, 90], legitimacy: [90, 100], longevity: [90, 100] },
    note: "Global reference brand; review-platform complaints must remain scoped",
  },
  { domain: "microsoft.com", category: "enterprise", expectedOverall: [85, 100], note: "Global reference brand" },
  { domain: "hubspot.com", category: "saas", expectedOverall: [70, 90], note: "Established SaaS with public support concerns" },
  { domain: "render.com", category: "saas", expectedOverall: [65, 85], note: "Established developer platform" },
  { domain: "babylist.com", category: "commerce", expectedOverall: [80, 95], note: "Mature consumer platform" },
  { domain: "toyota.com", category: "enterprise", expectedOverall: [60, 85], note: "Strong legitimacy with public reputation variance" },
  { domain: "doroni.io", category: "new_business", expectedOverall: [60, 85], note: "Early-stage aerospace company" },
  { domain: "ploy.ai", category: "new_business", expectedOverall: [65, 90], note: "New venture-backed software company" },
  {
    domain: "trustpilot.com",
    category: "saas",
    expectedOverall: [65, 85],
    expectedDimensions: { legitimacy: [75, 95], reputation: [40, 70], financial_signals: [70, 95] },
    note: "Established review platform; allegations must remain attributed and source-weighted",
  },
  { domain: "d2l.org", category: "nonprofit", expectedOverall: [75, 95], note: "Established mission-driven organization" },
  { domain: "bifmc.org", category: "nonprofit", expectedOverall: [75, 95], note: "Established local nonprofit" },
  { domain: "camphappydays.org", category: "nonprofit", expectedOverall: [75, 95], note: "Established local nonprofit" },
  { domain: "greenheartsc.org", category: "nonprofit", expectedOverall: [65, 90], note: "Active local nonprofit" },
  { domain: "yoartinc.org", category: "nonprofit", expectedOverall: [65, 90], note: "Active local nonprofit" },
  { domain: "engagingcreativeminds.org", category: "nonprofit", expectedOverall: [75, 95], note: "Established education nonprofit" },
  { domain: "charlestonstage.com", category: "nonprofit", expectedOverall: [70, 90], note: "Long-running regional institution" },
  { domain: "landmarksforfamilies.org", category: "nonprofit", expectedOverall: [70, 95], note: "Long-running regional institution" },
  { domain: "wildlife-rehab.com", category: "nonprofit", expectedOverall: [65, 90], note: "Volunteer-led local nonprofit" },
  { domain: "coastalcommunityfoundation.org", category: "nonprofit", expectedOverall: [80, 100], note: "Large established foundation" },
  { domain: "eccocharleston.org", category: "nonprofit", expectedOverall: [75, 95], note: "Established local nonprofit" },
  { domain: "sorellecharleston.com", category: "local_service", expectedOverall: [70, 95], note: "Established hospitality business" },
  { domain: "charlestonent.com", category: "local_service", expectedOverall: [55, 80], note: "Established healthcare practice" },
  { domain: "saunderswoodworkllc.com", category: "local_service", expectedOverall: [40, 70], note: "Small local service business" },
  { domain: "dfwservicedirect.com", category: "local_service", expectedOverall: [50, 80], note: "Established local service business" },
  { domain: "beautifulgatecenter.org", category: "nonprofit", expectedOverall: [55, 80], note: "Local nonprofit with mixed public signals" },
  { domain: "earth-heart-growers.com", category: "nonprofit", expectedOverall: [60, 85], note: "Small mission-led organization" },
  { domain: "theindigoroad.com", category: "local_service", expectedOverall: [75, 95], note: "Established hospitality group" },
  { domain: "oku.com", category: "saas", expectedOverall: [60, 85], note: "Established crypto product" },
  { domain: "uniquevapors.com", category: "inactive", expectedOverall: [0, 35], note: "Inactive business baseline" },
  { domain: "thecooper.com", category: "inactive", expectedOverall: [0, 35], note: "Low-evidence domain baseline" },
  { domain: "github.com", category: "enterprise", expectedOverall: [85, 100], note: "Established developer platform" },
  { domain: "salesforce.com", category: "enterprise", expectedOverall: [85, 100], note: "Public enterprise software company" },
  { domain: "notion.so", category: "saas", expectedOverall: [75, 95], note: "Established productivity SaaS" },
  { domain: "linear.app", category: "saas", expectedOverall: [70, 95], note: "Established product-led SaaS" },
  { domain: "shopify.com", category: "commerce", expectedOverall: [80, 95], note: "Large commerce platform" },
  { domain: "etsy.com", category: "commerce", expectedOverall: [75, 95], note: "Established consumer marketplace" },
  { domain: "redcross.org", category: "nonprofit", expectedOverall: [80, 100], note: "National nonprofit institution" },
  { domain: "habitat.org", category: "nonprofit", expectedOverall: [80, 100], note: "Established international nonprofit" },
  { domain: "aspendental.com", category: "local_service", expectedOverall: [65, 90], note: "Multi-location healthcare practice" },
  { domain: "homeadvisor.com", category: "local_service", expectedOverall: [60, 85], note: "Established local-services marketplace" },
] as const;

export function evaluateCalibrationCase(report: WCSReport, calibration: CalibrationCase) {
  const [min, max] = calibration.expectedOverall;
  const score = report.overall.score;
  const dimensionResults = Object.entries(calibration.expectedDimensions ?? {}).map(([key, band]) => {
    const dimension = report.dimensions?.find((item) => item.key === key);
    const [dimensionMin, dimensionMax] = band as readonly [number, number];
    return {
      key: key as DimensionKey,
      score: dimension?.score ?? null,
      expected: band,
      passed: Boolean(dimension && dimension.score >= dimensionMin && dimension.score <= dimensionMax),
    };
  });
  return {
    score,
    passed: score >= min && score <= max && dimensionResults.every((item) => item.passed),
    expectedOverall: calibration.expectedOverall,
    dimensionResults,
  };
}

export function evaluateSourceQuality(report: Pick<WCSReport, "sources">) {
  const distinct = new Set(report.sources.map((source) => source.url));
  const types = new Set(report.sources.map((source) => source.source_type).filter(Boolean));
  const authoritative = report.sources.filter((source) =>
    source.source_role === "primary" || source.source_role === "authority" ||
    source.source_type === "first_party" || source.source_type === "registry" || source.source_type === "technical"
  ).length;
  const reviewSources = report.sources.filter((source) => source.source_type === "review").length;
  const reviewShare = report.sources.length ? reviewSources / report.sources.length : 1;

  return {
    total: report.sources.length,
    distinct: distinct.size,
    sourceTypes: types.size,
    authoritative,
    reviewSources,
    reviewShare,
    passed: distinct.size >= 12 && types.size >= 4 && authoritative >= 4 && reviewSources <= 3 && reviewShare <= 0.3,
  };
}

/** Evaluate repeated scans of one calibration site. A report can be inside its
 * expected band while still drifting too much between runs, so both checks are
 * required before a scanner release is considered stable. */
export function evaluateCalibrationRuns(
  reports: Array<{ overall: { score: number } }>,
  calibration: CalibrationCase,
  maxSpread = 10,
) {
  const scores = reports.map((report) => report.overall.score);
  const [min, max] = calibration.expectedOverall;
  const spread = scores.length ? Math.max(...scores) - Math.min(...scores) : 0;
  const mean = scores.length
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : null;

  return {
    scores,
    mean,
    spread,
    passed: scores.length > 0 && scores.every((score) => score >= min && score <= max),
    consistent: scores.length > 0 && spread <= maxSpread,
  };
}
