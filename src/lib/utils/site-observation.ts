import type {
  ObservationFact,
  ObservationFactConfidence,
  ObservationFactSource,
  SiteObservation,
} from "@/lib/types/audit";
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
    .replace(/&mdash;/gi, "-")
    .replace(/&ndash;/gi, "-")
    .replace(/&hellip;/gi, "...")
    .replace(/&rsquo;/gi, "'")
    .replace(/&lsquo;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeObservationText(input: string) {
  return input
    .replace(/\bskip to content\b/gi, " ")
    .replace(/^\d+\s+/, "")
    .replace(/\bopen\b$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanText(input?: string | null) {
  if (!input) {
    return "";
  }

  return normalizeObservationText(decodeHtml(stripTags(input)));
}

function isLikelyNavigationNoise(input: string) {
  const cleaned = cleanText(input).toLowerCase();

  if (!cleaned) {
    return true;
  }

  const navigationTerms = [
    "skip to content",
    "home",
    "about",
    "services",
    "design process",
    "gallery",
    "contact us",
    "contact",
    "work with us",
    "kitchen",
    "bathroom",
    "outdoor",
    "portfolio",
    "faq",
    "blog",
  ];

  const matches = navigationTerms.filter((term) => cleaned.includes(term)).length;
  const punctuationCount = (cleaned.match(/[.!?]/g) ?? []).length;

  return (
    /skip to content|main menu|menu|navigation/.test(cleaned) ||
    (matches >= 4 && punctuationCount === 0) ||
    (matches >= 3 && cleaned.includes("/") && punctuationCount === 0)
  );
}

function uniqueTexts(values: string[], limit = values.length) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].slice(0, limit);
}

function trimToWordBoundary(input: string, maxLength: number) {
  if (input.length <= maxLength) {
    return input;
  }

  const trimmed = input.slice(0, maxLength).replace(/\s+\S*$/, "").trim();

  return trimmed || input.slice(0, maxLength).trim();
}

export function trimToSentenceBoundary(
  input: string,
  maxLength = 180,
  maxSentences = 2,
) {
  const cleaned = cleanText(input);

  if (!cleaned) {
    return "";
  }

  const abbreviations = [
    ["M.D.", "__MD__"],
    ["D.O.", "__DO__"],
    ["Ph.D.", "__PHD__"],
    ["Dr.", "__DR__"],
    ["Mr.", "__MR__"],
    ["Mrs.", "__MRS__"],
    ["Ms.", "__MS__"],
  ] as const;
  const protectedText = abbreviations.reduce(
    (value, [needle, replacement]) => value.replaceAll(needle, replacement),
    cleaned,
  );
  const sentences =
    protectedText
      .split(/(?<=[.!?])\s+(?=[A-Z])/)
      .map((sentence) => sentence.trim())
      .filter(Boolean)
      .map((sentence) =>
        abbreviations.reduce(
          (value, [needle, replacement]) => value.replaceAll(replacement, needle),
          sentence,
        ),
      ) ?? [];

  if (!sentences.length) {
    return trimToWordBoundary(cleaned, maxLength);
  }

  let result = "";
  let sentenceCount = 0;

  for (const sentence of sentences) {
    const next = result ? `${result} ${sentence}` : sentence;

    if (next.length > maxLength) {
      break;
    }

    result = next;
    sentenceCount += 1;

    if (sentenceCount >= maxSentences) {
      break;
    }
  }

  return result || trimToWordBoundary(cleaned, maxLength);
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

function extractEmail(text: string) {
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);

  return match?.[0] ?? "";
}

function selectAboutSnippet(paragraphs: string[], metaDescription: string) {
  const cleanParagraphs = paragraphs
    .map((paragraph) => cleanText(paragraph))
    .filter(Boolean)
    .filter((paragraph) => !isLikelyNavigationNoise(paragraph));
  const candidate = cleanParagraphs.find((paragraph) =>
    /(about|family|owner|team|mission|practice|clinic|craft|locally|years|experience|board-certified|serving|specializ)/i.test(
      paragraph,
    ),
  );
  const safeMetaDescription = cleanText(metaDescription);

  if (candidate) {
    return trimToSentenceBoundary(candidate);
  }

  if (safeMetaDescription && !isLikelyNavigationNoise(safeMetaDescription)) {
    return trimToSentenceBoundary(safeMetaDescription);
  }

  return "";
}

function parseJsonLdBlocks(html: string) {
  const blocks = [
    ...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ].map((match) => match[1]);

  return blocks.flatMap((block) => {
    try {
      const parsed = JSON.parse(block.trim());

      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
  });
}

function walkJsonValue(value: unknown, visitor: (item: Record<string, unknown>) => void) {
  if (Array.isArray(value)) {
    value.forEach((entry) => walkJsonValue(entry, visitor));
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  visitor(value as Record<string, unknown>);

  for (const nested of Object.values(value as Record<string, unknown>)) {
    walkJsonValue(nested, visitor);
  }
}

function collectSchemaStrings(data: unknown[], keys: string[]) {
  const results: string[] = [];

  for (const item of data) {
    walkJsonValue(item, (entry) => {
      for (const key of keys) {
        const value = entry[key];

        if (typeof value === "string") {
          const cleaned = cleanText(value);

          if (cleaned) {
            results.push(cleaned);
          }
        }
      }
    });
  }

  return uniqueTexts(results, 8);
}

function formatUsPhoneNumber(input: string) {
  const digits = input.replace(/\D/g, "");
  const normalized = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;

  if (normalized.length !== 10) {
    return "";
  }

  return `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`;
}

function createObservationFact(
  type: ObservationFact["type"],
  label: string,
  value: string,
  source: ObservationFactSource,
  confidence: ObservationFactConfidence,
): ObservationFact {
  return {
    id: `${type}-${source}-${value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`,
    type,
    label,
    value,
    source,
    confidence,
  };
}

function extractSchemaAddress(data: unknown[]) {
  for (const item of data) {
    let address = "";

    walkJsonValue(item, (entry) => {
      if (address) {
        return;
      }

      const addressValue = entry.address;

      if (!addressValue || typeof addressValue !== "object" || Array.isArray(addressValue)) {
        return;
      }

      const addressRecord = addressValue as Record<string, unknown>;
      const parts = [
        cleanText(typeof addressRecord.streetAddress === "string" ? addressRecord.streetAddress : ""),
        cleanText(typeof addressRecord.addressLocality === "string" ? addressRecord.addressLocality : ""),
        cleanText(typeof addressRecord.addressRegion === "string" ? addressRecord.addressRegion : ""),
        cleanText(typeof addressRecord.postalCode === "string" ? addressRecord.postalCode : ""),
      ].filter(Boolean);

      if (!parts.length) {
        return;
      }

      if (parts.length >= 4) {
        address = `${parts[0]}, ${parts[1]}, ${parts[2]} ${parts[3]}`.trim();
      } else {
        address = parts.join(", ");
      }
    });

    if (address) {
      return trimToSentenceBoundary(address, 140, 1);
    }
  }

  return "";
}

function extractLabeledPhone(paragraphs: string[]) {
  const phoneRegex = /(\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4})/;

  const match = paragraphs.find((paragraph) =>
    /(phone|call|office|appointments?|tel)/i.test(paragraph) && phoneRegex.test(paragraph),
  );

  if (!match) {
    return "";
  }

  return formatUsPhoneNumber(match.match(phoneRegex)?.[1] ?? "");
}

function extractLabeledEmail(paragraphs: string[]) {
  const match = paragraphs.find((paragraph) =>
    /(email|contact)/i.test(paragraph) && /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(paragraph),
  );

  return match ? extractEmail(match) : "";
}

function extractLabeledAddress(paragraphs: string[]) {
  const addressRegex =
    /\b\d{1,6}\s+[A-Za-z0-9.'#-]+(?:\s+[A-Za-z0-9.'#-]+)*,\s*[A-Za-z .'-]+,\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/;

  const match = paragraphs.find((paragraph) =>
    /(address|location|office|visit|located)/i.test(paragraph) && addressRegex.test(paragraph),
  );

  return match ? trimToSentenceBoundary(match.match(addressRegex)?.[0] ?? "", 140, 1) : "";
}

export function extractVerifiedFacts(
  html: string,
  paragraphs: string[],
  metaDescription: string,
) {
  const facts: ObservationFact[] = [];
  const links = extractLinks(html);
  const schemaData = parseJsonLdBlocks(html);

  const telLink = links.find((item) => /^tel:/i.test(item.href));
  const mailtoLink = links.find((item) => /^mailto:/i.test(item.href));
  const schemaPhone = collectSchemaStrings(schemaData, ["telephone", "phone"])[0] ?? "";
  const schemaEmail = collectSchemaStrings(schemaData, ["email"])[0] ?? "";
  const schemaDescription = collectSchemaStrings(schemaData, ["description"])[0] ?? "";
  const labeledPhone = extractLabeledPhone(paragraphs);
  const labeledEmail = extractLabeledEmail(paragraphs);
  const schemaAddress = extractSchemaAddress(schemaData);
  const labeledAddress = extractLabeledAddress([
    ...extractTagTexts(html, "address", 6),
    ...paragraphs,
  ]);

  const phone = formatUsPhoneNumber(
    telLink?.href.replace(/^tel:/i, "") || schemaPhone || labeledPhone,
  );

  if (phone) {
    facts.push(
      createObservationFact(
        "phone",
        "Phone",
        phone,
        telLink ? "tel-link" : schemaPhone ? "schema" : "contact-block",
        telLink || schemaPhone ? "verified" : "observed",
      ),
    );
  }

  const email = cleanText(
    mailtoLink?.href.replace(/^mailto:/i, "") || schemaEmail || labeledEmail,
  );

  if (email) {
    facts.push(
      createObservationFact(
        "email",
        "Email",
        email,
        mailtoLink ? "mailto-link" : schemaEmail ? "schema" : "contact-block",
        mailtoLink || schemaEmail ? "verified" : "observed",
      ),
    );
  }

  const address = schemaAddress || labeledAddress;

  if (address) {
    facts.push(
      createObservationFact(
        "address",
        "Address",
        address,
        schemaAddress ? "schema" : "contact-block",
        schemaAddress ? "verified" : "observed",
      ),
    );
  }

  const aboutValue = trimToSentenceBoundary(
    schemaDescription || selectAboutSnippet(paragraphs, metaDescription),
    180,
    2,
  );

  if (aboutValue) {
    facts.push(
      createObservationFact(
        "about",
        "About",
        aboutValue,
        schemaDescription
          ? "schema"
          : metaDescription && aboutValue === trimToSentenceBoundary(metaDescription, 180, 2)
            ? "meta-description"
            : "paragraph",
        schemaDescription ? "verified" : "observed",
      ),
    );
  }

  return facts;
}

function extractNotableDetails(text: string, paragraphs: string[], verifiedFacts: ObservationFact[]) {
  const notable = verifiedFacts
    .filter((fact) => fact.type !== "about")
    .slice(0, 3)
    .map((fact) => `${fact.label}: ${fact.value}`);
  const yearMatch = text.match(/\b(\d{1,2}\+?\s+years?|since\s+\d{4})\b/i);

  if (yearMatch) {
    notable.push(`Experience signal: ${yearMatch[0]}`);
  }

  const locationMatch = paragraphs.find((paragraph) =>
    /\b(?:SC|NC|CA|TX|FL|NY|GA|TN|AL|VA|WA|OR|PA|OH|MI|IL|CO|AZ|UT|OK|LA|MS|IN|MO|MD|MA|NJ|CT|RI|NH|ME|VT|DE|DC)\b/.test(
      paragraph,
    ),
  );

  if (locationMatch && !verifiedFacts.some((fact) => fact.type === "address")) {
    notable.push(trimToSentenceBoundary(locationMatch, 120, 1));
  }

  return uniqueTexts(notable, 4);
}

function derivePrimaryCtas(html: string) {
  const ctaMatcher =
    /\b(book|schedule|get started|contact|call|request|quote|estimate|claim|demo|tour|consult|apply|work with us|make an appointment)\b/i;

  return uniqueTexts(
    extractLinks(html)
      .map((item) => item.text)
      .filter((text) => !isLikelyNavigationNoise(text))
      .filter((text) => ctaMatcher.test(text))
      .map((text) => text.slice(0, 64)),
    5,
  );
}

function deriveTrustSignals(
  text: string,
  paragraphs: string[],
  schemaKinds: string[],
  verifiedFacts: ObservationFact[],
) {
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

  if (verifiedFacts.some((fact) => fact.type === "phone")) {
    signals.push("Verified phone contact is published.");
  }

  if (verifiedFacts.some((fact) => fact.type === "email")) {
    signals.push("Verified email contact is published.");
  }

  if (verifiedFacts.some((fact) => fact.type === "address")) {
    signals.push("Verified location details are visible.");
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
    verifiedFacts: [],
    primaryCtas: [],
    trustSignals: [],
    seoSignals: [],
    securitySignals: [],
    technicalSignals: [],
    notableDetails: [],
    templateSignals: [],
    screenshotUrl: createWebsiteScreenshotUrl(normalizedUrl, "desktop"),
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
    const verifiedFacts = extractVerifiedFacts(html, paragraphs, metaDescription);
    const aboutSnippet =
      verifiedFacts.find((fact) => fact.type === "about")?.value ?? "";
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
    const trustSignals = deriveTrustSignals(text, paragraphs, schemaKinds, verifiedFacts);
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
      aboutSnippet,
      verifiedFacts,
      primaryCtas: ctas,
      trustSignals,
      seoSignals,
      securitySignals,
      technicalSignals,
      notableDetails: extractNotableDetails(text, paragraphs, verifiedFacts),
      templateSignals,
      screenshotUrl: createWebsiteScreenshotUrl(finalUrl, "desktop"),
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
