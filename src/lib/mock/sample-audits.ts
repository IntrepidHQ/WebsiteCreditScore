import type { SampleAuditCard } from "@/lib/types/audit";
import { createWebsiteScreenshotUrl } from "@/lib/utils/url";

export const sampleAudits: SampleAuditCard[] = [
  {
    id: "mark-deford-md",
    title: "Mark Deford M.D.",
    url: "https://markdeford.dr-leonardo.com",
    previewUrl: "https://markdeford.dr-leonardo.com",
    profile: "healthcare",
    summary:
      "Provider details are present, but the first impression still feels generic.",
    scannedAt: new Date("2026-03-27T14:00:00-04:00").toISOString(),
    previewImage: createWebsiteScreenshotUrl("https://markdeford.dr-leonardo.com", "desktop"),
    fallbackPreviewImage: "/previews/healthcare-current.svg",
    executiveSummary:
      "This example is based on the live Mark Deford M.D. profile page. The site includes real provider metadata and health-information depth, but the templated presentation weakens trust at first glance.",
    highlights: [
      "The live page exposes the physician name, specialty, and North Charleston location details.",
      "Quick links include appointments, credentials, insurance, locations, and contact paths.",
      "Generic profile imagery and templated layout cues still show through the experience.",
    ],
    scoreOverrides: {
      "visual-design": 3.8,
      "ux-conversion": 4.2,
      "mobile-experience": 4.1,
      "seo-readiness": 6.2,
      accessibility: 4.8,
      "trust-credibility": 5.2,
      "security-posture": 5.9,
    },
  },
  {
    id: "saunders-woodworks",
    title: "Saunders Wood Work LLC",
    url: "https://www.saunderswoodworkllc.com/about",
    /** Homepage captures reliably in headless; audit still deep-links to /about. */
    previewUrl: "https://www.saunderswoodworkllc.com",
    profile: "local-service",
    summary:
      "The story is credible, but the page still makes visitors read too much before acting.",
    scannedAt: new Date("2026-03-28T10:30:00-04:00").toISOString(),
    // Homepage screenshot: `www` + stripWww:false matches `/api/preview` cache keys (Squarespace TLS).
    previewImage: createWebsiteScreenshotUrl("https://www.saunderswoodworkllc.com", "desktop"),
    fallbackPreviewImage: "/previews/service-current.svg",
    executiveSummary:
      "This example is based on the live Saunders Wood Work LLC About page. The business story is credible and detailed, but the page asks visitors to read a lot before it creates a clear next step.",
    highlights: [
      "The page claims 30+ years in the industry and names owner Mathew as the hands-on reviewer.",
      "Primary navigation and CTA language center on About, Contact Us, and Work with Us.",
      "The page publishes a Mount Pleasant address, office phone, office email, and weekday hours.",
    ],
    scoreOverrides: {
      "visual-design": 6.1,
      "ux-conversion": 5,
      "mobile-experience": 5.4,
      "seo-readiness": 4.7,
      accessibility: 5.5,
      "trust-credibility": 6.7,
      "security-posture": 6.1,
    },
  },
  {
    id: "one-medical",
    title: "One Medical",
    url: "https://www.onemedical.com",
    previewUrl: "https://www.onemedical.com",
    profile: "healthcare",
    summary:
      "The first-screen promise is calmer, clearer, and easier to trust before the booking ask arrives.",
    scannedAt: new Date("2026-03-29T09:15:00-04:00").toISOString(),
    previewImage: createWebsiteScreenshotUrl("https://www.onemedical.com", "desktop"),
    executiveSummary:
      "This example shows how a private-care homepage can reduce anxiety, lead with reassurance, and keep the booking path obvious without feeling abrupt.",
    highlights: [
      "The first screen states the offer clearly and gives the visitor one obvious next step.",
      "Trust cues and practical details appear before the page asks for commitment.",
      "The mobile experience keeps booking and wayfinding simple instead of forcing extra scanning.",
    ],
    scoreOverrides: {
      "visual-design": 8.7,
      "ux-conversion": 9.1,
      "mobile-experience": 9.0,
      "seo-readiness": 8.3,
      accessibility: 8.8,
      "trust-credibility": 9.4,
      "security-posture": 8.7,
    },
  },
  {
    id: "northface-construction",
    title: "Northface Construction",
    url: "https://northfaceconstruction.com",
    previewUrl: "https://northfaceconstruction.com",
    profile: "local-service",
    summary:
      "The estimate path is cleaner because the page earns trust with proof before pushing the ask.",
    scannedAt: new Date("2026-03-30T09:10:00-04:00").toISOString(),
    previewImage: createWebsiteScreenshotUrl("https://northfaceconstruction.com", "desktop"),
    executiveSummary:
      "This example raises the service-business bar with a stronger premium first impression, tighter process framing, and a clearer estimate path.",
    highlights: [
      "The first screen feels more considered than a typical contractor template.",
      "The site earns the ask with process, proof, and professional tone instead of rushing to forms.",
      "Project proof and structure support the quote path instead of competing with it.",
    ],
    scoreOverrides: {
      "visual-design": 8.5,
      "ux-conversion": 8.7,
      "mobile-experience": 8.4,
      "seo-readiness": 7.9,
      accessibility: 8.0,
      "trust-credibility": 8.9,
      "security-posture": 8.1,
    },
  },
  {
    id: "stripe",
    title: "Stripe",
    url: "https://stripe.com",
    previewUrl: "https://stripe.com",
    profile: "saas",
    summary:
      "Positioning, proof density, and product explanation stay clear even when the page carries a lot of information.",
    scannedAt: new Date("2026-03-30T13:45:00-04:00").toISOString(),
    previewImage: createWebsiteScreenshotUrl("https://stripe.com", "desktop"),
    executiveSummary:
      "This example is a strong SaaS benchmark because it stays confident and scannable while carrying pricing, proof, product detail, and next-step momentum at the same time.",
    highlights: [
      "Positioning, proof, and product explanation stay scannable even on dense pages.",
      "The site earns trust with strong structure before it asks for deeper commitment.",
      "CTAs stay visible without turning the page into a generic demand-gen template.",
    ],
    scoreOverrides: {
      "visual-design": 9.3,
      "ux-conversion": 9.1,
      "mobile-experience": 9.0,
      "seo-readiness": 8.8,
      accessibility: 9.0,
      "trust-credibility": 9.2,
      "security-posture": 9.1,
    },
  },
];
