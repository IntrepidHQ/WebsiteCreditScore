import type {
  AuditCategoryKey,
  AuditCategoryScore,
  BenchmarkReference,
  Evidence,
  Finding,
  ReportProfileType,
  SeverityLevel,
  SiteObservation,
} from "@/lib/types/audit";
import { clampScore } from "@/lib/utils/scores";
import { createWebsiteScreenshotUrl } from "@/lib/utils/url";

const categoryLabels: Record<AuditCategoryKey, string> = {
  "visual-design": "Visual Design",
  "ux-conversion": "UX / Conversion",
  "mobile-experience": "Mobile Experience",
  "seo-readiness": "SEO Readiness",
  accessibility: "Accessibility",
  "trust-credibility": "Trust / Credibility",
  "security-posture": "Security Posture",
};

function uniqueTexts(values: string[], limit = values.length) {
  return [...new Set(values.filter(Boolean).map((value) => value.trim()))].slice(0, limit);
}

function createEvidence(
  id: string,
  label: string,
  detail: string,
  kind: Evidence["kind"],
): Evidence {
  return { id, label, detail, kind };
}

function createFinding({
  id,
  title,
  summary,
  severity,
  category,
  section,
  businessImpact,
  recommendation,
  confidenceLevel,
  evidence,
  screenshots,
  tags,
}: Omit<Finding, "type" | "benchmark"> & { screenshots: string[] }) {
  return {
    id,
    type:
      section === "what-working"
        ? "positive"
        : section === "security-posture"
          ? "security"
          : section === "technical-seo"
            ? "technical"
            : "issue",
    title,
    summary,
    severity,
    category,
    section,
    businessImpact,
    recommendation,
    confidenceLevel,
    evidence,
    benchmark: [
      {
        id: `${id}-benchmark`,
        claim: recommendation,
        confidenceLevel: confidenceLevel === "detected" ? "high" : "medium",
        sourceLabel:
          section === "technical-seo"
            ? "Google Search Central"
            : section === "security-posture"
              ? "MDN header guidance"
              : "Craydl heuristic review",
        benchmarkType:
          section === "technical-seo" || section === "security-posture"
            ? "platform-observation"
            : "recommendation",
        notes: businessImpact,
        synergy: [],
        impactLabel:
          severity === "high"
            ? "Detected Issue"
            : section === "what-working"
              ? "Best Practice"
              : "Strategic Recommendation",
      },
    ],
    screenshots,
    tags,
  } satisfies Finding;
}

function hasMeaningfulCta(observation: SiteObservation) {
  return observation.primaryCtas.some((cta) =>
    /\b(book|schedule|get started|contact|call|request|quote|estimate|claim|demo|consult)\b/i.test(
      cta,
    ),
  );
}

function ctaPenalty(observation: SiteObservation) {
  if (!observation.primaryCtas.length) {
    return -1.2;
  }

  if (observation.primaryCtas.length <= 3 && hasMeaningfulCta(observation)) {
    return 0.9;
  }

  if (observation.primaryCtas.length >= 5) {
    return -0.5;
  }

  return 0.3;
}

function buildScoreDetails(
  label: string,
  observed: string[],
  action: string,
  benchmark: string,
) {
  return [
    observed.length ? `Observed: ${observed[0]}` : `Observed: ${label} needs more direct evidence on-page.`,
    `Why it matters: ${benchmark}`,
    `Next step: ${action}`,
  ];
}

export function buildObservedCategoryScores(
  _profile: ReportProfileType,
  observation: SiteObservation,
  scoreOverrides?: Partial<Record<AuditCategoryKey, number>>,
) {
  const computedScores: Record<AuditCategoryKey, number> = {
    "visual-design": clampScore(
      5.6 +
        (observation.heroHeading ? 0.6 : -0.7) +
        (observation.metaDescription ? 0.3 : -0.4) +
        (observation.ogImage ? 0.3 : 0) +
        (observation.templateSignals.length ? -1.3 : 0.4),
    ),
    "ux-conversion": clampScore(
      5.3 +
        ctaPenalty(observation) +
        (observation.formCount ? 0.4 : -0.4) +
        (observation.trustSignals.length >= 2 ? 0.5 : 0),
    ),
    "mobile-experience": clampScore(
      5.4 +
        (observation.hasViewport ? 1.1 : -1.6) +
        (observation.primaryCtas.length <= 3 && observation.primaryCtas.length > 0 ? 0.3 : -0.3) +
        (observation.headingCount >= 3 ? 0.2 : -0.2),
    ),
    "seo-readiness": clampScore(
      5.2 +
        (observation.pageTitle ? 0.9 : -1.1) +
        (observation.metaDescription ? 0.8 : -0.9) +
        (observation.heroHeading ? 0.4 : -0.8) +
        (observation.hasCanonical ? 0.4 : -0.3) +
        (observation.hasSchema ? 0.6 : -0.3) +
        (observation.internalLinkCount >= 8 ? 0.5 : -0.3),
    ),
    accessibility: clampScore(
      5.5 +
        (observation.hasLang ? 0.5 : -0.4) +
        (observation.hasViewport ? 0.3 : -0.4) +
        (observation.heroHeading ? 0.3 : -0.4) +
        (observation.missingAltRatio === 0
          ? 0.4
          : observation.missingAltRatio > 0.4
            ? -0.8
            : -0.2),
    ),
    "trust-credibility": clampScore(
      5.4 +
        Math.min(observation.trustSignals.length * 0.35, 1.8) +
        (observation.aboutSnippet ? 0.4 : -0.4) +
        (observation.templateSignals.length ? -0.8 : 0.2),
    ),
    "security-posture": clampScore(
      5.8 +
        (observation.finalUrl.startsWith("https://") ? 0.6 : -1) +
        Math.min(observation.securitySignals.length * 0.35, 1.8) +
        (observation.formCount > 0 && !observation.securitySignals.length ? -0.5 : 0),
    ),
  };

  return (Object.keys(categoryLabels) as AuditCategoryKey[]).map((key) => {
    const score = scoreOverrides?.[key] ?? computedScores[key];
    const summaryMap: Record<AuditCategoryKey, string> = {
      "visual-design":
        observation.heroHeading
          ? `The page opens with “${observation.heroHeading},” but the visual system still has to prove premium confidence.`
          : "The page lacks a clear top-of-page message anchor, so the first impression feels harder to trust.",
      "ux-conversion":
        observation.primaryCtas.length
          ? `The next step currently leans on ${observation.primaryCtas.slice(0, 2).join(" and ")}.`
          : "The page needs a clearer next-step path before traffic can convert efficiently.",
      "mobile-experience":
        observation.hasViewport
          ? "The page is set up to respond to smaller screens, but the content sequence still determines how usable it feels."
          : "The page does not expose a responsive viewport signal, which usually translates into a weaker mobile first impression.",
      "seo-readiness":
        observation.metaDescription
          ? "Core search signals are present, but the page still needs stronger structure and supporting page depth."
          : "Basic search signals are incomplete, which limits how clearly the page can be understood by search engines.",
      accessibility:
        observation.hasLang
          ? "Structural accessibility signals are partially present, but usability still depends on contrast, alt text, and semantic clarity."
          : "Several baseline accessibility signals are missing or unclear, which usually creates friction for everyone.",
      "trust-credibility":
        observation.trustSignals.length
          ? `The page already shows trust cues such as ${observation.trustSignals[0].toLowerCase()}`
          : "The page needs more direct proof, reassurance, and real-world credibility cues near the ask.",
      "security-posture":
        observation.securitySignals.length
          ? `The page exposes ${observation.securitySignals.length} visible hardening signal${observation.securitySignals.length > 1 ? "s" : ""}.`
          : "The page is on HTTPS, but visible hardening signals are still thin.",
    };

    const detailsMap: Record<AuditCategoryKey, string[]> = {
      "visual-design": buildScoreDetails(
        categoryLabels[key],
        [observation.heroHeading || observation.pageTitle],
        "Tighten hierarchy, reduce generic chrome, and make the first screen feel unmistakably custom.",
        "A 9+ visual score feels immediate, branded, and intentional before the visitor starts reading.",
      ),
      "ux-conversion": buildScoreDetails(
        categoryLabels[key],
        [
          observation.primaryCtas.length
            ? `Primary calls to action include ${observation.primaryCtas.join(", ")}.`
            : "No strong primary CTA language was detected on the page.",
        ],
        "Sequence proof before the ask and reduce the number of competing actions.",
        "High-scoring conversion paths make the next step obvious without asking for commitment too early.",
      ),
      "mobile-experience": buildScoreDetails(
        categoryLabels[key],
        [observation.hasViewport ? "Viewport meta tag is present." : "Viewport meta tag was not detected."],
        "Prioritize shorter sections, stronger spacing, and one clear mobile CTA path.",
        "A 9+ mobile score means the first message, proof, and next step still land cleanly on small screens.",
      ),
      "seo-readiness": buildScoreDetails(
        categoryLabels[key],
        observation.seoSignals,
        "Expand supporting pages, tighten metadata, and map internal links around real search intent.",
        "A 9+ search score combines page-level hygiene with real content depth and crawlable structure.",
      ),
      accessibility: buildScoreDetails(
        categoryLabels[key],
        observation.technicalSignals,
        "Audit contrast, alt text, focus states, and heading order so the page gets easier to use for everyone.",
        "High accessibility scores usually correlate with clearer content structure and lower friction.",
      ),
      "trust-credibility": buildScoreDetails(
        categoryLabels[key],
        observation.trustSignals,
        "Move proof, credentials, and reassurance closer to the first CTA and key decision moments.",
        "A 9+ trust score makes competence, safety, and legitimacy obvious before the visitor hesitates.",
      ),
      "security-posture": buildScoreDetails(
        categoryLabels[key],
        observation.securitySignals.length ? observation.securitySignals : ["No strong public-facing security headers were detected."],
        "Add missing security headers and make trust around forms and handling more explicit.",
        "A strong security posture is visible: HTTPS, modern headers, and fewer public signs of operational looseness.",
      ),
    };

    return {
      key,
      label: categoryLabels[key],
      score,
      summary: summaryMap[key],
      weight: key === "ux-conversion" || key === "trust-credibility" ? 1.25 : 1,
      details: detailsMap[key],
    } satisfies AuditCategoryScore;
  });
}

function getLowScoreKeys(categoryScores: AuditCategoryScore[]) {
  return [...categoryScores]
    .sort((left, right) => left.score - right.score)
    .slice(0, 3)
    .map((entry) => entry.key);
}

function severityFromScore(score: number): SeverityLevel {
  if (score < 4.8) {
    return "high";
  }

  if (score < 6.2) {
    return "medium";
  }

  return "low";
}

export function buildObservedFindings(
  profile: ReportProfileType,
  title: string,
  observation: SiteObservation,
  categoryScores: AuditCategoryScore[],
  previewImage: string,
) {
  const lowScoreKeys = getLowScoreKeys(categoryScores);
  const findings: Finding[] = [];

  if (observation.heroHeading || observation.pageTitle) {
    findings.push(
      createFinding({
        id: "working-core-message",
        title: "The page gives visitors a readable starting point",
        summary: observation.heroHeading
          ? `The opening heading is “${observation.heroHeading},” which gives the page a real message anchor.`
          : `The page title, “${observation.pageTitle},” gives the audit enough signal to understand the offer.`,
        severity: "low",
        category: "visual-design",
        section: "what-working",
        businessImpact:
          "When the top of the page communicates the offer quickly, the redesign can focus on improving trust and momentum instead of inventing the message from zero.",
        recommendation:
          "Keep the core message visible, then strengthen the hierarchy and proof around it.",
        confidenceLevel: "detected",
        evidence: [
          createEvidence(
            "working-core-message-1",
            "Observed heading",
            observation.heroHeading || observation.pageTitle,
            "content",
          ),
        ],
        screenshots: [previewImage],
        tags: ["message", "hierarchy", profile],
      }),
    );
  }

  if (observation.trustSignals.length) {
    findings.push(
      createFinding({
        id: "working-trust",
        title: "There are already trust ingredients on the page",
        summary: observation.trustSignals.join(" "),
        severity: "low",
        category: "trust-credibility",
        section: "what-working",
        businessImpact:
          "Real trust material means the redesign can amplify what already exists instead of fabricating credibility from scratch.",
        recommendation:
          "Promote the strongest proof higher on the page and closer to conversion moments.",
        confidenceLevel: "detected",
        evidence: observation.trustSignals.slice(0, 3).map((signal, index) =>
          createEvidence(`working-trust-${index}`, "Observed trust signal", signal, "trust"),
        ),
        screenshots: [previewImage],
        tags: ["trust", "proof", profile],
      }),
    );
  }

  if (lowScoreKeys.includes("visual-design")) {
    findings.push(
      createFinding({
        id: "issue-visual",
        title: "The first impression still undersells the business",
        summary: observation.templateSignals.length
          ? observation.templateSignals[0]
          : `${title} has real content, but the interface still feels closer to a stock template than a confident brand presentation.`,
        severity: severityFromScore(
          categoryScores.find((entry) => entry.key === "visual-design")?.score ?? 5,
        ),
        category: "visual-design",
        section: "costing-leads",
        businessImpact:
          "When the page looks generic or crowded, visitors judge the business as less capable before they read the details.",
        recommendation:
          "Rebuild the first screen around stronger type, fewer visual distractions, and a more deliberate proof ladder.",
        confidenceLevel: observation.templateSignals.length ? "detected" : "recommended",
        evidence: [
          createEvidence(
            "issue-visual-1",
            "Observed message anchor",
            observation.heroHeading || observation.pageTitle || "Top-of-page structure needs a clearer anchor.",
            "visual",
          ),
        ],
        screenshots: [previewImage],
        tags: ["visual-design", "first-impression"],
      }),
    );
  }

  if (lowScoreKeys.includes("ux-conversion")) {
    findings.push(
      createFinding({
        id: "issue-conversion",
        title: "The next step is not being earned clearly enough",
        summary: observation.primaryCtas.length
          ? `The page currently leans on ${observation.primaryCtas.join(", ")}, but the proof and sequencing around those asks still need work.`
          : "A clear primary CTA was not obvious on the page, which makes the conversion path feel passive or buried.",
        severity: severityFromScore(
          categoryScores.find((entry) => entry.key === "ux-conversion")?.score ?? 5,
        ),
        category: "ux-conversion",
        section: "costing-leads",
        businessImpact:
          "Even strong traffic underperforms when the page asks visitors to infer the next step instead of guiding them there.",
        recommendation:
          "Reduce CTA sprawl, add reassurance before the ask, and design one high-confidence path for the core action.",
        confidenceLevel: "detected",
        evidence: [
          createEvidence(
            "issue-conversion-1",
            "Observed CTA set",
            observation.primaryCtas.length
              ? observation.primaryCtas.join(", ")
              : "No clear CTA language was detected.",
            "content",
          ),
        ],
        screenshots: [previewImage],
        tags: ["cta", "conversion", "funnel"],
      }),
    );
  }

  findings.push(
    createFinding({
      id: "technical-seo-structure",
      title: "Search structure has room to get sharper",
      summary: observation.metaDescription
        ? `Metadata is partially present, but the page still needs deeper structural support to score like a standout search-ready experience.`
        : "Important search signals such as a meta description or stronger structural cues are still missing.",
      severity: severityFromScore(
        categoryScores.find((entry) => entry.key === "seo-readiness")?.score ?? 5,
      ),
      category: "seo-readiness",
      section: "technical-seo",
      businessImpact:
        "Search visibility and click-through improve when pages are easier for search engines to interpret and easier for people to trust in search results.",
      recommendation:
        "Tighten title and metadata patterns, expand supporting pages, and add schema or canonical coverage where relevant.",
      confidenceLevel: "detected",
      evidence: observation.seoSignals.slice(0, 3).map((signal, index) =>
        createEvidence(`technical-seo-${index}`, "Observed search signal", signal, "technical"),
      ),
      screenshots: [previewImage],
      tags: ["seo", "metadata", "structure"],
    }),
  );

  findings.push(
    createFinding({
      id: "security-posture",
      title: "Security posture can look more deliberate",
      summary: observation.securitySignals.length
        ? `The page exposes ${observation.securitySignals.join(" ").toLowerCase()}`
        : "The site is on HTTPS, but the visible hardening layer still looks light from a public-observation standpoint.",
      severity: severityFromScore(
        categoryScores.find((entry) => entry.key === "security-posture")?.score ?? 5,
      ),
      category: "security-posture",
      section: "security-posture",
      businessImpact:
        "Public-facing hardening signals support trust, especially when the site collects contact or booking information.",
      recommendation:
        "Add or tighten HSTS, CSP, referrer, frame, and permissions policies so the public posture matches a modern build.",
      confidenceLevel: "detected",
      evidence: [
        createEvidence(
          "security-posture-1",
          "Observed header posture",
          observation.securitySignals.length
            ? observation.securitySignals.join(" ")
            : "No major security headers were detected in the response.",
          "technical",
        ),
      ],
      screenshots: [previewImage],
      tags: ["security", "headers", "trust"],
    }),
  );

  return findings;
}

export function buildBenchmarkReferences(profile: ReportProfileType): BenchmarkReference[] {
  const sets: Record<ReportProfileType, BenchmarkReference[]> = {
    healthcare: [
      {
        id: "benchmark-onemedical",
        name: "One Medical",
        url: "https://www.onemedical.com",
        sourceLabel: "Healthcare reference",
        note: "Clear booking paths, strong reassurance, and a cleaner primary-care information hierarchy.",
        previewImage: createWebsiteScreenshotUrl("https://www.onemedical.com"),
        targetScore: 9.1,
        strengths: ["ux-conversion", "mobile-experience", "trust-credibility"],
      },
      {
        id: "benchmark-zocdoc",
        name: "Zocdoc",
        url: "https://www.zocdoc.com",
        sourceLabel: "Healthcare booking reference",
        note: "Strong next-step clarity and visible scheduling confidence.",
        previewImage: createWebsiteScreenshotUrl("https://www.zocdoc.com"),
        targetScore: 8.9,
        strengths: ["ux-conversion", "trust-credibility", "seo-readiness"],
      },
      {
        id: "benchmark-apple",
        name: "Apple",
        url: "https://www.apple.com",
        sourceLabel: "Global design reference",
        note: "A good reminder of how restrained hierarchy and confident visual systems raise perceived quality fast.",
        previewImage: createWebsiteScreenshotUrl("https://www.apple.com"),
        targetScore: 9.4,
        strengths: ["visual-design", "mobile-experience", "accessibility"],
      },
    ],
    "local-service": [
      {
        id: "benchmark-ajalberts",
        name: "AJ Alberts Plumbing",
        url: "https://www.ajalberts.com",
        sourceLabel: "Home-service reference",
        note: "Shows how service pages, proof, and direct contact can feel more immediate.",
        previewImage: createWebsiteScreenshotUrl("https://www.ajalberts.com"),
        targetScore: 8.8,
        strengths: ["ux-conversion", "trust-credibility", "seo-readiness"],
      },
      {
        id: "benchmark-northface",
        name: "Northface Construction",
        url: "https://northfaceconstruction.com",
        sourceLabel: "Contractor reference",
        note: "Useful reference for a tighter estimate path and stronger first-screen confidence.",
        previewImage: createWebsiteScreenshotUrl("https://northfaceconstruction.com"),
        targetScore: 8.9,
        strengths: ["visual-design", "ux-conversion", "trust-credibility"],
      },
      {
        id: "benchmark-apple-local",
        name: "Apple",
        url: "https://www.apple.com",
        sourceLabel: "Global design reference",
        note: "Not a service business, but a strong benchmark for hierarchy, restraint, and premium finish.",
        previewImage: createWebsiteScreenshotUrl("https://www.apple.com"),
        targetScore: 9.4,
        strengths: ["visual-design", "mobile-experience", "accessibility"],
      },
    ],
    saas: [
      {
        id: "benchmark-stripe",
        name: "Stripe",
        url: "https://stripe.com",
        sourceLabel: "SaaS reference",
        note: "Clear positioning, strong proof density, and a product story that stays easy to scan.",
        previewImage: createWebsiteScreenshotUrl("https://stripe.com"),
        targetScore: 9.5,
        strengths: ["visual-design", "ux-conversion", "trust-credibility"],
      },
      {
        id: "benchmark-linear",
        name: "Linear",
        url: "https://linear.app",
        sourceLabel: "SaaS reference",
        note: "A strong benchmark for product clarity, pacing, and modern interface confidence.",
        previewImage: createWebsiteScreenshotUrl("https://linear.app"),
        targetScore: 9.3,
        strengths: ["visual-design", "mobile-experience", "ux-conversion"],
      },
      {
        id: "benchmark-apple-saas",
        name: "Apple",
        url: "https://www.apple.com",
        sourceLabel: "Global design reference",
        note: "Useful as a high bar for clarity, polish, and restraint even outside the SaaS category.",
        previewImage: createWebsiteScreenshotUrl("https://www.apple.com"),
        targetScore: 9.4,
        strengths: ["visual-design", "accessibility", "mobile-experience"],
      },
    ],
  };

  return sets[profile];
}

export function buildObservedExecutiveSummary(
  title: string,
  observation: SiteObservation,
  overallScore: number,
) {
  const opening =
    observation.heroHeading || observation.pageTitle
      ? `${title} already communicates “${observation.heroHeading || observation.pageTitle},”`
      : `${title} already has real business substance,`;
  const specifics = uniqueTexts(
    [
      observation.aboutSnippet,
      ...observation.notableDetails,
      observation.primaryCtas.length
        ? `current CTA language includes ${observation.primaryCtas.slice(0, 2).join(" and ")}`
        : "",
    ],
    2,
  );
  const scoreFrame =
    overallScore >= 8
      ? "The opportunity now is refinement, not rescue."
      : overallScore >= 6
        ? "The main opportunity is to make that value easier to trust and easier to act on."
        : "Right now the site is likely making visitors work too hard before they feel confident enough to reach out.";

  return `${opening} but the site can still do a better job of turning that substance into a confident first impression. ${specifics.join(" ")} ${scoreFrame}`.trim();
}

export function getTenOutOfTenNotes() {
  return [
    "A 10/10 is rare. It means the site is clear, distinct, fast to understand, accessible, and visibly trustworthy with almost no obvious friction.",
    "Most strong commercial sites live in the 7.5 to 9.2 range. The goal is not perfection. It is a page that feels easier to trust and easier to act on than the alternatives.",
    "The reference cards below show what a high bar looks like in practice, not an impossible standard.",
  ];
}
