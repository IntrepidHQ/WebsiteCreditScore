import type { PreviewDevice, ReportProfileType, SiteNiche, SiteObservation } from "@/lib/types/audit";
import { PREVIEW_CAPTURE_VERSION } from "@/lib/utils/preview-capture-version";

const blockedHostnamePatterns = [
  /^localhost$/i,
  /\.localhost$/i,
  /\.local$/i,
  /\.internal$/i,
  /^0\.0\.0\.0$/,
  /^127\./,
  /^10\./,
  /^169\.254\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^\[::1\]$/i,
  /^\[?fe80:/i,
  /^\[?fc/i,
  /^\[?fd/i,
];

function isBlockedHostname(hostname: string) {
  return blockedHostnamePatterns.some((pattern) => pattern.test(hostname));
}

export type NormalizeUrlOptions = {
  /**
   * When false, keeps `www.` so preview capture hits the same host the site serves
   * (many Squarespace / hosted stacks only terminate TLS on `www`).
   * Default true for audits and deduping.
   */
  stripWww?: boolean;
};

export function normalizeUrl(input: string, options?: NormalizeUrlOptions) {
  const stripWww = options?.stripWww ?? true;
  const trimmed = input.trim();

  if (!trimmed) {
    throw new Error("Enter a website URL to generate an audit.");
  }

  const candidate = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  let parsed: URL;

  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error("Use a valid website URL, for example https://example.com.");
  }

  if (isBlockedHostname(parsed.hostname)) {
    throw new Error("Use a public website URL, not a local or private address.");
  }

  if (!parsed.hostname.includes(".")) {
    throw new Error("Use a public website URL with a valid domain.");
  }

  parsed.hash = "";
  parsed.search = "";
  parsed.pathname = parsed.pathname.replace(/\/+$/, "") || "/";
  parsed.protocol = "https:";
  parsed.hostname = parsed.hostname.toLowerCase();
  if (stripWww) {
    parsed.hostname = parsed.hostname.replace(/^www\./, "");
  }

  return parsed.toString().replace(/\/$/, "");
}

export function slugFromUrl(input: string) {
  const hostname = new URL(input).hostname.replace(/^www\./, "");

  return hostname
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export function formatDomainTitle(input: string) {
  const hostname = new URL(input).hostname.replace(/^www\./, "");
  const base = hostname.split(".")[0];

  return base
    .split(/[-_]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

/**
 * Split `<title>` on common site-wide separators only. Do not split on ASCII hyphens inside
 * brand names (e.g. "T-Mobile | …" must not become "T" + rest).
 */
export function splitPageTitleIntoCandidates(pageTitle: string): string[] {
  const trimmed = pageTitle.trim();
  if (!trimmed) {
    return [];
  }

  return trimmed
    .split(/\s*[|\u2013\u2014]\s+/)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

/**
 * Choose a report title from the live `<title>` or fall back to a hostname-based label.
 */
export function pickReportTitleFromPageTitle(pageTitle: string, normalizedUrl: string): string {
  const trimmed = pageTitle.trim();
  if (!trimmed) {
    return formatDomainTitle(normalizedUrl);
  }

  const parts = splitPageTitleIntoCandidates(trimmed);
  const candidates = parts.length > 0 ? parts : [trimmed];

  const first = candidates[0] ?? "";
  if (first.length >= 3 || /[-_]/.test(first)) {
    return first;
  }

  const longer = candidates.find((p) => p.length > first.length && p.length >= 3);
  if (longer) {
    return longer;
  }

  if (first.length >= 2) {
    return first;
  }

  return formatDomainTitle(normalizedUrl);
}

export function inferProfileType(input: string): ReportProfileType {
  const hostname = new URL(input).hostname.toLowerCase();
  const root = hostname.replace(/^www\./, "").split(".")[0];

  const keywordMatches: Array<[ReportProfileType, RegExp]> = [
    [
      "healthcare",
      /(clinic|care|dental|med|health|wellness|ortho|therapy|doctor|hospital)/,
    ],
    [
      "local-service",
      /(roof|plumb|hvac|electric|landscap|remodel|clean|garage|service|repair|starbucks|dunkin|timhorton|peets|coffee|restaurant|cafe|kitchen|grill|burger|pizza|taco|food|eats|bakery|bistro|dining|brew|latte|espresso|franchise|drive.thru|order\.online)/,
    ],
    [
      "saas",
      // Subdomain / token boundaries — avoid matching "app" inside "apple.com".
      /(^|\.)app\.|(^|\.)api\.|(^|\.)cloud\.|(^|\.)dashboard\.|(^|\.)studio\.|(^|\.)data\.|(^|\.)analytics\.|(^|\.)saas\.|(^|\.)crm\.|\bsoftware\b|platform|system|suite|datadog|intercom|zendesk|hubspot|salesforce|vercel|netlify|figma|notion\.so|slack\.com|linear\.app/,
    ],
  ];

  const matched = keywordMatches.find(([, regex]) => regex.test(hostname));

  if (matched) {
    return matched[0];
  }

  // Hyphenated roots (e.g. "roof-masters") lean local-service.
  if (/-|_/.test(root)) {
    return "local-service";
  }

  // Safe default for unrecognised brand/tech domains. Using a hash-based
  // random assignment previously caused sites like claude.com to be labelled
  // "Healthcare Provider". Generic tech/brand domains are closer to SaaS than
  // either of the other two profiles.
  return "saas";
}

/**
 * Physical construction / trades — avoid overly broad tokens like `building` that match
 * figurative product copy (“building the future”, “ship what you’re building”).
 */
const constructionNichePattern =
  /\b(construction|contractors?|contracting|general\s+contractor|gc\b|roofing|remodel(ing|er)?|renovat|concrete|masonry|excavat|steel\s+erect|subcontract)\b/i;

const nicheKeywords: Array<[SiteNiche, RegExp]> = [
  ["restaurant-qsr", /(starbucks|dunkin|timhorton|coffee|restaurant|grill|kitchen|fried|chicken|burger|pizza|taco|bbq|diner|cafe|bistro|biscuit|wings|wingstop|bojangle|popeye|chick.fil|raising.cane|culver|zaxby|whataburger|sonic.drive|steak.n|hardees|dairy.queen|arbys|wendys|mcdonalds|subway|chipotle|qdoba|panera|applebee|buffalo.wild|cracker.barrel)/],
  ["dental", /(dental|dentist|orthodont|dds|dmds|teeth|smile|braces|ortho)/],
  ["healthcare-general", /(clinic|care|med|health|wellness|therapy|doctor|hospital|physio|urgent.care|telehealth|patient)/],
  ["legal", /(law|legal|attorney|lawyer|counsel|litigat|attorneys|lawfirm)/],
  ["real-estate", /(realty|realtor|homes|properties|property|housing|realestate|estate|mls|listings)/],
  ["fitness", /(gym|fitness|crossfit|yoga|training|athletic|workout|pilates|bootcamp)/],
  ["beauty-salon", /(salon|spa|beauty|nail|hair|barber|lash|brow|aesthetics|waxing)/],
  ["construction", constructionNichePattern],
  ["home-services", /(plumb|hvac|electric|landscap|irrigation|pest|cleaning|garage|gutter|handyman|repair|roof)/],
  ["retail-ecommerce", /(shop|store|boutique|retail|goods|market|supply|merch|apparel|ecommerce)/],
  /** Checked after construction/home-services to reduce false positives from generic words. */
  ["saas-software", /(software|platform|saas|crm|cloud|analytics|dashboard|workspace|devtools)/],
];

const saasProductSignals =
  /\b(linear|jira|asana|monday\.com|clickup|height\.app|notion|slack|figma|github|gitlab|product\s+hunt|issue\s+track|roadmap|sprint|backlog|pull\s+request|devops|changelog|api\s+docs|b2b\s+software|product\s+management|engineering\s+teams|developer\s+platform|product\s+development\s+system)\b/i;

const hostnameNicheOverrides: Array<[SiteNiche, RegExp]> = [
  ["saas-software", /(^|\.)linear\.app$/i],
  ["saas-software", /(^|\.)asana\.com$/i],
  ["saas-software", /(^|\.)monday\.com$/i],
  ["saas-software", /(^|\.)clickup\.com$/i],
  ["saas-software", /(^|\.)atlassian\.(com|net)$/i],
  ["saas-software", /(^|\.)notion\.so$/i],
  ["saas-software", /(^|\.)slack\.com$/i],
];

export function inferSiteNiche(
  url: string,
  observation?: Pick<SiteObservation, "pageTitle" | "metaDescription"> | null,
): SiteNiche {
  const hostname = (() => {
    try {
      return new URL(url).hostname.toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  })();

  for (const [niche, regex] of hostnameNicheOverrides) {
    if (regex.test(hostname)) {
      return niche;
    }
  }

  // Pass 1: domain keyword match
  for (const [niche, regex] of nicheKeywords) {
    if (regex.test(hostname)) {
      return niche;
    }
  }

  // Pass 2: observation text match (pageTitle + metaDescription)
  if (observation) {
    const text = `${observation.pageTitle ?? ""} ${observation.metaDescription ?? ""}`.toLowerCase();

    if (text) {
      // Strong product-software signals should win before physical-industry keywords.
      if (saasProductSignals.test(text)) {
        return "saas-software";
      }

      for (const [niche, regex] of nicheKeywords) {
        if (regex.test(text)) {
          return niche;
        }
      }
    }
  }

  // Pass 3: fall back to existing profile type → niche mapping
  const profile = inferProfileType(url);
  const profileToNiche: Record<ReportProfileType, SiteNiche> = {
    healthcare: "healthcare-general",
    "local-service": "local-service-generic",
    saas: "saas-software",
  };

  return profileToNiche[profile];
}

export function createWebsiteScreenshotUrl(
  input: string,
  device: PreviewDevice = "desktop",
) {
  return `/api/preview?url=${encodeURIComponent(
    normalizeUrl(input, { stripWww: false }),
  )}&device=${device}&v=${PREVIEW_CAPTURE_VERSION}`;
}
