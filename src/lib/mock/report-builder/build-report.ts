import type {
  AuditCategoryScore,
  AuditReport,
  ClientProfile,
  ReportProfileType,
  ReportProvenance,
  ResearchTrace,
  SiteNiche,
  SiteObservation,
} from "@/lib/types/audit";
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
import { rerankBenchmarkReferencesWithClaude } from "@/lib/ai/benchmark-rerank";
import { analyzeSiteWithAI } from "@/lib/ai/site-analysis";
import type { AISiteAnalysis } from "@/lib/ai/site-analysis";
import { measureBenchmarkReferences } from "@/lib/benchmarks/scans";
import { fetchPageSpeedMetrics } from "@/lib/utils/pagespeed";
import { generateOutreachEmail } from "@/lib/utils/outreach";
import { createDefaultProposalOffer } from "@/lib/utils/proposal-offers";
import { calculatePricingSummary, getDefaultSelectedIds } from "@/lib/utils/pricing";
import { ensurePreviewCachedForObservation } from "@/lib/utils/preview-warm";
import { aggregateOverallScore } from "@/lib/utils/scores";
import { createFallbackObservation, inspectWebsite } from "@/lib/utils/site-observation";
import {
  createWebsiteScreenshotUrl,
  inferProfileType,
  inferSiteNiche,
  normalizeUrl,
  pickReportTitleFromPageTitle,
  slugFromUrl,
} from "@/lib/utils/url";

import { REPORT_COMPETITOR_REFERENCE_LIMIT } from "@/lib/benchmarks/report-limits";
import { listRankedBenchmarkCandidates, selectBenchmarkReferencesForReport } from "./benchmark-selection";
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

// Build the "your site" card note from observed signals so competitor cards
// compare against a specific, believable line rather than profile boilerplate.
function buildCurrentSiteCompetitorNote(
  observation: SiteObservation,
  categoryScores: AuditCategoryScore[],
  profile: ReportProfileType,
): string {
  if (observation.aboutSnippet?.trim()) {
    const snippet = observation.aboutSnippet.trim().slice(0, 160);
    return snippet.endsWith(".") ? snippet : `${snippet}…`;
  }

  // Find the lowest-scoring category and name it concretely.
  const weakest = categoryScores
    .slice()
    .sort((a, b) => a.score - b.score)[0];

  const gapLine =
    weakest && weakest.score < 5
      ? `${weakest.label} is the weakest category here (${weakest.score.toFixed(1)}/10).`
      : weakest
        ? `${weakest.label} leads the opportunity list for this site.`
        : "";

  const observedLine = observation.heroHeading
    ? `Opens with "${observation.heroHeading.slice(0, 100)}."`
    : observation.pageTitle
      ? `Page title "${observation.pageTitle.slice(0, 80)}."`
      : profile === "healthcare"
        ? "Provider detail is present, but the presentation still reads templated."
        : profile === "local-service"
          ? "Local signals are present, but the page still asks visitors to work too hard."
          : "The offer is visible, but the package and proof need to be easier to scan.";

  return [observedLine, gapLine].filter(Boolean).join(" ").trim();
}

const slugifyIndustryLabel = (input: string) => {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return slug ? (`ai:${slug}` as const) : null;
};

const buildHeuristicIndustryTags = (
  profile: ReportProfileType,
  niche: SiteNiche | undefined,
): string[] => {
  const tags = new Set<string>([`profile:${profile}`]);
  if (niche) {
    tags.add(`niche:${niche}`);
  }
  return [...tags];
};

function deriveReportTitle(
  normalizedUrl: string,
  sample: (typeof sampleAudits)[number] | undefined,
  observation: SiteObservation,
) {
  if (sample?.title) {
    return sample.title;
  }

  return pickReportTitleFromPageTitle(observation.pageTitle ?? "", normalizedUrl);
}

/**
 * Apply AI-generated content to replace template-based report fields.
 * Only overrides fields where AI produced a non-empty value; heuristic
 * values remain as-is if AI analysis failed or returned nothing.
 */
function applyAIAnalysis(report: AuditReport, ai: AISiteAnalysis): AuditReport {
  const aiIndustryTag = slugifyIndustryLabel(ai.industryLabel);
  const mergedIndustryTags = aiIndustryTag
    ? Array.from(new Set([...(report.clientProfile.industryTags ?? []), aiIndustryTag]))
    : report.clientProfile.industryTags;

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
      industryTags: mergedIndustryTags,
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

function buildResearchTrace(observation: SiteObservation, provenanceMode: ReportProvenance): ResearchTrace {
  const phoneCount = observation.verifiedFacts.filter((f) => f.type === "phone").length;
  const emailCount = observation.verifiedFacts.filter((f) => f.type === "email").length;

  const structureParts: string[] = [];
  if (observation.pageTitle) structureParts.push(`page title detected`);
  structureParts.push(`${observation.headingCount} heading${observation.headingCount !== 1 ? "s" : ""}`);
  structureParts.push(`${observation.internalLinkCount} internal link${observation.internalLinkCount !== 1 ? "s" : ""}`);
  if (observation.formCount > 0) structureParts.push(`${observation.formCount} form${observation.formCount !== 1 ? "s" : ""}`);
  if (observation.hasViewport) structureParts.push("viewport meta present");

  const messagingParts: string[] = [];
  if (observation.heroHeading) messagingParts.push(`hero: "${observation.heroHeading.slice(0, 80)}"`);
  if (observation.metaDescription) messagingParts.push("meta description found");
  if (observation.aboutSnippet) messagingParts.push("about section detected");

  const trustParts: string[] = [];
  if (phoneCount > 0) trustParts.push(`${phoneCount} phone number${phoneCount !== 1 ? "s" : ""} found`);
  if (emailCount > 0) trustParts.push(`${emailCount} email address${emailCount !== 1 ? "es" : ""} found`);
  if (observation.trustSignals.length > 0) trustParts.push(`${observation.trustSignals.length} trust signal${observation.trustSignals.length !== 1 ? "s" : ""} detected`);
  if (observation.hasSchema) trustParts.push("structured data present");

  const conversionParts: string[] = [];
  if (observation.primaryCtas.length > 0) conversionParts.push(`${observation.primaryCtas.length} CTA button${observation.primaryCtas.length !== 1 ? "s" : ""} found`);
  if (observation.formCount > 0) conversionParts.push(`${observation.formCount} form${observation.formCount !== 1 ? "s" : ""} detected`);

  const technicalParts: string[] = [];
  if (observation.hasCanonical) technicalParts.push("canonical URL");
  if (observation.hasLang) technicalParts.push("HTML lang");
  if (observation.seoSignals.length > 0) technicalParts.push(`${observation.seoSignals.length} SEO signal${observation.seoSignals.length !== 1 ? "s" : ""}`);
  if (observation.securitySignals.length > 0) technicalParts.push(`${observation.securitySignals.length} security indicator${observation.securitySignals.length !== 1 ? "s" : ""}`);

  const steps: ResearchTrace["steps"] = [
    {
      pass: 1,
      label: "Homepage structure",
      what: "Page title, heading hierarchy, internal links, forms, viewport meta tag",
      found: structureParts.length > 0 ? structureParts.join(" · ") : "Minimal structure detected",
      status: observation.fetchSucceeded ? "complete" : "partial",
    },
    {
      pass: 2,
      label: "Messaging and positioning",
      what: "Hero headline, meta description, about section, value proposition clarity",
      found: messagingParts.length > 0 ? messagingParts.join(" · ") : "No clear messaging detected",
      status: messagingParts.length >= 2 ? "complete" : "partial",
    },
    {
      pass: 3,
      label: "Trust and credibility signals",
      what: "Testimonials, contact info, trust badges, schema markup, social proof",
      found: trustParts.length > 0 ? trustParts.join(" · ") : "No trust signals detected",
      status: trustParts.length >= 2 ? "complete" : "partial",
    },
    {
      pass: 4,
      label: "Conversion flow",
      what: "CTA placement and labels, forms, lead capture mechanisms, friction points",
      found: conversionParts.length > 0 ? conversionParts.join(" · ") : "No clear conversion path detected",
      status: conversionParts.length > 0 ? "complete" : "partial",
    },
    {
      pass: 5,
      label: "Technical, SEO, and security",
      what: "Canonical tag, HTML lang attribute, structured data, security headers, SEO signals",
      found: technicalParts.length > 0 ? technicalParts.join(" · ") : "Technical signals limited",
      status: "complete",
    },
  ];

  if (observation.performanceScore !== undefined) {
    const perfScore = Math.round(observation.performanceScore * 100);
    const perfParts = [`performance score ${perfScore}/100`];
    if (observation.lcp) perfParts.push(`LCP ${(observation.lcp / 1000).toFixed(1)}s`);
    if (observation.cls !== undefined) perfParts.push(`CLS ${observation.cls.toFixed(2)}`);
    if (observation.fcp) perfParts.push(`FCP ${(observation.fcp / 1000).toFixed(1)}s`);
    steps.push({
      pass: 6,
      label: "Performance (mobile)",
      what: "PageSpeed score, Core Web Vitals, Largest Contentful Paint, layout shift",
      found: perfParts.join(" · "),
      status: "complete",
    });
  }

  const missingSignals: ResearchTrace["missingSignals"] = [];
  if (observation.trustSignals.length === 0) missingSignals.push({ label: "No testimonials or social proof found", severity: "critical" });
  if (observation.primaryCtas.length === 0) missingSignals.push({ label: "No CTA buttons detected", severity: "critical" });
  if (!observation.metaDescription || observation.metaDescription.length < 50) missingSignals.push({ label: "Meta description missing or too short", severity: "critical" });
  if (phoneCount === 0) missingSignals.push({ label: "No phone number detected", severity: "standard" });
  if (emailCount === 0) missingSignals.push({ label: "No email address detected", severity: "standard" });
  if (observation.formCount === 0) missingSignals.push({ label: "No contact or lead form detected", severity: "standard" });
  if (!observation.hasCanonical) missingSignals.push({ label: "Missing canonical URL tag", severity: "standard" });
  if (!observation.hasSchema) missingSignals.push({ label: "No structured data markup found", severity: "standard" });
  if (!observation.hasLang) missingSignals.push({ label: "Missing HTML lang attribute", severity: "standard" });
  if (observation.missingAltRatio > 0.3) missingSignals.push({ label: `${Math.round(observation.missingAltRatio * 100)}% of images missing alt text`, severity: "standard" });

  return {
    steps,
    extractedElements: {
      heroText: observation.heroHeading || undefined,
      metaDescription: observation.metaDescription || undefined,
      pageTitle: observation.pageTitle || undefined,
      ctaLabels: observation.primaryCtas.slice(0, 5),
      trustSignals: observation.trustSignals.slice(0, 4),
    },
    missingSignals,
    analysisMode: provenanceMode,
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

  // Enrich benchmarks, AI, and desktop preview warm in parallel — warm persists to Supabase Storage (L2)
  // so repeat `/api/preview` loads skip Browserless when storage is configured.
  const [enriched, aiAnalysis] = await Promise.all([
    enrichReportBenchmarks(report),
    analyzeSiteWithAI(normalizedUrl, enrichedObservation, report.overallScore),
    ensurePreviewCachedForObservation(normalizedUrl, enrichedObservation).catch((err) => {
      console.warn("[preview-warm]", err);
    }),
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
    ? getNicheCompetitors(niche, normalizedUrl, REPORT_COMPETITOR_REFERENCE_LIMIT)
    : null;
  const nicheReferences = nicheRefs
    ? nicheCompetitorsToReferences(nicheRefs, getBenchmarkVerticalForProfile(profile))
    : null;
  // Use niche references for both the competitor research cards and comparison chart;
  // fall back to design benchmark references when no niche is detected.
  const benchmarkReferences = nicheReferences ?? designBenchmarkReferences;
  const competitorReferences = benchmarkReferences;
  const findings = buildObservedFindings(profile, title, observation, categoryScores, livePreviewSet.current.desktop);
  const opportunities = buildOpportunities(profile, livePreviewSet, categoryScores, observation);
  const rebuildPhases = buildRebuildPhases(profile, categoryScores, observation);
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
        buildCurrentSiteCompetitorNote(observation, categoryScores, profile),
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
    industryTags: buildHeuristicIndustryTags(profile, niche),
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
      buildObservedExecutiveSummary(title, observation, overallScore, provenanceMode, categoryScores),
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
      "Small fixes on the current site usually keep the same weak structure that is holding trust and conversion back.",
      "A phased rebuild lets you validate strategy, copy, design, and build in order instead of betting everything on one big guess.",
      "Use the tiers below to match budget to ambition — you can add or trim scope once priorities are clear.",
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
    researchTrace: buildResearchTrace(observation, provenanceMode),
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
  const { references: allMeasured } = await measureBenchmarkReferences(report.clientProfile.type);
  const measuredBenchmarkReferences = selectBenchmarkReferencesForReport(
    report.normalizedUrl,
    report.overallScore,
    allMeasured,
  );
  const candidatePool = listRankedBenchmarkCandidates(
    report.normalizedUrl,
    report.overallScore,
    allMeasured,
    28,
  );

  const currentSnapshot = report.competitorSnapshots.find(
    (snapshot) => snapshot.relationship === "your-site",
  );
  const niche = report.clientProfile.niche;
  const nicheRefs = niche
    ? getNicheCompetitors(niche, report.normalizedUrl, REPORT_COMPETITOR_REFERENCE_LIMIT)
    : null;
  const nicheReferences = nicheRefs
    ? nicheCompetitorsToReferences(nicheRefs, getBenchmarkVerticalForProfile(report.clientProfile.type))
    : null;

  let competitorReferences = nicheReferences ?? measuredBenchmarkReferences;
  let benchmarkSelectionSource: NonNullable<AuditReport["provenance"]["benchmarkSelectionSource"]> =
    nicheReferences ? "niche" : "heuristic";

  if (!nicheReferences) {
    const aiOrdered = await rerankBenchmarkReferencesWithClaude({
      siteObservation: report.siteObservation,
      clientProfileType: report.clientProfile.type,
      normalizedUrl: report.normalizedUrl,
      industryTags: report.clientProfile.industryTags,
      niche: report.clientProfile.niche,
      candidates: candidatePool,
    });
    if (aiOrdered && aiOrdered.length === REPORT_COMPETITOR_REFERENCE_LIMIT) {
      competitorReferences = aiOrdered;
      benchmarkSelectionSource = "claude-rerank";
    }
  }

  return {
    ...report,
    benchmarkReferences: competitorReferences,
    benchmarkScanIds: competitorReferences
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
    provenance: {
      ...report.provenance,
      benchmarkSelectionSource,
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

  const normalizedUrl = normalizeUrl(sample.url);

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
    ensurePreviewCachedForObservation(normalizedUrl, enrichedObservation).catch((err) => {
      console.warn("[preview-warm]", err);
    }),
  ]);

  report = enriched;

  if (aiAnalysis) {
    report = applyAIAnalysis(report, aiAnalysis);
  }

  return report;
}
