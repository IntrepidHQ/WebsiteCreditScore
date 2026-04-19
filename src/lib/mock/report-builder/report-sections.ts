import type {
  AuditCategoryKey,
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
  SiteObservation,
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

export function buildRebuildPhases(
  profile: ReportProfileType,
  categoryScores?: AuditCategoryScore[],
  observation?: SiteObservation,
): RebuildPhase[] {
  const profileLens =
    profile === "healthcare"
      ? "patient trust and appointment clarity"
      : profile === "local-service"
        ? "local authority and estimate conversion"
        : "product proof and demo momentum";

  const basePhases: Record<string, RebuildPhase> = {
    strategy: {
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
    "design-system": {
      id: "design-system",
      title: "Design System",
      summary:
        "Build a modular visual system that feels expensive, consistent, and ready to scale across the full site.",
      timeline: "Day 2",
      deliverables: ["Tokenized UI system", "Type and color direction", "Responsive components"],
      outcome: "A premium design language the prospect can recognize instantly.",
    },
    content: {
      id: "content",
      title: "Content / Messaging",
      summary:
        "Rewrite key pages around clarity, reassurance, and outcome-focused persuasion.",
      timeline: "Day 3",
      deliverables: ["Headline framework", "CTA ladder", "Trust and proof modules"],
      outcome: "Sharper positioning and less friction around the main conversion moments.",
    },
    development: {
      id: "development",
      title: "Development",
      summary: "Build a fast front end with deliberate motion and a cleaner content architecture.",
      timeline: "Day 4",
      deliverables: ["Responsive front-end build", "CMS-ready sections", "Quality assurance"],
      outcome: "A site that feels premium on both desktop and mobile.",
    },
    "seo-foundation": {
      id: "seo-foundation",
      title: "SEO Foundation",
      summary:
        "Restructure technical SEO and content architecture so organic traffic and conversion support each other.",
      timeline: "Day 5",
      deliverables: ["Metadata templates", "Schema opportunities", "Internal-link strategy"],
      outcome: "Better search readiness without stuffing technical work into the background.",
    },
    "launch-optimization": {
      id: "launch-optimization",
      title: "Launch / Optimization",
      summary: "Ship with confidence, then tune based on real conversion behavior.",
      timeline: "Day 6",
      deliverables: ["Launch checklist", "Analytics QA", "Optimization backlog"],
      outcome: "A launch plan that feels controlled and measurable, not risky.",
    },
  };

  // Without scoring context, fall back to the canonical order.
  if (!categoryScores) {
    return Object.values(basePhases);
  }

  // Each category's weakness surfaces one of the phases first.
  const phaseForCategory: Record<AuditCategoryKey, string> = {
    "visual-design": "design-system",
    "ux-conversion": "content",
    "mobile-experience": "development",
    "seo-readiness": "seo-foundation",
    accessibility: "development",
    "trust-credibility": "strategy",
    "security-posture": "development",
  };

  // Prioritize phases tied to the weakest categories. "strategy" always comes
  // first in practice (before build), but the phase everyone feels most urgently
  // should get the strongest summary.
  const ranked = [...categoryScores].sort((a, b) => a.score - b.score);
  const urgentPhaseIds = new Set<string>();
  for (const entry of ranked.slice(0, 3)) {
    urgentPhaseIds.add(phaseForCategory[entry.key]);
  }

  // Rewrite summaries for urgent phases so they cite the observed gap.
  const phases: RebuildPhase[] = Object.values(basePhases).map((phase) => {
    if (!urgentPhaseIds.has(phase.id)) return phase;

    const gapSummary = (() => {
      switch (phase.id) {
        case "strategy":
          return observation?.verifiedFacts.filter((f) => f.type !== "about").length === 0
            ? "Trust is the weakest category in this audit. Start by clarifying the promise and positioning real proof (reviews, credentials, verifiable contact) before any design work begins."
            : `Trust scores pulled this audit down. Start by clarifying the narrative around ${profileLens} and sequencing existing proof material so it actually reaches the conversion moment.`;
        case "design-system":
          return observation?.templateSignals.length
            ? "The current site carries detected template markers — the design-system phase starts by replacing placeholder content with a confident, business-specific visual language."
            : "Visual design scored lowest in this audit. The design-system phase becomes the biggest lever: tokenize the brand, clean typography, and remove generic framework chrome.";
        case "content":
          if (observation && observation.primaryCtas.length === 0) {
            return "There's no clear CTA on the current page. The content phase leads by defining the primary action, the proof that precedes it, and the alt path for visitors who aren't ready.";
          }
          if (observation && observation.primaryCtas.length >= 5) {
            return `The current page has ${observation.primaryCtas.length} competing CTAs. The content phase collapses the stack to one primary action, then sequences reassurance right before it.`;
          }
          return "UX/Conversion scored lowest here. The content phase rebuilds the conversion choreography: one primary ask, proof beside it, and a clear secondary path for unsure visitors.";
        case "development":
          if (observation && typeof observation.lcp === "number" && observation.lcp > 4000) {
            return `Measured mobile LCP is ${(observation.lcp / 1000).toFixed(1)}s — the development phase treats performance as a feature, not a cleanup task: preloaded hero, deferred JS, responsive images.`;
          }
          if (observation && !observation.hasViewport) {
            return "The current site has no viewport tag, so the development phase starts with mobile-first rebuild and doesn't move on until the first mobile screen is readable.";
          }
          return "Mobile and accessibility scores pulled this audit down. The development phase builds for phones first, with deliberate motion and audited focus states.";
        case "seo-foundation":
          const missing: string[] = [];
          if (observation && !observation.pageTitle) missing.push("title");
          if (observation && !observation.metaDescription) missing.push("meta description");
          if (observation && !observation.hasSchema) missing.push("structured data");
          if (observation && !observation.hasCanonical) missing.push("canonical");
          return missing.length
            ? `Core SEO signals are missing (${missing.join(", ")}). The SEO phase restores the fundamentals first, then builds supporting pages around real search intent.`
            : "Search scored lowest in this audit. The SEO phase tightens metadata templates, maps internal links to how people actually search, and expands supporting page depth.";
        default:
          return phase.summary;
      }
    })();

    return { ...phase, summary: gapSummary };
  });

  // Put urgent phases physically higher on the page (after strategy, which
  // always leads) so the sequencing matches the narrative.
  const strategy = phases.find((p) => p.id === "strategy");
  const rest = phases.filter((p) => p.id !== "strategy");
  const urgent = rest.filter((p) => urgentPhaseIds.has(p.id));
  const normal = rest.filter((p) => !urgentPhaseIds.has(p.id));
  const reordered = strategy ? [strategy, ...urgent, ...normal] : [...urgent, ...normal];

  // Keep Day labels sequential after reordering so the timeline still reads left-to-right.
  return reordered.map((phase, index) => ({ ...phase, timeline: `Day ${index + 1}` }));
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

// Opportunity generators: keyed by category, each returns an Opportunity card
// grounded in the actual observation when possible. `null` means "this category
// doesn't have enough signal to justify a card right now."
type OpportunityBuilder = (args: {
  score: number;
  observation: SiteObservation;
  profile: ReportProfileType;
  previewImage: string;
}) => Opportunity | null;

const opportunityBuilders: Record<AuditCategoryKey, OpportunityBuilder> = {
  "visual-design": ({ score, observation, profile, previewImage }) => {
    const hero = observation.heroHeading?.trim();
    const templated = observation.templateSignals.length > 0;
    const current = templated
      ? `Template markers are still visible on the page (${observation.templateSignals.slice(0, 2).join("; ")}), which instantly undercuts credibility.`
      : hero
        ? `The page opens with "${hero}," but the surrounding layout reads closer to a generic framework than a confident brand presentation.`
        : "The page has no primary heading, so visitors can't anchor on a message before they judge the site's quality.";
    const future = templated
      ? "Every placeholder is replaced with real, business-specific copy and proof before any other visual change ships."
      : "The first screen introduces a clear promise, a single dominant CTA, and enough restraint that the brand reads as intentional within a second or two.";
    return {
      id: "opp-visual",
      title: templated
        ? "Remove placeholder copy"
        : hero
          ? "First-impression reset"
          : "Add a confident top-of-page message",
      summary: templated
        ? "Replace every detected template marker with real copy, then rebuild the first screen around a clear promise and a single dominant CTA."
        : "Rebuild the first screen around a clearer promise, fewer competing elements, and proof that's visible before the visitor has to scroll.",
      impactLabel: score < 4.5 ? "Detected Issue" : "High-Leverage Upgrade",
      claim:
        profile === "healthcare"
          ? "In healthcare, the first screen sets the confidence the whole booking flow depends on."
          : profile === "local-service"
            ? "For local services, the first impression is where credibility versus 'yet another site' gets decided."
            : "A stronger first screen reframes the business as more capable before the prospect even reads the offer.",
      confidenceLevel: templated || !hero ? "high" : "medium",
      sourceLabel: templated ? "Detected template signal" : "Visual Design heuristic",
      benchmarkType: "recommendation",
      notes: hero ?? "No H1 observed on the page.",
      synergy: ["copywriting", "base-rebuild"],
      currentState: current,
      futureState: future,
      previewImage,
    };
  },
  "ux-conversion": ({ score, observation, previewImage }) => {
    const ctaCount = observation.primaryCtas.length;
    const formCount = observation.formCount;
    const current = ctaCount === 0
      ? "There's no recognizable call to action on the page, so visitors land with nowhere specific to go."
      : ctaCount >= 5
        ? `The page has ${ctaCount} competing CTAs (${observation.primaryCtas.slice(0, 3).join(", ")}…). Everything feels important, so nothing actually is.`
        : `The current conversion path leans on ${observation.primaryCtas.slice(0, 2).join(" and ")}, but the sequencing around it doesn't build enough trust before the ask.`;
    const future = ctaCount === 0
      ? "One primary CTA earns the top slot with clear action language, and a secondary path handles visitors who aren't ready yet."
      : ctaCount >= 5
        ? "One primary CTA becomes visually dominant; the rest are demoted or merged so there's a single obvious next step."
        : "The primary CTA is framed by proof and reassurance right before it, so the click feels like the logical next step, not a leap.";
    return {
      id: "opp-ux",
      title: ctaCount === 0
        ? "Add a clear primary CTA"
        : ctaCount >= 5
          ? "Collapse competing CTAs"
          : "Tighten the conversion path",
      summary:
        formCount === 0 && ctaCount === 0
          ? "There's no way to convert on the current page — add at least one form and one primary CTA, then sequence proof around them."
          : "Sequence proof before the ask and reduce competing actions so the primary CTA becomes the obvious next step.",
      impactLabel: score < 4.5 ? "Detected Issue" : "High-Leverage Upgrade",
      claim: "The goal is not more buttons. It's clearer commitment choreography.",
      confidenceLevel: ctaCount === 0 || ctaCount >= 5 ? "high" : "medium",
      sourceLabel: "Observed CTA inventory",
      benchmarkType: "recommendation",
      notes: ctaCount
        ? `Observed CTAs: ${observation.primaryCtas.slice(0, 4).join(", ")}.`
        : "No CTA language detected on the page.",
      synergy: ["booking-funnel", "analytics"],
      currentState: current,
      futureState: future,
      previewImage,
    };
  },
  "mobile-experience": ({ score, observation, previewImage }) => {
    const lcpSec =
      typeof observation.lcp === "number" ? (observation.lcp / 1000).toFixed(1) : null;
    const hasViewport = observation.hasViewport;
    if (hasViewport && score >= 7 && !lcpSec) {
      // Mobile is already strong and we have no perf data to complain about.
      return null;
    }
    const current = !hasViewport
      ? "No responsive viewport tag is present, so the site almost certainly renders at desktop width on phones."
      : lcpSec && Number(lcpSec) > 4
        ? `Mobile LCP lands at ${lcpSec}s — the hero takes long enough to appear that many visitors leave before it does.`
        : "Mobile layout responds, but the sequence of content and CTAs doesn't match how phone traffic actually reads the page.";
    const future = !hasViewport
      ? "A viewport tag is added and the first mobile screen is built around one clear message, one CTA, and readable type."
      : "Hero media is compressed and preloaded, non-critical JS is deferred, and the mobile flow leads with the same promise as desktop in half the scroll depth."
    return {
      id: "opp-mobile",
      title: !hasViewport
        ? "Fix mobile rendering"
        : lcpSec && Number(lcpSec) > 4
          ? "Speed up the mobile hero"
          : "Restructure the mobile flow",
      summary:
        lcpSec && Number(lcpSec) > 4
          ? `Cut LCP from ${lcpSec}s toward 2.5s by preloading the hero image, deferring non-critical scripts, and trimming the mobile above-the-fold.`
          : "Rebuild the mobile experience around shorter sections, stronger spacing, and a single clear CTA path.",
      impactLabel: score < 4.5 ? "Detected Issue" : "High-Leverage Upgrade",
      claim: "Mobile is where most visitors decide — the site's mobile read defines the brand now.",
      confidenceLevel: lcpSec || !hasViewport ? "high" : "medium",
      sourceLabel: lcpSec ? "Google PageSpeed" : "Mobile Experience heuristic",
      benchmarkType: "recommendation",
      notes: lcpSec ? `Measured LCP ${lcpSec}s on mobile.` : "HTML-only mobile signals.",
      synergy: ["accessibility-speed", "full-site"],
      currentState: current,
      futureState: future,
      previewImage,
    };
  },
  "seo-readiness": ({ score, observation, previewImage }) => {
    const missing: string[] = [];
    if (!observation.pageTitle) missing.push("a title tag");
    if (!observation.metaDescription) missing.push("a meta description");
    if (!observation.hasCanonical) missing.push("a canonical link");
    if (!observation.hasSchema) missing.push("structured data (schema.org)");
    if (observation.internalLinkCount < 5) missing.push("meaningful internal linking");
    const current = missing.length
      ? `Core SEO signals are incomplete: ${missing.slice(0, 3).join(", ")}.`
      : "Basic SEO signals are present, but the content depth and internal link structure aren't yet earning ranked real estate.";
    const future = missing.length
      ? `Every missing signal is added — ${missing.slice(0, 3).join(", ")} — with templates that scale to new pages.`
      : "Supporting pages expand around high-intent search, metadata is tightened per page, and internal links form clear topic clusters.";
    return {
      id: "opp-seo",
      title: missing.length ? "Fix SEO fundamentals" : "Build search depth",
      summary:
        missing.length
          ? `Restore the missing SEO fundamentals: ${missing.slice(0, 3).join(", ")}. Then map the internal link structure to how people actually search for this business.`
          : "Expand supporting pages around real search intent and tighten per-page metadata so the site earns more than just brand traffic.",
      impactLabel: score < 4.5 ? "Detected Issue" : "Strategic Recommendation",
      claim: "Structure is not just SEO plumbing — it's how search engines justify showing this site over a competitor's.",
      confidenceLevel: missing.length ? "high" : "medium",
      sourceLabel: "Technical SEO observation",
      benchmarkType: "benchmark",
      notes: missing.length
        ? `Missing: ${missing.join(", ")}.`
        : `Internal links detected: ${observation.internalLinkCount}.`,
      synergy: ["search-foundation", "local-seo-pages"],
      currentState: current,
      futureState: future,
      previewImage,
    };
  },
  "trust-credibility": ({ score, observation, previewImage }) => {
    const verifiedContacts = observation.verifiedFacts.filter(
      (f) => f.type === "phone" || f.type === "email" || f.type === "address",
    );
    const current = verifiedContacts.length === 0
      ? "No phone, email, or address was detected on the page. Visitors have no easy way to confirm the business is real."
      : observation.trustSignals.length === 0
        ? `Contact details are present (${verifiedContacts.map((f) => f.label).join(", ")}), but proof material — reviews, credentials, case studies — isn't visible near the ask.`
        : "Real trust material exists on the page, but it sits in the wrong place to actually influence the conversion moment.";
    const future = verifiedContacts.length === 0
      ? "Phone, email, and address are published in the header, footer, and near every CTA — with one click to dial or open directions."
      : "Reviews, credentials, and testimonials sit directly beside the primary CTA so the decision feels lower-risk in the moment.";
    return {
      id: "opp-trust",
      title: verifiedContacts.length === 0 ? "Make the business verifiable" : "Bring proof next to the ask",
      summary: "Move proof and verified contact info as close to the conversion moments as possible, not just the footer.",
      impactLabel: score < 4.5 ? "Detected Issue" : "High-Leverage Upgrade",
      claim: "Trust is not a page — it's a position. Proof beside the ask changes conversion more than proof on a separate page.",
      confidenceLevel: verifiedContacts.length === 0 ? "high" : "medium",
      sourceLabel: "Trust / Credibility observation",
      benchmarkType: "recommendation",
      notes: `Verified contacts: ${verifiedContacts.length}. Trust signals: ${observation.trustSignals.length}.`,
      synergy: ["copywriting", "base-rebuild"],
      currentState: current,
      futureState: future,
      previewImage,
    };
  },
  accessibility: ({ score, observation, previewImage }) => {
    const altPct = Math.round(observation.missingAltRatio * 100);
    if (score >= 7 && altPct < 20 && observation.hasLang && observation.hasViewport) {
      return null;
    }
    const gaps: string[] = [];
    if (!observation.hasLang) gaps.push("no lang attribute on <html>");
    if (!observation.hasViewport) gaps.push("no viewport tag");
    if (altPct >= 20) gaps.push(`${altPct}% of images missing alt text`);
    const current = gaps.length
      ? `Accessibility basics are incomplete: ${gaps.join(", ")}.`
      : "Structural accessibility is decent, but contrast, focus states, and semantic heading order aren't yet audited.";
    const future = "Alt text, language, focus states, and heading order pass a basic accessibility audit, which also tends to lift SEO and mobile usability.";
    return {
      id: "opp-accessibility",
      title: gaps.length ? "Fix accessibility basics" : "Run a semantic a11y pass",
      summary: gaps.length
        ? `Restore accessibility basics: ${gaps.join(", ")}. Then audit contrast and focus states.`
        : "Audit contrast, alt text, focus states, and heading order so the page becomes easier to use for everyone.",
      impactLabel: score < 4.5 ? "Detected Issue" : "Best Practice",
      claim: "Accessibility gaps usually point at the same friction sighted users feel — just more visibly.",
      confidenceLevel: gaps.length ? "high" : "medium",
      sourceLabel: "Accessibility observation",
      benchmarkType: "recommendation",
      notes: gaps.length ? gaps.join("; ") : "Run contrast + keyboard nav audit.",
      synergy: ["accessibility-speed", "full-site"],
      currentState: current,
      futureState: future,
      previewImage,
    };
  },
  "security-posture": ({ score, observation, previewImage }) => {
    if (observation.finalUrl.startsWith("https://") && observation.securitySignals.length >= 3) {
      // Already solid — don't crowd the opportunity list with a security card.
      return null;
    }
    const current = !observation.finalUrl.startsWith("https://")
      ? "The site is not served over HTTPS — browsers flag it as 'Not Secure,' which destroys trust before any other signal loads."
      : observation.securitySignals.length === 0
        ? "No hardening headers (HSTS, CSP, X-Frame-Options) were returned. Forms on this page are collecting data with no visible security posture."
        : `Only ${observation.securitySignals.length} hardening header${observation.securitySignals.length > 1 ? "s were" : " was"} detected — a strong posture typically needs 4–6.`;
    const future = "HTTPS is enforced, and the response carries a full set of modern hardening headers (HSTS, CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy).";
    return {
      id: "opp-security",
      title: !observation.finalUrl.startsWith("https://") ? "Move to HTTPS immediately" : "Add security headers",
      summary: "Enforce HTTPS and add the modern hardening headers a technical buyer expects to see on the first response.",
      impactLabel: score < 4.5 ? "Detected Issue" : "Strategic Recommendation",
      claim: "Security headers are a 10-minute infra change that shows up as lower risk to every technical visitor.",
      confidenceLevel: "high",
      sourceLabel: "HTTP response inspection",
      benchmarkType: "platform-observation",
      notes: observation.securitySignals.length
        ? `Present: ${observation.securitySignals.slice(0, 4).join(", ")}.`
        : "No security headers detected.",
      synergy: ["accessibility-speed"],
      currentState: current,
      futureState: future,
      previewImage,
    };
  },
};

export function buildOpportunities(
  profile: ReportProfileType,
  previewSet: AuditReport["previewSet"],
  categoryScores?: AuditCategoryScore[],
  observation?: SiteObservation,
): Opportunity[] {
  const previewImage = previewSet.future.desktop;

  // Fallback when called without observation/score context (e.g. older tests).
  if (!categoryScores || !observation) {
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
        claim:
          "A stronger first screen reframes the entire business as more capable and more intentional.",
        confidenceLevel: "high",
        sourceLabel: "Heuristic presentation layer",
        benchmarkType: "recommendation",
        notes: lens,
        synergy: ["copywriting", "base-rebuild"],
        currentState:
          "Current layout asks visitors to decode the message before they feel momentum.",
        futureState:
          "Proposed layout makes the value and next step obvious in under a few seconds.",
        previewImage,
      },
    ];
  }

  // Sort categories by score ascending. Use weight as a tiebreaker so
  // high-weight categories (ux-conversion, trust-credibility) bubble up.
  const ranked = [...categoryScores].sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    return (b.weight ?? 1) - (a.weight ?? 1);
  });

  const opportunities: Opportunity[] = [];
  const seen = new Set<string>();

  for (const entry of ranked) {
    const builder = opportunityBuilders[entry.key];
    if (!builder) continue;
    const card = builder({
      score: entry.score,
      observation,
      profile,
      previewImage,
    });
    if (!card || seen.has(card.id)) continue;
    opportunities.push(card);
    seen.add(card.id);
    if (opportunities.length >= 4) break;
  }

  // Guarantee at least 3 cards so the section never looks thin: pad with
  // the next-ranked builders even if they returned null above (by relaxing).
  if (opportunities.length < 3) {
    for (const entry of ranked) {
      if (opportunities.length >= 3) break;
      const builder = opportunityBuilders[entry.key];
      if (!builder) continue;
      const card = builder({
        score: entry.score,
        observation,
        profile,
        previewImage,
      });
      if (!card) continue;
      if (seen.has(card.id)) continue;
      opportunities.push(card);
      seen.add(card.id);
    }
  }

  return opportunities;
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
      label: "Request 15-min call",
      description: "Opens a short form — we reply with a calendar link within one business day.",
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
