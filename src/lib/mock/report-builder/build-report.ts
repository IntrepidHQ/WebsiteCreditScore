import type { AuditReport, ClientProfile, ReportProvenance, SiteObservation } from "@/lib/types/audit";
import { getNicheCompetitors, nicheCompetitorsToReferences } from "@/lib/benchmarks/niche-competitors";
import { getBenchmarkVerticalForProfile } from "@/lib/benchmarks/library";
import {
  buildBenchmarkReferences,
  buildObservationClientNarratives,
  buildObservedCategoryScores,
  buildObservedExecutiveSummary,
  buildObservedFindings,
} from "@/lib/mock/report-enhancements";
import { sampleAudits } from "@/lib/mock/sample-audits";
import { analyzeSiteWithAI } from "@/lib/ai/site-analysis";
import type { AISiteAnalysis } from "@/lib/ai/site-analysis";
import { fetchPageSpeedMetrics } from "@/lib/utils/pagespeed";
import { generateOutreachEmail } from "@/lib/utils/outreach";
import { createDefaultProposalOffer } from "@/lib/utils/proposal-offers";
import { calculatePricingSummary, getDefaultSelectedIds } from "@/lib/utils/pricing";
import { aggregateOverallScore } from "@/lib/utils/scores";
import { createFallbackObservation, inspectWebsite } from "@/lib/utils/site-observation";
import {
  createWebsiteScreenshotUrl,
  formatDomainTitle,
  inferProfileType,
  inferSiteNiche,
  normalizeUrl,
  slugFromUrl,
} from "@/lib/utils/url";

import { enrichBenchmarkReferences, selectBenchmarkReferencesForReport } from "./benchmark-selection";
import { profileClientProfiles } from "./constants";
import {
  buildCompetitors,
  buildOpportunities,
  buildProposalCtas,
  buildRebuildPhases,
  buildRoiDefaults,
  buildSocialProof,
  createCatalog,
  getPreviewSet,
} from "./report-sections";

function deriveReportTitle(
  normalizedUrl: string,
  sample: (typeof sampleAudits)[number] | undefined,
  observation: SiteObservation,
) {
  if (sample?.title) {
    return sample.title;
  }

  const pageTitle = observation.pageTitle
    .split(/[\|\u2013-]/)
    .map((segment) => segment.trim())
    .find(Boolean);

  return pageTitle || formatDomainTitle(normalizedUrl);
}

/**
 * Apply AI-generated content to replace template-based report fields.
 * Only overrides fields where AI produced a non-empty value; heuristic
 * values remain as-is if AI analysis failed or returned nothing.
 */
function applyAIAnalysis(report: AuditReport, ai: AISiteAnalysis): AuditReport {
  return {
    ...report,
    executiveSummary: ai.executiveSummary,
    outreachEmail: {
      subject: ai.outreachSubject,
      previewLine: ai.outreachPreview,
      body: ai.outreachBody,
    },
    clientProfile: {
      ...report.clientProfile,
      industryLabel: ai.industryLabel,
      audience: ai.audienceProfile,
      primaryGoal: ai.primaryGoal,
      // observedPositioning holds the most visible business description in the UI
      observedPositioning: ai.businessDescription,
      observedAudienceInference: ai.audienceProfile,
    },
    provenance: {
      ...report.provenance,
      narrativeSource: "claude",
    },
  };
}

export async function buildLiveAuditReportFromUrl(rawUrl: string): Promise<AuditReport> {
  const normalizedUrl = normalizeUrl(rawUrl);

  // Fetch site observation and PageSpeed metrics in parallel — both are
  // network calls that don't depend on each other.
  const [observation, pageSpeedMetrics] = await Promise.all([
    inspectWebsite(normalizedUrl),
    fetchPageSpeedMetrics(normalizedUrl, "mobile"),
  ]);

  // Merge PageSpeed data into the observation so it flows through scoring,
  // the AI prompt, and the packet PDF.
  const enrichedObservation = pageSpeedMetrics
    ? {
        ...observation,
        performanceScore: pageSpeedMetrics.performanceScore,
        lcp: pageSpeedMetrics.lcp,
        cls: pageSpeedMetrics.cls,
        fcp: pageSpeedMetrics.fcp,
        tbt: pageSpeedMetrics.tbt,
        speedIndex: pageSpeedMetrics.speedIndex,
      }
    : observation;

  let report = buildAuditReportFromUrl(rawUrl, enrichedObservation);

  // Enrich benchmarks and run AI analysis in parallel.
  const [enriched, aiAnalysis] = await Promise.all([
    enrichReportBenchmarks(report),
    analyzeSiteWithAI(normalizedUrl, enrichedObservation, report.overallScore),
  ]);

  report = enriched;

  if (aiAnalysis) {
    report = applyAIAnalysis(report, aiAnalysis);
  }

  return report;
}

export function buildAuditReportFromUrl(
  rawUrl: string,
  observation?: SiteObservation | null,
): AuditReport {
  const normalizedUrl = normalizeUrl(rawUrl);
  const sample = sampleAudits.find((entry) => normalizeUrl(entry.url) === normalizedUrl);

  return buildAuditReport(normalizedUrl, sample, observation ?? createFallbackObservation(normalizedUrl));
}

function buildAuditReport(
  rawUrl: string,
  sample?: (typeof sampleAudits)[number],
  incomingObservation?: SiteObservation,
): AuditReport {
  const normalizedUrl = normalizeUrl(rawUrl);
  const profile = sample?.profile ?? inferProfileType(normalizedUrl);
  const observation = incomingObservation ?? createFallbackObservation(normalizedUrl);
  const provenanceMode: ReportProvenance = sample
    ? "sample-based"
    : observation.fetchSucceeded
      ? "live-observed"
      : "fallback-estimated";
  const provenanceNote =
    provenanceMode === "live-observed"
      ? "Score reflects directly observed page signals from the scanned URL."
      : provenanceMode === "sample-based"
        ? "Score uses sample profile data with live signal enrichment where available."
        : "Score is estimated from heuristic baselines because live page signals were unavailable.";
  const confidenceLabel =
    provenanceMode === "live-observed"
      ? "high"
      : provenanceMode === "sample-based"
        ? "medium"
        : "low";
  const title = deriveReportTitle(normalizedUrl, sample, observation);
  const previewSet = getPreviewSet(profile);
  const previewUrl = sample?.previewUrl ?? rawUrl;
  const livePreviewDesktop = createWebsiteScreenshotUrl(previewUrl, "desktop");
  const livePreviewMobile = createWebsiteScreenshotUrl(previewUrl, "mobile");
  /** Committed assets under `/previews/` — never replace with live `/api/preview` when fetch succeeds. */
  const bundledPreview =
    typeof sample?.previewImage === "string" && sample.previewImage.startsWith("/previews/");
  const currentPreviewImage = bundledPreview
    ? sample!.previewImage
    : observation.fetchSucceeded || !sample?.previewImage
      ? livePreviewDesktop
      : sample.previewImage;
  const currentMobilePreview = bundledPreview
    ? sample!.previewImage
    : observation.fetchSucceeded
      ? livePreviewMobile
      : livePreviewDesktop;
  const livePreviewSet = {
    ...previewSet,
    current: {
      desktop: currentPreviewImage,
      mobile: currentMobilePreview,
    },
    future: previewSet.future,
    fallbackCurrent: {
      desktop: observation.ogImage ?? sample?.fallbackPreviewImage ?? previewSet.fallbackCurrent.desktop,
      mobile: observation.ogImage ?? sample?.fallbackPreviewImage ?? previewSet.fallbackCurrent.mobile,
    },
    fallbackFuture: previewSet.fallbackFuture,
  };
  const categoryScores = buildObservedCategoryScores(profile, observation, sample?.scoreOverrides);
  const reportId = sample?.id ?? slugFromUrl(normalizedUrl);
  const hostname = new URL(normalizedUrl).hostname;
  const overallScore = aggregateOverallScore(categoryScores);
  const designBenchmarkReferences = selectBenchmarkReferencesForReport(
    normalizedUrl,
    overallScore,
    buildBenchmarkReferences(profile),
  );
  const niche = sample ? undefined : inferSiteNiche(normalizedUrl, observation);
  const nicheRefs = niche
    ? getNicheCompetitors(niche, normalizedUrl, 3)
    : null;
  const nicheReferences = nicheRefs
    ? nicheCompetitorsToReferences(nicheRefs, getBenchmarkVerticalForProfile(profile))
    : null;
  // Use niche references for both the competitor research cards and comparison chart;
  // fall back to design benchmark references when no niche is detected.
  const benchmarkReferences = nicheReferences ?? designBenchmarkReferences;
  const competitorReferences = benchmarkReferences;
  const findings = buildObservedFindings(profile, title, observation, categoryScores, livePreviewSet.current.desktop);
  const opportunities = buildOpportunities(profile, livePreviewSet);
  const rebuildPhases = buildRebuildPhases(profile);
  const pricingBundle = createCatalog();
  const defaultPricingSummary = calculatePricingSummary(
    pricingBundle,
    getDefaultSelectedIds(pricingBundle),
  );
  const competitorSnapshots = buildCompetitors(
    {
      name: title,
      url: previewUrl,
      previewImage: currentPreviewImage,
      note:
        sample?.summary ??
        (observation.aboutSnippet
          ? observation.aboutSnippet
          : profile === "healthcare"
            ? "Useful provider detail is present, but the presentation still feels templated."
            : profile === "local-service"
              ? "Real local signals are present, but the page still asks visitors to work too hard."
              : "The offer is visible, but the package and proof can be much easier to scan."),
    },
    categoryScores,
    overallScore,
    competitorReferences,
  );
  const proposalCtas = buildProposalCtas(normalizedUrl);
  const socialProof = buildSocialProof();
  const roiDefaults = buildRoiDefaults(profile);
  const profileBase = profileClientProfiles[profile];
  const { observedPositioning, observedAudienceInference } = buildObservationClientNarratives(
    title,
    observation,
    profileBase.industryLabel,
    profileBase.audience,
  );
  const clientProfile: ClientProfile = {
    ...profileBase,
    niche,
    observedPositioning,
    observedAudienceInference,
    competitors: competitorSnapshots
      .filter((item) => item.relationship === "reference")
      .map((item) => item.name),
  };

  const report: AuditReport = {
    id: reportId,
    title,
    url: hostname,
    normalizedUrl,
    executiveSummary:
      sample?.executiveSummary ??
      buildObservedExecutiveSummary(title, observation, overallScore, provenanceMode),
    overallScore,
    categoryScores,
    findings,
    opportunities,
    rebuildPhases,
    pricingBundle,
    clientProfile,
    proposalCtas,
    competitorSnapshots,
    benchmarkReferences,
    benchmarkScanIds: benchmarkReferences
      .map((item) => item.benchmarkScanId)
      .filter(Boolean) as string[],
    objectionHandling: [
      "Patching the current site usually preserves the same structural compromises that are already suppressing trust and conversion.",
      "A phased rebuild lowers risk because strategy, content, design, and implementation can be validated in sequence instead of guessed all at once.",
      "The pricing options below are designed to match ambition to budget without losing the core strategic gains.",
    ],
    roiDefaults,
    previewSet: livePreviewSet,
    siteObservation: observation,
    outreachEmail: {
      subject: "",
      previewLine: "",
      body: "",
    },
    proposalOffer: createDefaultProposalOffer(defaultPricingSummary.total),
    socialProof,
    provenance: {
      mode: provenanceMode,
      confidenceLabel,
      note: provenanceNote,
      narrativeSource: "heuristic",
    },
  };

  report.outreachEmail = generateOutreachEmail(report);

  return report;
}

export async function enrichReportBenchmarks(report: AuditReport): Promise<AuditReport> {
  const measuredBenchmarkReferences = await enrichBenchmarkReferences(
    report.normalizedUrl,
    report.overallScore,
    report.clientProfile.type,
  );
  const currentSnapshot = report.competitorSnapshots.find(
    (snapshot) => snapshot.relationship === "your-site",
  );
  const niche = report.clientProfile.niche;
  const nicheRefs = niche
    ? getNicheCompetitors(niche, report.normalizedUrl, 3)
    : null;
  const nicheReferences = nicheRefs
    ? nicheCompetitorsToReferences(nicheRefs, getBenchmarkVerticalForProfile(report.clientProfile.type))
    : null;
  // Niche references replace both the benchmark cards and comparison chart;
  // fall back to measured design references when no niche is detected.
  const competitorReferences = nicheReferences ?? measuredBenchmarkReferences;

  return {
    ...report,
    benchmarkReferences: competitorReferences,
    benchmarkScanIds: measuredBenchmarkReferences
      .map((item) => item.benchmarkScanId)
      .filter(Boolean) as string[],
    competitorSnapshots: buildCompetitors(
      {
        name: currentSnapshot?.name ?? report.title,
        url: currentSnapshot?.url ?? report.normalizedUrl,
        previewImage: currentSnapshot?.previewImage ?? report.previewSet.current.desktop,
        note: currentSnapshot?.note ?? report.executiveSummary,
      },
      report.categoryScores,
      report.overallScore,
      competitorReferences,
    ),
    clientProfile: {
      ...report.clientProfile,
      competitors: competitorReferences.map((item) => item.name),
    },
  };
}

export function getSampleAuditCards() {
  return [...sampleAudits]
    .sort((left, right) => {
      const leftTime = left.scannedAt ? new Date(left.scannedAt).getTime() : 0;
      const rightTime = right.scannedAt ? new Date(right.scannedAt).getTime() : 0;

      return rightTime - leftTime;
    })
    .map((sample) => ({
      ...sample,
      // Respect per-sample `previewImage` (e.g. Saunders uses homepage for capture while `url` is /about).
      // Overwriting with previewUrl broke Squarespace previews that need the root domain.
      previewImage:
        sample.previewImage ??
        createWebsiteScreenshotUrl(sample.previewUrl ?? sample.url, "desktop"),
      score: buildAuditReport(sample.url, sample).overallScore,
    }));
}

export function getPublicScanHistoryCards() {
  return getSampleAuditCards();
}

export function buildAuditReportById(id: string) {
  const sample = sampleAudits.find((entry) => entry.id === id);

  if (!sample) {
    return null;
  }

  return buildAuditReport(sample.url, sample);
}

export async function buildLiveAuditReportById(id: string) {
  const sample = sampleAudits.find((entry) => entry.id === id);

  if (!sample) {
    return null;
  }

  const [observation, pageSpeedMetrics] = await Promise.all([
    inspectWebsite(sample.url),
    fetchPageSpeedMetrics(sample.url, "mobile"),
  ]);

  const enrichedObservation = pageSpeedMetrics
    ? {
        ...observation,
        performanceScore: pageSpeedMetrics.performanceScore,
        lcp: pageSpeedMetrics.lcp,
        cls: pageSpeedMetrics.cls,
        fcp: pageSpeedMetrics.fcp,
        tbt: pageSpeedMetrics.tbt,
        speedIndex: pageSpeedMetrics.speedIndex,
      }
    : observation;

  let report = buildAuditReport(sample.url, sample, enrichedObservation);

  const [enriched, aiAnalysis] = await Promise.all([
    enrichReportBenchmarks(report),
    analyzeSiteWithAI(sample.url, enrichedObservation, report.overallScore),
  ]);

  report = enriched;

  if (aiAnalysis) {
    report = applyAIAnalysis(report, aiAnalysis);
  }

  return report;
}
