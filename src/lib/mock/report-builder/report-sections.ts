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
