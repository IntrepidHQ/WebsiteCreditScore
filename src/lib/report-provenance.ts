import {
  REPORT_SCHEMA_VERSION,
  RUBRIC_VERSION,
  SCANNER_VERSION,
  type EvidenceConfidence,
  type Representativeness,
  type SourceRole,
  type SourceType,
  type WCSReport,
} from "@/lib/schema";

type Provenance = {
  source_type: SourceType;
  confidence: EvidenceConfidence;
  source_role: SourceRole;
  representativeness: Representativeness;
  scope: string;
};

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
  if (host === site || host.endsWith(`.${site}`)) {
    return {
      source_type: "first_party",
      confidence: "verified",
      source_role: "primary",
      representativeness: "representative",
      scope: "Direct evidence of what the website publishes; not independent verification of its claims.",
    };
  }
  if (/(\.gov$|bbb\.org|charitynavigator\.org|guidestar\.org|propublica\.org)/.test(host)) {
    return {
      source_type: "registry",
      confidence: "verified",
      source_role: "authority",
      representativeness: "representative",
      scope: "Authoritative for the specific registration, filing, certification, or complaint record shown.",
    };
  }
  if (/(trustpilot|yelp|g2\.com|capterra|glassdoor|google\.[^/]+$)/.test(host)) {
    return {
      source_type: "review",
      confidence: "reported",
      source_role: "reported_experience",
      representativeness: "limited",
      scope: "Self-selected reviewer sentiment on this platform; not a company-wide quality or legitimacy score.",
    };
  }
  if (/(reddit|linkedin|facebook|instagram|x\.com|twitter|youtube|tiktok)/.test(host)) {
    return {
      source_type: "social",
      confidence: "reported",
      source_role: "reported_experience",
      representativeness: "limited",
      scope: "Platform-specific public activity or commentary; sampling and identity may be incomplete.",
    };
  }
  if (/(ssllabs|securityheaders|pagespeed|builtwith|wappalyzer)/.test(host)) {
    return {
      source_type: "technical",
      confidence: "verified",
      source_role: "authority",
      representativeness: "representative",
      scope: "Point-in-time technical observation for the tested URL or domain.",
    };
  }
  if (/(crunchbase|prnewswire|businesswire|forbes|techcrunch|reuters|bloomberg)/.test(host)) {
    return {
      source_type: "news",
      confidence: "reported",
      source_role: "independent",
      representativeness: "unknown",
      scope: "Independent or distributed reporting; verify consequential claims against primary records.",
    };
  }
  return {
    source_type: "other",
    confidence: "unverified",
    source_role: "unknown",
    representativeness: "unknown",
    scope: "Source authority and coverage are not established.",
  };
}

/** Attach consistent source metadata server-side; model wording never controls provenance. */
export function attachReportProvenance(report: WCSReport): WCSReport {
  const observedAt = report.scanned_at;
  return {
    ...report,
    report_meta: {
      schema_version: REPORT_SCHEMA_VERSION,
      rubric_version: RUBRIC_VERSION,
      scanner_version: SCANNER_VERSION,
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514",
    },
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
