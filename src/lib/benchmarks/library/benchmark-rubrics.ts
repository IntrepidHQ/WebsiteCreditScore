import type { BenchmarkRubric, BenchmarkVertical } from "@/lib/types/audit";

export const benchmarkRubrics: Record<BenchmarkVertical, BenchmarkRubric> = {
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
  fintech: {
    id: "rubric-fintech",
    vertical: "fintech",
    title: "Fintech",
    summary:
      "A 10/10 fintech site makes the financial job obvious fast, proves operational maturity early, and explains complexity without adding hesitation.",
    fastLifts: [
      "State the money problem being solved before expanding into product detail.",
      "Move trust, compliance, and operational proof closer to the first CTA.",
      "Use product visuals and examples to simplify complexity instead of adding more copy.",
    ],
    criteria: [
      {
        id: "fintech-visual",
        category: "visual-design",
        title: "Calm product credibility",
        description: "The interface should feel precise, current, and expensive without drifting into novelty.",
        whyItMatters: "Financial trust is inferred from visual control long before compliance copy gets read.",
        signals: ["Tight hierarchy", "Restrained visual language", "Confident product framing"],
      },
      {
        id: "fintech-conversion",
        category: "ux-conversion",
        title: "Guided evaluation",
        description: "The page should move from value to proof to action with minimal uncertainty.",
        whyItMatters: "Fintech visitors hesitate when the product path or next step feels risky or vague.",
        signals: ["Clear CTA path", "Proof before signup", "Low-friction evaluation"],
      },
      {
        id: "fintech-mobile",
        category: "mobile-experience",
        title: "Money-task clarity on mobile",
        description: "The offer, proof, and action path should survive small screens without losing confidence.",
        whyItMatters: "Decision-makers often first encounter financial products on mobile before returning on desktop.",
        signals: ["Condensed clarity", "Scannable proof", "Mobile-safe CTA framing"],
      },
      {
        id: "fintech-seo",
        category: "seo-readiness",
        title: "Intent and product discoverability",
        description: "The information architecture should support category, use case, and comparison intent.",
        whyItMatters: "Fintech evaluation starts with specific, high-intent search behavior.",
        signals: ["Intent-based pages", "Clear product taxonomy", "Search-visible supporting content"],
      },
      {
        id: "fintech-accessibility",
        category: "accessibility",
        title: "Readable high-stakes usability",
        description: "Dense financial ideas should remain readable, navigable, and low-friction.",
        whyItMatters: "High-stakes product decisions break down fast when comprehension does.",
        signals: ["Readable contrast", "Strong semantic structure", "Predictable interaction patterns"],
      },
      {
        id: "fintech-trust",
        category: "trust-credibility",
        title: "Operational proof and reassurance",
        description: "Security, compliance, customer proof, and product maturity should feel visible without becoming theater.",
        whyItMatters: "Trust needs to be earned before the product asks for account, card, or cashflow access.",
        signals: ["Customer proof", "Compliance and security cues", "Clear signs of product maturity"],
      },
      {
        id: "fintech-security",
        category: "security-posture",
        title: "Visible security maturity",
        description: "The site should show current hardening and stable operational care.",
        whyItMatters: "Fintech credibility drops immediately when the surface feels stale or technically rough.",
        signals: ["HTTPS and modern headers", "Current trust infrastructure", "No stale or risky surface signals"],
      },
    ],
  },
  legal: {
    id: "rubric-legal",
    vertical: "legal",
    title: "Law Firms and Legal Services",
    summary:
      "A 10/10 legal site reduces anxiety before the consultation, establishes attorney credibility quickly, and makes the first contact step feel safe and low-commitment.",
    fastLifts: [
      "Lead with the client's problem and outcome, not the firm's history and awards.",
      "Surface attorney credentials, practice areas, and case-type clarity before asking for contact.",
      "Shorten the consultation path and reduce form friction so hesitant visitors convert.",
    ],
    criteria: [
      {
        id: "legal-visual",
        category: "visual-design",
        title: "Authority without intimidation",
        description:
          "The site should feel serious and credible without triggering the cold-corporate associations that make prospective clients hesitate.",
        whyItMatters: "Legal visitors are often anxious — visual tone shapes whether they stay or leave.",
        signals: [
          "Calm, confident hierarchy",
          "Human rather than institutional photography",
          "Restraint over visual clutter",
        ],
      },
      {
        id: "legal-conversion",
        category: "ux-conversion",
        title: "Consultation friction",
        description:
          "The consultation request, call, or intake path should feel low-commitment and clearly explained.",
        whyItMatters: "Legal CTA hesitation often comes from fear of cost or process unknowns, not lack of intent.",
        signals: [
          "Free consultation offer clearly stated",
          "Short, predictable contact path",
          "Proof and reassurance before the ask",
        ],
      },
      {
        id: "legal-mobile",
        category: "mobile-experience",
        title: "Mobile search-to-call speed",
        description:
          "Mobile visitors researching legal help should reach the firm's practice area, attorney, and contact action without friction.",
        whyItMatters: "Urgent legal situations often start on mobile — delays cost real conversions.",
        signals: [
          "Visible call or contact action on first scroll",
          "Practice area clarity above the fold",
          "Concise pacing without content walls",
        ],
      },
      {
        id: "legal-seo",
        category: "seo-readiness",
        title: "Practice area and location structure",
        description:
          "Pages should map practice areas, attorney profiles, and service geography into crawlable, intent-matched URLs.",
        whyItMatters: "Legal search intent is highly specific — generic pages miss the queries that convert.",
        signals: [
          "Dedicated practice area pages",
          "Attorney bio pages with structured markup",
          "Location and jurisdiction signals",
        ],
      },
      {
        id: "legal-accessibility",
        category: "accessibility",
        title: "Readable under stress",
        description:
          "Forms, navigation, and dense legal language should remain legible and predictable for visitors who may be distressed.",
        whyItMatters: "Legal visitors are often making high-stakes decisions under emotional pressure.",
        signals: [
          "Readable contrast and type sizes",
          "Clear semantic structure",
          "Predictable forms and navigation",
        ],
      },
      {
        id: "legal-trust",
        category: "trust-credibility",
        title: "Attorney credibility and outcomes",
        description:
          "Bar membership, practice focus, case outcomes (where permitted), client testimonials, and tenure should appear before skepticism forms.",
        whyItMatters: "Prospective clients are choosing someone to represent their most serious problems.",
        signals: [
          "Bar credentials and licenses",
          "Case outcomes or client testimonials",
          "Named attorney profiles with real bios",
        ],
      },
      {
        id: "legal-security",
        category: "security-posture",
        title: "Client data confidence",
        description:
          "The intake and contact surface should feel technically current and responsible.",
        whyItMatters:
          "Legal inquiries involve sensitive personal information — visible sloppiness destroys trust.",
        signals: [
          "HTTPS and modern headers",
          "Clean, minimal intake forms",
          "No obvious stale or risky surface details",
        ],
      },
    ],
  },
  "real-estate": {
    id: "rubric-real-estate",
    vertical: "real-estate",
    title: "Real Estate and Property",
    summary:
      "A 10/10 real estate site makes search and agent credibility immediate, reduces the friction between browsing and contact, and builds enough trust that visitors don't leave for Zillow.",
    fastLifts: [
      "Put search, area coverage, and agent credibility on the first screen — don't lead with branding.",
      "Move sold history, testimonials, and local expertise closer to the first contact ask.",
      "Improve mobile listing UX so buyers don't need to switch to a portal to get the information they want.",
    ],
    criteria: [
      {
        id: "realestate-visual",
        category: "visual-design",
        title: "Property-forward clarity",
        description:
          "The site should make featured properties, search, and agent identity instantly clear without looking like a portal clone.",
        whyItMatters: "Real estate buyers and sellers judge expertise from the interface before they read a word.",
        signals: [
          "High-quality property imagery",
          "Agent and area signal visible early",
          "Confident, uncluttered layout",
        ],
      },
      {
        id: "realestate-conversion",
        category: "ux-conversion",
        title: "Search and contact speed",
        description:
          "Property search, valuation requests, and agent contact should be accessible within the first scroll.",
        whyItMatters: "High-intent buyers compare multiple agents quickly — friction loses them permanently.",
        signals: [
          "Search or browse action prominent on landing",
          "Valuation or seller CTA visible",
          "Short contact path with proof before the ask",
        ],
      },
      {
        id: "realestate-mobile",
        category: "mobile-experience",
        title: "On-site mobile browsing",
        description:
          "Listings should be browsable, shareable, and actionable on mobile without switching to a portal.",
        whyItMatters:
          "Buyers often tour neighborhoods with a phone in hand — mobile UX directly affects inquiry rates.",
        signals: [
          "Mobile-optimized listing cards",
          "Easy map and filter interactions",
          "Tap-to-call or schedule visible on listings",
        ],
      },
      {
        id: "realestate-seo",
        category: "seo-readiness",
        title: "Neighborhood and property discoverability",
        description:
          "Pages should target specific neighborhoods, property types, and transactional intent queries.",
        whyItMatters: "Real estate search intent is highly local — generic pages lose to neighborhood-specific content.",
        signals: [
          "Neighborhood and community pages",
          "Property schema markup",
          "Agent profile and area pages with intent-matched copy",
        ],
      },
      {
        id: "realestate-accessibility",
        category: "accessibility",
        title: "Inclusive listing browsing",
        description:
          "Photo galleries, maps, and search filters should work under varied conditions and assistive technologies.",
        whyItMatters: "Property browsing involves complex interactive elements that often fail accessibility.",
        signals: [
          "Alt text on property images",
          "Keyboard-navigable search and filters",
          "Readable contrast on listing overlays",
        ],
      },
      {
        id: "realestate-trust",
        category: "trust-credibility",
        title: "Agent authority and social proof",
        description:
          "Sold history, local reviews, transaction volume, and agent tenure should be immediately convincing.",
        whyItMatters:
          "Sellers choose agents based on perceived expertise — trust signals directly influence listing choices.",
        signals: [
          "Sold properties and testimonials",
          "Agent license and brokerage affiliation",
          "Local market knowledge signals",
        ],
      },
      {
        id: "realestate-security",
        category: "security-posture",
        title: "Secure data handling",
        description:
          "Inquiry forms, lead capture, and buyer portals should feel technically current and trustworthy.",
        whyItMatters: "Real estate transactions involve sensitive financial information — surface sloppiness signals risk.",
        signals: [
          "HTTPS and modern headers",
          "Clean inquiry and registration forms",
          "No stale or risky surface signals",
        ],
      },
    ],
  },
  fitness: {
    id: "rubric-fitness",
    vertical: "fitness",
    title: "Gyms, Studios and Personal Training",
    summary:
      "A 10/10 fitness site makes the transformation promise clear fast, reduces the barrier to trying, and turns scheduling friction into a competitive advantage.",
    fastLifts: [
      "Lead with outcomes and community evidence, not equipment specs or class lists.",
      "Make the first-visit or free-trial path obviously easy — remove every step that isn't necessary.",
      "Ensure class schedules and booking actions are mobile-first, not an afterthought.",
    ],
    criteria: [
      {
        id: "fitness-visual",
        category: "visual-design",
        title: "Energy and identity",
        description:
          "The site should radiate the brand's energy — whether that's community warmth, athletic intensity, or boutique calm — without using stock imagery.",
        whyItMatters: "Fitness is aspirational — the visual energy sells the experience before the copy explains it.",
        signals: [
          "Real member or coach photography",
          "Consistent, energetic visual language",
          "Brand personality visible without reading",
        ],
      },
      {
        id: "fitness-conversion",
        category: "ux-conversion",
        title: "Trial and sign-up speed",
        description:
          "A free trial, intro offer, or class booking should be reachable in one confident step from the first screen.",
        whyItMatters: "Fitness consideration is often impulse-driven — friction kills conversion fast.",
        signals: [
          "Visible trial or intro offer",
          "Single-step class browse or booking",
          "Price and schedule transparency before the ask",
        ],
      },
      {
        id: "fitness-mobile",
        category: "mobile-experience",
        title: "Schedule-first mobile UX",
        description:
          "Class schedules, booking, and location information should be immediately usable on mobile without zooming or hunting.",
        whyItMatters: "Members browse and book classes on their phones — mobile UX is the product for most.",
        signals: [
          "Mobile-optimized schedule view",
          "One-tap booking or sign-up",
          "Location and hours prominent without scrolling",
        ],
      },
      {
        id: "fitness-seo",
        category: "seo-readiness",
        title: "Local and modality discoverability",
        description:
          "Pages should target local fitness intent (neighborhood + class type) and support Google Business integration.",
        whyItMatters: "Fitness searches are highly local and modality-specific — broad pages miss buying intent.",
        signals: [
          "Location and class-type pages",
          "Local business schema",
          "Reviews and rating signals surfaced structurally",
        ],
      },
      {
        id: "fitness-accessibility",
        category: "accessibility",
        title: "Schedule and booking usability",
        description:
          "Interactive schedules, modals, and booking flows should work predictably for all visitors.",
        whyItMatters: "Schedule complexity creates accessibility failures that are often the first thing mobile users encounter.",
        signals: [
          "Keyboard-accessible schedule widgets",
          "Readable contrast and type sizes",
          "Predictable booking form behavior",
        ],
      },
      {
        id: "fitness-trust",
        category: "trust-credibility",
        title: "Coach credentials and member proof",
        description:
          "Trainer certifications, transformation stories, community photos, and real reviews should appear before visitors hesitate.",
        whyItMatters: "Fitness is personal — visitors need to see that real people with credibility will be guiding them.",
        signals: [
          "Coach bios with credentials",
          "Member testimonials or before/after evidence",
          "Community size or social proof signals",
        ],
      },
      {
        id: "fitness-security",
        category: "security-posture",
        title: "Membership data confidence",
        description:
          "Sign-up and payment surfaces should feel current and properly handled.",
        whyItMatters: "Fitness memberships involve recurring billing — insecure surfaces raise obvious flags.",
        signals: [
          "HTTPS and modern headers",
          "Secure sign-up and payment surface",
          "No stale or risky infrastructure signals",
        ],
      },
    ],
  },
  "beauty-wellness": {
    id: "rubric-beauty-wellness",
    vertical: "beauty-wellness",
    title: "Beauty and Wellness",
    summary:
      "A 10/10 beauty and wellness site converts on aesthetic confidence, makes booking instantly accessible, and earns the trust that brings clients back.",
    fastLifts: [
      "Let portfolio work lead — don't bury before/after or stylist work behind generic copy.",
      "Make online booking the first action, not a buried contact form.",
      "Show real staff personalities to build the personal connection that drives repeat visits.",
    ],
    criteria: [
      {
        id: "beauty-visual",
        category: "visual-design",
        title: "Portfolio-first aesthetics",
        description:
          "The site should be as beautiful as the work it represents — portfolio imagery, color palette, and layout should signal craft.",
        whyItMatters:
          "Beauty clients judge technical skill from the website's design before booking or stepping inside.",
        signals: [
          "High-quality portfolio or work images",
          "Cohesive color and typography",
          "Clean, uncrowded layout",
        ],
      },
      {
        id: "beauty-conversion",
        category: "ux-conversion",
        title: "Booking accessibility",
        description:
          "Online booking, service menus, and pricing should be reachable in one or two steps without hunting.",
        whyItMatters: "Clients who can't quickly see pricing and book are more likely to call competitors.",
        signals: [
          "Prominent book-now action",
          "Service menu with pricing visible",
          "Staff selection before booking if relevant",
        ],
      },
      {
        id: "beauty-mobile",
        category: "mobile-experience",
        title: "Mobile booking experience",
        description:
          "Discovery, browsing portfolios, and booking should all work smoothly on small screens.",
        whyItMatters:
          "Beauty bookings are overwhelmingly initiated on mobile — a poor mobile UX loses bookings to apps.",
        signals: [
          "Portfolio images optimized for mobile",
          "One-tap booking prominent",
          "Fast, touch-friendly service menu",
        ],
      },
      {
        id: "beauty-seo",
        category: "seo-readiness",
        title: "Service and local discoverability",
        description:
          "Service pages, stylist profiles, and location signals should support intent-specific discovery.",
        whyItMatters: "Searches for specific treatments and stylists are high-intent — missing them loses the booking.",
        signals: [
          "Individual service or treatment pages",
          "Local business and review schema",
          "Location and operating hours structurally clear",
        ],
      },
      {
        id: "beauty-accessibility",
        category: "accessibility",
        title: "Inclusive booking usability",
        description:
          "Service menus, booking flows, and gallery navigation should be usable for all visitors.",
        whyItMatters: "Image-heavy and modal-heavy designs are frequent accessibility failure points.",
        signals: [
          "Alt text on portfolio images",
          "Keyboard-navigable booking flows",
          "Readable contrast on all backgrounds",
        ],
      },
      {
        id: "beauty-trust",
        category: "trust-credibility",
        title: "Stylist identity and social proof",
        description:
          "Named staff, real portfolio work, reviews, and recognizable certifications should appear before booking hesitation forms.",
        whyItMatters: "Beauty clients book people, not salons — personal credibility drives conversion and return rate.",
        signals: [
          "Named staff with real photography",
          "Client reviews and before/after work",
          "Certifications or brand affiliations visible",
        ],
      },
      {
        id: "beauty-security",
        category: "security-posture",
        title: "Booking platform confidence",
        description:
          "Online booking and payment capture should feel secure and up-to-date.",
        whyItMatters: "A stale or rough booking surface undermines the premium positioning that justifies pricing.",
        signals: [
          "HTTPS and modern headers",
          "Reputable booking platform or secure widget",
          "No obvious stale or risky surface signals",
        ],
      },
    ],
  },
  "construction-trades": {
    id: "rubric-construction-trades",
    vertical: "construction-trades",
    title: "Construction and Trades",
    summary:
      "A 10/10 construction and trades site proves the crew's skill before the estimate ask, makes project types and service coverage immediately clear, and turns skeptical homeowners into confident callers.",
    fastLifts: [
      "Lead with project portfolio and real photos — before-and-after is more persuasive than any copy.",
      "Surface license numbers, insurance proof, and warranty terms early — these are the most common objections.",
      "Make the quote or consultation request easy and low-commitment, especially on mobile.",
    ],
    criteria: [
      {
        id: "construction-visual",
        category: "visual-design",
        title: "Project confidence on first screen",
        description:
          "The site should communicate scope, quality, and professional credibility through imagery before copy gets read.",
        whyItMatters:
          "Trades buyers judge quality visually first — strong project photography does more than any headline.",
        signals: [
          "High-quality project or work-in-progress photography",
          "Trade and specialty clear on first screen",
          "Uncluttered, confident layout",
        ],
      },
      {
        id: "construction-conversion",
        category: "ux-conversion",
        title: "Quote and estimate speed",
        description:
          "Free estimate, consultation, or contact paths should be reachable without guessing or scrolling.",
        whyItMatters:
          "Trades buyers shop multiple contractors quickly — friction in the quote path loses jobs to competitors.",
        signals: [
          "Free estimate CTA prominent on first screen",
          "Short contact or quote form",
          "Service areas and project types clear before the ask",
        ],
      },
      {
        id: "construction-mobile",
        category: "mobile-experience",
        title: "Tap-to-call and mobile estimates",
        description:
          "Mobile visitors should reach the contractor's phone, service area, and quote action in one tap.",
        whyItMatters:
          "Construction searches often happen at the job site or during a problem — mobile friction costs real jobs.",
        signals: [
          "Click-to-call prominent and accessible",
          "Simple mobile estimate form",
          "Project photos optimized for mobile browsing",
        ],
      },
      {
        id: "construction-seo",
        category: "seo-readiness",
        title: "Trade and location structure",
        description:
          "Service pages should map trades, project types, and geography into intent-matched, crawlable URLs.",
        whyItMatters:
          "Construction searches combine trade + location intent — generic pages lose to structured competitors.",
        signals: [
          "Individual trade or service pages",
          "Location and service area pages",
          "Schema markup for local business and reviews",
        ],
      },
      {
        id: "construction-accessibility",
        category: "accessibility",
        title: "Practical usability for all clients",
        description:
          "Quote forms, phone links, and portfolio navigation should work for all visitors under real conditions.",
        whyItMatters: "Accessibility improvements often reduce mobile friction and convert more hesitant callers.",
        signals: [
          "Readable contrast and heading structure",
          "Usable quote and contact forms",
          "Alt text on project photography",
        ],
      },
      {
        id: "construction-trust",
        category: "trust-credibility",
        title: "License, insurance, and project proof",
        description:
          "License numbers, insurance documentation, bonding, warranty terms, and completed project galleries should appear before skepticism takes hold.",
        whyItMatters:
          "Trades buyers are burned regularly by unqualified contractors — verifiable proof is the primary conversion driver.",
        signals: [
          "License and insurance explicitly stated",
          "Completed project portfolio with details",
          "Client reviews and tenure signals",
        ],
      },
      {
        id: "construction-security",
        category: "security-posture",
        title: "Professional operational surface",
        description:
          "Public-facing hardening, form handling, and certificate validity should look like a business that takes things seriously.",
        whyItMatters:
          "Homeowners giving access to their property need to trust the business behind the website.",
        signals: [
          "HTTPS and modern headers",
          "Clean, minimal contact surface",
          "No stale or rough technical signals",
        ],
      },
    ],
  },
  "restaurant-hospitality": {
    id: "rubric-restaurant-hospitality",
    vertical: "restaurant-hospitality",
    title: "Restaurants and Hospitality",
    summary:
      "A 10/10 restaurant site closes the decision before the visitor opens another tab — by making menus, reservations, and the dining experience immediately and sensuously clear.",
    fastLifts: [
      "Lead with food photography and the dining experience, not the restaurant name and logo.",
      "Make reservations and ordering accessible in one tap — don't make hungry visitors hunt.",
      "Surface hours, location, and parking information where mobile users expect to find them fast.",
    ],
    criteria: [
      {
        id: "restaurant-visual",
        category: "visual-design",
        title: "Appetite-first visual impact",
        description:
          "The site should create an immediate sensory impression of the dining experience through photography, color, and type.",
        whyItMatters: "Restaurant decisions are emotional — great food photography converts before copy does.",
        signals: [
          "High-quality food and atmosphere photography",
          "Visual tone matching the dining experience",
          "Clean hierarchy that showcases the space",
        ],
      },
      {
        id: "restaurant-conversion",
        category: "ux-conversion",
        title: "Reserve and order speed",
        description:
          "Reservation booking, takeout ordering, and menu browsing should be reachable in one click from any device.",
        whyItMatters: "Hungry visitors have low patience — friction in the booking or order path goes to a competitor.",
        signals: [
          "Reservation CTA visible on first screen",
          "Order online action prominent",
          "Menu accessible without download or PDF",
        ],
      },
      {
        id: "restaurant-mobile",
        category: "mobile-experience",
        title: "Near-me mobile decisiveness",
        description:
          "Hours, location, menu, and booking should be accessible on mobile within two taps from any page.",
        whyItMatters:
          "Restaurant searches are among the most local and time-sensitive on mobile — the site must close, not just inform.",
        signals: [
          "Hours and address visible without scrolling",
          "Tap-to-call and directions actions",
          "Mobile-readable menu without zoom",
        ],
      },
      {
        id: "restaurant-seo",
        category: "seo-readiness",
        title: "Local and cuisine discoverability",
        description:
          "The site should support neighborhood, cuisine, and occasion-specific search intent with structured markup.",
        whyItMatters: "Diners search by cuisine type and neighborhood — structured signals win the local pack.",
        signals: [
          "Restaurant schema with hours, menu, and rating",
          "Cuisine, neighborhood, and occasion signals",
          "Google Business integration supported",
        ],
      },
      {
        id: "restaurant-accessibility",
        category: "accessibility",
        title: "Menu and booking usability",
        description:
          "Menus, reservation widgets, and contact information should be navigable for all visitors.",
        whyItMatters: "PDF menus, Flash-based booking widgets, and low-contrast overlays are common failures in hospitality.",
        signals: [
          "HTML menu with readable contrast",
          "Accessible reservation widget",
          "Alt text on food photography",
        ],
      },
      {
        id: "restaurant-trust",
        category: "trust-credibility",
        title: "Reputation and experience signals",
        description:
          "Press mentions, awards, chef credentials, dietary accommodations, and review aggregation should appear where diners look for reassurance.",
        whyItMatters:
          "Diners researching options are quickly reassured or lost based on visible evidence of quality and care.",
        signals: [
          "Press or award mentions",
          "Chef or team identity visible",
          "Dietary and allergen accommodation clear",
        ],
      },
      {
        id: "restaurant-security",
        category: "security-posture",
        title: "Booking and order surface security",
        description:
          "Reservation and payment capture surfaces should feel technically current and properly maintained.",
        whyItMatters: "A stale or broken booking widget at a premium restaurant is an immediate red flag.",
        signals: [
          "HTTPS and current certificates",
          "Reputable reservation platform integration",
          "No broken or stale technical surface details",
        ],
      },
    ],
  },
};
