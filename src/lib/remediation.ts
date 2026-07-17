import type { DimensionKey } from "@/lib/schema";

/**
 * Remediation catalog — maps each scored dimension to the concrete way to lift
 * it, and to the Brainztem offering that productizes that fix.
 *
 * SOURCE OF TRUTH for add-on ids / names / prices / targeting:
 *   Brainztem  src/lib/catalog.ts  (CATALOG[].targets)
 * Each add-on there already declares which WCS dimensions it `targets`; this
 * file is the reverse index (dimension → best-fit add-on) plus the self-serve
 * actions an owner can take directly. Keep prices in sync when they change
 * there. Prices are point-in-time; a report/pitch is a point-in-time artifact.
 *
 * The resolved recommendation is attached to each weak dimension server-side
 * (see attachRemediations) so it travels inside the report to the WCS UI and,
 * via the SP webhook, into the Strategy Presentation pitch.
 */

/** Below this score a dimension is considered "weak" and gets a remediation. */
export const REMEDIATION_THRESHOLD = 75;

export type RemediationMode = "addon" | "self_serve";

export interface AddonRef {
  /** Brainztem catalog id, e.g. "score-recovery". */
  id: string;
  name: string;
  price_usd: number;
  /** One line on how this add-on lifts this specific dimension. */
  pitch: string;
}

export interface DimensionRemediation {
  headline: string;
  /** Concrete actions the owner can take themselves, no purchase required. */
  self_serve: string[];
  mode: RemediationMode;
  /** Present when a Brainztem add-on productizes the fix. */
  addon?: AddonRef;
}

/**
 * The umbrella program for a low OVERALL score — a 90-day roadmap over the
 * three weakest dimensions, verified by monthly re-scans. Referenced by the
 * pitch when several dimensions are weak.
 */
export const SCORE_RECOVERY: AddonRef = {
  id: "score-recovery",
  name: "Score Recovery Program",
  price_usd: 1700,
  pitch: "A 90-day roadmap targeting your three weakest credit-score dimensions, verified by monthly re-scans.",
};

const REMEDIATION: Record<DimensionKey, DimensionRemediation> = {
  legitimacy: {
    headline: "Make the business unmistakably real and reachable",
    self_serve: [
      "Publish a physical address, phone, and monitored email in the site footer",
      "Add an About/Company page naming the real people behind the business",
      "Claim and complete a Google Business Profile and any relevant BBB listing",
    ],
    mode: "addon",
    addon: {
      id: "score-recovery",
      name: "Score Recovery Program",
      price_usd: 1700,
      pitch: "Targets your weakest legitimacy signals on a 90-day roadmap and re-scans monthly to prove the lift.",
    },
  },
  reputation: {
    headline: "Build and surface third-party proof",
    self_serve: [
      "Ask recent happy customers for reviews on Google and industry platforms",
      "Respond publicly to every existing review, positive or negative",
      "Add named testimonials and case studies to the site",
    ],
    mode: "addon",
    addon: {
      id: "review-engine",
      name: "Review & reputation engine",
      price_usd: 900,
      pitch: "Monitors reviews and mentions, drafts responses, and runs review-request campaigns to rebuild reputation.",
    },
  },
  visual_design: {
    headline: "Modernize the homepage so it reads as credible at a glance",
    self_serve: [
      "Refresh the homepage with a clear hierarchy, consistent brand, and real imagery",
      "Ensure the design holds up on mobile and in dark mode",
      "Replace stock/placeholder assets with genuine product and team photos",
    ],
    mode: "self_serve",
  },
  ux_conversion: {
    headline: "Remove friction between landing and taking action",
    self_serve: [
      "Make the primary call-to-action obvious above the fold on every page",
      "Cut form fields to the minimum and clarify what happens after submit",
      "Fix broken links and slow-loading pages that stall the buyer journey",
    ],
    mode: "self_serve",
  },
  transparency: {
    headline: "Publish the transparency pages buyers and procurement look for",
    self_serve: [
      "Publish a Privacy Policy and Terms of Service, linked in the footer",
      "Add clear pricing (or a transparent 'contact for pricing' with ranges)",
      "Add a refund/cancellation or SLA page, and for B2B SaaS a security/trust page, DPA, and cookie policy",
    ],
    mode: "addon",
    addon: {
      id: "score-recovery",
      name: "Score Recovery Program",
      price_usd: 1700,
      pitch: "Drafts and ships the missing pricing, refund, ToS, privacy, and trust pages, then re-scans to confirm the transparency lift.",
    },
  },
  technical: {
    headline: "Fix the technical health signals under the hood",
    self_serve: [
      "Enforce HTTPS with a valid certificate and modern TLS",
      "Add security headers (HSTS, CSP, X-Content-Type-Options)",
      "Improve Core Web Vitals — compress images, cache, and reduce blocking scripts",
    ],
    mode: "addon",
    addon: {
      id: "seo-pipeline",
      name: "SEO audit & fix pipeline",
      price_usd: 950,
      pitch: "Finds and works down technical issues — HTTPS, headers, speed, and indexation — on a prioritized queue.",
    },
  },
  content: {
    headline: "Deepen original, expert content",
    self_serve: [
      "Replace thin or AI-spun pages with original, expert-written material",
      "Add depth: guides, FAQs, and specifics only a real operator would know",
      "Publish on a consistent cadence so the site looks actively maintained",
    ],
    mode: "addon",
    addon: {
      id: "content-engine",
      name: "Weekly content engine",
      price_usd: 1200,
      pitch: "Produces drafted posts and newsletter issues on a weekly schedule, approval-gated, to build content depth.",
    },
  },
  social_presence: {
    headline: "Turn ghost profiles into a living presence",
    self_serve: [
      "Post consistently on the one or two channels your buyers actually use",
      "Link social profiles from the site and keep them current",
      "Engage — reply, share, and show real people behind the brand",
    ],
    mode: "addon",
    addon: {
      id: "outreach-engine",
      name: "Outreach engine",
      price_usd: 1500,
      pitch: "Researches prospects and drafts approval-gated outreach so your presence and engagement grow steadily.",
    },
  },
  longevity: {
    headline: "Signal staying power despite a young domain",
    self_serve: [
      "State the founding story and any prior track record explicitly",
      "Keep the site continuously live so the Wayback Machine builds history",
      "Highlight milestones, tenure, and customers served to offset domain age",
    ],
    // Domain age cannot be bought; this is inherently self-serve narrative work.
    mode: "self_serve",
  },
  financial_signals: {
    headline: "Show evidence of real financial activity and stability",
    self_serve: [
      "Publish funding, milestone, or revenue signals where appropriate",
      "Pursue press coverage of launches, raises, or notable customers",
      "Add a Crunchbase profile and keep it current",
    ],
    mode: "addon",
    addon: {
      id: "investor-pack",
      name: "Investor data-room pack",
      price_usd: 750,
      pitch: "Assembles diligence-ready materials and deck variants that signal financial credibility.",
    },
  },
};

/** For nonprofits, financial credibility is better served by the grant agent. */
const NONPROFIT_OVERRIDES: Partial<Record<DimensionKey, AddonRef>> = {
  financial_signals: {
    id: "grant-agent",
    name: "Grant research & drafting",
    price_usd: 1400,
    pitch: "Finds grant programs you qualify for and drafts the applications — the nonprofit path to financial signals.",
  },
};

/**
 * Resolve the remediation for a dimension, or null if the dimension is already
 * strong (score >= threshold). `tier` tailors add-on picks (e.g. nonprofit).
 */
export function remediationForDimension(
  key: DimensionKey,
  score: number,
  tier: "standard" | "nonprofit" = "standard",
): DimensionRemediation | null {
  if (score >= REMEDIATION_THRESHOLD) return null;
  const base = REMEDIATION[key];
  if (tier === "nonprofit" && NONPROFIT_OVERRIDES[key]) {
    return { ...base, mode: "addon", addon: NONPROFIT_OVERRIDES[key] };
  }
  return base;
}
