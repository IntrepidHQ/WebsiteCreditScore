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
import {
  buildBenchmarkReferencesForProfile,
  getCriterionForProfileCategory,
} from "@/lib/benchmarks/library";
import { clampScore } from "@/lib/utils/scores";

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
              : "WebsiteCreditScore.com heuristic review",
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
  rubricFocus?: string,
) {
  return [
    observed.length ? `Observed: ${observed[0]}` : `Observed: ${label} needs more direct evidence on-page.`,
    rubricFocus ? `Benchmark focus: ${rubricFocus}` : null,
    `Why it matters: ${benchmark}`,
    `Next step: ${action}`,
  ].filter(Boolean) as string[];
}

export function buildObservedCategoryScores(
  profile: ReportProfileType,
  observation: SiteObservation,
  scoreOverrides?: Partial<Record<AuditCategoryKey, number>>,
) {
  const verifiedContactCount = observation.verifiedFacts.filter((fact) =>
    fact.type === "phone" || fact.type === "email" || fact.type === "address",
  ).length;
  const verifiedAbout = observation.verifiedFacts.find((fact) => fact.type === "about");
  const hasAdvancedMotion = observation.motionSignals.some(
    (signal) => signal === "scroll-story" || signal === "layout-transition" || signal === "page-transition",
  );
  const hasAnyMotion = observation.motionSignals.length > 0;
  const titleLength = observation.pageTitle.length;
  const descriptionLength = observation.metaDescription.length;

  // ── VISUAL DESIGN (base 4.5) ──
  // A senior designer defaults to "mediocre" and requires evidence to score higher.
  let visualDesign = 4.5;
  visualDesign += observation.heroHeading ? 0.8 : -0.5;
  visualDesign += observation.ogImage ? 0.3 : 0;
  visualDesign += observation.templateSignals.length ? -2.0 : 0;
  if (observation.templateSignals.some((s) => /lorem ipsum|your practice name/i.test(s))) visualDesign -= 0.5;
  visualDesign += hasAdvancedMotion ? 0.8 : hasAnyMotion ? 0.3 : -0.3;
  visualDesign += observation.headingCount >= 4 ? 0.4 : observation.headingCount <= 1 ? -0.4 : 0;
  visualDesign += observation.metaDescription ? 0.2 : 0;
  visualDesign += observation.internalLinkCount >= 10 ? 0.3 : 0;

  // ── UX & CONVERSION (base 4.0) ──
  let uxConversion = 4.0;
  uxConversion += ctaPenalty(observation);
  uxConversion += observation.formCount >= 3 ? 0.9 : observation.formCount >= 1 ? 0.6 : -0.5;
  uxConversion += verifiedContactCount >= 2 ? 1.0 : verifiedContactCount >= 1 ? 0.5 : 0;
  uxConversion += observation.trustSignals.length >= 5 ? 0.8 : observation.trustSignals.length >= 3 ? 0.5 : 0;
  uxConversion += verifiedAbout ? 0.3 : 0;
  uxConversion += hasAdvancedMotion ? 0.3 : 0;

  // ── MOBILE EXPERIENCE (base 5.0) ──
  // Viewport is make-or-break. Without it, cap hard.
  let mobileExperience = 5.0;
  mobileExperience += observation.hasViewport ? 1.5 : -2.5;
  mobileExperience += observation.primaryCtas.length >= 1 && observation.primaryCtas.length <= 3 ? 0.4 : observation.primaryCtas.length >= 5 ? -0.5 : 0;
  mobileExperience += observation.headingCount >= 3 ? 0.3 : 0;
  mobileExperience += observation.formCount >= 1 ? 0.2 : 0;
  mobileExperience += observation.missingAltRatio === 0 ? 0.2 : observation.missingAltRatio > 0.5 ? -0.3 : 0;
  mobileExperience += observation.hasLang ? 0.2 : 0;

  // ── SEO READINESS (base 3.5) ──
  let seoReadiness = 3.5;
  seoReadiness += observation.pageTitle ? 1.0 : -1.0;
  if (observation.pageTitle && titleLength >= 30 && titleLength <= 60) seoReadiness += 0.3;
  seoReadiness += observation.metaDescription ? 0.8 : 0;
  if (observation.metaDescription && descriptionLength >= 120 && descriptionLength <= 160) seoReadiness += 0.3;
  seoReadiness += observation.heroHeading ? 0.6 : 0;
  seoReadiness += observation.hasCanonical ? 0.5 : 0;
  seoReadiness += observation.hasSchema ? 0.8 : 0;
  seoReadiness += observation.hasLang ? 0.3 : 0;
  seoReadiness += observation.internalLinkCount >= 15 ? 0.8 : observation.internalLinkCount >= 8 ? 0.5 : observation.internalLinkCount < 3 ? -0.5 : 0;

  // ── TRUST & CREDIBILITY (base 3.5) ──
  let trustCredibility = 3.5;
  trustCredibility += observation.verifiedFacts.some((f) => f.type === "phone") ? 0.8 : 0;
  trustCredibility += observation.verifiedFacts.some((f) => f.type === "email") ? 0.6 : 0;
  trustCredibility += observation.verifiedFacts.some((f) => f.type === "address") ? 0.8 : 0;
  trustCredibility += verifiedAbout ? 0.5 : -0.4;
  trustCredibility += Math.min(observation.trustSignals.length * 0.4, 1.2);
  trustCredibility += observation.hasSchema ? 0.5 : 0;
  trustCredibility += observation.templateSignals.length ? -1.5 : 0;

  // ── SECURITY POSTURE (base 5.0) ──
  let securityPosture = 5.0;
  securityPosture += observation.finalUrl.startsWith("https://") ? 0.8 : -2.0;
  // Individual header bonuses
  const secHeaders = observation.securitySignals.join(" ").toLowerCase();
  securityPosture += /hsts/i.test(secHeaders) ? 0.6 : 0;
  securityPosture += /content security policy/i.test(secHeaders) ? 0.6 : 0;
  securityPosture += /frame/i.test(secHeaders) ? 0.4 : 0;
  securityPosture += /referrer/i.test(secHeaders) ? 0.3 : 0;
  securityPosture += /permissions/i.test(secHeaders) ? 0.3 : 0;
  securityPosture += /mime/i.test(secHeaders) ? 0.3 : 0;
  securityPosture += observation.formCount > 0 && observation.securitySignals.length === 0 ? -0.8 : 0;

  // ── ACCESSIBILITY (base 4.5) ──
  let accessibility = 4.5;
  accessibility += observation.hasLang ? 0.6 : -0.5;
  accessibility += observation.hasViewport ? 0.4 : -0.5;
  accessibility += observation.heroHeading ? 0.4 : 0;
  accessibility += observation.headingCount >= 3 ? 0.3 : 0;
  accessibility += observation.missingAltRatio === 0 ? 0.8 : observation.missingAltRatio > 0.4 ? -1.2 : -0.4;
  accessibility += observation.formCount >= 1 ? 0.2 : 0;
  accessibility += observation.templateSignals.length ? -0.5 : 0;
  // Note: capped lower because we can't detect contrast, focus states, ARIA, or keyboard nav from HTML alone

  const computedScores: Record<AuditCategoryKey, number> = {
    "visual-design": clampScore(visualDesign),
    "ux-conversion": clampScore(uxConversion),
    "mobile-experience": clampScore(mobileExperience),
    "seo-readiness": clampScore(seoReadiness),
    accessibility: clampScore(accessibility),
    "trust-credibility": clampScore(trustCredibility),
    "security-posture": clampScore(securityPosture),
  };

  return (Object.keys(categoryLabels) as AuditCategoryKey[]).map((key) => {
    const score = scoreOverrides?.[key] ?? computedScores[key];
    const summaryMap: Record<AuditCategoryKey, string> = {
      "visual-design":
        observation.heroHeading
          ? `The page opens with "${observation.heroHeading}," but the visual system still has to prove premium confidence.`
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
        verifiedContactCount
          ? `The page already exposes ${verifiedContactCount} verified business detail${verifiedContactCount > 1 ? "s" : ""} prospects can use to validate the business.`
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
        getCriterionForProfileCategory(profile, key)?.whyItMatters,
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
        getCriterionForProfileCategory(profile, key)?.whyItMatters,
      ),
      "mobile-experience": buildScoreDetails(
        categoryLabels[key],
        [observation.hasViewport ? "Viewport meta tag is present." : "Viewport meta tag was not detected."],
        "Prioritize shorter sections, stronger spacing, and one clear mobile CTA path.",
        "A 9+ mobile score means the first message, proof, and next step still land cleanly on small screens.",
        getCriterionForProfileCategory(profile, key)?.whyItMatters,
      ),
      "seo-readiness": buildScoreDetails(
        categoryLabels[key],
        observation.seoSignals,
        "Expand supporting pages, tighten metadata, and map internal links around real search intent.",
        "A 9+ search score combines page-level hygiene with real content depth and crawlable structure.",
        getCriterionForProfileCategory(profile, key)?.whyItMatters,
      ),
      accessibility: buildScoreDetails(
        categoryLabels[key],
        observation.technicalSignals,
        "Audit contrast, alt text, focus states, and heading order so the page gets easier to use for everyone.",
        "High accessibility scores usually correlate with clearer content structure and lower friction.",
        getCriterionForProfileCategory(profile, key)?.whyItMatters,
      ),
      "trust-credibility": buildScoreDetails(
        categoryLabels[key],
        observation.verifiedFacts
          .filter((fact) => fact.type !== "about")
          .map((fact) => `${fact.label}: ${fact.value}`),
        "Move proof, credentials, and reassurance closer to the first CTA and key decision moments.",
        "A 9+ trust score makes competence, safety, and legitimacy obvious before the visitor hesitates.",
        getCriterionForProfileCategory(profile, key)?.whyItMatters,
      ),
      "security-posture": buildScoreDetails(
        categoryLabels[key],
        observation.securitySignals.length ? observation.securitySignals : ["No strong public-facing security headers were detected."],
        "Add missing security headers and make trust around forms and handling more explicit.",
        "A strong security posture is visible: HTTPS, modern headers, and fewer public signs of operational looseness.",
        getCriterionForProfileCategory(profile, key)?.whyItMatters,
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
  const scoreFor = (key: AuditCategoryKey) =>
    categoryScores.find((entry) => entry.key === key)?.score ?? 5;

  // ────────────────────────────────────────────────
  // WHAT'S WORKING (positive findings from real signals)
  // ────────────────────────────────────────────────

  if (observation.heroHeading || observation.pageTitle) {
    findings.push(
      createFinding({
        id: "working-core-message",
        title: "The page gives visitors a readable starting point",
        summary: observation.heroHeading
          ? `The opening heading is "${observation.heroHeading}," which gives the page a real message anchor.`
          : `The page title, "${observation.pageTitle}," gives the audit enough signal to understand the offer.`,
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

  if (observation.trustSignals.length >= 2) {
    findings.push(
      createFinding({
        id: "working-trust",
        title: "Trust signals are already present on the page",
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

  const verifiedContactCount = observation.verifiedFacts.filter((f) =>
    f.type === "phone" || f.type === "email" || f.type === "address",
  ).length;

  if (verifiedContactCount >= 2) {
    findings.push(
      createFinding({
        id: "working-contact",
        title: "Business contact information is published",
        summary: `The page exposes ${verifiedContactCount} verified contact method${verifiedContactCount > 1 ? "s" : ""}: ${observation.verifiedFacts.filter((f) => f.type !== "about").map((f) => f.label).join(", ")}.`,
        severity: "low",
        category: "trust-credibility",
        section: "what-working",
        businessImpact:
          "Visible contact details are one of the strongest trust signals for local and service businesses.",
        recommendation:
          "Make contact info accessible from every major section, not just the footer.",
        confidenceLevel: "detected",
        evidence: observation.verifiedFacts
          .filter((f) => f.type !== "about")
          .slice(0, 3)
          .map((fact) => createEvidence(`working-contact-${fact.type}`, fact.label, fact.value, "trust")),
        screenshots: [previewImage],
        tags: ["contact", "trust", profile],
      }),
    );
  }

  if (observation.hasSchema) {
    findings.push(
      createFinding({
        id: "working-schema",
        title: "Structured data is in place for rich search results",
        summary:
          "Schema.org markup was detected, which helps search engines understand the business and can enable rich results.",
        severity: "low",
        category: "seo-readiness",
        section: "what-working",
        businessImpact:
          "Structured data can lead to enhanced search listings with ratings, hours, and contact info.",
        recommendation:
          "Verify the schema covers all critical business attributes and passes Google's structured data test.",
        confidenceLevel: "detected",
        evidence: [
          createEvidence("working-schema-1", "Structured data", "Schema.org markup detected", "technical"),
        ],
        screenshots: [previewImage],
        tags: ["schema", "seo", profile],
      }),
    );
  }

  if (observation.securitySignals.length >= 3) {
    findings.push(
      createFinding({
        id: "working-security",
        title: "Security posture is deliberate",
        summary: `The site exposes ${observation.securitySignals.length} security header${observation.securitySignals.length > 1 ? "s" : ""}, showing intentional hardening.`,
        severity: "low",
        category: "security-posture",
        section: "what-working",
        businessImpact:
          "Strong security headers reduce risk of attacks and signal operational maturity to technical visitors.",
        recommendation:
          "Maintain current headers and add any missing ones (CSP, Permissions-Policy).",
        confidenceLevel: "detected",
        evidence: observation.securitySignals.slice(0, 3).map((signal, index) =>
          createEvidence(`working-security-${index}`, "Security header", signal, "technical"),
        ),
        screenshots: [previewImage],
        tags: ["security", "headers", profile],
      }),
    );
  }

  if (hasMeaningfulCta(observation) && observation.primaryCtas.length <= 3) {
    findings.push(
      createFinding({
        id: "working-cta",
        title: "The conversion path is focused",
        summary: `The page has ${observation.primaryCtas.length} clear call${observation.primaryCtas.length > 1 ? "s" : ""} to action: ${observation.primaryCtas.join(", ")}.`,
        severity: "low",
        category: "ux-conversion",
        section: "what-working",
        businessImpact:
          "Focused CTAs reduce decision paralysis and make the next step obvious.",
        recommendation:
          "Sequence proof and reassurance before each CTA to increase conversion confidence.",
        confidenceLevel: "detected",
        evidence: observation.primaryCtas.map((cta, index) =>
          createEvidence(`working-cta-${index}`, "Call to action", cta, "content"),
        ),
        screenshots: [previewImage],
        tags: ["cta", "conversion", profile],
      }),
    );
  }

  // ────────────────────────────────────────────────
  // ISSUES — COSTING LEADS (observation-driven)
  // ────────────────────────────────────────────────

  // Template / placeholder content (critical)
  if (observation.templateSignals.length) {
    findings.push(
      createFinding({
        id: "issue-template",
        title: "Template or placeholder content detected",
        summary: `The page contains template markers: ${observation.templateSignals.map((s) => s.replace(/Template marker matched:\s*/i, "")).join(", ")}. This destroys credibility instantly.`,
        severity: "high",
        category: "visual-design",
        section: "costing-leads",
        businessImpact:
          "Placeholder content tells visitors the site isn't finished or maintained. Most will leave immediately.",
        recommendation:
          "Replace all placeholder text with real business content before any other improvements.",
        confidenceLevel: "detected",
        evidence: observation.templateSignals.map((signal, index) =>
          createEvidence(`issue-template-${index}`, "Template marker", signal, "content"),
        ),
        screenshots: [previewImage],
        tags: ["template", "placeholder", "critical"],
      }),
    );
  }

  // No hero heading
  if (!observation.heroHeading) {
    findings.push(
      createFinding({
        id: "issue-no-h1",
        title: "No primary heading (H1) found on the page",
        summary:
          "The page has no H1 heading, which means there's no clear message anchor for visitors or search engines.",
        severity: "high",
        category: "visual-design",
        section: "costing-leads",
        businessImpact:
          "Without a primary heading, visitors can't instantly understand what the business offers or why they should stay.",
        recommendation:
          "Add a clear, benefit-driven H1 that communicates the core value proposition within the first viewport.",
        confidenceLevel: "detected",
        evidence: [
          createEvidence("issue-no-h1-1", "Heading structure", "No H1 element detected in the HTML", "content"),
        ],
        screenshots: [previewImage],
        tags: ["heading", "hierarchy", "seo"],
      }),
    );
  }

  // No CTAs
  if (observation.primaryCtas.length === 0) {
    findings.push(
      createFinding({
        id: "issue-no-cta",
        title: "No clear call to action detected",
        summary:
          "The page has no recognizable CTA language (book, schedule, contact, get started, etc.). Visitors have no obvious next step.",
        severity: "high",
        category: "ux-conversion",
        section: "costing-leads",
        businessImpact:
          "Without a clear next step, even interested visitors will leave rather than figure out how to engage.",
        recommendation:
          "Add a prominent, action-oriented CTA above the fold and repeat it after key proof sections.",
        confidenceLevel: "detected",
        evidence: [
          createEvidence("issue-no-cta-1", "CTA scan", "No action-oriented CTA language detected", "content"),
        ],
        screenshots: [previewImage],
        tags: ["cta", "conversion", "critical"],
      }),
    );
  } else if (observation.primaryCtas.length >= 5) {
    findings.push(
      createFinding({
        id: "issue-too-many-ctas",
        title: `Too many competing calls to action (${observation.primaryCtas.length} detected)`,
        summary: `The page has ${observation.primaryCtas.length} CTAs: ${observation.primaryCtas.join(", ")}. This creates decision paralysis.`,
        severity: "medium",
        category: "ux-conversion",
        section: "costing-leads",
        businessImpact:
          "When everything is a priority, nothing is. Too many competing actions reduce conversion rates.",
        recommendation:
          "Choose one primary action and make it visually dominant. Demote the rest to secondary treatments.",
        confidenceLevel: "detected",
        evidence: observation.primaryCtas.map((cta, index) =>
          createEvidence(`issue-ctas-${index}`, "Competing CTA", cta, "content"),
        ),
        screenshots: [previewImage],
        tags: ["cta", "conversion", "ux"],
      }),
    );
  }

  // No forms + no CTAs = no conversion mechanism at all
  if (observation.formCount === 0 && observation.primaryCtas.length === 0) {
    findings.push(
      createFinding({
        id: "issue-no-conversion",
        title: "No conversion mechanisms detected",
        summary:
          "The page has no forms and no clear calls to action. There is literally no way for a visitor to convert.",
        severity: "high",
        category: "ux-conversion",
        section: "costing-leads",
        businessImpact:
          "A page without any conversion path is a brochure. Every visit is wasted traffic.",
        recommendation:
          "Add at least one contact form and a clear primary CTA. Place them where trust has been established.",
        confidenceLevel: "detected",
        evidence: [
          createEvidence("issue-no-conversion-1", "Forms", "0 forms detected", "content"),
          createEvidence("issue-no-conversion-2", "CTAs", "No CTA language detected", "content"),
        ],
        screenshots: [previewImage],
        tags: ["conversion", "forms", "critical"],
      }),
    );
  }

  // No viewport = broken mobile
  if (!observation.hasViewport) {
    findings.push(
      createFinding({
        id: "issue-no-viewport",
        title: "No responsive viewport tag detected",
        summary:
          "The page is missing a viewport meta tag, which means it almost certainly renders poorly on mobile devices.",
        severity: "high",
        category: "mobile-experience",
        section: "costing-leads",
        businessImpact:
          "Over 60% of web traffic is mobile. Without a viewport tag, the site is broken for most visitors.",
        recommendation:
          "Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"> immediately.",
        confidenceLevel: "detected",
        evidence: [
          createEvidence("issue-no-viewport-1", "Viewport", "No viewport meta tag in the HTML", "technical"),
        ],
        screenshots: [previewImage],
        tags: ["mobile", "viewport", "critical"],
      }),
    );
  }

  // Missing alt text
  if (observation.missingAltRatio > 0.3) {
    const percentage = Math.round(observation.missingAltRatio * 100);
    findings.push(
      createFinding({
        id: "issue-missing-alt",
        title: `${percentage}% of images are missing alt text`,
        summary: `${percentage}% of images on the page lack alt attributes, making them invisible to screen readers and unhelpful for SEO.`,
        severity: observation.missingAltRatio > 0.5 ? "high" : "medium",
        category: "accessibility",
        section: "costing-leads",
        businessImpact:
          "Missing alt text hurts accessibility, image SEO, and the experience when images fail to load.",
        recommendation:
          "Add descriptive alt text to every meaningful image. Use empty alt=\"\" only for purely decorative images.",
        confidenceLevel: "detected",
        evidence: [
          createEvidence(
            "issue-missing-alt-1",
            "Alt text coverage",
            `${percentage}% of images missing alt attributes`,
            "technical",
          ),
        ],
        screenshots: [previewImage],
        tags: ["accessibility", "alt-text", "seo"],
      }),
    );
  }

  // No verifiable contact info
  if (verifiedContactCount === 0) {
    findings.push(
      createFinding({
        id: "issue-no-contact",
        title: "No verifiable business contact information found",
        summary:
          "No phone number, email address, or physical address was detected on the page. Visitors can't verify the business is real.",
        severity: "high",
        category: "trust-credibility",
        section: "costing-leads",
        businessImpact:
          "Lack of contact information is the #1 trust killer for local and service businesses.",
        recommendation:
          "Add phone, email, and address in the header/footer and on a dedicated contact page.",
        confidenceLevel: "detected",
        evidence: [
          createEvidence("issue-no-contact-1", "Contact scan", "No verified phone, email, or address detected", "trust"),
        ],
        screenshots: [previewImage],
        tags: ["trust", "contact", "critical"],
      }),
    );
  }

  // Thin internal linking
  if (observation.internalLinkCount < 3) {
    findings.push(
      createFinding({
        id: "issue-thin-links",
        title: `Very thin internal linking (${observation.internalLinkCount} link${observation.internalLinkCount !== 1 ? "s" : ""})`,
        summary: `Only ${observation.internalLinkCount} internal link${observation.internalLinkCount !== 1 ? "s were" : " was"} detected. The site feels isolated with no navigational depth.`,
        severity: "medium",
        category: "seo-readiness",
        section: "costing-leads",
        businessImpact:
          "Thin internal linking limits crawlability, reduces page authority distribution, and makes the site feel shallow.",
        recommendation:
          "Build out service/product pages and link them from the homepage with descriptive anchor text.",
        confidenceLevel: "detected",
        evidence: [
          createEvidence("issue-thin-links-1", "Internal links", `${observation.internalLinkCount} internal links detected`, "technical"),
        ],
        screenshots: [previewImage],
        tags: ["seo", "links", "structure"],
      }),
    );
  }

  // Visual design issue (general — only if not already covered by template)
  if (lowScoreKeys.includes("visual-design") && !observation.templateSignals.length) {
    findings.push(
      createFinding({
        id: "issue-visual",
        title: "The first impression still undersells the business",
        summary: `${title} has real content, but the interface still feels closer to a stock template than a confident brand presentation.`,
        severity: severityFromScore(scoreFor("visual-design")),
        category: "visual-design",
        section: "costing-leads",
        businessImpact:
          "When the page looks generic or crowded, visitors judge the business as less capable before they read the details.",
        recommendation:
          "Rebuild the first screen around stronger type, fewer visual distractions, and a more deliberate proof ladder.",
        confidenceLevel: "recommended",
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

  // ────────────────────────────────────────────────
  // TECHNICAL SEO FINDINGS
  // ────────────────────────────────────────────────

  if (!observation.pageTitle) {
    findings.push(
      createFinding({
        id: "technical-missing-title",
        title: "Missing page title tag",
        summary:
          "No <title> tag was found. This is the single most important on-page SEO element and controls what appears in search results.",
        severity: "high",
        category: "seo-readiness",
        section: "technical-seo",
        businessImpact:
          "Without a title tag, search engines have to guess what the page is about, usually resulting in poor rankings and unappealing search listings.",
        recommendation:
          "Add a descriptive title tag (30-60 characters) that includes the primary keyword and business name.",
        confidenceLevel: "detected",
        evidence: [createEvidence("technical-missing-title-1", "Title tag", "Not detected in HTML", "technical")],
        screenshots: [previewImage],
        tags: ["seo", "title", "critical"],
      }),
    );
  }

  if (!observation.metaDescription) {
    findings.push(
      createFinding({
        id: "technical-missing-meta",
        title: "No meta description detected",
        summary:
          "The page is missing a meta description, which controls the snippet shown in search results.",
        severity: "medium",
        category: "seo-readiness",
        section: "technical-seo",
        businessImpact:
          "Without a meta description, search engines auto-generate a snippet that may not represent the business well.",
        recommendation:
          "Add a compelling meta description (120-160 characters) that summarizes the page's value proposition.",
        confidenceLevel: "detected",
        evidence: [createEvidence("technical-missing-meta-1", "Meta description", "Not detected in HTML", "technical")],
        screenshots: [previewImage],
        tags: ["seo", "metadata"],
      }),
    );
  }

  if (!observation.hasCanonical) {
    findings.push(
      createFinding({
        id: "technical-no-canonical",
        title: "No canonical URL declared",
        summary:
          "The page doesn't declare a canonical URL, which can lead to duplicate content issues if the page is accessible via multiple URLs.",
        severity: "low",
        category: "seo-readiness",
        section: "technical-seo",
        businessImpact:
          "Duplicate content dilutes search authority and can cause the wrong version of a page to rank.",
        recommendation:
          "Add a <link rel=\"canonical\"> pointing to the preferred URL for each page.",
        confidenceLevel: "detected",
        evidence: [createEvidence("technical-no-canonical-1", "Canonical", "No canonical link element detected", "technical")],
        screenshots: [previewImage],
        tags: ["seo", "canonical"],
      }),
    );
  }

  if (!observation.hasSchema) {
    findings.push(
      createFinding({
        id: "technical-no-schema",
        title: "No schema.org structured data detected",
        summary:
          "The page has no JSON-LD or schema.org markup, missing an opportunity for rich search results.",
        severity: "medium",
        category: "seo-readiness",
        section: "technical-seo",
        businessImpact:
          "Structured data enables rich results (ratings, hours, FAQs) that significantly improve click-through rates.",
        recommendation:
          "Add LocalBusiness, Organization, or appropriate schema type with complete business information.",
        confidenceLevel: "detected",
        evidence: [createEvidence("technical-no-schema-1", "Schema", "No JSON-LD blocks detected", "technical")],
        screenshots: [previewImage],
        tags: ["seo", "schema"],
      }),
    );
  }

  if (!observation.hasLang) {
    findings.push(
      createFinding({
        id: "technical-no-lang",
        title: "No language attribute on the HTML element",
        summary:
          "The <html> element is missing a lang attribute, which affects screen readers and search engine language detection.",
        severity: "low",
        category: "accessibility",
        section: "technical-seo",
        businessImpact:
          "Screen readers may mispronounce content, and search engines may misclassify the page's language.",
        recommendation:
          "Add lang=\"en\" (or appropriate language code) to the <html> tag.",
        confidenceLevel: "detected",
        evidence: [createEvidence("technical-no-lang-1", "Language attribute", "Not present on <html> element", "technical")],
        screenshots: [previewImage],
        tags: ["accessibility", "i18n"],
      }),
    );
  }

  // ────────────────────────────────────────────────
  // SECURITY FINDINGS
  // ────────────────────────────────────────────────

  if (!observation.finalUrl.startsWith("https://")) {
    findings.push(
      createFinding({
        id: "security-no-https",
        title: "Site is not served over HTTPS",
        summary:
          "The site is not using HTTPS. Browsers mark non-HTTPS sites as 'Not Secure,' which destroys visitor trust immediately.",
        severity: "high",
        category: "security-posture",
        section: "security-posture",
        businessImpact:
          "Non-HTTPS sites lose search ranking, trigger browser warnings, and cannot collect form data safely.",
        recommendation:
          "Enable HTTPS immediately via your hosting provider or a service like Cloudflare.",
        confidenceLevel: "detected",
        evidence: [
          createEvidence("security-no-https-1", "Protocol", `Site loaded over ${observation.finalUrl.split("://")[0]}`, "technical"),
        ],
        screenshots: [previewImage],
        tags: ["security", "https", "critical"],
      }),
    );
  }

  if (observation.securitySignals.length === 0) {
    findings.push(
      createFinding({
        id: "security-no-headers",
        title: "No security headers detected",
        summary:
          "The site returned no security headers (HSTS, CSP, X-Frame-Options, etc.). The server is not hardened against common web attacks.",
        severity: observation.formCount > 0 ? "high" : "medium",
        category: "security-posture",
        section: "security-posture",
        businessImpact:
          observation.formCount > 0
            ? "The site collects form data with no visible security hardening — this is a significant risk."
            : "Missing security headers leave the site vulnerable to clickjacking, XSS, and MIME sniffing attacks.",
        recommendation:
          "Add HSTS, Content-Security-Policy, X-Frame-Options, Referrer-Policy, and Permissions-Policy headers.",
        confidenceLevel: "detected",
        evidence: [
          createEvidence("security-no-headers-1", "Security headers", "None detected in HTTP response", "technical"),
        ],
        screenshots: [previewImage],
        tags: ["security", "headers"],
      }),
    );
  } else if (observation.securitySignals.length < 3) {
    findings.push(
      createFinding({
        id: "security-partial-headers",
        title: "Security headers are incomplete",
        summary: `Only ${observation.securitySignals.length} security header${observation.securitySignals.length > 1 ? "s were" : " was"} detected. A strong posture typically needs 4-6 headers.`,
        severity: "low",
        category: "security-posture",
        section: "security-posture",
        businessImpact:
          "Partial security headers leave gaps that sophisticated attackers can exploit.",
        recommendation:
          "Audit current headers and add missing ones: HSTS, CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy, X-Content-Type-Options.",
        confidenceLevel: "detected",
        evidence: observation.securitySignals.map((signal, index) =>
          createEvidence(`security-partial-${index}`, "Present header", signal, "technical"),
        ),
        screenshots: [previewImage],
        tags: ["security", "headers"],
      }),
    );
  } else {
    findings.push(
      createFinding({
        id: "security-headers-strong",
        title: "Several security headers are present",
        summary: `The HTTP response includes ${observation.securitySignals.length} common hardening signals (for example HSTS, CSP, or frame controls).`,
        severity: "low",
        category: "security-posture",
        section: "security-posture",
        businessImpact:
          "Visible header hygiene supports trust with technical buyers and reduces some common browser-level risks.",
        recommendation:
          "Keep headers current as the stack changes, and review CSP when adding third-party scripts or tags.",
        confidenceLevel: "detected",
        evidence: observation.securitySignals.map((signal, index) =>
          createEvidence(`security-strong-${index}`, "Observed header signal", signal, "technical"),
        ),
        screenshots: [previewImage],
        tags: ["security", "headers"],
      }),
    );
  }

  return findings;
}

export function buildBenchmarkReferences(profile: ReportProfileType): BenchmarkReference[] {
  return buildBenchmarkReferencesForProfile(profile);
}

export function getBenchmarkReferenceScore(reference: BenchmarkReference) {
  return reference.measuredScore ?? reference.targetScore;
}

function truncateObservationText(text: string, max: number) {
  const trimmed = text.trim();

  if (trimmed.length <= max) {
    return trimmed;
  }

  return `${trimmed.slice(0, max - 1).trim()}…`;
}

export function buildObservationClientNarratives(
  title: string,
  observation: SiteObservation,
  industryLabel: string,
  templateAudience: string,
): { observedPositioning: string; observedAudienceInference: string } {
  const meta = observation.metaDescription?.trim();
  const hero = observation.heroHeading?.trim();
  const titleLine = observation.pageTitle?.trim();

  const positioningPieces: string[] = [];

  if (meta) {
    positioningPieces.push(`Public summary line: ${truncateObservationText(meta, 320)}`);
  }

  if (hero) {
    positioningPieces.push(`Primary headline: “${truncateObservationText(hero, 180)}”`);
  }

  if (titleLine && titleLine.toLowerCase() !== hero?.toLowerCase()) {
    positioningPieces.push(`Browser title: “${truncateObservationText(titleLine, 120)}”`);
  }

  if (observation.aboutSnippet?.trim()) {
    positioningPieces.push(
      `About-style copy: ${truncateObservationText(observation.aboutSnippet.trim(), 360)}`,
    );
  }

  if (observation.notableDetails?.length) {
    positioningPieces.push(
      `Other visible cues: ${observation.notableDetails.slice(0, 4).join("; ")}`,
    );
  }

  const observedPositioning =
    positioningPieces.length > 0
      ? `${title} operates as ${industryLabel.toLowerCase()}. Taken together, how the site introduces itself suggests: ${positioningPieces.join(" ")}`
      : `${title} fits the ${industryLabel} pattern, but collected positioning copy was limited, so treat this as a structural read until more marketing text is available.`;

  const ctaHint =
    observation.primaryCtas.length > 0
      ? `Calls to action stress: ${observation.primaryCtas.slice(0, 6).join(", ")}.`
      : "";
  const trustHint =
    observation.trustSignals.length > 0
      ? `Trust language and badges highlight: ${observation.trustSignals.slice(0, 6).join(", ")}.`
      : "";
  const templateHint = observation.templateSignals?.length
    ? `Layout cues include: ${observation.templateSignals.slice(0, 3).join("; ")}.`
    : "";

  const inferenceParts = [ctaHint, trustHint, templateHint].filter(Boolean);

  const observedAudienceInference =
    inferenceParts.length > 0
      ? `On-page language points to visitors similar to: ${templateAudience} Supporting detail: ${inferenceParts.join(" ")}`
      : `Audience cues are thin. For a typical ${industryLabel.toLowerCase()} site, plan for readers much like: ${templateAudience}`;

  return { observedPositioning, observedAudienceInference };
}

export function buildObservedExecutiveSummary(
  title: string,
  observation: SiteObservation,
  overallScore: number,
  mode: "live-observed" | "fallback-estimated" | "sample-based",
) {
  const opening =
    observation.heroHeading || observation.pageTitle
      ? `${title} already communicates "${observation.heroHeading || observation.pageTitle},"`
      : `${title} already has real business substance,`;
  const specifics = uniqueTexts(
    [
      observation.aboutSnippet,
      ...observation.verifiedFacts
        .filter((fact) => fact.type !== "about")
        .map((fact) => `${fact.label}: ${fact.value}`),
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
  const confidenceFrame =
    mode === "live-observed"
      ? "This summary is based on directly observed page signals."
      : mode === "sample-based"
        ? "This summary blends observed signals with known sample profile data."
        : "This summary is estimated from heuristic fallbacks because live fetch signals were limited.";

  return `${opening} but the site can still do a better job of turning that substance into a confident first impression. ${specifics.join(" ")} ${scoreFrame} ${confidenceFrame}`.trim();
}

export function getTenOutOfTenNotes() {
  return [
    "A 10/10 is rare. It means the site is clear, distinct, fast to understand, accessible, and visibly trustworthy with almost no obvious friction.",
    "Most strong commercial sites live in the 7.5 to 9.2 range. The goal is not perfection. It is a page that feels easier to trust and easier to act on than the alternatives.",
    "The reference cards below show what a high bar looks like in practice, not an impossible standard.",
  ];
}
