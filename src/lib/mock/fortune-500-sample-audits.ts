import type { AuditCategoryKey, ReportProfileType, SampleAuditCard } from "@/lib/types/audit";
import { createWebsiteScreenshotUrl } from "@/lib/utils/url";

type FortuneRow = {
  id: string;
  title: string;
  url: string;
  profile: ReportProfileType;
  summary: string;
  executiveSummary: string;
  highlights: string[];
  scannedAt: string;
  scoreOverrides: Partial<Record<AuditCategoryKey, number>>;
};

const mk = (row: FortuneRow): SampleAuditCard => ({
  id: row.id,
  title: row.title,
  url: row.url,
  previewUrl: row.url,
  profile: row.profile,
  summary: row.summary,
  scannedAt: row.scannedAt,
  previewImage: createWebsiteScreenshotUrl(row.url, "desktop"),
  executiveSummary: row.executiveSummary,
  highlights: row.highlights,
  scoreOverrides: row.scoreOverrides,
});

/**
 * Twenty representative Fortune 500–scale homepages for marketing demos.
 * Scores are illustrative sample rubric values (not live crawl scores).
 * Hero selection on the homepage picks the highest overall among this pool.
 */
const FORTUNE_ROWS: FortuneRow[] = [
  {
    id: "f500-walmart",
    title: "Walmart",
    url: "https://www.walmart.com",
    profile: "local-service",
    summary: "Commerce giant with dense navigation — clarity competes with breadth at the top of the funnel.",
    executiveSummary:
      "Walmart’s homepage is built for discovery and repeat visits. The tradeoff is obvious: breadth can dilute the first-screen story unless hierarchy stays ruthless.",
    highlights: [
      "Category-first navigation and search are unmistakably primary.",
      "Promotions rotate quickly, so trust depends on stable chrome and predictable wayfinding.",
      "Mobile density is high — small targets and competing modules add friction for some visitors.",
    ],
    scannedAt: new Date("2026-04-01T10:05:00-04:00").toISOString(),
    scoreOverrides: {
      "visual-design": 7.4,
      "ux-conversion": 7.1,
      "mobile-experience": 7.0,
      "seo-readiness": 8.0,
      accessibility: 6.9,
      "trust-credibility": 7.8,
      "security-posture": 8.2,
    },
  },
  {
    id: "f500-amazon",
    title: "Amazon",
    url: "https://www.amazon.com",
    profile: "saas",
    summary: "Relentless optimization culture shows up as tight modules — still busy, but intentionally so.",
    executiveSummary:
      "Amazon’s homepage is a conversion laboratory: modules repeat, test, and compress attention. The experience rewards returning shoppers more than first-time orientation.",
    highlights: [
      "Search is the true hero — the page assumes intent and accelerates matching.",
      "Personalization increases relevance but can feel opaque to new visitors.",
      "Trust is reinforced through fulfillment language, guarantees, and return posture.",
    ],
    scannedAt: new Date("2026-04-01T14:20:00-04:00").toISOString(),
    scoreOverrides: {
      "visual-design": 7.6,
      "ux-conversion": 8.4,
      "mobile-experience": 7.9,
      "seo-readiness": 8.6,
      accessibility: 7.2,
      "trust-credibility": 8.1,
      "security-posture": 8.5,
    },
  },
  {
    id: "f500-unitedhealth",
    title: "UnitedHealth Group",
    url: "https://www.unitedhealthgroup.com",
    profile: "healthcare",
    summary: "Enterprise healthcare voice — credible, but the homepage can feel like a holding company index.",
    executiveSummary:
      "UnitedHealth Group reads as institutional first. The homepage succeeds on legitimacy and governance cues, while product stories sometimes arrive one click late.",
    highlights: [
      "Clear corporate structure and compliance-forward tone reduce ambiguity.",
      "Investor and member pathways coexist — labeling quality determines comprehension speed.",
      "Visual restraint supports trust; differentiation is subtler than consumer brands.",
    ],
    scannedAt: new Date("2026-04-02T09:15:00-04:00").toISOString(),
    scoreOverrides: {
      "visual-design": 7.1,
      "ux-conversion": 6.8,
      "mobile-experience": 6.9,
      "seo-readiness": 7.4,
      accessibility: 7.0,
      "trust-credibility": 8.2,
      "security-posture": 8.3,
    },
  },
  {
    id: "f500-cvs",
    title: "CVS Health",
    url: "https://www.cvshealth.com",
    profile: "healthcare",
    summary: "Healthcare + retail hybrid — strong mission framing, with a lot of destinations to choose from.",
    executiveSummary:
      "CVS Health balances retail immediacy with payer/provider complexity. The homepage works when visitors already know what bucket they belong in.",
    highlights: [
      "Mission-led messaging supports long-term brand trust.",
      "Multiple audiences create parallel funnels — clarity depends on strong labels.",
      "Mobile navigation benefits from consistent iconography and predictable IA.",
    ],
    scannedAt: new Date("2026-04-02T11:40:00-04:00").toISOString(),
    scoreOverrides: {
      "visual-design": 7.3,
      "ux-conversion": 7.0,
      "mobile-experience": 7.2,
      "seo-readiness": 7.6,
      accessibility: 7.1,
      "trust-credibility": 8.0,
      "security-posture": 8.1,
    },
  },
  {
    id: "f500-berkshire",
    title: "Berkshire Hathaway",
    url: "https://www.berkshirehathaway.com",
    profile: "saas",
    summary: "Radically minimal — almost anti-design — which reads as confidence until expectations shift.",
    executiveSummary:
      "Berkshire Hathaway’s homepage is famously sparse. It signals culture more than conversion craft; for most businesses this would be a liability, here it is the brand.",
    highlights: [
      "Ultra-light layout removes distraction for the intended audience.",
      "Almost no modern marketing scaffolding — trust is transferred from reputation, not UX polish.",
      "Accessibility and hierarchy are not the point of the page — comprehension still depends on prior context.",
    ],
    scannedAt: new Date("2026-04-02T15:05:00-04:00").toISOString(),
    scoreOverrides: {
      "visual-design": 5.2,
      "ux-conversion": 5.0,
      "mobile-experience": 5.4,
      "seo-readiness": 6.1,
      accessibility: 5.8,
      "trust-credibility": 7.2,
      "security-posture": 7.0,
    },
  },
  {
    id: "f500-alphabet",
    title: "Alphabet",
    url: "https://abc.xyz",
    profile: "saas",
    summary: "Investor-forward story with editorial restraint — fewer modules, more whitespace discipline.",
    executiveSummary:
      "Alphabet’s public site reads like a portfolio narrative: calm typography, careful pacing, and a focus on governance and long arcs rather than product hype.",
    highlights: [
      "Whitespace and typographic hierarchy signal premium restraint.",
      "Content is structured for scanning across long-form sections.",
      "The experience is closer to annual-report clarity than growth-marketing urgency.",
    ],
    scannedAt: new Date("2026-04-03T08:50:00-04:00").toISOString(),
    scoreOverrides: {
      "visual-design": 8.4,
      "ux-conversion": 7.6,
      "mobile-experience": 8.0,
      "seo-readiness": 7.8,
      accessibility: 8.1,
      "trust-credibility": 8.3,
      "security-posture": 8.6,
    },
  },
  {
    id: "f500-exxon",
    title: "ExxonMobil",
    url: "https://corporate.exxonmobil.com",
    profile: "local-service",
    summary: "Industrial credibility — strong systems storytelling, with dense navigation typical of energy majors.",
    executiveSummary:
      "ExxonMobil’s corporate presence emphasizes operations, sustainability commitments, and investor-grade disclosure. The homepage succeeds when visitors want substance over flair.",
    highlights: [
      "Proof is anchored in programs, reporting, and operational specifics.",
      "Navigation depth reflects organizational reality — shortcuts matter for first-time visitors.",
      "Visual language is conservative by design to protect institutional trust.",
    ],
    scannedAt: new Date("2026-04-03T12:10:00-04:00").toISOString(),
    scoreOverrides: {
      "visual-design": 7.0,
      "ux-conversion": 6.7,
      "mobile-experience": 6.8,
      "seo-readiness": 7.5,
      accessibility: 6.9,
      "trust-credibility": 7.9,
      "security-posture": 8.2,
    },
  },
  {
    id: "f500-mckesson",
    title: "McKesson",
    url: "https://www.mckesson.com",
    profile: "healthcare",
    summary: "B2B healthcare distribution tone — competent, with a homepage that behaves like a portal hub.",
    executiveSummary:
      "McKesson’s homepage prioritizes pathways for customers, partners, and careers. The challenge is the same as most B2B giants: make the first click feel obvious for each audience.",
    highlights: [
      "Role-based entry points reduce mis-clicks for professional visitors.",
      "Trust leans on scale, compliance posture, and category authority.",
      "Visual design is functional; differentiation is subtle without strong brand moments.",
    ],
    scannedAt: new Date("2026-04-03T16:25:00-04:00").toISOString(),
    scoreOverrides: {
      "visual-design": 6.8,
      "ux-conversion": 6.9,
      "mobile-experience": 6.7,
      "seo-readiness": 7.2,
      accessibility: 6.8,
      "trust-credibility": 7.7,
      "security-posture": 8.1,
    },
  },
  {
    id: "f500-cigna",
    title: "The Cigna Group",
    url: "https://www.thecignagroup.com",
    profile: "healthcare",
    summary: "Enterprise payer narrative — careful language, with a homepage tuned for reputation management.",
    executiveSummary:
      "Cigna Group’s homepage reads as cautious and compliance-aware. It wins on clarity of corporate intent, while product stories can feel intentionally secondary.",
    highlights: [
      "Strong emphasis on stewardship, inclusion, and operating principles.",
      "Newsroom and investor pathways are surfaced without overwhelming the first screen.",
      "Mobile parity is generally solid, though dense policy language increases scanning cost.",
    ],
    scannedAt: new Date("2026-04-04T09:00:00-04:00").toISOString(),
    scoreOverrides: {
      "visual-design": 7.2,
      "ux-conversion": 6.9,
      "mobile-experience": 7.0,
      "seo-readiness": 7.4,
      accessibility: 7.1,
      "trust-credibility": 8.1,
      "security-posture": 8.2,
    },
  },
  {
    id: "f500-costco",
    title: "Costco Wholesale",
    url: "https://www.costco.com",
    profile: "local-service",
    summary: "Retail clarity — membership logic is central, and the homepage rewards repeat shoppers.",
    executiveSummary:
      "Costco’s homepage is built around membership value and warehouse rhythm. The experience is strongest when visitors already understand the model.",
    highlights: [
      "Deals and seasonal modules create urgency without abandoning structure.",
      "Search and warehouse locator patterns support high-intent visits.",
      "Trust is reinforced through return policies and membership economics.",
    ],
    scannedAt: new Date("2026-04-04T13:35:00-04:00").toISOString(),
    scoreOverrides: {
      "visual-design": 7.5,
      "ux-conversion": 7.8,
      "mobile-experience": 7.6,
      "seo-readiness": 7.9,
      accessibility: 7.0,
      "trust-credibility": 8.0,
      "security-posture": 8.2,
    },
  },
  {
    id: "f500-microsoft",
    title: "Microsoft",
    url: "https://www.microsoft.com",
    profile: "saas",
    summary: "Product constellation navigation — strong systems design, with many valid next steps.",
    executiveSummary:
      "Microsoft’s homepage is a flagship SaaS + platform storefront. It succeeds by balancing brand story with modular product entry points, while still carrying enormous breadth.",
    highlights: [
      "Design system consistency reads immediately across modules.",
      "Cross-product navigation is dense but mostly predictable for IT buyers.",
      "Proof is expressed through customer stories, metrics, and ecosystem breadth.",
    ],
    scannedAt: new Date("2026-04-05T10:10:00-04:00").toISOString(),
    scoreOverrides: {
      "visual-design": 9.1,
      "ux-conversion": 9.0,
      "mobile-experience": 8.9,
      "seo-readiness": 8.8,
      accessibility: 9.0,
      "trust-credibility": 9.0,
      "security-posture": 9.1,
    },
  },
  {
    id: "f500-cardinal-health",
    title: "Cardinal Health",
    url: "https://www.cardinalhealth.com",
    profile: "healthcare",
    summary: "Clinical supply chain authority — competent IA, with a homepage that reads slightly conservative.",
    executiveSummary:
      "Cardinal Health’s homepage is built for professionals: solutions, specialties, and evidence-led language. The experience is strongest when visitors self-identify quickly.",
    highlights: [
      "Segmented pathways reduce ambiguity for hospital vs retail vs lab audiences.",
      "Trust is reinforced through regulatory seriousness and long-horizon partnerships.",
      "Visual brand moments are restrained compared to consumer healthcare brands.",
    ],
    scannedAt: new Date("2026-04-05T14:45:00-04:00").toISOString(),
    scoreOverrides: {
      "visual-design": 7.0,
      "ux-conversion": 6.9,
      "mobile-experience": 6.9,
      "seo-readiness": 7.3,
      accessibility: 6.9,
      "trust-credibility": 7.8,
      "security-posture": 8.1,
    },
  },
  {
    id: "f500-cencora",
    title: "Cencora",
    url: "https://www.cencora.com",
    profile: "healthcare",
    summary: "Post-rebrand pharmaceutical distribution — clearer story, still navigating legacy URL expectations.",
    executiveSummary:
      "Cencora’s homepage reflects a modernized enterprise identity: cleaner typography, tighter modules, and a deliberate shift from old brand memory toward forward-looking services.",
    highlights: [
      "Rebrand clarity depends on repeated naming and confident visual anchoring.",
      "B2B proof is expressed through scale, partnerships, and specialty coverage.",
      "Mobile navigation benefits from disciplined grouping under a smaller set of top tabs.",
    ],
    scannedAt: new Date("2026-04-06T09:30:00-04:00").toISOString(),
    scoreOverrides: {
      "visual-design": 7.4,
      "ux-conversion": 7.1,
      "mobile-experience": 7.2,
      "seo-readiness": 7.5,
      accessibility: 7.0,
      "trust-credibility": 7.9,
      "security-posture": 8.1,
    },
  },
  {
    id: "f500-jpmorgan",
    title: "JPMorgan Chase",
    url: "https://www.jpmorganchase.com",
    profile: "saas",
    summary: "Institutional finance homepage — disciplined, with a premium calm that still carries many destinations.",
    executiveSummary:
      "JPMorgan Chase’s corporate presence emphasizes stability, governance, and global reach. The homepage is strongest when it keeps the first screen legible despite breadth.",
    highlights: [
      "Investor relations and responsibility narratives are surfaced without gimmicks.",
      "Typography and spacing signal premium restraint appropriate to the category.",
      "Security and trust cues are implicit in tone as much as explicit badges.",
    ],
    scannedAt: new Date("2026-04-06T13:55:00-04:00").toISOString(),
    scoreOverrides: {
      "visual-design": 8.1,
      "ux-conversion": 7.7,
      "mobile-experience": 7.9,
      "seo-readiness": 7.8,
      accessibility: 7.8,
      "trust-credibility": 8.6,
      "security-posture": 8.7,
    },
  },
  {
    id: "f500-jnj",
    title: "Johnson & Johnson",
    url: "https://www.jnj.com",
    profile: "healthcare",
    summary: "Healthcare conglomerate narrative — careful, human-centered copy with conservative visual energy.",
    executiveSummary:
      "Johnson & Johnson’s homepage leans on empathy-forward storytelling and scientific credibility. The tradeoff is typical for pharma: strong trust language, cautious conversion asks.",
    highlights: [
      "Brand heritage is used as a trust accelerator responsibly.",
      "Patient and professional pathways are separated with clear language.",
      "Motion and imagery are restrained to match regulatory comfort zones.",
    ],
    scannedAt: new Date("2026-04-07T08:40:00-04:00").toISOString(),
    scoreOverrides: {
      "visual-design": 7.6,
      "ux-conversion": 7.2,
      "mobile-experience": 7.3,
      "seo-readiness": 7.5,
      accessibility: 7.4,
      "trust-credibility": 8.3,
      "security-posture": 8.2,
    },
  },
  {
    id: "f500-elevance",
    title: "Elevance Health",
    url: "https://www.elevancehealth.com",
    profile: "healthcare",
    summary: "Payer homepage with consumer moments — clearer than many peers, still enterprise-heavy.",
    executiveSummary:
      "Elevance Health balances member journeys with enterprise storytelling. The homepage works when visitors can self-select into the right lane quickly.",
    highlights: [
      "Care + coverage language is prominent without drowning in jargon.",
      "Community and outcomes narratives support trust before forms.",
      "Mobile layout keeps primary CTAs reachable, though density remains high.",
    ],
    scannedAt: new Date("2026-04-07T12:15:00-04:00").toISOString(),
    scoreOverrides: {
      "visual-design": 7.5,
      "ux-conversion": 7.3,
      "mobile-experience": 7.4,
      "seo-readiness": 7.6,
      accessibility: 7.2,
      "trust-credibility": 8.0,
      "security-posture": 8.1,
    },
  },
  {
    id: "f500-bofa",
    title: "Bank of America",
    url: "https://www.bankofamerica.com",
    profile: "saas",
    summary: "Consumer banking at scale — strong sign-in momentum, with marketing modules competing for attention.",
    executiveSummary:
      "Bank of America’s homepage is optimized around authenticated journeys and product discovery. The challenge is classic: marketing richness vs speed-to-task for returning customers.",
    highlights: [
      "Primary banking actions are visually prioritized for repeat visitors.",
      "Promotional tiles add energy but increase cognitive load for first-time scanning.",
      "Trust is reinforced through FDIC language, security posture, and familiar brand chrome.",
    ],
    scannedAt: new Date("2026-04-08T09:05:00-04:00").toISOString(),
    scoreOverrides: {
      "visual-design": 7.7,
      "ux-conversion": 8.0,
      "mobile-experience": 7.8,
      "seo-readiness": 7.7,
      accessibility: 7.4,
      "trust-credibility": 8.2,
      "security-posture": 8.4,
    },
  },
  {
    id: "f500-meta",
    title: "Meta",
    url: "https://www.meta.com",
    profile: "saas",
    summary: "Brand-forward tech storytelling — confident visuals, with a homepage that sells ecosystems, not a single SKU.",
    executiveSummary:
      "Meta’s homepage is built like a flagship consumer tech narrative: bold visuals, fast pivots between products, and a strong emphasis on future-facing stories.",
    highlights: [
      "Visual design carries brand personality even when copy is minimal.",
      "Cross-product navigation rewards visitors who already understand the portfolio.",
      "Trust narratives blend consumer safety themes with platform-scale responsibility.",
    ],
    scannedAt: new Date("2026-04-08T14:50:00-04:00").toISOString(),
    scoreOverrides: {
      "visual-design": 8.8,
      "ux-conversion": 8.4,
      "mobile-experience": 8.6,
      "seo-readiness": 8.2,
      accessibility: 8.1,
      "trust-credibility": 7.9,
      "security-posture": 8.5,
    },
  },
  {
    id: "f500-wellsfargo",
    title: "Wells Fargo",
    url: "https://www.wellsfargo.com",
    profile: "saas",
    summary: "National bank homepage — familiar patterns, with strong task shortcuts and steady visual rhythm.",
    executiveSummary:
      "Wells Fargo’s homepage emphasizes everyday banking tasks and account entry. The experience is intentionally conventional — familiarity is treated as a trust feature.",
    highlights: [
      "Sign-in and account recovery paths are visually dominant.",
      "Product tiles follow predictable banking IA conventions.",
      "Security reminders are woven into the flow without overwhelming marketing content.",
    ],
    scannedAt: new Date("2026-04-09T11:25:00-04:00").toISOString(),
    scoreOverrides: {
      "visual-design": 7.4,
      "ux-conversion": 7.9,
      "mobile-experience": 7.7,
      "seo-readiness": 7.5,
      accessibility: 7.3,
      "trust-credibility": 7.8,
      "security-posture": 8.3,
    },
  },
  {
    id: "f500-apple",
    title: "Apple",
    url: "https://www.apple.com",
    profile: "saas",
    summary: "Category-defining restraint — the homepage feels like a product gallery with editorial confidence.",
    executiveSummary:
      "Apple’s homepage is a benchmark for premium digital craft: confident whitespace, cinematic product presentation, and a rhythm that makes complexity feel simple.",
    highlights: [
      "Visual hierarchy is disciplined enough that each module gets a moment.",
      "Motion and photography are used as primary communication, not decoration.",
      "The experience stays coherent across devices — a rare combination at this scale.",
    ],
    scannedAt: new Date("2026-04-12T16:40:00-04:00").toISOString(),
    scoreOverrides: {
      "visual-design": 9.6,
      "ux-conversion": 9.5,
      "mobile-experience": 9.6,
      "seo-readiness": 9.4,
      accessibility: 9.5,
      "trust-credibility": 9.6,
      "security-posture": 9.5,
    },
  },
];

export const fortune500SampleAudits: SampleAuditCard[] = FORTUNE_ROWS.map(mk);

export const FORTUNE_500_HERO_CANDIDATE_IDS: readonly string[] = FORTUNE_ROWS.map((row) => row.id);
