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
    previewUrl: "https://www.saunderswoodworkllc.com/about",
    profile: "local-service",
    summary:
      "The story is credible, but the page still makes visitors read too much before acting.",
    scannedAt: new Date("2026-03-28T10:30:00-04:00").toISOString(),
    previewImage: createWebsiteScreenshotUrl("https://www.saunderswoodworkllc.com/about", "desktop"),
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
];
