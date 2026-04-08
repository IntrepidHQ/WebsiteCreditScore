import type {
  ContentClassification,
  FetchErrorReason,
  ObservationFact,
  ObservationFactConfidence,
  ObservationFactSource,
  SiteObservation,
} from "@/lib/types/audit";
import type { FirecrawlScrapePayload } from "@/lib/utils/firecrawl-types";
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
    .replace(/\bsaunders\b/gi, "Saunders")
    .replace(/\bsaunder's\b/gi, "Saunder's")
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
    return trimToSentenceBoundary(candidate, 150, 1);
  }

  if (safeMetaDescription && !isLikelyNavigationNoise(safeMetaDescription)) {
    return trimToSentenceBoundary(safeMetaDescription, 150, 1);
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

function deriveMotionSignals(html: string, text: string) {
  const signals = new Set<string>();
  const haystack = `${html}\n${text}`;

  if (/prefers-reduced-motion|motion-reduce/i.test(haystack)) {
    signals.add("reduced-motion");
  }

  if (/(hover:|focus:|active:|transition(?:-duration)?|duration-\d|ease-)/i.test(haystack)) {
    signals.add("micro-feedback");
  }

  if (/(accordion|toggle|toast|success|error|validation|form-state)/i.test(haystack)) {
    signals.add("state-feedback");
  }

  if (/(animate-|fade-|fade in|stagger|entrance|entering|reveal)/i.test(haystack)) {
    signals.add("reveal");
  }

  if (/(scrolltrigger|data-aos|scrollreveal|framer-motion|motion\/react|motion\.dev|gsap|lenis|locomotive|lottie|animejs|scroll[- ]story|parallax)/i.test(haystack)) {
    signals.add("scroll-story");
  }

  if (/(flip|layoutid|layout transition|layout-transition|view-transition)/i.test(haystack)) {
    signals.add("layout-transition");
  }

  if (/(page transition|route transition|view-transition|route-transition)/i.test(haystack)) {
    signals.add("page-transition");
  }

  if (/(splittext|typewriter|typing|scramble|kinetic|text reveal|line reveal|text-motion)/i.test(haystack)) {
    signals.add("text-motion");
  }

  if (/(marquee|ticker|ambient|background animation|looping|continuous motion)/i.test(haystack)) {
    signals.add("ambient-motion");
  }

  return uniqueTexts([...signals], 8);
}

type ContentStructureSignals = {
  internalLinkCount: number;
  htmlLength: number;
  schemaKindCount: number;
};

function classifyContent(
  requestUrl: string,
  finalUrl: string,
  text: string,
  pageTitle: string,
  headingCount: number,
  structure: ContentStructureSignals,
): ContentClassification {
  const requestHostname = new URL(requestUrl).hostname.replace(/^www\./, "");
  const finalHostname = new URL(finalUrl).hostname.replace(/^www\./, "");

  // Redirect to a search engine
  const searchEngines = ["google.com", "bing.com", "yahoo.com", "duckduckgo.com", "baidu.com", "yandex.com"];
  if (searchEngines.some((se) => finalHostname === se || finalHostname.endsWith(`.${se}`))) {
    return "search-engine-redirect";
  }

  // Redirect to an unrelated domain (not just www prefix or subdomain differences)
  const requestBase = requestHostname.split(".").slice(-2).join(".");
  const finalBase = finalHostname.split(".").slice(-2).join(".");
  if (requestBase !== finalBase) {
    return "redirect-to-unrelated";
  }

  const lower = text.toLowerCase();
  const strippedLength = text.replace(/\s+/g, " ").trim().length;

  const { internalLinkCount, htmlLength, schemaKindCount } = structure;
  // SPAs and marketing sites often ship little extractable body text / no classic h1–h2 in the
  // first HTML payload, but still return a large document with links or JSON-LD.
  const looksLikeRealDocument =
    htmlLength >= 6000 ||
    internalLinkCount >= 3 ||
    schemaKindCount > 0;

  // Empty or nearly empty page — require weak text *and* no structural hints
  if (strippedLength < 80 && headingCount === 0 && !looksLikeRealDocument) {
    return "empty-page";
  }

  // Parked domain detection
  const parkedPatterns = [
    /this domain is for sale/i,
    /buy this domain/i,
    /domain parking/i,
    /parked by/i,
    /this domain may be for sale/i,
    /domain is available/i,
    /make an offer on this domain/i,
    /hugedomains\.com/i,
    /sedoparking/i,
    /afternic/i,
    /dan\.com/i,
    /godaddy\s+auctions?/i,
    /namecheap.*marketplace/i,
  ];
  if (parkedPatterns.some((p) => p.test(lower) || p.test(pageTitle.toLowerCase()))) {
    return "parked-domain";
  }

  // Under construction — but only if it's the dominant content
  const underConstructionPatterns = [
    /^coming soon$/i,
    /site is under construction/i,
    /website is under construction/i,
    /we're building something/i,
    /under maintenance/i,
    /launching soon/i,
  ];
  if (strippedLength < 500 && underConstructionPatterns.some((p) => p.test(text.trim()) || p.test(pageTitle))) {
    return "under-construction";
  }

  return "normal";
}

function classifyFetchError(error: unknown): FetchErrorReason {
  if (!error || typeof error !== "object") return "unknown";
  const message = "message" in error && typeof error.message === "string" ? error.message : "";
  const name = "name" in error && typeof error.name === "string" ? error.name : "";

  if (name === "AbortError" || name === "TimeoutError" || /timeout|timed out/i.test(message)) {
    return "timeout";
  }
  if (/ENOTFOUND|ENOENT|getaddrinfo|dns/i.test(message)) {
    return "dns";
  }
  if (/certificate|ssl|tls|ERR_CERT/i.test(message)) {
    return "ssl";
  }
  if (/ECONNREFUSED|ECONNRESET|EHOSTUNREACH|blocked/i.test(message)) {
    return "blocked";
  }
  return "unknown";
}

function markdownParagraphsForFirecrawl(markdown: string, limit = 24): string[] {
  const blocks = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .split(/\n{2,}/)
    .map((block) =>
      block
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/[*_`]+/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter((p) => p.length > 24);

  return uniqueTexts(blocks, limit);
}

function countMarkdownHeadings(markdown: string): number {
  return (markdown.match(/^#{1,6}\s+/gm) ?? []).length;
}

function firstMarkdownHeading(markdown: string): string {
  const line = markdown.split(/\n/).find((l) => /^#{1,6}\s+/.test(l.trim()));
  if (!line) {
    return "";
  }
  return cleanText(line.replace(/^#{1,6}\s+/, ""));
}

function markdownToReadableText(markdown: string): string {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, " ");
  return cleanText(
    withoutCode
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[*_`]+/g, " "),
  );
}

function derivePrimaryCtasFromMarkdown(markdown: string): string[] {
  const ctaMatcher =
    /\b(book|schedule|get started|contact|call|request|quote|estimate|claim|demo|tour|consult|apply|work with us|make an appointment)\b/i;
  const matches = [...markdown.matchAll(/\[([^\]]{2,80})\]\([^)]+\)/g)]
    .map((m) => cleanText(m[1] ?? ""))
    .filter(Boolean)
    .filter((text) => ctaMatcher.test(text) && !isLikelyNavigationNoise(text));

  return uniqueTexts(matches.map((t) => t.slice(0, 64)), 5);
}

function mergeVerifiedFacts(primary: ObservationFact[], secondary: ObservationFact[]): ObservationFact[] {
  const seen = new Set<string>();
  const out: ObservationFact[] = [];

  for (const fact of [...primary, ...secondary]) {
    const key = `${fact.type}:${fact.value}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(fact);
  }

  return out;
}

function shouldAttemptFirecrawl(observation: SiteObservation): boolean {
  const key = (process.env.FIRECRAWL_API ?? process.env.FIRECRAWL_API_KEY ?? "").trim();
  if (!key) {
    return false;
  }

  if (!observation.fetchSucceeded) {
    return true;
  }

  const cls = observation.contentClassification;
  if (cls === "empty-page" || cls === "under-construction") {
    return true;
  }

  const thinText =
    (observation.strippedTextLength ?? 0) < 180 && (observation.headingCount ?? 0) < 2;

  return thinText;
}

function siteObservationFromFirecrawlOnly(
  normalizedRequestUrl: string,
  fc: FirecrawlScrapePayload,
): SiteObservation {
  const paragraphs = markdownParagraphsForFirecrawl(fc.markdown);
  const text = markdownToReadableText(fc.markdown);
  const pageTitle = fc.pageTitle || firstMarkdownHeading(fc.markdown);
  const heroHeading = firstMarkdownHeading(fc.markdown) || pageTitle;
  const metaDescription = fc.metaDescription;
  const verifiedFacts = extractVerifiedFacts("", paragraphs, metaDescription);
  const aboutSnippet = verifiedFacts.find((fact) => fact.type === "about")?.value ?? "";
  const headingCount = countMarkdownHeadings(fc.markdown);
  const strippedTextLength = text.replace(/\s+/g, " ").trim().length;
  const markdownLinkCount = (fc.markdown.match(/\]\([^)]+\)/g) ?? []).length;
  const contentClassification = classifyContent(
    normalizedRequestUrl,
    fc.finalUrl,
    text,
    pageTitle,
    headingCount,
    {
      internalLinkCount: markdownLinkCount,
      htmlLength: Math.max(fc.markdown.length, 1),
      schemaKindCount: 0,
    },
  );
  const trustSignals = deriveTrustSignals(text, paragraphs, [], verifiedFacts);
  const templateSignals = deriveTemplateSignals(text);
  const motionSignals = deriveMotionSignals(fc.markdown, text);
  const primaryCtas = derivePrimaryCtasFromMarkdown(fc.markdown);

  return {
    fetchedAt: new Date().toISOString(),
    finalUrl: fc.finalUrl,
    pageTitle,
    metaDescription,
    heroHeading,
    aboutSnippet,
    verifiedFacts,
    primaryCtas,
    trustSignals,
    seoSignals: uniqueTexts(
      [
        pageTitle ? `Title tag present: ${pageTitle}` : "",
        metaDescription ? "Meta description present." : "",
        heroHeading ? `Primary heading: ${heroHeading}` : "",
        "Content captured via Firecrawl (live HTML fetch failed or was blocked).",
      ],
      6,
    ),
    securitySignals: [
      "Security headers were not read from a same-origin response; posture may differ for real visitors.",
    ],
    technicalSignals: uniqueTexts(
      [
        "Page text recovered via Firecrawl; DOM-level signals (forms, viewport, canonical) were not measured on this path.",
      ],
      5,
    ),
    motionSignals,
    notableDetails: extractNotableDetails(text, paragraphs, verifiedFacts),
    templateSignals,
    screenshotUrl: createWebsiteScreenshotUrl(fc.finalUrl, "desktop"),
    ogImage: undefined,
    formCount: 0,
    internalLinkCount: 0,
    headingCount,
    hasViewport: false,
    hasCanonical: false,
    hasSchema: false,
    hasLang: false,
    missingAltRatio: 0,
    fetchSucceeded: true,
    httpStatus: 200,
    contentClassification,
    redirectTarget: fc.finalUrl !== normalizedRequestUrl ? fc.finalUrl : undefined,
    strippedTextLength,
  };
}

function mergeFirecrawlIntoSiteObservation(
  normalizedRequestUrl: string,
  base: SiteObservation,
  fc: FirecrawlScrapePayload,
): SiteObservation {
  const fcParagraphs = markdownParagraphsForFirecrawl(fc.markdown);
  const metaDescription = base.metaDescription.trim() || fc.metaDescription;
  const pageTitle = base.pageTitle.trim() || fc.pageTitle || firstMarkdownHeading(fc.markdown);
  const heroHeading = base.heroHeading.trim() || firstMarkdownHeading(fc.markdown) || pageTitle;
  const fcFacts = extractVerifiedFacts("", fcParagraphs, metaDescription);
  const verifiedFacts = mergeVerifiedFacts(base.verifiedFacts, fcFacts);
  const aboutSnippet =
    base.aboutSnippet.trim() ||
    verifiedFacts.find((fact) => fact.type === "about")?.value ||
    fcParagraphs[0] ||
    "";
  const combinedText = cleanText(
    [
      base.pageTitle,
      base.heroHeading,
      base.metaDescription,
      base.aboutSnippet,
      markdownToReadableText(fc.markdown),
    ].join(" "),
  );
  const headingCount = Math.max(base.headingCount, countMarkdownHeadings(fc.markdown));
  const strippedTextLength = combinedText.replace(/\s+/g, " ").trim().length;
  const finalUrl = fc.finalUrl || base.finalUrl;
  const markdownLinkCount = (fc.markdown.match(/\]\([^)]+\)/g) ?? []).length;
  const contentClassification = classifyContent(
    normalizedRequestUrl,
    finalUrl,
    combinedText,
    pageTitle,
    headingCount,
    {
      internalLinkCount: Math.max(base.internalLinkCount, markdownLinkCount),
      htmlLength: Math.max(fc.markdown.length, (base.strippedTextLength ?? 0) * 2, 1),
      schemaKindCount: base.hasSchema ? 1 : 0,
    },
  );
  const paragraphs = uniqueTexts(
    [...fcParagraphs, base.aboutSnippet, base.metaDescription].filter(Boolean),
    28,
  );
  const trustSignals = uniqueTexts(
    [
      ...base.trustSignals,
      ...deriveTrustSignals(combinedText, paragraphs, [], verifiedFacts),
    ],
    10,
  );
  const primaryCtas =
    base.primaryCtas.length > 0 ? base.primaryCtas : derivePrimaryCtasFromMarkdown(fc.markdown);

  return {
    ...base,
    fetchedAt: new Date().toISOString(),
    finalUrl,
    pageTitle,
    metaDescription,
    heroHeading,
    aboutSnippet,
    verifiedFacts,
    primaryCtas,
    trustSignals,
    templateSignals: uniqueTexts(
      [...base.templateSignals, ...deriveTemplateSignals(combinedText)],
      8,
    ),
    motionSignals: uniqueTexts(
      [...base.motionSignals, ...deriveMotionSignals(fc.markdown, combinedText)],
      8,
    ),
    notableDetails: extractNotableDetails(combinedText, paragraphs, verifiedFacts),
    seoSignals: uniqueTexts(
      [
        ...base.seoSignals,
        "Additional page copy recovered via Firecrawl after a thin live HTML parse.",
      ],
      8,
    ),
    technicalSignals: uniqueTexts(
      [...base.technicalSignals, "Supplemental text source: Firecrawl markdown."],
      6,
    ),
    contentClassification,
    strippedTextLength,
    headingCount,
  };
}

async function maybeEnrichWithFirecrawl(
  normalizedRequestUrl: string,
  observation: SiteObservation,
): Promise<SiteObservation> {
  if (!shouldAttemptFirecrawl(observation)) {
    return observation;
  }

  const { scrapeUrlMarkdownWithFirecrawl } = await import("@/lib/utils/firecrawl-scrape");
  const target = observation.fetchSucceeded ? observation.finalUrl : normalizedRequestUrl;
  const fc = await scrapeUrlMarkdownWithFirecrawl(target);
  if (!fc) {
    return observation;
  }

  if (!observation.fetchSucceeded) {
    return siteObservationFromFirecrawlOnly(normalizedRequestUrl, fc);
  }

  return mergeFirecrawlIntoSiteObservation(normalizedRequestUrl, observation, fc);
}

export function createFallbackObservation(
  rawUrl: string,
  fetchError?: FetchErrorReason,
  httpStatus?: number,
): SiteObservation {
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
    motionSignals: [],
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
    fetchError: fetchError ?? "unknown",
    httpStatus,
    strippedTextLength: 0,
  };
}

async function fetchObservation(normalizedUrl: string): Promise<SiteObservation> {
  try {
    const response = await fetch(normalizedUrl, {
      headers: {
        // Browser-like UA: some chains return a tiny “bot” shell to generic crawlers, which
        // tripped our empty-page gate even when the real site has content.
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });

    if (!response.ok) {
      return createFallbackObservation(normalizedUrl, "http-error", response.status);
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
    const headingCount =
      extractTagTexts(html, "h1", 6).length +
      extractTagTexts(html, "h2", 12).length +
      extractTagTexts(html, "h3", 8).length;
    const formCount = [...html.matchAll(/<form\b/gi)].length;
    const missingAltRatio = computeMissingAltRatio(html);
    const templateSignals = deriveTemplateSignals(text);
    const trustSignals = deriveTrustSignals(text, paragraphs, schemaKinds, verifiedFacts);
    const securitySignals = deriveSecuritySignals(response.headers);
    const motionSignals = deriveMotionSignals(html, text);
    const strippedTextLength = text.replace(/\s+/g, " ").trim().length;
    const contentClassification = classifyContent(normalizedUrl, finalUrl, text, pageTitle, headingCount, {
      internalLinkCount,
      htmlLength: html.length,
      schemaKindCount: schemaKinds.length,
    });
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
      motionSignals,
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
      httpStatus: response.status,
      contentClassification,
      redirectTarget: finalUrl !== normalizedUrl ? finalUrl : undefined,
      strippedTextLength,
    };
  } catch (error) {
    return createFallbackObservation(normalizedUrl, classifyFetchError(error));
  }
}

export async function inspectWebsite(rawUrl: string) {
  const normalizedUrl = normalizeUrl(rawUrl);
  const cached = observationCache.get(normalizedUrl);

  if (cached) {
    return cached;
  }

  const pending = (async () => {
    const base = await fetchObservation(normalizedUrl);
    return maybeEnrichWithFirecrawl(normalizedUrl, base);
  })();
  observationCache.set(normalizedUrl, pending);

  return pending;
}
