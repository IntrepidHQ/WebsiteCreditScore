import type { AuditCategoryKey, AuditReport } from "@/lib/types/audit";
import { clampScore } from "@/lib/utils/scores";

function getCategoryScore(report: AuditReport, key: AuditCategoryKey) {
  return report.categoryScores.find((item) => item.key === key)?.score ?? 5;
}

function getVerifiedFactCount(report: AuditReport) {
  return report.siteObservation.verifiedFacts.filter((fact) =>
    fact.type === "phone" || fact.type === "email" || fact.type === "address",
  ).length;
}

export function calculateKeywordRankingScore(report: AuditReport) {
  const observation = report.siteObservation;
  const seo = getCategoryScore(report, "seo-readiness");
  const visual = getCategoryScore(report, "visual-design");
  const accessibility = getCategoryScore(report, "accessibility");
  const titleBonus = observation.pageTitle ? 0.7 : -0.8;
  const metaBonus = observation.metaDescription ? 0.6 : -0.7;
  const headingBonus = observation.heroHeading ? 0.45 : -0.45;
  const schemaBonus = observation.hasSchema ? 0.65 : -0.5;
  const canonicalBonus = observation.hasCanonical ? 0.35 : -0.25;
  const linkBonus = Math.min(observation.internalLinkCount * 0.08, 0.8);
  const ctaBonus = observation.primaryCtas.some((cta) =>
    /\b(book|schedule|get started|contact|call|quote|estimate|consult)\b/i.test(cta),
  )
    ? 0.25
    : -0.15;

  return clampScore(
    seo * 0.55 +
      visual * 0.1 +
      accessibility * 0.1 +
      titleBonus +
      metaBonus +
      headingBonus +
      schemaBonus +
      canonicalBonus +
      linkBonus +
      ctaBonus,
  );
}

export function calculateAiSearchabilityScore(report: AuditReport) {
  const observation = report.siteObservation;
  const seo = getCategoryScore(report, "seo-readiness");
  const trust = getCategoryScore(report, "trust-credibility");
  const accessibility = getCategoryScore(report, "accessibility");
  const verifiedFactBonus = Math.min(getVerifiedFactCount(report) * 0.35, 1.2);
  const aboutBonus = observation.aboutSnippet ? 0.55 : -0.4;
  const headingsBonus = observation.headingCount >= 4 ? 0.5 : -0.25;
  const schemaBonus = observation.hasSchema ? 0.8 : -0.55;
  const langBonus = observation.hasLang ? 0.2 : -0.15;
  const clarityBonus = observation.metaDescription ? 0.4 : -0.3;

  return clampScore(
    seo * 0.4 +
      trust * 0.25 +
      accessibility * 0.15 +
      verifiedFactBonus +
      aboutBonus +
      headingsBonus +
      schemaBonus +
      langBonus +
      clarityBonus,
  );
}

export interface SeoScoreCard {
  id: string;
  label: string;
  score: number;
  summary: string;
  signals: string[];
}

export function buildSeoScoreCards(report: AuditReport): SeoScoreCard[] {
  const observation = report.siteObservation;
  const keywordRankingScore = calculateKeywordRankingScore(report);
  const aiSearchabilityScore = calculateAiSearchabilityScore(report);

  return [
    {
      id: "keyword-ranking",
      label: "Google keyword ranking",
      score: keywordRankingScore,
      summary:
        "How well the page supports keyword intent, metadata, and crawlable structure before paid SEO work.",
      signals: [
        observation.pageTitle ? "Title tag present" : "Title tag needs work",
        observation.metaDescription ? "Meta description present" : "Meta description needs work",
        observation.hasCanonical ? "Canonical present" : "Canonical missing",
        `Internal links: ${observation.internalLinkCount}`,
      ],
    },
    {
      id: "ai-searchability",
      label: "AI searchability",
      score: aiSearchabilityScore,
      summary:
        "How clearly the page can be summarized, cited, and extracted by AI search systems and answer engines.",
      signals: [
        observation.hasSchema ? "Schema present" : "Schema missing",
        observation.aboutSnippet ? "About summary detected" : "About summary needs work",
        `Verified facts: ${getVerifiedFactCount(report)}`,
        observation.headingCount >= 4 ? "Readable heading depth" : "More heading depth needed",
      ],
    },
  ];
}

export function getSeoUnlockBenefits() {
  return [
    "Keyword ranking score with actionable lift notes.",
    "AI searchability score with entity, schema, and content clarity guidance.",
    "Competitor keyword gap ideas and page-level next steps.",
    "A tighter SEO score interpretation than generic audit output.",
  ];
}
