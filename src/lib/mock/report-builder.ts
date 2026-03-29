import type {
  AuditCategoryKey,
  AuditCategoryScore,
  AuditReport,
  Benchmark,
  BenchmarkReference,
  ClientProfile,
  CompetitorSnapshot,
  Finding,
  Opportunity,
  PricingBundle,
  PricingItem,
  ProposalCTA,
  RebuildPhase,
  ReportProfileType,
  RoiScenarioDefaults,
  SiteObservation,
} from "@/lib/types/audit";
import {
  buildBenchmarkReferences,
  getBenchmarkReferenceScore,
  buildObservedCategoryScores,
  buildObservedExecutiveSummary,
  buildObservedFindings,
} from "@/lib/mock/report-enhancements";
import {
  measureBenchmarkReferences,
  rankMeasuredBenchmarkReferences,
} from "@/lib/benchmarks/scans";
import { sampleAudits } from "@/lib/mock/sample-audits";
import { generateOutreachEmail } from "@/lib/utils/outreach";
import { createDefaultProposalOffer } from "@/lib/utils/proposal-offers";
import { calculatePricingSummary, getDefaultSelectedIds } from "@/lib/utils/pricing";
import { aggregateOverallScore, clampScore } from "@/lib/utils/scores";
import {
  createFallbackObservation,
  inspectWebsite,
} from "@/lib/utils/site-observation";
import {
  createWebsiteScreenshotUrl,
  formatDomainTitle,
  inferProfileType,
  normalizeUrl,
  slugFromUrl,
} from "@/lib/utils/url";

const categoryLabels: Record<AuditCategoryKey, string> = {
  "visual-design": "Visual Design",
  "ux-conversion": "UX / Conversion",
  "mobile-experience": "Mobile Experience",
  "seo-readiness": "SEO Readiness",
  accessibility: "Accessibility",
  "trust-credibility": "Trust / Credibility",
  "security-posture": "Security Posture",
};

const profileClientProfiles: Record<
  ReportProfileType,
  Omit<ClientProfile, "competitors">
> = {
  healthcare: {
    type: "healthcare",
    industryLabel: "Healthcare Provider",
    audience: "Patients comparing local care options and booking windows.",
    primaryGoal: "Increase appointment requests without sacrificing trust.",
    trustDrivers: [
      "Provider credibility",
      "Insurance clarity",
      "Patient-friendly mobile intake",
    ],
  },
  "local-service": {
    type: "local-service",
    industryLabel: "Local Service Business",
    audience: "Homeowners who need fast reassurance before they call.",
    primaryGoal: "Convert more local intent into booked estimates.",
    trustDrivers: [
      "Local proof",
      "Fast contact paths",
      "Visible process and guarantees",
    ],
  },
  saas: {
    type: "saas",
    industryLabel: "B2B SaaS",
    audience: "Buyers evaluating product fit, proof, and time-to-value.",
    primaryGoal: "Turn more curious traffic into qualified demos.",
    trustDrivers: [
      "Outcome-led messaging",
      "Product proof",
      "Clear next-step commitment",
    ],
  },
};

const comparisonMetrics = [
  { id: "clarity", label: "Message Clarity" },
  { id: "trust", label: "Trust Depth" },
  { id: "mobile", label: "Mobile Polish" },
  { id: "seo", label: "Search Coverage" },
] as const;

function deriveComparisonMetrics(categoryScores: AuditCategoryScore[]) {
  const scoreMap = Object.fromEntries(
    categoryScores.map((score) => [score.key, score.score]),
  ) as Record<AuditCategoryKey, number>;

  return [
    {
      ...comparisonMetrics[0],
      value: Math.round(((scoreMap["visual-design"] + scoreMap["ux-conversion"]) / 2) * 10),
      format: "percent" as const,
    },
    {
      ...comparisonMetrics[1],
      value: Math.round(scoreMap["trust-credibility"] * 10),
      format: "percent" as const,
    },
    {
      ...comparisonMetrics[2],
      value: Math.round(scoreMap["mobile-experience"] * 10),
      format: "percent" as const,
    },
    {
      ...comparisonMetrics[3],
      value: Math.round(scoreMap["seo-readiness"] * 10),
      format: "percent" as const,
    },
  ];
}

function domainHash(input: string) {
  return [...input].reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

export function selectBenchmarkReferencesForReport(
  currentUrl: string,
  currentOverallScore: number,
  references: BenchmarkReference[],
) {
  return rankMeasuredBenchmarkReferences(currentUrl, currentOverallScore, references).slice(0, 3);
}

async function enrichBenchmarkReferences(
  currentUrl: string,
  currentOverallScore: number,
  profile: ReportProfileType,
) {
  const { references } = await measureBenchmarkReferences(profile);

  return selectBenchmarkReferencesForReport(currentUrl, currentOverallScore, references);
}

function makeBenchmark(
  id: string,
  claim: string,
  impactLabel: Benchmark["impactLabel"],
  notes: string,
  sourceLabel = "Industry benchmark",
): Benchmark {
  return {
    id,
    claim,
    confidenceLevel: impactLabel === "Detected Issue" ? "high" : "medium",
    sourceLabel,
    benchmarkType:
      impactLabel === "Detected Issue"
        ? "platform-observation"
        : impactLabel === "Strategic Recommendation"
          ? "recommendation"
          : "benchmark",
    notes,
    synergy: [],
    impactLabel,
  };
}

function makeFinding(
  finding: Omit<Finding, "benchmark" | "screenshots"> & {
    benchmark: Array<{
      id: string;
      claim: string;
      impactLabel: Benchmark["impactLabel"];
      notes: string;
      sourceLabel?: string;
    }>;
  },
  screenshot: string,
): Finding {
  return {
    ...finding,
    benchmark: finding.benchmark.map((entry) =>
      makeBenchmark(
        entry.id,
        entry.claim,
        entry.impactLabel,
        entry.notes,
        entry.sourceLabel,
      ),
    ),
    screenshots: [screenshot],
  };
}

function buildCategoryScores(
  profile: ReportProfileType,
  normalizedUrl: string,
  scoreOverrides?: Partial<Record<AuditCategoryKey, number>>,
): AuditCategoryScore[] {
  const bases: Record<ReportProfileType, Record<AuditCategoryKey, number>> = {
    healthcare: {
      "visual-design": 6.1,
      "ux-conversion": 4.8,
      "mobile-experience": 4.7,
      "seo-readiness": 5.5,
      accessibility: 5.4,
      "trust-credibility": 6.9,
      "security-posture": 5.9,
    },
    "local-service": {
      "visual-design": 4.9,
      "ux-conversion": 4.4,
      "mobile-experience": 4.3,
      "seo-readiness": 5.7,
      accessibility: 4.7,
      "trust-credibility": 5.4,
      "security-posture": 5.2,
    },
    saas: {
      "visual-design": 7.1,
      "ux-conversion": 5.2,
      "mobile-experience": 5.8,
      "seo-readiness": 5.1,
      accessibility: 5.9,
      "trust-credibility": 5.1,
      "security-posture": 5.8,
    },
  };

  const summaries: Record<AuditCategoryKey, string> = {
    "visual-design": "Strong first impression matters because prospects judge competence before they read.",
    "ux-conversion": "Calls to action, page flow, and form friction are directly shaping lead volume.",
    "mobile-experience": "Most first visits now happen on smaller screens, where clarity drops fastest.",
    "seo-readiness": "Search visibility depends on clear structure, metadata, and page depth.",
    accessibility: "Readable contrast, structure, and usable controls reduce friction for every visitor.",
    "trust-credibility": "Proof, process, and reassurance make high-value decisions feel lower risk.",
    "security-posture": "Observable hardening signals influence trust and reduce avoidable risk indicators.",
  };

  const hashOffset = (domainHash(normalizedUrl) % 7) / 10 - 0.3;
  const detailMap: Record<AuditCategoryKey, string[]> = {
    "visual-design": [
      "Measured against hierarchy, spacing consistency, and visual confidence on first impression.",
      "Looks at whether the page feels custom and intentional versus generic or outdated.",
      "Drops when layout density, inconsistent components, or weak emphasis dilute trust.",
    ],
    "ux-conversion": [
      "Measures how clearly the page leads toward the next step.",
      "Looks for CTA clarity, friction in forms, and whether proof appears before the ask.",
      "Drops when the user has to interpret too many competing actions.",
    ],
    "mobile-experience": [
      "Measures whether the core message and CTA stay usable on smaller screens.",
      "Looks at hierarchy, touch comfort, and how quickly the next step becomes obvious.",
      "Drops when forms, proof, or navigation feel crowded on mobile.",
    ],
    "seo-readiness": [
      "Measures whether structure, metadata, and page depth can support discoverability.",
      "Looks at whether high-intent topics likely have dedicated, well-structured pages.",
      "Drops when the site appears thin on supporting pages, schema, or internal linking.",
    ],
    accessibility: [
      "Measures clarity of contrast, page structure, and general usability.",
      "Looks for readable hierarchy and fewer avoidable interaction barriers.",
      "Drops when dense layouts or weak contrast likely reduce comprehension.",
    ],
    "trust-credibility": [
      "Measures how much confidence the page earns before it asks for commitment.",
      "Looks for proof, process, reassurance, and audience-specific credibility cues.",
      "Drops when trust signals are present but not placed where they matter most.",
    ],
    "security-posture": [
      "Measures observable trust and hardening indicators rather than hidden vulnerabilities.",
      "Looks for HTTPS, form reassurance, and signals of operational maturity.",
      "Drops when visible safety and professionalism cues feel incomplete.",
    ],
  };

  return (Object.keys(categoryLabels) as AuditCategoryKey[]).map((key) => ({
    key,
    label: categoryLabels[key],
    score: clampScore(scoreOverrides?.[key] ?? bases[profile][key] + hashOffset),
    summary: summaries[key],
    weight:
      key === "ux-conversion" || key === "trust-credibility" ? 1.25 : 1,
    details: detailMap[key],
  }));
}

function buildFindings(
  profile: ReportProfileType,
  title: string,
  preview: string,
): Finding[] {
  switch (profile) {
    case "healthcare":
      return [
        makeFinding(
          {
            id: "provider-trust",
            type: "positive",
            title: "Provider identity is visible early",
            summary:
              "The page clearly shows the physician name, specialty, and contact context, which gives visitors something concrete to trust.",
            severity: "low",
            category: "trust-credibility",
            section: "what-working",
            businessImpact:
              "The redesign can build on real provider signals instead of manufacturing credibility from scratch.",
            recommendation:
              "Keep the provider proof, then package it with a stronger bio, clearer credentials, and more deliberate trust placement.",
            confidenceLevel: "detected",
            evidence: [
              {
                id: "bio-grid",
                label: "Visible physician metadata",
                detail: "The page exposes the doctor name, specialty, phone number, and location details.",
                kind: "trust",
              },
            ],
            benchmark: [
              {
                id: "trust-anchor",
                claim: "Trust content already exists, so the redesign can sharpen it rather than invent it.",
                impactLabel: "Best Practice",
                notes: "Existing credibility assets lower rewrite risk.",
              },
            ],
            tags: ["trust", "bios", "reviews"],
          },
          preview,
        ),
        makeFinding(
          {
            id: "hero-overload",
            type: "issue",
            title: "The first screen still looks like a provider template",
            summary:
              "The opening view reads as a stock provider-page shell before it reads as a distinct local practice.",
            severity: "high",
            category: "visual-design",
            section: "costing-leads",
            businessImpact:
              "Patients make fast trust judgments. Template cues can reduce confidence before anyone reads the details.",
            recommendation:
              "Replace the stock presentation with a clearer brand hierarchy, a stronger primary action, and more intentional provider imagery.",
            confidenceLevel: "detected",
            evidence: [
              {
                id: "default-avatar",
                label: "Default profile image still visible",
                detail: "The page still shows a generic provider avatar rather than a real portrait.",
                kind: "content",
              },
              {
                id: "template-cues",
                label: "Generic layout cues remain visible",
                detail:
                  "The opening structure and supporting modules still read like a shared provider template rather than a distinct local practice.",
                kind: "visual",
              },
            ],
            benchmark: [
              {
                id: "hero-clarity",
                claim: "Distinct local branding matters more when the underlying platform feels templated.",
                impactLabel: "High-Leverage Upgrade",
                notes: "A stronger top section can improve trust without changing the useful physician metadata underneath.",
              },
            ],
            tags: ["hero", "template", "visual"],
          },
          preview,
        ),
        makeFinding(
          {
            id: "intake-mobile",
            type: "issue",
            title: "Quick-link navigation fragments the next step on smaller screens",
            summary:
              "Appointments, credentials, insurances, locations, and connection links all compete at once before one clear action wins.",
            severity: "high",
            category: "mobile-experience",
            section: "costing-leads",
            businessImpact:
              "Patients on phones need a fast path to the right action. Too many equal-weight options slows decision-making.",
            recommendation:
              "Prioritize one dominant appointment path, then demote secondary links into a calmer supporting structure.",
            confidenceLevel: "inferred",
            evidence: [
              {
                id: "quick-links",
                label: "Many top-level actions are shown together",
                detail: "Appointments, credentials, insurances, locations, and connect links all surface with similar visual weight.",
                kind: "visual",
              },
            ],
            benchmark: [
              {
                id: "form-trust",
                claim: "Healthcare mobile flows work better when the next step is obvious before the supporting details expand.",
                impactLabel: "Strategic Recommendation",
                notes: "Keep the useful supporting links, but stop asking them to share primary attention with the booking path.",
              },
            ],
            tags: ["mobile", "navigation", "cta"],
          },
          preview,
        ),
        makeFinding(
          {
            id: "metadata-duplication",
            type: "technical",
            title: "Metadata depth appears thin for location and service intent",
            summary:
              "The page title carries useful physician information, but the overall content structure still looks shallow for long-tail care searches.",
            severity: "medium",
            category: "seo-readiness",
            section: "technical-seo",
            businessImpact:
              "This limits how confidently the site can rank for differentiated care searches in-market.",
            recommendation:
              "Rewrite metadata templates, reinforce heading structure, and expand page-level internal linking around service intent.",
            confidenceLevel: "inferred",
            evidence: [
              {
                id: "service-coverage",
                label: "Single-profile structure is doing most of the work",
                detail: "Observed structure appears to rely on one provider page more than a fuller set of service, insurance, and FAQ pages.",
                kind: "technical",
              },
            ],
            benchmark: [
              {
                id: "local-health-seo",
                claim: "Local healthcare visibility improves when services, locations, and FAQs are clearly segmented.",
                impactLabel: "Best Practice",
                notes: "Schema and page architecture should reinforce patient intent, not just brand presence.",
              },
            ],
            tags: ["seo", "metadata", "schema"],
          },
          preview,
        ),
        makeFinding(
          {
            id: "headers-risk",
            type: "security",
            title: "Security posture is adequate, but the trust layer is under-signaled",
            summary:
              "HTTPS is present, yet visible privacy and response-handling reassurance still feels light.",
            severity: "medium",
            category: "security-posture",
            section: "security-posture",
            businessImpact:
              "Patients submitting sensitive details are more cautious when the page does not proactively explain safety and privacy handling.",
            recommendation:
              "Add privacy reassurance near forms, tighten header coverage, and review outdated plugin or theme dependencies if applicable.",
            confidenceLevel: "recommended",
            evidence: [
              {
                id: "https",
                label: "HTTPS detected",
                detail: "Transport security appears active.",
                kind: "technical",
              },
              {
                id: "form-reassurance",
                label: "Privacy reassurance is not prominent",
                detail: "The page does not clearly explain how inquiries are handled or what patients should expect next.",
                kind: "trust",
              },
            ],
            benchmark: [
              {
                id: "hardening-opportunity",
                claim: "Visible hardening and reassurance cues improve confidence without using alarmist language.",
                impactLabel: "Strategic Recommendation",
                notes: "Frame this as a trust and hardening upgrade, not a fear tactic.",
              },
            ],
            tags: ["security-posture", "forms", "trust"],
          },
          preview,
        ),
      ];
    case "local-service":
      return [
        makeFinding(
          {
            id: "phone-visibility",
            type: "positive",
            title: "The page already carries real-world business proof",
            summary:
              "The business story, owner name, address, phone, email, and hours are all visible, which creates a credible foundation.",
            severity: "low",
            category: "trust-credibility",
            section: "what-working",
            businessImpact:
              "There is enough local credibility to turn the redesign into an authority move rather than a cosmetic one.",
            recommendation:
              "Keep the real contact detail and owner-led tone, then pair it with a tighter conversion path and stronger project proof.",
            confidenceLevel: "detected",
            evidence: [
              {
                id: "phone-cta",
                label: "Detailed business information is published",
                detail: "The page includes the Mount Pleasant address, office phone, office email, and weekday hours.",
                kind: "trust",
              },
            ],
            benchmark: [
              {
                id: "service-trust",
                claim: "Local service sites benefit when fast access is paired with stronger trust architecture.",
                impactLabel: "Best Practice",
                notes: "The foundation is there, but it needs cleaner hierarchy.",
              },
            ],
            tags: ["phone", "local", "credibility"],
          },
          preview,
        ),
        makeFinding(
          {
            id: "generic-hero",
            type: "issue",
            title: "The page asks visitors to read before it asks them to act",
            summary:
              "The About page leads with long narrative blocks, so the conversion path arrives later than it should.",
            severity: "high",
            category: "ux-conversion",
            section: "costing-leads",
            businessImpact:
              "Interested visitors may leave with a good impression of the craft, but without a strong reason to take the next step right now.",
            recommendation:
              "Condense the story, elevate the primary CTA sooner, and add a tighter summary of what happens when someone reaches out.",
            confidenceLevel: "detected",
            evidence: [
              {
                id: "long-copy",
                label: "Long narrative blocks dominate the page",
                detail: "The page leans on a long company story before it creates a clearer action path.",
                kind: "content",
              },
            ],
            benchmark: [
              {
                id: "hero-locality",
                claim: "Local service pages convert better when story, proof, and next step are kept in tighter sequence.",
                impactLabel: "High-Leverage Upgrade",
                notes: "This can stay personal without making the visitor work so hard to find the CTA.",
              },
            ],
            tags: ["story", "cta", "conversion"],
          },
          preview,
        ),
        makeFinding(
          {
            id: "service-area-depth",
            type: "issue",
            title: "Authority is present, but service proof is not packaged tightly enough",
            summary:
              "The business feels experienced, but the page does not quickly convert that experience into project proof, service detail, and a stronger conversion cue.",
            severity: "high",
            category: "visual-design",
            section: "costing-leads",
            businessImpact:
              "Custom work buyers want to see craftsmanship, process, and confidence quickly, especially on mobile.",
            recommendation:
              "Pair the owner story with a project gallery, service highlights, and a more immediate consultation path.",
            confidenceLevel: "inferred",
            evidence: [
              {
                id: "location-depth",
                label: "Proof is not leading the page",
                detail: "The About page emphasizes narrative more than visible examples of finished work or process steps.",
                kind: "visual",
              },
            ],
            benchmark: [
              {
                id: "service-area-upgrade",
                claim: "Craft and service businesses usually win faster when proof and process sit closer to the contact ask.",
                impactLabel: "Strategic Recommendation",
                notes: "That improves both credibility and the speed of decision-making.",
              },
            ],
            tags: ["proof", "process", "visual"],
          },
          preview,
        ),
        makeFinding(
          {
            id: "form-urgency",
            type: "technical",
            title: "Local search structure has room to work harder",
            summary:
              "The About page publishes strong local signals, but there is still room for more service-specific and search-targeted page depth.",
            severity: "medium",
            category: "seo-readiness",
            section: "technical-seo",
            businessImpact:
              "That limits how much search intent can be captured before prospects ever reach the contact page.",
            recommendation:
              "Add service pages, project-specific proof, and tighter internal linking around the highest-value search intents.",
            confidenceLevel: "inferred",
            evidence: [
              {
                id: "local-signals",
                label: "Contact and location detail are already present",
                detail: "The page has local business data, but the wider page architecture can still do more to support search capture.",
                kind: "technical",
              },
            ],
            benchmark: [
              {
                id: "estimate-flow",
                claim: "Local SEO performs better when business detail is backed by dedicated service and proof pages.",
                impactLabel: "Best Practice",
                notes: "The raw trust signals are there. The structure around them is what needs expanding.",
              },
            ],
            tags: ["local-seo", "service-pages", "content"],
          },
          preview,
        ),
        makeFinding(
          {
            id: "headers-and-stack",
            type: "security",
            title: "The site looks safe enough, but observable hardening is still lightweight",
            summary:
              "Trust is being asked for before the site fully signals professionalism around forms and configuration hygiene.",
            severity: "medium",
            category: "security-posture",
            section: "security-posture",
            businessImpact:
              "For homeowners comparing several providers, weak professionalism cues can subtly lower inquiry confidence.",
            recommendation:
              "Review security headers, tighten inquiry-form language, and add calm reassurance around privacy and response expectations.",
            confidenceLevel: "recommended",
            evidence: [
              {
                id: "https-visible",
                label: "HTTPS observed",
                detail: "Transport encryption appears active.",
                kind: "technical",
              },
              {
                id: "trust-copy",
                label: "Minimal trust language near forms",
                detail: "Form areas do not clearly explain privacy, response, or expected next steps.",
                kind: "trust",
              },
            ],
            benchmark: [
              {
                id: "posture-note",
                claim: "Security posture should be communicated calmly as professionalism, not fear.",
                impactLabel: "Strategic Recommendation",
                notes: "The goal is to raise confidence, not dramatize risk.",
              },
            ],
            tags: ["security-posture", "trust", "forms"],
          },
          preview,
        ),
      ];
    default:
      return [
        makeFinding(
          {
            id: "visual-polish",
            type: "positive",
            title: "The offer is already more specific than a generic marketing site",
            summary:
              "The page makes it clear that the product is for provider pages, reviews, scheduling, and telehealth-oriented workflows.",
            severity: "low",
            category: "visual-design",
            section: "what-working",
            businessImpact:
              "The redesign can preserve the modern feel while making the narrative sharper and more persuasive.",
            recommendation:
              "Keep the category specificity, then simplify the narrative so the package and next step are easier to understand.",
            confidenceLevel: "detected",
            evidence: [
              {
                id: "modern-ui",
                label: "Offer scope is explicit",
                detail: "The homepage description references provider pages, patient reviews, scheduling, chat, telehealth, and email integrations.",
                kind: "content",
              },
            ],
            benchmark: [
              {
                id: "modern-brand",
                claim: "A credible baseline lowers redesign risk because refinement can focus on conversion, not rescue.",
                impactLabel: "Best Practice",
                notes: "Treat this as an upgrade story, not a from-scratch rescue.",
              },
            ],
            tags: ["brand", "visual", "baseline"],
          },
          preview,
        ),
        makeFinding(
          {
            id: "cta-mismatch",
            type: "issue",
            title: "The page stacks too many claims before it clarifies the package",
            summary:
              "The offer is visible, but the visitor has to sort through a lot of ranking and feature language before the buying path feels simple.",
            severity: "high",
            category: "ux-conversion",
            section: "costing-leads",
            businessImpact:
              "When the CTA ladder is ambiguous, more demo-ready visitors stay in research mode.",
            recommendation:
              "Reduce the claim density, show clearer package framing, and make one primary action do most of the work.",
            confidenceLevel: "detected",
            evidence: [
              {
                id: "competing-actions",
                label: "Claim-heavy opening sequence",
                detail: "The site leans on ranking and category claims before it simplifies what to do next.",
                kind: "content",
              },
            ],
            benchmark: [
              {
                id: "cta-sequencing",
                claim: "The strongest SaaS landing pages reduce decision spread by sequencing proof before commitment.",
                impactLabel: "High-Leverage Upgrade",
                notes: "CTA clarity is often a multiplier on existing traffic.",
              },
            ],
            tags: ["cta", "narrative", "conversion"],
          },
          preview,
        ),
        makeFinding(
          {
            id: "proof-depth",
            type: "issue",
            title: "The core CTA is strong, but the surrounding proof can be cleaner",
            summary:
              "A direct CTA is present, but the page would feel more credible with cleaner comparisons, simpler proof, and a more obvious decision path.",
            severity: "medium",
            category: "trust-credibility",
            section: "costing-leads",
            businessImpact:
              "B2B buyers need more evidence density before they commit to a demo or pricing conversation.",
            recommendation:
              "Support the main CTA with clearer examples, stronger proof structure, and more direct explanation of what is included.",
            confidenceLevel: "inferred",
            evidence: [
              {
                id: "proof-placement",
                label: "CTA clarity outruns proof clarity",
                detail: "The action language is stronger than the surrounding explanation of package depth and fit.",
                kind: "trust",
              },
            ],
            benchmark: [
              {
                id: "proof-layering",
                claim: "Trust rises faster when logos, quotes, product proof, and outcomes reinforce each other.",
                impactLabel: "Strategic Recommendation",
                notes: "The site should make confidence cumulative, not optional.",
              },
            ],
            tags: ["proof", "demo", "saaS"],
          },
          preview,
        ),
        makeFinding(
          {
            id: "seo-coverage",
            type: "technical",
            title: "Search architecture is likely missing bottom-funnel depth",
            summary:
              "The site appears optimized for brand storytelling more than for category-specific, comparison, or use-case capture.",
            severity: "medium",
            category: "seo-readiness",
            section: "technical-seo",
            businessImpact:
              "That leaves lower-cost acquisition and buyer-intent education underdeveloped.",
            recommendation:
              "Expand use-case, comparison, FAQ, and integration pages while tightening metadata and internal link strategy.",
            confidenceLevel: "inferred",
            evidence: [
              {
                id: "page-depth",
                label: "Thin bottom-funnel page depth",
                detail: "Observed structure suggests more opportunity pages could support SEO and conversion intent.",
                kind: "technical",
              },
            ],
            benchmark: [
              {
                id: "content-depth",
                claim: "The strongest SaaS sites turn educational depth into sales qualification, not just search traffic.",
                impactLabel: "Best Practice",
                notes: "This supports both SEO and pipeline quality.",
              },
            ],
            tags: ["seo", "content", "bottom-funnel"],
          },
          preview,
        ),
        makeFinding(
          {
            id: "posture-signals",
            type: "security",
            title: "Security posture appears standard, but buyer reassurance is still incomplete",
            summary:
              "Observable configuration looks acceptable, yet the site misses chances to proactively lower buyer risk perception.",
            severity: "medium",
            category: "security-posture",
            section: "security-posture",
            businessImpact:
              "SaaS buyers often use security cues as a proxy for operational maturity before they ever talk to sales.",
            recommendation:
              "Strengthen trust messaging around compliance, data handling, and security hardening without shifting into alarmist language.",
            confidenceLevel: "recommended",
            evidence: [
              {
                id: "https-saas",
                label: "HTTPS detected",
                detail: "Transport security appears active across the primary site.",
                kind: "technical",
              },
              {
                id: "trust-signals",
                label: "Security reassurance is light",
                detail: "The marketing site does not yet foreground enough maturity cues for cautious buyers.",
                kind: "trust",
              },
            ],
            benchmark: [
              {
                id: "security-maturity",
                claim: "Security posture messaging should support trust and procurement confidence, not fear.",
                impactLabel: "Strategic Recommendation",
                notes: "Simple visible cues can reduce perceived buying risk.",
              },
            ],
            tags: ["security-posture", "trust", "compliance"],
          },
          preview,
        ),
      ];
  }
}

function buildCompetitors(
  currentSite: {
    name: string;
    url: string;
    previewImage: string;
    note: string;
  },
  categoryScores: AuditCategoryScore[],
  overallScore: number,
  benchmarkReferences: BenchmarkReference[],
): CompetitorSnapshot[] {
  return [
    {
      id: "your-site",
      name: currentSite.name,
      relationship: "your-site",
      url: currentSite.url,
      previewImage: currentSite.previewImage,
      note: currentSite.note,
      overallScore,
      metrics: deriveComparisonMetrics(categoryScores),
    },
    ...benchmarkReferences.map((site) => {
      const fallbackScore = getBenchmarkReferenceScore(site);
      const metrics = site.measuredCategoryScores
        ? deriveComparisonMetrics(site.measuredCategoryScores)
        : [
            {
              ...comparisonMetrics[0],
              value: Math.round(
                (site.strengths.includes("visual-design") ||
                site.strengths.includes("ux-conversion")
                  ? fallbackScore
                  : fallbackScore - 0.9) * 10,
              ),
              format: "percent" as const,
            },
            {
              ...comparisonMetrics[1],
              value: Math.round(
                (site.strengths.includes("trust-credibility")
                  ? fallbackScore
                  : fallbackScore - 1) * 10,
              ),
              format: "percent" as const,
            },
            {
              ...comparisonMetrics[2],
              value: Math.round(
                (site.strengths.includes("mobile-experience")
                  ? fallbackScore
                  : fallbackScore - 0.8) * 10,
              ),
              format: "percent" as const,
            },
            {
              ...comparisonMetrics[3],
              value: Math.round(
                (site.strengths.includes("seo-readiness")
                  ? fallbackScore
                  : fallbackScore - 1.1) * 10,
              ),
              format: "percent" as const,
            },
          ];

      return {
        id: site.id,
        name: site.name,
        relationship: "reference" as const,
        url: site.url,
        previewImage: site.previewImage,
        note: site.note,
        overallScore: fallbackScore,
        metrics,
      };
    }),
  ];
}

function buildRebuildPhases(profile: ReportProfileType): RebuildPhase[] {
  const profileLens =
    profile === "healthcare"
      ? "patient trust and appointment clarity"
      : profile === "local-service"
        ? "local authority and estimate conversion"
        : "product proof and demo momentum";

  return [
    {
      id: "strategy",
      title: "Strategy",
      summary: `Clarify the core narrative around ${profileLens} before a single screen is redesigned.`,
      timeline: "Week 1",
      deliverables: [
        "Stakeholder workshop",
        "Offer and audience positioning",
        "Conversion-path audit",
      ],
      outcome: "A tighter message hierarchy that removes guesswork from the redesign.",
    },
    {
      id: "design-system",
      title: "Design System",
      summary:
        "Build a modular visual system that feels expensive, consistent, and ready to scale across the full site.",
      timeline: "Week 2",
      deliverables: [
        "Tokenized UI system",
        "Type and color direction",
        "Responsive components",
      ],
      outcome: "A premium design language the prospect can recognize instantly.",
    },
    {
      id: "content",
      title: "Content / Messaging",
      summary:
        "Rewrite key pages around clarity, reassurance, and outcome-focused persuasion.",
      timeline: "Week 2-3",
      deliverables: [
        "Headline framework",
        "CTA ladder",
        "Trust and proof modules",
      ],
      outcome: "Sharper positioning and less friction around the main conversion moments.",
    },
    {
      id: "development",
      title: "Development",
      summary:
        "Build a fast, modern front end with thoughtful animation and a cleaner content architecture.",
      timeline: "Week 3-4",
      deliverables: [
        "Responsive front-end build",
        "CMS-ready sections",
        "Quality assurance",
      ],
      outcome: "A site that feels premium on both desktop and mobile.",
    },
    {
      id: "seo-foundation",
      title: "SEO Foundation",
      summary:
        "Restructure technical SEO and content architecture so organic traffic and conversion support each other.",
      timeline: "Week 4",
      deliverables: [
        "Metadata templates",
        "Schema opportunities",
        "Internal-link strategy",
      ],
      outcome: "Better search readiness without stuffing technical work into the background.",
    },
    {
      id: "launch-optimization",
      title: "Launch / Optimization",
      summary:
        "Ship with confidence, then tune based on conversion behavior instead of assumptions.",
      timeline: "Week 5+",
      deliverables: [
        "Launch checklist",
        "Analytics QA",
        "Optimization backlog",
      ],
      outcome: "A launch plan that feels controlled and measurable, not risky.",
    },
  ];
}

function createCatalog(): PricingBundle {
  const baseItem: PricingItem = {
    id: "base-rebuild",
    title: "Strategic Website Rebuild",
    description:
      "Core strategy, homepage redesign, responsive component foundation, and launch-ready polish.",
    price: 4200,
    defaultSelected: true,
    impactLevel: "core",
    sourceLabel: "Calibrated SMB redesign baseline",
    synergyWith: [],
    category: "base",
    deliverables: [
      "Strategy sprint",
      "Homepage redesign",
      "Responsive build system",
      "Baseline search + QA setup",
      "Launch checklist",
    ],
    benchmarkNote:
      "This anchors the redesign around clarity, trust, and a visibly better first impression.",
    estimatedLiftLabel: "Core lift in clarity, trust, and conversion readiness",
    estimatedScoreLift: 3.1,
    liftFocus: ["visual-design", "ux-conversion", "trust-credibility", "mobile-experience"],
  };

  const addOns: PricingItem[] = [
    {
      id: "full-site",
      title: "Full Site Rebuild",
      description:
        "Extend the new system across service, pricing, about, and key funnel pages.",
      price: 2200,
      defaultSelected: false,
      impactLevel: "transformative",
      sourceLabel: "Scaled implementation scope",
      synergyWith: ["local-seo-pages", "search-foundation", "copywriting"],
      category: "build",
      deliverables: ["Up to 6 high-value pages", "Reusable layouts", "QA pass"],
      benchmarkNote: "Best when the goal is a true perception reset, not patching.",
      estimatedLiftLabel: "Site-wide lift in consistency, trust, and conversion coverage",
      estimatedScoreLift: 1.4,
      liftFocus: ["visual-design", "ux-conversion", "seo-readiness", "trust-credibility"],
    },
    {
      id: "mobile-ux",
      title: "Mobile UX Optimization",
      description:
        "Focused mobile conversion pass with touch-target, form, and hierarchy improvements.",
      price: 850,
      defaultSelected: false,
      impactLevel: "high",
      sourceLabel: "Observed friction point",
      synergyWith: ["booking-funnel", "accessibility-speed"],
      category: "ux",
      deliverables: ["Mobile flow audit", "Responsive refinements", "Form tuning"],
      benchmarkNote: "Small-screen clarity often pays back fast.",
      estimatedLiftLabel: "Lower mobile friction and better completion rates",
      estimatedScoreLift: 0.7,
      liftFocus: ["mobile-experience", "ux-conversion", "accessibility"],
    },
    {
      id: "booking-funnel",
      title: "Booking / Lead Funnel Redesign",
      description:
        "Rebuild the primary inquiry flow around reassurance, speed, and staged commitment.",
      price: 1100,
      defaultSelected: false,
      impactLevel: "transformative",
      sourceLabel: "Conversion benchmark",
      synergyWith: ["analytics", "copywriting", "lead-follow-up"],
      category: "conversion",
      deliverables: ["Form redesign", "Follow-up flow", "CTA alignment"],
      benchmarkNote: "High leverage when the current path feels heavy or vague.",
      estimatedLiftLabel: "More qualified leads from the same traffic",
      estimatedScoreLift: 0.9,
      liftFocus: ["ux-conversion", "trust-credibility", "mobile-experience"],
    },
    {
      id: "local-seo-pages",
      title: "Local SEO Pages",
      description:
        "Location or service-area pages built to support both search intent and conversion trust.",
      price: 1200,
      defaultSelected: false,
      impactLevel: "high",
      sourceLabel: "Search opportunity",
      synergyWith: ["search-foundation", "full-site"],
      category: "seo",
      deliverables: ["3 location pages", "Template structure", "Internal-link map"],
      benchmarkNote: "Turns service coverage into visible demand capture.",
      estimatedLiftLabel: "Improved local visibility and page-specific trust",
      estimatedScoreLift: 0.6,
      liftFocus: ["seo-readiness", "trust-credibility"],
    },
    {
      id: "search-foundation",
      title: "Search Foundation",
      description:
        "Metadata, headings, schema, and internal search-readiness cleanup in one pass.",
      price: 950,
      defaultSelected: false,
      impactLevel: "high",
      sourceLabel: "SEO readiness review",
      synergyWith: ["local-seo-pages", "full-site", "speed"],
      category: "seo",
      deliverables: ["Metadata framework", "Heading cleanup", "Schema mapping"],
      benchmarkNote: "Supports both ranking health and clearer information architecture.",
      estimatedLiftLabel: "Stronger indexability and cleaner search presentation",
      estimatedScoreLift: 0.7,
      liftFocus: ["seo-readiness", "accessibility"],
    },
    {
      id: "accessibility-speed",
      title: "Accessibility + Speed QA",
      description:
        "Polish the primary pages with contrast, focus, image, and performance cleanup that visitors actually feel.",
      price: 950,
      defaultSelected: false,
      impactLevel: "high",
      sourceLabel: "Quality review",
      synergyWith: ["mobile-ux", "search-foundation"],
      category: "quality",
      deliverables: ["Contrast + focus pass", "Image/performance tuning", "Core QA cleanup"],
      benchmarkNote: "Improves polish in the places visitors notice immediately.",
      estimatedLiftLabel: "Cleaner usability and faster perceived load",
      estimatedScoreLift: 0.6,
      liftFocus: ["accessibility", "mobile-experience", "seo-readiness"],
    },
    {
      id: "analytics",
      title: "Analytics + Event Tracking",
      description:
        "Measure scroll depth, CTA engagement, form progression, and key conversion events.",
      price: 650,
      defaultSelected: false,
      impactLevel: "core",
      sourceLabel: "Optimization plan",
      synergyWith: ["booking-funnel", "cro"],
      category: "data",
      deliverables: ["Event plan", "Tracking setup", "Dashboard spec"],
      benchmarkNote: "What gets measured can actually be optimized after launch.",
      estimatedLiftLabel: "Faster post-launch decision quality",
      estimatedScoreLift: 0.3,
      liftFocus: ["ux-conversion"],
    },
    {
      id: "copywriting",
      title: "Copywriting + Messaging Rewrite",
      description:
        "Rewrite key sections around differentiation, proof, and lower-friction calls to action.",
      price: 1250,
      defaultSelected: false,
      impactLevel: "transformative",
      sourceLabel: "Messaging review",
      synergyWith: ["booking-funnel", "full-site"],
      category: "content",
      deliverables: ["Headline system", "Proof messaging", "CTA rewrite"],
      benchmarkNote: "Usually the difference between attractive and persuasive.",
      estimatedLiftLabel: "Sharper value communication and better lead quality",
      estimatedScoreLift: 0.8,
      liftFocus: ["ux-conversion", "trust-credibility", "visual-design"],
    },
    {
      id: "lead-follow-up",
      title: "Lead Follow-Up Automation",
      description:
        "Connect forms to cleaner routing, follow-up automation, and faster response handling.",
      price: 900,
      defaultSelected: false,
      impactLevel: "high",
      sourceLabel: "Operational fit",
      synergyWith: ["booking-funnel", "analytics"],
      category: "operations",
      deliverables: ["CRM mapping", "Lead routing", "Follow-up sequence"],
      benchmarkNote: "Prevents better leads from entering a weaker handoff system.",
      estimatedLiftLabel: "Better follow-up speed and less lead leakage",
      estimatedScoreLift: 0.5,
      liftFocus: ["ux-conversion", "trust-credibility"],
    },
    {
      id: "speed",
      title: "Speed Optimization",
      description:
        "Performance pass for assets, layout stability, and perceived load speed.",
      price: 800,
      defaultSelected: false,
      impactLevel: "high",
      sourceLabel: "Performance review",
      synergyWith: ["search-foundation", "mobile-ux"],
      category: "quality",
      deliverables: ["Performance audit", "Asset optimization", "Load tuning"],
      benchmarkNote: "Speed supports both trust and mobile usability.",
      estimatedLiftLabel: "Stronger first impression and lower bounce risk",
      estimatedScoreLift: 0.5,
      liftFocus: ["mobile-experience", "seo-readiness", "trust-credibility"],
    },
    {
      id: "cro",
      title: "Ongoing CRO Testing",
      description:
        "Structured post-launch testing cadence for CTAs, proof, layouts, and offer framing.",
      price: 850,
      defaultSelected: false,
      impactLevel: "transformative",
      sourceLabel: "Optimization plan",
      synergyWith: ["analytics", "booking-funnel", "copywriting"],
      category: "optimization",
      deliverables: ["90-day testing plan", "Hypothesis backlog", "Reporting format"],
      benchmarkNote: "Best when the site becomes a growth channel, not just a brochure.",
      estimatedLiftLabel: "Compounded conversion improvements over time",
      estimatedScoreLift: 0.6,
      liftFocus: ["ux-conversion", "trust-credibility"],
    },
  ];

  return {
    baseItem,
    addOns,
    recommendedIds: [baseItem.id],
    stickyNote:
      "Start with the rebuild that visibly changes the score, then add only the upgrades that match the sales goal.",
  };
}

function buildOpportunities(
  profile: ReportProfileType,
  previewSet: AuditReport["previewSet"],
): Opportunity[] {
  const lens =
    profile === "healthcare"
      ? "Reduce anxiety and guide patients into confident booking."
      : profile === "local-service"
        ? "Make local authority and fast response impossible to miss."
        : "Turn product interest into a sharper, proof-led conversion story.";

  return [
    {
      id: "before-after-1",
      title: "First-impression reset",
      summary:
        "Replace the current blended opening with a clear premium promise, grounded proof, and a single dominant CTA.",
      impactLabel: "High-Leverage Upgrade",
      claim: "A stronger first screen reframes the entire business as more capable and more intentional.",
      confidenceLevel: "high",
      sourceLabel: "Heuristic presentation layer",
      benchmarkType: "recommendation",
      notes: lens,
      synergy: ["copywriting", "base-rebuild"],
      currentState: "Current layout asks visitors to decode the message before they feel momentum.",
      futureState: "Proposed layout makes the value and next step obvious in under a few seconds.",
      previewImage: previewSet.future.desktop,
    },
    {
      id: "before-after-2",
      title: "CTA flow redesign",
      summary:
        "Sequence reassurance before the ask so the final call to action feels lower-risk and more natural.",
      impactLabel: "Strategic Recommendation",
      claim: "The goal is not more buttons. It is clearer commitment choreography.",
      confidenceLevel: "medium",
      sourceLabel: "Conversion framework",
      benchmarkType: "recommendation",
      notes: "Match the CTA to visitor intent at each stage instead of repeating the same ask.",
      synergy: ["booking-funnel", "analytics"],
      currentState: "Calls to action compete with one another or ask for too much context too soon.",
      futureState: "Each section naturally earns the next step and keeps momentum intact.",
      previewImage: previewSet.future.desktop,
    },
    {
      id: "before-after-3",
      title: "Information architecture upgrade",
      summary:
        "Organize the site around the pages people actually need to trust, compare, and commit.",
      impactLabel: "Best Practice",
      claim: "Structure is not just SEO plumbing. It is persuasion architecture.",
      confidenceLevel: "medium",
      sourceLabel: "Site architecture review",
      benchmarkType: "benchmark",
      notes: "Better content hierarchy improves both usability and discoverability.",
      synergy: ["search-foundation", "local-seo-pages", "full-site"],
      currentState: "Important details are present, but spread too thinly or buried too deep.",
      futureState: "High-intent pages become clearer, easier to navigate, and more obviously valuable.",
      previewImage: previewSet.future.desktop,
    },
    {
      id: "before-after-4",
      title: "Design system direction",
      summary:
        "Give the brand a more intentional visual language with premium spacing, stronger type, and modular UI patterns.",
      impactLabel: "High-Leverage Upgrade",
      claim: "This is the moment where the site starts to feel clearly premium.",
      confidenceLevel: "high",
      sourceLabel: "Design direction",
      benchmarkType: "recommendation",
      notes: "A system-level uplift improves perception across every page, not just the homepage.",
      synergy: ["base-rebuild", "full-site", "accessibility-speed"],
      currentState: "The current interface works, but it does not fully communicate premium confidence.",
      futureState: "The redesign feels custom, modern, and aligned with the quality of the offer.",
      previewImage: previewSet.future.desktop,
    },
  ];
}

function buildProposalCtas(normalizedUrl: string): ProposalCTA[] {
  return [
    {
      id: "build",
      label: "Build My New Site",
      description: "Start scoping the redesign package with the current selections.",
      intent: "primary",
      href: `mailto:?subject=Website%20review%20for%20${encodeURIComponent(normalizedUrl)}`,
    },
    {
      id: "book",
      label: "Book Strategy Call",
      description: "Review priorities, timing, and what we would tackle first.",
      intent: "secondary",
    },
    {
      id: "share",
      label: "Share Report",
      description: "Copy a clean presentation link to send internally or to the client.",
      intent: "utility",
    },
  ];
}

function buildSocialProof() {
  return [];
}

function buildRoiDefaults(profile: ReportProfileType): RoiScenarioDefaults {
  switch (profile) {
    case "healthcare":
      return { monthlyLeadGain: 12, leadToClientRate: 24, averageClientValue: 850 };
    case "local-service":
      return { monthlyLeadGain: 10, leadToClientRate: 18, averageClientValue: 4200 };
    default:
      return { monthlyLeadGain: 8, leadToClientRate: 14, averageClientValue: 7200 };
  }
}

function getPreviewSet(profile: ReportProfileType): AuditReport["previewSet"] {
  const currentFallback =
    profile === "healthcare"
      ? "/previews/healthcare-current.svg"
      : profile === "local-service"
        ? "/previews/service-current.svg"
        : "/previews/saas-current.svg";
  const futureFallback =
    profile === "healthcare"
      ? "/previews/healthcare-future.svg"
      : profile === "local-service"
        ? "/previews/service-future.svg"
        : "/previews/saas-future.svg";

  if (profile === "healthcare") {
    return {
      current: {
        desktop: currentFallback,
        mobile: currentFallback,
      },
      future: {
        desktop: futureFallback,
        mobile: futureFallback,
      },
      fallbackCurrent: {
        desktop: "",
        mobile: "",
      },
      fallbackFuture: {
        desktop: futureFallback,
        mobile: futureFallback,
      },
      mobileLabel: "Mobile",
      desktopLabel: "Desktop",
    };
  }

  if (profile === "local-service") {
    return {
      current: {
        desktop: currentFallback,
        mobile: currentFallback,
      },
      future: {
        desktop: futureFallback,
        mobile: futureFallback,
      },
      fallbackCurrent: {
        desktop: "",
        mobile: "",
      },
      fallbackFuture: {
        desktop: futureFallback,
        mobile: futureFallback,
      },
      mobileLabel: "Mobile",
      desktopLabel: "Desktop",
    };
  }

  return {
    current: {
      desktop: currentFallback,
      mobile: currentFallback,
    },
    future: {
      desktop: futureFallback,
      mobile: futureFallback,
    },
    fallbackCurrent: {
      desktop: "",
      mobile: "",
    },
    fallbackFuture: {
      desktop: futureFallback,
      mobile: futureFallback,
    },
    mobileLabel: "Mobile",
    desktopLabel: "Desktop",
  };
}

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

export async function buildLiveAuditReportFromUrl(rawUrl: string): Promise<AuditReport> {
  const normalizedUrl = normalizeUrl(rawUrl);
  const observation = await inspectWebsite(normalizedUrl);
  const report = buildAuditReportFromUrl(rawUrl, observation);

  return enrichReportBenchmarks(report);
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
  const title = deriveReportTitle(normalizedUrl, sample, observation);
  const previewSet = getPreviewSet(profile);
  const previewUrl = sample?.previewUrl ?? rawUrl;
  const livePreviewDesktop = createWebsiteScreenshotUrl(previewUrl, "desktop");
  const livePreviewMobile = createWebsiteScreenshotUrl(previewUrl, "mobile");
  const currentPreviewImage =
    observation.fetchSucceeded || !sample?.previewImage
      ? livePreviewDesktop
      : sample.previewImage;
  const livePreviewSet = {
    ...previewSet,
    current: {
      desktop: currentPreviewImage,
      mobile: observation.fetchSucceeded ? livePreviewMobile : livePreviewDesktop,
    },
    future: previewSet.future,
    fallbackCurrent: {
      desktop: observation.ogImage ?? sample?.fallbackPreviewImage ?? previewSet.fallbackCurrent.desktop,
      mobile: observation.ogImage ?? sample?.fallbackPreviewImage ?? previewSet.fallbackCurrent.mobile,
    },
    fallbackFuture: previewSet.fallbackFuture,
  };
  const categoryScores = observation.fetchSucceeded
    ? buildObservedCategoryScores(profile, observation, sample?.scoreOverrides)
    : buildCategoryScores(profile, normalizedUrl, sample?.scoreOverrides);
  const reportId = sample?.id ?? slugFromUrl(normalizedUrl);
  const hostname = new URL(normalizedUrl).hostname;
  const overallScore = aggregateOverallScore(categoryScores);
  const benchmarkReferences = selectBenchmarkReferencesForReport(
    normalizedUrl,
    overallScore,
    buildBenchmarkReferences(profile),
  );
  const findings = observation.fetchSucceeded
    ? buildObservedFindings(profile, title, observation, categoryScores, livePreviewSet.current.desktop)
    : buildFindings(profile, title, livePreviewSet.current.desktop);
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
    benchmarkReferences,
  );
  const proposalCtas = buildProposalCtas(normalizedUrl);
  const socialProof = buildSocialProof();
  const roiDefaults = buildRoiDefaults(profile);
  const clientProfile = {
    ...profileClientProfiles[profile],
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
      buildObservedExecutiveSummary(title, observation, overallScore),
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
  };

  report.outreachEmail = generateOutreachEmail(report);

  return report;
}

async function enrichReportBenchmarks(report: AuditReport): Promise<AuditReport> {
  const measuredBenchmarkReferences = await enrichBenchmarkReferences(
    report.normalizedUrl,
    report.overallScore,
    report.clientProfile.type,
  );
  const currentSnapshot = report.competitorSnapshots.find(
    (snapshot) => snapshot.relationship === "your-site",
  );

  return {
    ...report,
    benchmarkReferences: measuredBenchmarkReferences,
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
      measuredBenchmarkReferences,
    ),
    clientProfile: {
      ...report.clientProfile,
      competitors: measuredBenchmarkReferences.map((item) => item.name),
    },
  };
}

export function getSampleAuditCards() {
  return sampleAudits.map((sample) => ({
    ...sample,
    previewImage: createWebsiteScreenshotUrl(sample.previewUrl ?? sample.url, "desktop"),
    score: buildAuditReport(sample.url, sample).overallScore,
  }));
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

  const observation = await inspectWebsite(sample.url);
  const report = buildAuditReport(sample.url, sample, observation);

  return enrichReportBenchmarks(report);
}
