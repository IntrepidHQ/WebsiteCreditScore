import type { EvidenceConfidence, SourceType, WCSReport } from "@/lib/schema";

type Provenance = { source_type: SourceType; confidence: EvidenceConfidence };

function hostname(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

/** Classify the kind of evidence without inventing support the source did not provide. */
export function classifyEvidence(url: string, scannedDomain: string): Provenance {
  const host = hostname(url);
  const site = scannedDomain.replace(/^www\./, "").toLowerCase();
  if (host === site || host.endsWith(`.${site}`)) return { source_type: "first_party", confidence: "verified" };
  if (/(\.gov$|bbb\.org|charitynavigator\.org|guidestar\.org|propublica\.org)/.test(host)) {
    return { source_type: "registry", confidence: "verified" };
  }
  if (/(trustpilot|yelp|g2\.com|capterra|glassdoor|google\.[^/]+$)/.test(host)) {
    return { source_type: "review", confidence: "reported" };
  }
  if (/(reddit|linkedin|facebook|instagram|x\.com|twitter|youtube|tiktok)/.test(host)) {
    return { source_type: "social", confidence: "reported" };
  }
  if (/(ssllabs|securityheaders|pagespeed|builtwith|wappalyzer)/.test(host)) {
    return { source_type: "technical", confidence: "verified" };
  }
  if (/(crunchbase|prnewswire|businesswire|forbes|techcrunch|reuters|bloomberg)/.test(host)) {
    return { source_type: "news", confidence: "reported" };
  }
  return { source_type: "other", confidence: "unverified" };
}

/** Attach consistent source metadata server-side; model wording never controls provenance. */
export function attachReportProvenance(report: WCSReport): WCSReport {
  const observedAt = report.scanned_at;
  return {
    ...report,
    sources: report.sources.map((source) => ({
      ...source,
      ...classifyEvidence(source.url, report.domain),
      observed_at: observedAt,
    })),
    dimensions: report.dimensions.map((dimension) => ({
      ...dimension,
      evidence: dimension.evidence.map((evidence) => ({
        ...evidence,
        ...classifyEvidence(evidence.url, report.domain),
        observed_at: observedAt,
      })),
    })),
  };
}
