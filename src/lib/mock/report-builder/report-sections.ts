import type {
  AuditCategoryScore,
  AuditReport,
  BenchmarkReference,
  CompetitorSnapshot,
  Opportunity,
  PricingBundle,
  PricingItem,
  ProposalCTA,
  RebuildPhase,
  ReportProfileType,
  RoiScenarioDefaults,
} from "@/lib/types/audit";
import { getBenchmarkReferenceScore } from "@/lib/mock/report-enhancements";
import { comparisonMetrics } from "./constants";
import { deriveComparisonMetrics } from "./metrics";

export function buildCompetitors(
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

export function buildRebuildPhases(profile: ReportProfileType): RebuildPhase[] {
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
      timeline: "Day 1",
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
      timeline: "Day 2",
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
      timeline: "Day 3",
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
      summary: "Build a fast front end with deliberate motion and a cleaner content architecture.",
      timeline: "Day 4",
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
      timeline: "Day 5",
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
      summary: "Ship with confidence, then tune based on real conversion behavior.",
      timeline: "Day 6",
      deliverables: [
        "Launch checklist",
        "Analytics QA",
        "Optimization backlog",
      ],
      outcome: "A launch plan that feels controlled and measurable, not risky.",
    },
  ];
}

export function createCatalog(): PricingBundle {
  const baseItem: PricingItem = {
    id: "digital-audit-included",
    title: "Live scan & scored credit report",
    description:
      "Weighted crawl score, category breakdown, benchmarks, and workspace-ready exports — the same artifact that anchors the DIY flow before optional human help.",
    price: 0,
    defaultSelected: true,
    impactLevel: "core",
    sourceLabel: "Included with every audit run",
    synergyWith: [],
    category: "base",
    deliverables: [
      "Live crawl and scoring rubric",
      "Benchmark and competitive context",
      "Workspace storage for the saved report",
      "Path to the free build prompt when you are ready to ship with AI tools",
    ],
    benchmarkNote:
      "Orientation first: understand where the site stands and what would move the needle before you fund build work.",
    estimatedLiftLabel: "Foundational clarity before spend lands on implementation",
    estimatedScoreLift: 0.35,
    liftFocus: ["ux-conversion", "trust-credibility", "seo-readiness"],
  };

  const addOns: PricingItem[] = [
    {
      id: "expanded-audit-brief",
      title: "Expanded audit + brief",
      description:
        "A stakeholder-ready write-up that turns the score into decisions: prioritized fixes, positioning notes, and a sprint-sized checklist. Typically lands in the free–$200 range depending on depth.",
      price: 150,
      defaultSelected: false,
      impactLevel: "high",
      sourceLabel: "Audit + brief tier",
      synergyWith: ["ai-assisted-handoff"],
      category: "strategy",
      deliverables: [
        "Findings ordered by revenue risk",
        "Copy-ready positioning notes",
        "Implementation checklist for the next sprint",
      ],
      benchmarkNote: "Best when you need sign-off material, not just a scorecard.",
      estimatedLiftLabel: "Faster alignment on what actually changes first",
      estimatedScoreLift: 0.45,
      liftFocus: ["ux-conversion", "trust-credibility"],
    },
    {
      id: "ai-assisted-handoff",
      title: "AI-assisted build supervision & handoff",
      description:
        "We stay in the loop while you ship with modern AI builders: scope guardrails, async review, prompt hygiene, and launch readiness. Most SMB engagements land around $1.5k–$2.5k.",
      price: 2000,
      defaultSelected: false,
      impactLevel: "transformative",
      sourceLabel: "DIY + guardrails tier",
      synergyWith: ["expanded-audit-brief"],
      category: "build",
      deliverables: [
        "Office hours on generated UI and component choices",
        "Risk pass on performance, accessibility, and SEO foot-guns",
        "Launch checklist sized for Stripe-friendly project totals",
      ],
      benchmarkNote: "You keep momentum from AI-assisted delivery; we keep blind spots visible.",
      estimatedLiftLabel: "Higher confidence on a fast build without gambling the brand",
      estimatedScoreLift: 1.1,
      liftFocus: ["visual-design", "accessibility", "mobile-experience"],
    },
    {
      id: "white-glove-build",
      title: "Full white-glove implementation",
      description:
        "Human-led execution from system design through QA and launch. Many SMB scopes land around $3.5k–$5k — roughly what 40–60 productive hours costs at $100–$150/hr.",
      price: 4200,
      defaultSelected: false,
      impactLevel: "transformative",
      sourceLabel: "Hands-on delivery tier",
      synergyWith: [],
      category: "build",
      deliverables: [
        "Design system + component build-out",
        "Primary funnel pages refreshed end-to-end",
        "Accessibility, performance, and analytics QA",
        "Launch checklist with rollback plan",
      ],
      benchmarkNote: "Choose this when the business cannot afford a quiet failure at launch.",
      estimatedLiftLabel: "Material jump in trust and conversion-ready polish",
      estimatedScoreLift: 1.6,
      liftFocus: ["visual-design", "ux-conversion", "trust-credibility", "mobile-experience"],
    },
  ];

  return {
    baseItem,
    addOns,
    recommendedIds: [baseItem.id, "expanded-audit-brief"],
    stickyNote:
      "Totals are planning anchors — not a fixed quote until scope is approved. AI-assisted supervision and white-glove delivery are alternatives; pick the tier that matches risk, timeline, and budget (most production paths here stay under $10K through Stripe).",
  };
}

export function buildOpportunities(
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

export function buildProposalCtas(normalizedUrl: string): ProposalCTA[] {
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

export function buildSocialProof() {
  return [];
}

export function buildRoiDefaults(profile: ReportProfileType): RoiScenarioDefaults {
  switch (profile) {
    case "healthcare":
      return { monthlyLeadGain: 12, leadToClientRate: 24, averageClientValue: 850 };
    case "local-service":
      return { monthlyLeadGain: 10, leadToClientRate: 18, averageClientValue: 4200 };
    default:
      return { monthlyLeadGain: 8, leadToClientRate: 14, averageClientValue: 7200 };
  }
}

export function getPreviewSet(profile: ReportProfileType): AuditReport["previewSet"] {
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

  // All profiles share the same structure; currentFallback is the static SVG that shows
  // whenever a live screenshot hasn't been captured yet (or failed).
  return {
    current: {
      desktop: currentFallback,
      mobile: currentFallback,
    },
    future: {
      desktop: futureFallback,
      mobile: futureFallback,
    },
    // Point fallbackCurrent at the profile SVG (not empty string) so PreviewImage
    // always has a valid second-chance asset when the live screenshot request fails.
    fallbackCurrent: {
      desktop: currentFallback,
      mobile: currentFallback,
    },
    fallbackFuture: {
      desktop: futureFallback,
      mobile: futureFallback,
    },
    mobileLabel: "Mobile",
    desktopLabel: "Desktop",
  };
}
