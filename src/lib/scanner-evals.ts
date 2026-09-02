import type { WCSReport } from "@/lib/schema";

export type CalibrationCase = {
  domain: string;
  category: "enterprise" | "saas" | "commerce" | "nonprofit" | "local_service" | "new_business" | "inactive";
  expectedOverall: readonly [number, number];
  note: string;
};

/**
 * Fixed regression set for scanner changes. Ranges acknowledge that a trust
 * report is evidence-led judgment, while still catching major model drift.
 */
export const CALIBRATION_CASES: readonly CalibrationCase[] = [
  { domain: "apple.com", category: "enterprise", expectedOverall: [85, 100], note: "Global reference brand" },
  { domain: "microsoft.com", category: "enterprise", expectedOverall: [85, 100], note: "Global reference brand" },
  { domain: "hubspot.com", category: "saas", expectedOverall: [70, 90], note: "Established SaaS with public support concerns" },
  { domain: "render.com", category: "saas", expectedOverall: [65, 85], note: "Established developer platform" },
  { domain: "babylist.com", category: "commerce", expectedOverall: [80, 95], note: "Mature consumer platform" },
  { domain: "toyota.com", category: "enterprise", expectedOverall: [60, 85], note: "Strong legitimacy with public reputation variance" },
  { domain: "doroni.io", category: "new_business", expectedOverall: [60, 85], note: "Early-stage aerospace company" },
  { domain: "ploy.ai", category: "new_business", expectedOverall: [65, 90], note: "New venture-backed software company" },
  { domain: "inflect.com", category: "saas", expectedOverall: [50, 75], note: "Established infrastructure company with limited public proof" },
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
] as const;

export function evaluateCalibrationCase(report: WCSReport, calibration: CalibrationCase) {
  const [min, max] = calibration.expectedOverall;
  const score = report.overall.score;
  return {
    score,
    passed: score >= min && score <= max,
    expectedOverall: calibration.expectedOverall,
  };
}
