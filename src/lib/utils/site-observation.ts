import type { SiteObservation } from "@/lib/types/audit";
import { createWebsiteScreenshotUrl, normalizeUrl } from "@/lib/utils/url";

const observationCache = new Map<string, Promise<SiteObservation>>();

function stripTags(input: string) {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtml(input: string) {
  return input
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanText(input?: string | null) {
  if (!input) {
    return "";
  }

  return decodeHtml(stripTags(input));
}

function uniqueTexts(values: string[], limit = values.length) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].slice(0, limit);
}

function extractTagTexts(html: string, tagName: string, limit = 12) {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi");
  const matches = [...html.matchAll(regex)]
    .map((match) => cleanText(match[1]))
    .filter(Boolean);

  return uniqueTexts(matches, limit);
}

function extractMetaContent(
  html: string,
  attribute: "name" | "property",
  value: string,
) {
  const regex = new RegExp(
    `<meta[^>]*${attribute}=["']${value}["'][^>]*content=["']([^"']+)["'][^>]*>`,
    "i",
  );

  return cleanText(html.match(regex)?.[1]);
}

function extractCanonical(html: string) {
  const match = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);

  return match?.[1]?.trim() ?? "";
}

function extractLinks(html: string) {
  const linkRegex = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  const links = [...html.matchAll(linkRegex)].map((match) => ({
    href: match[1].match(/href=["']([^"']+)["']/i)?.[1] ?? "",
    text: cleanText(match[2]),
  }));

  const buttonRegex = /<button\b[^>]*>([\s\S]*?)<\/button>/gi;
  const buttons = [...html.matchAll(buttonRegex)].map((match) => ({
    href: "",
    text: cleanText(match[1]),
  }));

  return [...links, ...buttons];
}

function extractSchemaKinds(html: string) {
  const schemaBlocks = [
    ...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ].map((match) => match[1]);

  const kinds = schemaBlocks.flatMap((block) => {
    const entries = [...block.matchAll(/"@type"\s*:\s*"([^"]+)"/gi)].map((match) => match[1]);

    return entries;
  });

  return uniqueTexts(kinds, 8);
}

function extractPhoneNumber(text: string) {
  const match = text.match(
    /(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/,
  );

  return match?.[0] ?? "";
}

function extractEmail(text: string) {
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);

  return match?.[0] ?? "";
}

function selectAboutSnippet(paragraphs: string[], metaDescription: string) {
  const candidate = paragraphs.find((paragraph) =>
    /(about|family|owner|team|mission|practice|clinic|craft|locally|years|experience|board-certified|serving|specializ)/i.test(
      paragraph,
    ),
  );

  return candidate ?? metaDescription;
}

function extractNotableDetails(text: string, paragraphs: string[]) {
  const notable: string[] = [];
  const phoneNumber = extractPhoneNumber(text);
  const email = extractEmail(text);

  if (phoneNumber) {
    notable.push(`Phone listed: ${phoneNumber}`);
  }

  if (email) {
    notable.push(`Email listed: ${email}`);
  }

  const yearMatch = text.match(/\b(\d{1,2}\+?\s+years?|since\s+\d{4})\b/i);

  if (yearMatch) {
    notable.push(`Experience signal: ${yearMatch[0]}`);
  }

  const locationMatch = paragraphs.find((paragraph) =>
    /\b(?:SC|NC|CA|TX|FL|NY|GA|TN|AL|VA|WA|OR|PA|OH|MI|IL|CO|AZ|UT|OK|LA|MS|IN|MO|MD|MA|NJ|CT|RI|NH|ME|VT|DE|DC)\b/.test(
      paragraph,
    ),
  );

  if (locationMatch) {
    notable.push(locationMatch.slice(0, 120));
  }

  return uniqueTexts(notable, 4);
}

function derivePrimaryCtas(html: string) {
  const ctaMatcher =
    /\b(book|schedule|get started|contact|call|request|quote|estimate|claim|demo|tour|consult|apply|work with us|make an appointment)\b/i;

  return uniqueTexts(
    extractLinks(html)
      .map((item) => item.text)
      .filter((text) => ctaMatcher.test(text))
      .map((text) => text.slice(0, 64)),
    5,
  );
}

function deriveTrustSignals(text: string, paragraphs: string[], schemaKinds: string[]) {
  const signals: string[] = [];

  if (/testimonial|review|rating|five-star|5-star/i.test(text)) {
    signals.push("Reviews or testimonial language is present.");
  }

  if (/board-certified|licensed|insured|certified|npi|specialty/i.test(text)) {
    signals.push("Credential or certification language is visible.");
  }

  if (/family owned|locally owned|serving|experience|years/i.test(text)) {
    signals.push("Tenure or local ownership language is visible.");
  }

  if (extractPhoneNumber(text)) {
    signals.push("Direct phone contact is published.");
  }

  if (extractEmail(text)) {
    signals.push("Direct email contact is published.");
  }

  if (paragraphs.some((paragraph) => /hours|monday|tuesday|friday|open/i.test(paragraph))) {
    signals.push("Business hours are visible.");
  }

  if (schemaKinds.some((kind) => /Physician|MedicalClinic|Organization|LocalBusiness|ProfessionalService|Service/i.test(kind))) {
    signals.push(`Structured data references ${schemaKinds[0]}.`);
  }

  return uniqueTexts(signals, 5);
}

function deriveTemplateSignals(text: string) {
  const patterns = [
    /your practice name/i,
    /lorem ipsum/i,
    /coming soon/i,
    /default/i,
    /sample text/i,
    /placeholder/i,
  ];

  return patterns
    .filter((pattern) => pattern.test(text))
    .map((pattern) => `Template marker matched: ${pattern.source.replace(/\\b|\//g, "")}`);
}

function countInternalLinks(links: ReturnType<typeof extractLinks>, hostname: string) {
  return links.filter((item) => {
    if (!item.href) {
      return false;
    }

    if (item.href.startsWith("/") || item.href.startsWith("#")) {
      return true;
    }

    try {
      return new URL(item.href, `https://${hostname}`).hostname.replace(/^www\./, "") === hostname;
    } catch {
      return false;
    }
  }).length;
}

function computeMissingAltRatio(html: string) {
  const imageMatches = [...html.matchAll(/<img\b([^>]*)>/gi)];

  if (!imageMatches.length) {
    return 0;
  }

  const missingAlt = imageMatches.filter((match) => !/\balt=["'][^"']*["']/i.test(match[1])).length;

  return Number((missingAlt / imageMatches.length).toFixed(2));
}

function deriveSecuritySignals(headers: Headers) {
  const signals: string[] = [];

  if (headers.get("strict-transport-security")) {
    signals.push("HSTS header present.");
  }

  if (headers.get("content-security-policy")) {
    signals.push("Content Security Policy present.");
  }

  if (headers.get("x-frame-options")) {
    signals.push("Frame embedding policy present.");
  }

  if (headers.get("referrer-policy")) {
    signals.push("Referrer policy present.");
  }

  if (headers.get("permissions-policy")) {
    signals.push("Permissions policy present.");
  }

  if (headers.get("x-content-type-options")) {
    signals.push("MIME sniffing protection present.");
  }

  return signals;
}

export function createFallbackObservation(rawUrl: string): SiteObservation {
  const normalizedUrl = normalizeUrl(rawUrl);

  return {
    fetchedAt: new Date().toISOString(),
    finalUrl: normalizedUrl,
    pageTitle: "",
    metaDescription: "",
    heroHeading: "",
    aboutSnippet: "",
    primaryCtas: [],
    trustSignals: [],
    seoSignals: [],
    securitySignals: [],
    technicalSignals: [],
    notableDetails: [],
    templateSignals: [],
    screenshotUrl: createWebsiteScreenshotUrl(normalizedUrl),
    ogImage: undefined,
    formCount: 0,
    internalLinkCount: 0,
    headingCount: 0,
    hasViewport: false,
    hasCanonical: false,
    hasSchema: false,
    hasLang: false,
    missingAltRatio: 0,
    fetchSucceeded: false,
  };
}

async function fetchObservation(normalizedUrl: string): Promise<SiteObservation> {
  const fallback = createFallbackObservation(normalizedUrl);

  try {
    const response = await fetch(normalizedUrl, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; CraydlAudit/1.0; +https://craydl.pro)",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });

    if (!response.ok) {
      return fallback;
    }

    const finalUrl = response.url || normalizedUrl;
    const html = await response.text();
    const text = cleanText(html);
    const paragraphs = extractTagTexts(html, "p", 20);
    const pageTitle = cleanText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]);
    const metaDescription =
      extractMetaContent(html, "name", "description") ||
      extractMetaContent(html, "property", "og:description");
    const heroHeading = extractTagTexts(html, "h1", 1)[0] ?? "";
    const links = extractLinks(html);
    const ctas = derivePrimaryCtas(html);
    const schemaKinds = extractSchemaKinds(html);
    const hostname = new URL(finalUrl).hostname.replace(/^www\./, "");
    const ogImage =
      extractMetaContent(html, "property", "og:image") ||
      extractMetaContent(html, "name", "twitter:image");
    const canonical = extractCanonical(html);
    const hasViewport = /<meta[^>]*name=["']viewport["']/i.test(html);
    const hasLang = /<html[^>]*lang=["'][^"']+["']/i.test(html);
    const internalLinkCount = countInternalLinks(links, hostname);
    const headingCount = extractTagTexts(html, "h1", 6).length + extractTagTexts(html, "h2", 12).length;
    const formCount = [...html.matchAll(/<form\b/gi)].length;
    const missingAltRatio = computeMissingAltRatio(html);
    const templateSignals = deriveTemplateSignals(text);
    const trustSignals = deriveTrustSignals(text, paragraphs, schemaKinds);
    const securitySignals = deriveSecuritySignals(response.headers);
    const seoSignals = uniqueTexts(
      [
        pageTitle ? `Title tag present: ${pageTitle}` : "",
        metaDescription ? "Meta description present." : "",
        heroHeading ? `Primary heading: ${heroHeading}` : "",
        canonical ? "Canonical URL present." : "",
        schemaKinds.length ? `Structured data found: ${schemaKinds.join(", ")}` : "",
        internalLinkCount ? `${internalLinkCount} internal links on the page.` : "",
      ],
      6,
    );
    const technicalSignals = uniqueTexts(
      [
        hasViewport ? "Viewport meta tag present." : "Viewport meta tag not detected.",
        hasLang ? "Language attribute present on the HTML element." : "Language attribute not detected.",
        formCount ? `${formCount} form${formCount > 1 ? "s" : ""} detected.` : "No forms detected on the page.",
        missingAltRatio > 0
          ? `Estimated missing alt ratio: ${Math.round(missingAltRatio * 100)}%.`
          : "Images appear to include alt attributes.",
      ],
      5,
    );

    return {
      fetchedAt: new Date().toISOString(),
      finalUrl,
      pageTitle,
      metaDescription,
      heroHeading,
      aboutSnippet: selectAboutSnippet(paragraphs, metaDescription),
      primaryCtas: ctas,
      trustSignals,
      seoSignals,
      securitySignals,
      technicalSignals,
      notableDetails: extractNotableDetails(text, paragraphs),
      templateSignals,
      screenshotUrl: createWebsiteScreenshotUrl(finalUrl),
      ogImage: ogImage
        ? new URL(ogImage, finalUrl).toString()
        : undefined,
      formCount,
      internalLinkCount,
      headingCount,
      hasViewport,
      hasCanonical: Boolean(canonical),
      hasSchema: schemaKinds.length > 0,
      hasLang,
      missingAltRatio,
      fetchSucceeded: true,
    };
  } catch {
    return fallback;
  }
}

export async function inspectWebsite(rawUrl: string) {
  const normalizedUrl = normalizeUrl(rawUrl);
  const cached = observationCache.get(normalizedUrl);

  if (cached) {
    return cached;
  }

  const pending = fetchObservation(normalizedUrl);
  observationCache.set(normalizedUrl, pending);

  return pending;
}
