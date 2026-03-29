import type {
  AuditCategoryKey,
  BenchmarkReference,
  BenchmarkRubric,
  BenchmarkSite,
  BenchmarkTier,
  BenchmarkVertical,
  DesignPatternNote,
  ReportProfileType,
} from "@/lib/types/audit";
import { createWebsiteScreenshotUrl } from "@/lib/utils/url";

const primaryVerticals: BenchmarkVertical[] = [
  "service-providers",
  "private-healthcare",
];

const benchmarkRubrics: Record<BenchmarkVertical, BenchmarkRubric> = {
  "service-providers": {
    id: "rubric-service-providers",
    vertical: "service-providers",
    title: "Home and Commercial Services",
    summary:
      "A 10/10 service-provider site makes the offer obvious fast, earns trust before the estimate ask, and turns local intent into contact without friction.",
    fastLifts: [
      "Clarify the first-screen promise and service coverage immediately.",
      "Move proof, guarantees, and operator credibility closer to the first CTA.",
      "Reduce mobile contact friction so calls, forms, and quote actions feel instant.",
    ],
    criteria: [
      {
        id: "services-visual",
        category: "visual-design",
        title: "First-screen clarity",
        description: "The first screen should state the offer, area served, and why the business is credible within seconds.",
        whyItMatters: "Service buyers make fast trust judgments before reading deeply.",
        signals: [
          "Readable first-screen hierarchy",
          "Custom rather than template-feeling presentation",
          "Single dominant message anchor",
        ],
      },
      {
        id: "services-conversion",
        category: "ux-conversion",
        title: "Estimate and contact speed",
        description: "Calls, quote requests, and next-step paths should be obvious and low-friction.",
        whyItMatters: "Urgent service demand drops quickly when contact feels slow or ambiguous.",
        signals: [
          "One primary CTA path",
          "Proof before the ask",
          "Short contact distance from the first screen",
        ],
      },
      {
        id: "services-mobile",
        category: "mobile-experience",
        title: "Mobile call usability",
        description: "Small-screen visitors should be able to understand the offer and call or request service quickly.",
        whyItMatters: "A large share of local demand starts on smaller screens.",
        signals: [
          "Tap-first CTA treatment",
          "No content bottlenecks before the ask",
          "Paced sections with clear spacing",
        ],
      },
      {
        id: "services-seo",
        category: "seo-readiness",
        title: "Local intent structure",
        description: "The site should map services, cities, and proof into crawlable pages instead of relying on one generic homepage.",
        whyItMatters: "Local search capture depends on clear service and geography architecture.",
        signals: [
          "Clear service coverage pages",
          "Location or service-area signals",
          "Meaningful internal linking",
        ],
      },
      {
        id: "services-accessibility",
        category: "accessibility",
        title: "Readable practical usability",
        description: "Forms, phone actions, and service information should remain easy to use under real conditions.",
        whyItMatters: "Accessibility improvements often reduce friction for every visitor.",
        signals: [
          "Readable contrast",
          "Clear semantic heading order",
          "Usable forms and labels",
        ],
      },
      {
        id: "services-trust",
        category: "trust-credibility",
        title: "Proof and reassurance",
        description: "Licensing, reviews, guarantees, tenure, process, and team signals should appear before skepticism sets in.",
        whyItMatters: "Service sites win when competence feels obvious early.",
        signals: [
          "Visible credentials or certifications",
          "Reviews and project proof",
          "Guarantees, financing, or reassurance",
        ],
      },
      {
        id: "services-security",
        category: "security-posture",
        title: "Operational confidence",
        description: "Basic hardening and trustworthy form handling should be visible and current.",
        whyItMatters: "Public-facing sloppiness undermines confidence in the business.",
        signals: [
          "HTTPS and modern headers",
          "Clean forms",
          "No obvious operational rough edges",
        ],
      },
    ],
  },
  "private-healthcare": {
    id: "rubric-private-healthcare",
    vertical: "private-healthcare",
    title: "Private Dental and Healthcare",
    summary:
      "A 10/10 private-care site reduces anxiety, establishes provider credibility early, and makes the patient’s next step feel safe and simple.",
    fastLifts: [
      "Lead with provider clarity, specialty, and patient reassurance instead of generic health language.",
      "Make insurance, payment, and booking paths easier to understand before asking for commitment.",
      "Shorten the mobile intake path and surface practical visit information earlier.",
    ],
    criteria: [
      {
        id: "healthcare-visual",
        category: "visual-design",
        title: "Calm, credible first impression",
        description: "The site should feel trustworthy, current, and intentionally designed without looking trendy or theatrical.",
        whyItMatters: "Patients often judge legitimacy and safety from the interface before the copy.",
        signals: [
          "Calm hierarchy",
          "Provider-first message framing",
          "Restraint over clutter",
        ],
      },
      {
        id: "healthcare-conversion",
        category: "ux-conversion",
        title: "Booking and intake clarity",
        description: "Appointment, consultation, and contact paths should feel low-risk and predictable.",
        whyItMatters: "Healthcare visitors hesitate when the next step feels confusing or high effort.",
        signals: [
          "Clear scheduling path",
          "Proof before booking",
          "Reduced form and navigation friction",
        ],
      },
      {
        id: "healthcare-mobile",
        category: "mobile-experience",
        title: "Patient-first mobile flow",
        description: "Mobile visitors should reach specialties, location, insurance, and booking actions quickly.",
        whyItMatters: "Many patient journeys start on mobile while researching or comparing providers.",
        signals: [
          "Visible booking/contact actions",
          "Concise content pacing",
          "Easy access to practical visit info",
        ],
      },
      {
        id: "healthcare-seo",
        category: "seo-readiness",
        title: "Care and provider discoverability",
        description: "Search-facing structure should support specialties, providers, conditions, and location intent.",
        whyItMatters: "Patients and referrers often discover care options through specific queries.",
        signals: [
          "Structured specialty/provider pages",
          "Metadata with actual intent coverage",
          "Supportive internal linking",
        ],
      },
      {
        id: "healthcare-accessibility",
        category: "accessibility",
        title: "Clear, low-stress usability",
        description: "Reading, navigation, and form interaction should be easier for stressed or time-limited visitors.",
        whyItMatters: "Accessibility directly improves comprehension and confidence in care settings.",
        signals: [
          "Readable typography and contrast",
          "Clear semantics",
          "Predictable forms and navigation",
        ],
      },
      {
        id: "healthcare-trust",
        category: "trust-credibility",
        title: "Provider credibility and reassurance",
        description: "Provider identity, expertise, practical visit details, and social proof should be explicit.",
        whyItMatters: "Patients need to feel the provider is legitimate, relevant, and safe.",
        signals: [
          "Provider credentials",
          "Insurance/payment clarity",
          "Practical location and care details",
        ],
      },
      {
        id: "healthcare-security",
        category: "security-posture",
        title: "Safe and current posture",
        description: "Public-facing hardening and responsible handling cues should feel current and deliberate.",
        whyItMatters: "Healthcare visitors are especially sensitive to signs of sloppiness or risk.",
        signals: [
          "HTTPS and visible hardening",
          "Clean forms",
          "No obvious stale or risky surface details",
        ],
      },
    ],
  },
  "product-saas": {
    id: "rubric-product-saas",
    vertical: "product-saas",
    title: "Product and SaaS",
    summary:
      "A 10/10 product site explains value quickly, earns trust with proof, and keeps the interface confident without adding narrative clutter.",
    fastLifts: [
      "Clarify the product promise before expanding into features.",
      "Increase proof density without making the page feel heavier.",
      "Tighten pacing so every section earns the next scroll.",
    ],
    criteria: [
      {
        id: "saas-visual",
        category: "visual-design",
        title: "Product confidence",
        description: "The site should feel intentional, modern, and convincingly product-led.",
        whyItMatters: "Product quality is inferred from interface quality immediately.",
        signals: ["Deliberate hierarchy", "Confident restraint", "Consistent system language"],
      },
      {
        id: "saas-conversion",
        category: "ux-conversion",
        title: "Narrative to CTA pacing",
        description: "The page should guide readers from value to proof to action without overload.",
        whyItMatters: "Product sites lose momentum when they explain too much too early.",
        signals: ["Visible CTA path", "Proof before commitment", "Reduced narrative friction"],
      },
      {
        id: "saas-mobile",
        category: "mobile-experience",
        title: "Compressed clarity",
        description: "The core story and CTA should survive small screens without feeling collapsed.",
        whyItMatters: "A premium desktop story still has to work under mobile constraints.",
        signals: ["Readable pacing", "Scannable sections", "Mobile-safe CTA framing"],
      },
      {
        id: "saas-seo",
        category: "seo-readiness",
        title: "Product discoverability",
        description: "The information architecture should support category, feature, and intent-level discovery.",
        whyItMatters: "Search capture and product understanding both depend on clear structure.",
        signals: ["Metadata hygiene", "Feature/supporting pages", "Internal linking"],
      },
      {
        id: "saas-accessibility",
        category: "accessibility",
        title: "Inclusive product storytelling",
        description: "Readable contrast, semantics, and reduced friction should hold throughout the story.",
        whyItMatters: "Accessibility and clarity rise together on complex product pages.",
        signals: ["Contrast", "Semantic structure", "Predictable controls"],
      },
      {
        id: "saas-trust",
        category: "trust-credibility",
        title: "Proof density",
        description: "Social proof, logos, case evidence, and clarity around scale should appear before doubt grows.",
        whyItMatters: "Visitors need evidence that the product is real, stable, and worth the switch.",
        signals: ["Customer proof", "Operational credibility", "Clear positioning"],
      },
      {
        id: "saas-security",
        category: "security-posture",
        title: "Operational maturity",
        description: "A modern technical product should show visible signs of current security and operational care.",
        whyItMatters: "Security and operational polish shape product trust even before evaluation starts.",
        signals: ["HTTPS and modern headers", "Secure forms", "No obvious stale technical signals"],
      },
    ],
  },
};

const benchmarkSites: BenchmarkSite[] = [
  {
    id: "site-aj-alberts",
    vertical: "service-providers",
    tier: "reference",
    name: "AJ Alberts Plumbing",
    url: "https://www.ajalberts.com",
    sourceLabel: "Service benchmark",
    note: "Strong service intent, practical proof, and immediate contact direction.",
    desktopPreviewImage: createWebsiteScreenshotUrl("https://www.ajalberts.com", "desktop"),
    mobilePreviewImage: createWebsiteScreenshotUrl("https://www.ajalberts.com", "mobile"),
    strengths: ["ux-conversion", "trust-credibility", "seo-readiness"],
    whatWorks: [
      "Service intent becomes clear quickly instead of hiding behind generic company language.",
      "Proof and contact options appear early enough to reduce hesitation for local prospects.",
      "The page structure supports deeper service capture rather than relying on one all-purpose page.",
    ],
    bestFor: "Local-service sites that need clearer service intent and faster estimate paths.",
    reusablePatterns: [
      "Lead with service clarity before company backstory.",
      "Place proof beside the first ask, not after it.",
      "Use supporting service pages to turn search demand into qualified inquiries.",
    ],
    curatedWeight: 1.04,
  },
  {
    id: "site-northface-construction",
    vertical: "service-providers",
    tier: "flagship",
    name: "Northface Construction",
    url: "https://northfaceconstruction.com",
    sourceLabel: "Contractor benchmark",
    note: "A stronger premium first impression with a tighter estimate path.",
    desktopPreviewImage: createWebsiteScreenshotUrl("https://northfaceconstruction.com", "desktop"),
    mobilePreviewImage: createWebsiteScreenshotUrl("https://northfaceconstruction.com", "mobile"),
    strengths: ["visual-design", "ux-conversion", "trust-credibility"],
    whatWorks: [
      "The first screen feels more considered than a typical contractor template.",
      "The site earns the ask with process, proof, and professional tone instead of rushing to forms.",
      "Trust cues sit closer to the action the visitor is expected to take.",
    ],
    bestFor: "Contractors and trades that need a cleaner premium feel and stronger estimate flow.",
    reusablePatterns: [
      "Use visual restraint to make craftsmanship feel credible.",
      "Tie the CTA to proof and process in the same viewport cluster.",
      "Show professionalism through pacing, not just decorative polish.",
    ],
    curatedWeight: 1.08,
  },
  {
    id: "site-mr-rooter",
    vertical: "service-providers",
    tier: "specialist",
    name: "Mr. Rooter",
    url: "https://www.mrrooter.com",
    sourceLabel: "Service-network benchmark",
    note: "Useful for studying service hierarchy, urgency handling, and mobile contact clarity.",
    desktopPreviewImage: createWebsiteScreenshotUrl("https://www.mrrooter.com", "desktop"),
    mobilePreviewImage: createWebsiteScreenshotUrl("https://www.mrrooter.com", "mobile"),
    strengths: ["ux-conversion", "seo-readiness", "mobile-experience"],
    whatWorks: [
      "Urgent service intent, location discovery, and contact actions appear early in the experience.",
      "The structure supports both immediate need and broader service exploration.",
      "Mobile conversion paths stay obvious instead of burying the quote or call action.",
    ],
    bestFor: "Service companies that need cleaner urgency handling and stronger mobile contact flow.",
    reusablePatterns: [
      "Separate urgent actions from exploratory browsing.",
      "Use local structure to support both search and conversion.",
      "Make phone and quote actions feel native on mobile.",
    ],
    curatedWeight: 1,
  },
  {
    id: "site-apple-services",
    vertical: "service-providers",
    tier: "specialist",
    name: "Apple",
    url: "https://www.apple.com",
    sourceLabel: "Global design benchmark",
    note: "A high bar for hierarchy, polish, restraint, and premium perception.",
    desktopPreviewImage: createWebsiteScreenshotUrl("https://www.apple.com", "desktop"),
    mobilePreviewImage: createWebsiteScreenshotUrl("https://www.apple.com", "mobile"),
    strengths: ["visual-design", "mobile-experience", "accessibility"],
    whatWorks: [
      "The page direction is clear immediately, reducing cognitive load.",
      "The visual system stays disciplined across every section and device width.",
      "Polish comes from restraint and consistency, not more UI.",
    ],
    bestFor: "Service-business redesigns that need a more premium editorial bar.",
    reusablePatterns: [
      "Use fewer interface ideas, executed more consistently.",
      "Let typography and spacing create confidence before detail does.",
      "Treat mobile as a composed layout, not a collapsed desktop page.",
    ],
    curatedWeight: 0.98,
  },
  {
    id: "site-design-in-wood",
    vertical: "service-providers",
    focusArea: "woodworking",
    tier: "flagship",
    name: "Design In Wood",
    url: "https://www.designinwoodinc.com",
    sourceLabel: "Woodworking benchmark",
    note: "A strong craft portfolio with a premium presentation bar and a clearer sense of specialty.",
    desktopPreviewImage: createWebsiteScreenshotUrl("https://www.designinwoodinc.com", "desktop"),
    mobilePreviewImage: createWebsiteScreenshotUrl("https://www.designinwoodinc.com", "mobile"),
    strengths: ["visual-design", "trust-credibility", "ux-conversion"],
    whatWorks: [
      "Project imagery does the heavy lifting before the copy has to explain the craft.",
      "The page feels curated enough to support higher-end custom work.",
      "The presentation reads more like a studio portfolio than a generic service template.",
    ],
    bestFor: "Custom woodworking brands that need a premium craft portfolio bar.",
    reusablePatterns: [
      "Let project photography establish the quality baseline.",
      "Use restrained page rhythm so the work feels elevated.",
      "Keep specialty and portfolio proof close to each other.",
    ],
    curatedWeight: 1.07,
  },
  {
    id: "site-woodworks-build",
    vertical: "service-providers",
    focusArea: "woodworking",
    tier: "reference",
    name: "Woodworks & Design",
    url: "https://woodworksbuild.com",
    sourceLabel: "Woodworking benchmark",
    note: "Clear project taxonomy and strong proof for cabinetry, built-ins, and millwork.",
    desktopPreviewImage: createWebsiteScreenshotUrl("https://woodworksbuild.com", "desktop"),
    mobilePreviewImage: createWebsiteScreenshotUrl("https://woodworksbuild.com", "mobile"),
    strengths: ["ux-conversion", "seo-readiness", "trust-credibility"],
    whatWorks: [
      "The site organizes a wide range of custom work into usable categories.",
      "Proof appears in the form of actual project types instead of only broad claims.",
      "The structure supports both browsing and direct inquiry without feeling scattered.",
    ],
    bestFor: "Cabinetry and millwork teams that need organized proof and service coverage.",
    reusablePatterns: [
      "Group work by category so visitors can self-select quickly.",
      "Use a service taxonomy that maps to real buying intent.",
      "Balance workshop credibility with project-led presentation.",
    ],
    curatedWeight: 1.03,
  },
  {
    id: "site-wolfe-custom-woodworking",
    vertical: "service-providers",
    focusArea: "woodworking",
    tier: "specialist",
    name: "Wolfe Custom Woodworking",
    url: "https://www.wolfecustomwoodworking.com",
    sourceLabel: "Woodworking benchmark",
    note: "Polished custom furniture presentation with direct contact paths and a strong project gallery.",
    desktopPreviewImage: createWebsiteScreenshotUrl("https://www.wolfecustomwoodworking.com", "desktop"),
    mobilePreviewImage: createWebsiteScreenshotUrl("https://www.wolfecustomwoodworking.com", "mobile"),
    strengths: ["visual-design", "ux-conversion", "mobile-experience"],
    whatWorks: [
      "Featured work is easy to scan and the site quickly communicates the kind of craftsmanship on offer.",
      "The contact path is direct enough to support high-intent visitors.",
      "The portfolio feels more bespoke than a generic local trades site.",
    ],
    bestFor: "Custom woodworking shops that want a cleaner portfolio and direct contact flow.",
    reusablePatterns: [
      "Use featured work as the proof layer, not as filler.",
      "Keep the contact ask visible without reducing the premium feel.",
      "Let the project gallery define the brand’s craft ceiling.",
    ],
    curatedWeight: 1.01,
  },
  {
    id: "site-one-medical",
    vertical: "private-healthcare",
    tier: "flagship",
    name: "One Medical",
    url: "https://www.onemedical.com",
    sourceLabel: "Healthcare benchmark",
    note: "Strong reassurance, calm booking paths, and a cleaner primary-care information hierarchy.",
    desktopPreviewImage: createWebsiteScreenshotUrl("https://www.onemedical.com", "desktop"),
    mobilePreviewImage: createWebsiteScreenshotUrl("https://www.onemedical.com", "mobile"),
    strengths: ["ux-conversion", "mobile-experience", "trust-credibility"],
    whatWorks: [
      "The first screen states the offer clearly and gives the visitor one obvious next step.",
      "Trust cues and practical details appear before the page asks for commitment.",
      "The mobile experience keeps booking and wayfinding simple instead of forcing extra scanning.",
    ],
    bestFor: "Healthcare sites that need calmer booking flow and stronger first-screen reassurance.",
    reusablePatterns: [
      "Lead with provider and patient reassurance before dense explanation.",
      "Keep booking CTAs visible without making them feel abrupt.",
      "Place insurance and visit practicality closer to decision points.",
    ],
    curatedWeight: 1.08,
  },
  {
    id: "site-zocdoc",
    vertical: "private-healthcare",
    tier: "reference",
    name: "Zocdoc",
    url: "https://www.zocdoc.com",
    sourceLabel: "Healthcare booking benchmark",
    note: "Strong next-step clarity and visible scheduling confidence.",
    desktopPreviewImage: createWebsiteScreenshotUrl("https://www.zocdoc.com", "desktop"),
    mobilePreviewImage: createWebsiteScreenshotUrl("https://www.zocdoc.com", "mobile"),
    strengths: ["ux-conversion", "trust-credibility", "seo-readiness"],
    whatWorks: [
      "Search and booking paths are immediate, so intent turns into action quickly.",
      "Provider proof and reassurance reduce hesitation before scheduling.",
      "The architecture supports discovery and conversion without bloating the page.",
    ],
    bestFor: "Practices that need the site to qualify and route appointment intent faster.",
    reusablePatterns: [
      "Shorten the distance between search intent and booking action.",
      "Use structured provider proof, not generic trust copy.",
      "Support comparison without losing momentum.",
    ],
    curatedWeight: 1.03,
  },
  {
    id: "site-mayo",
    vertical: "private-healthcare",
    tier: "specialist",
    name: "Mayo Clinic",
    url: "https://www.mayoclinic.org",
    sourceLabel: "Healthcare content benchmark",
    note: "A strong benchmark for health-information clarity, structure, and confidence at scale.",
    desktopPreviewImage: createWebsiteScreenshotUrl("https://www.mayoclinic.org", "desktop"),
    mobilePreviewImage: createWebsiteScreenshotUrl("https://www.mayoclinic.org", "mobile"),
    strengths: ["seo-readiness", "trust-credibility", "accessibility"],
    whatWorks: [
      "Deep information still feels structured enough to stay trustworthy and navigable.",
      "Credibility cues are woven into the experience instead of isolated in a single section.",
      "The architecture supports discovery, reassurance, and follow-on exploration.",
    ],
    bestFor: "Healthcare teams that need stronger information architecture without losing trust.",
    reusablePatterns: [
      "Use hierarchy to make dense information feel usable.",
      "Support both immediate need and deeper research paths.",
      "Let structure, not decoration, carry authority.",
    ],
    curatedWeight: 1,
  },
  {
    id: "site-apple-healthcare",
    vertical: "private-healthcare",
    tier: "specialist",
    name: "Apple",
    url: "https://www.apple.com",
    sourceLabel: "Global design benchmark",
    note: "A useful bar for premium hierarchy, clarity, and accessibility even outside healthcare.",
    desktopPreviewImage: createWebsiteScreenshotUrl("https://www.apple.com", "desktop"),
    mobilePreviewImage: createWebsiteScreenshotUrl("https://www.apple.com", "mobile"),
    strengths: ["visual-design", "mobile-experience", "accessibility"],
    whatWorks: [
      "Hierarchy is obvious within seconds, even before deep reading.",
      "Spacing, type scale, and consistency make the brand feel more capable.",
      "Mobile and accessibility basics feel considered rather than added later.",
    ],
    bestFor: "Healthcare teams that need a stronger visual polish benchmark without adding noise.",
    reusablePatterns: [
      "Make clarity and calm do the premium work.",
      "Use spacing rhythm to remove anxiety from dense topics.",
      "Improve polish through consistency, not ornament.",
    ],
    curatedWeight: 0.98,
  },
  {
    id: "site-stripe",
    vertical: "product-saas",
    tier: "flagship",
    name: "Stripe",
    url: "https://stripe.com",
    sourceLabel: "SaaS benchmark",
    note: "Clear positioning, strong proof density, and a product story that stays easy to scan.",
    desktopPreviewImage: createWebsiteScreenshotUrl("https://stripe.com", "desktop"),
    mobilePreviewImage: createWebsiteScreenshotUrl("https://stripe.com", "mobile"),
    strengths: ["visual-design", "ux-conversion", "trust-credibility"],
    whatWorks: [
      "Positioning, proof, and product explanation stay scannable even on dense pages.",
      "The site earns trust with strong structure before it asks for deeper commitment.",
      "Calls to action stay visible without overwhelming the reader.",
    ],
    bestFor: "SaaS sites that need stronger proof density without losing clarity.",
    reusablePatterns: [
      "Use modular storytelling instead of giant undifferentiated sections.",
      "Make the proof system as visible as the pitch.",
      "Let dense information stay scannable through rhythm and grouping.",
    ],
    curatedWeight: 1.08,
  },
  {
    id: "site-linear",
    vertical: "product-saas",
    tier: "reference",
    name: "Linear",
    url: "https://linear.app",
    sourceLabel: "SaaS benchmark",
    note: "A strong benchmark for product clarity, pacing, and modern interface confidence.",
    desktopPreviewImage: createWebsiteScreenshotUrl("https://linear.app", "desktop"),
    mobilePreviewImage: createWebsiteScreenshotUrl("https://linear.app", "mobile"),
    strengths: ["visual-design", "mobile-experience", "ux-conversion"],
    whatWorks: [
      "The pacing is tight, so the visitor always knows what to read next.",
      "The interface confidence supports the product story instead of competing with it.",
      "Smaller-screen presentation remains deliberate and readable.",
    ],
    bestFor: "Product teams that want modern polish without sacrificing comprehension.",
    reusablePatterns: [
      "Use pacing to guide attention instead of adding explanation.",
      "Make interface confidence support the narrative.",
      "Keep high polish without losing functional clarity.",
    ],
    curatedWeight: 1.05,
  },
  {
    id: "site-vercel",
    vertical: "product-saas",
    tier: "specialist",
    name: "Vercel",
    url: "https://vercel.com",
    sourceLabel: "Platform benchmark",
    note: "A strong benchmark for product clarity, polish, and developer-facing storytelling.",
    desktopPreviewImage: createWebsiteScreenshotUrl("https://vercel.com", "desktop"),
    mobilePreviewImage: createWebsiteScreenshotUrl("https://vercel.com", "mobile"),
    strengths: ["visual-design", "ux-conversion", "mobile-experience"],
    whatWorks: [
      "Technical product messaging stays crisp without losing visual confidence.",
      "Calls to action stay visible while the narrative still earns trust.",
      "The experience remains deliberate across viewport sizes instead of collapsing into density.",
    ],
    bestFor: "SaaS teams that need stronger narrative pacing and product polish.",
    reusablePatterns: [
      "Give dense product ideas a cleaner visual tempo.",
      "Use typography and layout to keep technical content digestible.",
      "Keep CTAs visible without flattening the story.",
    ],
    curatedWeight: 1,
  },
  {
    id: "site-apple-saas",
    vertical: "product-saas",
    tier: "specialist",
    name: "Apple",
    url: "https://www.apple.com",
    sourceLabel: "Global design benchmark",
    note: "A high bar for clarity, polish, and restraint even outside SaaS.",
    desktopPreviewImage: createWebsiteScreenshotUrl("https://www.apple.com", "desktop"),
    mobilePreviewImage: createWebsiteScreenshotUrl("https://www.apple.com", "mobile"),
    strengths: ["visual-design", "accessibility", "mobile-experience"],
    whatWorks: [
      "Visual hierarchy is strong enough that the page feels premium before details land.",
      "Components, spacing, and contrast remain disciplined throughout the experience.",
      "The product is not buried under unnecessary chrome or competing directions.",
    ],
    bestFor: "Teams looking for a reference point for clarity, polish, and restraint.",
    reusablePatterns: [
      "Use disciplined systems to make premium feel effortless.",
      "Reduce chrome so the message carries more of the work.",
      "Make every screen width feel designed, not merely responsive.",
    ],
    curatedWeight: 0.97,
  },
];

const patternNotes: Record<BenchmarkVertical, DesignPatternNote[]> = {
  "service-providers": [
    {
      id: "note-services-grid",
      title: "Use modular proof grids, not long unbroken pages",
      source: "robot-components",
      category: "grid",
      summary: "Service sites benefit from modular grids that let trust, services, and process read in distinct chunks instead of one long brochure column.",
      takeaways: [
        "Use predictable grid rhythm to separate proof from pitch.",
        "Let service cards and proof cards share a unified system.",
        "Reduce scroll fatigue by composing sections as modules, not slabs.",
      ],
      applicability: "Best for home, trade, and commercial service sites with multiple proof types.",
    },
    {
      id: "note-services-color",
      title: "Use restrained tonal color systems",
      source: "Radix Colors",
      category: "color",
      summary: "Premium service sites feel more trustworthy when surfaces, borders, and accents come from a restrained tonal system instead of arbitrary branding colors.",
      takeaways: [
        "Use hue-consistent tonal scales for borders and surfaces.",
        "Reserve vivid color for calls to action and state changes.",
        "Avoid muddy contrast in dark themes.",
      ],
      applicability: "Best for redesigns that need to feel more current and more trustworthy fast.",
    },
    {
      id: "note-services-prompts",
      title: "Prompt patterns should map to business outcomes",
      source: "AI UX Playground",
      category: "prompts",
      summary: "Pattern libraries are only useful if they stay tied to real job-to-be-done outcomes such as calling, requesting service, or booking a visit.",
      takeaways: [
        "Treat hero, proof, CTA, and FAQ as conversion tools, not content filler.",
        "Use prompt patterns to generate options, not final answers.",
        "Score patterns by the friction they remove.",
      ],
      applicability: "Best for service-provider redesign workshops and benchmark reviews.",
    },
  ],
  "private-healthcare": [
    {
      id: "note-healthcare-type",
      title: "Typography should reduce anxiety before it sells",
      source: "AI UX Playground + editorial layout study",
      category: "typography",
      summary: "Healthcare typography performs best when it feels calm, readable, and assured rather than loud or ornamental.",
      takeaways: [
        "Use a stronger lede and caption system for practical patient information.",
        "Keep line lengths shorter in reassurance-heavy sections.",
        "Let hierarchy guide trust instead of decorative treatment.",
      ],
      applicability: "Best for dental, clinic, specialist, and provider-profile experiences.",
    },
    {
      id: "note-healthcare-icons",
      title: "Use consistent icon families for utility only",
      source: "Iconoir + Iconify",
      category: "iconography",
      summary: "Healthcare UI should use icons to clarify logistics and actions, not to decorate every content block.",
      takeaways: [
        "Use one primary icon family and a broad fallback library only when needed.",
        "Keep icons around location, insurance, scheduling, and contact tasks.",
        "Avoid mixing icon metaphors that undermine calm, clinical clarity.",
      ],
      applicability: "Best for patient logistics, provider proof, and intake flows.",
    },
    {
      id: "note-healthcare-workflow",
      title: "Codex should follow a repeatable design-review workflow",
      source: "superpowers + awesome-codex-skills",
      category: "workflow",
      summary: "The strongest UI reviews come from a repeatable skill-driven workflow: benchmark, critique, propose, validate, and refine.",
      takeaways: [
        "Treat design review as a disciplined repeatable process.",
        "Use skills to separate exploration, critique, and implementation.",
        "Capture repeatable UI judgment as reusable notes, not one-off opinions.",
      ],
      applicability: "Best for making Craydl’s future audits more consistent across projects.",
    },
  ],
  "product-saas": [
    {
      id: "note-saas-type",
      title: "Typography quality should come from rhythm first",
      source: "Editorial layout study",
      category: "typography",
      summary: "The strongest product sites do not rely on decorative text styling; they use measure, spacing, rhythm, and composition to make typography feel expensive.",
      takeaways: [
        "Use stronger ledes, captions, and stat typography systems.",
        "Balance type blocks with whitespace and supporting media.",
        "Keep emphasis structural instead of effect-heavy.",
      ],
      applicability: "Best for product pages, benchmark storytelling, and high-density landing surfaces.",
    },
  ],
};

export function getPrimaryBenchmarkVerticals() {
  return primaryVerticals;
}

export function getBenchmarkRubric(vertical: BenchmarkVertical) {
  return benchmarkRubrics[vertical];
}

export function getBenchmarkRubricForProfile(profile: ReportProfileType) {
  return benchmarkRubrics[getBenchmarkVerticalForProfile(profile)];
}

export function getCriterionForProfileCategory(
  profile: ReportProfileType,
  category: AuditCategoryKey,
) {
  return getBenchmarkRubricForProfile(profile).criteria.find(
    (criterion) => criterion.category === category,
  );
}

export function getBenchmarkSites(vertical: BenchmarkVertical) {
  return benchmarkSites.filter((site) => site.vertical === vertical);
}

export function getBenchmarkSitesByFocus(
  vertical: BenchmarkVertical,
  focusArea: NonNullable<BenchmarkSite["focusArea"]>,
) {
  return getBenchmarkSites(vertical).filter((site) => site.focusArea === focusArea);
}

export function getBenchmarkDesignNotes(vertical: BenchmarkVertical) {
  return patternNotes[vertical];
}

export function getBenchmarkVerticalForProfile(
  profile: ReportProfileType,
): BenchmarkVertical {
  if (profile === "healthcare") {
    return "private-healthcare";
  }

  if (profile === "local-service") {
    return "service-providers";
  }

  return "product-saas";
}

export function buildBenchmarkReferencesForProfile(
  profile: ReportProfileType,
): BenchmarkReference[] {
  return getBenchmarkSites(getBenchmarkVerticalForProfile(profile)).map((site) => ({
    id: site.id,
    siteId: site.id,
    vertical: site.vertical,
    focusArea: site.focusArea,
    tier: site.tier,
    name: site.name,
    url: site.url,
    sourceLabel: site.sourceLabel,
    note: site.note,
    previewImage: site.desktopPreviewImage,
    mobilePreviewImage: site.mobilePreviewImage,
    targetScore: getBenchmarkTargetScore(site.tier),
    strengths: site.strengths,
    whatWorks: site.whatWorks,
    bestFor: site.bestFor,
    reusablePatterns: site.reusablePatterns,
  }));
}

export function getBenchmarkTargetScore(tier: BenchmarkTier) {
  if (tier === "flagship") {
    return 9.2;
  }

  if (tier === "reference") {
    return 8.8;
  }

  return 8.4;
}

export function getDesignPatternNotesForProfile(profile: ReportProfileType) {
  return getBenchmarkDesignNotes(getBenchmarkVerticalForProfile(profile));
}

export function getAllThemePresetSeeds() {
  return [
    {
      id: "signal-dark",
      name: "Signal Dark",
      mode: "dark" as const,
      accentFamily: "Craydl amber",
      mood: "Confident, warm, and premium.",
      recommendedUseCase: "Default audit and packet workspace.",
      options: { accentColor: "#f7b21b", fontScale: 1.02, radius: 10, shadowIntensity: 0.88, spacingDensity: 0.98 },
    },
    {
      id: "blueprint-dark",
      name: "Blueprint Dark",
      mode: "dark" as const,
      accentFamily: "Blueprint blue",
      mood: "Sharper, more technical, and calm.",
      recommendedUseCase: "Benchmark analysis and technical review flows.",
      options: { accentColor: "#7da8ff", fontScale: 1.01, radius: 9, shadowIntensity: 0.8, spacingDensity: 0.96 },
    },
    {
      id: "atelier-dark",
      name: "Atelier Dark",
      mode: "dark" as const,
      accentFamily: "Verdant mint",
      mood: "Editorial, composed, and studio-like.",
      recommendedUseCase: "Presentation-heavy reviews and benchmark storytelling.",
      options: { accentColor: "#7adbb3", fontScale: 1.04, radius: 11, shadowIntensity: 0.82, spacingDensity: 1.02 },
    },
    {
      id: "ledger-light",
      name: "Ledger Light",
      mode: "light" as const,
      accentFamily: "Ledger gold",
      mood: "Clean, bright, and proposal-friendly.",
      recommendedUseCase: "Client packet previews and lighter presentation modes.",
      options: { accentColor: "#c58512", fontScale: 1.01, radius: 10, shadowIntensity: 0.72, spacingDensity: 0.98 },
    },
    {
      id: "clinic-light",
      name: "Clinic Light",
      mode: "light" as const,
      accentFamily: "Clinic blue",
      mood: "Calm, precise, and trustworthy.",
      recommendedUseCase: "Dental and healthcare proposal reviews.",
      options: { accentColor: "#4f7ff0", fontScale: 1.02, radius: 10, shadowIntensity: 0.68, spacingDensity: 1 },
    },
    {
      id: "workshop-light",
      name: "Workshop Light",
      mode: "light" as const,
      accentFamily: "Workshop sage",
      mood: "Practical, grounded, and refined.",
      recommendedUseCase: "Service-business audits and internal benchmark reviews.",
      options: { accentColor: "#1f9b74", fontScale: 1, radius: 9, shadowIntensity: 0.65, spacingDensity: 0.96 },
    },
  ];
}
