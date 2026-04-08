import type { AuditReport } from "@/lib/types/audit";

function normalizeCopy(value: string) {
  return value
    .replace(/&mdash;/gi, "—")
    .replace(/&ndash;/gi, "–")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\bskip to content\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function hasUnsafeCopy(value: string) {
  return /&[a-z]+;|skip to content|^\d+\s/.test(value.toLowerCase());
}

export function prepareReportForStorage(report: AuditReport): AuditReport {
  return {
    ...report,
    executiveSummary: normalizeCopy(report.executiveSummary),
    clientProfile: {
      ...report.clientProfile,
      observedPositioning: normalizeCopy(report.clientProfile.observedPositioning),
      observedAudienceInference: normalizeCopy(report.clientProfile.observedAudienceInference),
    },
    siteObservation: {
      ...report.siteObservation,
      pageTitle: normalizeCopy(report.siteObservation.pageTitle),
      metaDescription: normalizeCopy(report.siteObservation.metaDescription),
      heroHeading: normalizeCopy(report.siteObservation.heroHeading),
      aboutSnippet: normalizeCopy(report.siteObservation.aboutSnippet),
      verifiedFacts: report.siteObservation.verifiedFacts.map((fact) => ({
        ...fact,
        value: normalizeCopy(fact.value),
      })),
      notableDetails: report.siteObservation.notableDetails.map(normalizeCopy),
    },
    findings: report.findings.map((finding) => ({
      ...finding,
      title: normalizeCopy(finding.title),
      summary: normalizeCopy(finding.summary),
      businessImpact: normalizeCopy(finding.businessImpact),
      recommendation: normalizeCopy(finding.recommendation),
    })),
    opportunities: report.opportunities.map((opportunity) => ({
      ...opportunity,
      title: normalizeCopy(opportunity.title),
      summary: normalizeCopy(opportunity.summary),
      currentState: normalizeCopy(opportunity.currentState),
      futureState: normalizeCopy(opportunity.futureState),
      notes: normalizeCopy(opportunity.notes),
    })),
  };
}

export function passesReportQualityCheck(report: AuditReport) {
  const strings = [
    report.executiveSummary,
    report.clientProfile.observedPositioning,
    report.clientProfile.observedAudienceInference,
    report.siteObservation.pageTitle,
    report.siteObservation.metaDescription,
    report.siteObservation.heroHeading,
    report.siteObservation.aboutSnippet,
    ...report.siteObservation.verifiedFacts.map((fact) => fact.value),
    ...report.findings.flatMap((finding) => [
      finding.title,
      finding.summary,
      finding.businessImpact,
      finding.recommendation,
    ]),
  ].filter(Boolean);

  return strings.every((value) => !hasUnsafeCopy(value));
}
