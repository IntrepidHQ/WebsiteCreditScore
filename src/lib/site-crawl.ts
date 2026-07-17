import "server-only";

/**
 * First-party site crawl.
 *
 * The scan agent only has web_search, which judges "does this site have a
 * privacy policy / pricing page?" by whether Google has *indexed* that URL.
 * New or lightly-indexed sites get unfairly marked as missing transparency
 * documents that are actually one footer click away (this is exactly what
 * mis-scored quantonlabs.com — real /privacy and /terms pages, footer-linked,
 * but unindexed).
 *
 * This module fetches the homepage directly, extracts its links (especially
 * the footer), and confirms which legal / pricing / contact pages actually
 * exist. The result is injected into the agent prompt as authoritative
 * ground truth so the agent never claims a page is absent when it demonstrably
 * exists.
 */

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/122.0 Safari/537.36 WebsiteCreditScoreBot/1.0";

const HOMEPAGE_TIMEOUT_MS = 10_000;
const PAGE_TIMEOUT_MS = 8_000;
const MAX_FOLLOWED_PAGES = 8;
const TOTAL_BUDGET_MS = 25_000;

/** Legal / transparency / contact page categories we care about. */
export type PageCategory =
  | "privacy"
  | "terms"
  | "refund"
  | "pricing"
  | "cookies"
  | "contact"
  | "about"
  | "security"
  | "dpa"
  | "sla";

/** href / anchor-text patterns that identify each category. */
const CATEGORY_PATTERNS: Record<PageCategory, RegExp> = {
  privacy: /privacy/i,
  terms: /\b(terms|tos|terms-of-(service|use)|conditions)\b/i,
  refund: /\b(refund|returns?|cancellation)\b/i,
  pricing: /\b(pricing|plans|pricing-plans|buy|checkout)\b/i,
  cookies: /\bcookies?\b/i,
  contact: /\bcontact\b/i,
  about: /\b(about|company|team|who-we-are)\b/i,
  security: /\b(security|trust|compliance)\b/i,
  dpa: /\b(dpa|data-processing|data-protection|gdpr)\b/i,
  sla: /\b(sla|service-level|uptime)\b/i,
};

/** Fallback URL paths to probe when the homepage doesn't link a category. */
const FALLBACK_PATHS: Record<PageCategory, string[]> = {
  privacy: ["/privacy", "/privacy-policy"],
  terms: ["/terms", "/terms-of-service", "/terms-of-use", "/tos"],
  refund: ["/refund", "/refund-policy", "/returns"],
  pricing: ["/pricing", "/plans"],
  cookies: ["/cookies", "/cookie-policy"],
  contact: ["/contact", "/contact-us"],
  about: ["/about", "/about-us"],
  security: ["/security", "/trust"],
  dpa: ["/dpa", "/data-processing-agreement"],
  sla: ["/sla"],
};

export interface FoundPage {
  category: PageCategory;
  url: string;
  title: string | null;
  /** How we found it: a real footer/nav link, or a probed fallback path. */
  via: "link" | "probe";
  excerpt: string | null;
}

export interface SiteCrawl {
  domain: string;
  homepageOk: boolean;
  /** Distinct same-origin links discovered on the homepage (href → text). */
  links: { href: string; text: string }[];
  found: FoundPage[];
  contact: {
    email: boolean;
    phone: boolean;
    form: boolean;
  };
  /** Human-readable notes (fetch failures etc.). */
  notes: string[];
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([^<]{0,160})<\/title>/i);
  if (m) return m[1].trim();
  const h1 = html.match(/<h1[^>]*>([\s\S]{0,160}?)<\/h1>/i);
  return h1 ? stripTags(h1[1]).slice(0, 160) : null;
}

async function fetchText(url: string, timeoutMs: number): Promise<{ ok: boolean; status: number; html: string }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml" },
    });
    const html = res.ok ? await res.text() : "";
    return { ok: res.ok, status: res.status, html };
  } catch {
    return { ok: false, status: 0, html: "" };
  } finally {
    clearTimeout(timer);
  }
}

/** Absolute-ize an href against the site origin; return null if off-origin or junk. */
function normalizeHref(href: string, origin: string): string | null {
  if (!href) return null;
  const h = href.trim();
  if (h.startsWith("#") || h.startsWith("mailto:") || h.startsWith("tel:") || h.startsWith("javascript:")) {
    return null;
  }
  try {
    const u = new URL(h, origin);
    if (u.origin !== origin) return null;
    u.hash = "";
    return u.toString();
  } catch {
    return null;
  }
}

function extractLinks(html: string, origin: string): { href: string; text: string }[] {
  const out = new Map<string, string>();
  const re = /<a\b[^>]*?href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const abs = normalizeHref(m[1], origin);
    if (!abs) continue;
    const text = stripTags(m[2]).slice(0, 80);
    if (!out.has(abs)) out.set(abs, text);
  }
  return [...out.entries()].map(([href, text]) => ({ href, text }));
}

function categorize(href: string, text: string): PageCategory | null {
  const hay = `${href} ${text}`;
  // Order matters: check narrower categories before broader ones.
  const order: PageCategory[] = [
    "privacy", "terms", "refund", "cookies", "dpa", "sla",
    "security", "pricing", "contact", "about",
  ];
  for (const cat of order) {
    if (CATEGORY_PATTERNS[cat].test(hay)) return cat;
  }
  return null;
}

/**
 * Crawl a domain's homepage + its legal/pricing/contact pages. Never throws —
 * returns a best-effort partial crawl within a total time budget.
 */
export async function crawlSite(domain: string): Promise<SiteCrawl> {
  const started = Date.now();
  const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const origin = `https://${clean}`;
  const crawl: SiteCrawl = {
    domain: clean,
    homepageOk: false,
    links: [],
    found: [],
    contact: { email: false, phone: false, form: false },
    notes: [],
  };

  const home = await fetchText(origin, HOMEPAGE_TIMEOUT_MS);
  if (!home.ok || !home.html) {
    crawl.notes.push(`Homepage fetch failed (status ${home.status || "network error"}).`);
    return crawl;
  }
  crawl.homepageOk = true;

  crawl.contact.email = /mailto:/i.test(home.html) || /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(stripTags(home.html));
  crawl.contact.phone = /tel:/i.test(home.html) || /(\+?\d[\d\s().-]{7,}\d)/.test(stripTags(home.html));
  crawl.contact.form = /<form\b/i.test(home.html);

  crawl.links = extractLinks(home.html, origin);

  // Pick the best link per category from real homepage links.
  const linkByCat = new Map<PageCategory, { href: string; text: string }>();
  for (const link of crawl.links) {
    const cat = categorize(link.href, link.text);
    if (cat && !linkByCat.has(cat)) linkByCat.set(cat, link);
  }

  // Build the fetch list: real links first, then fallback probes for any
  // category we didn't find a link for.
  const toFetch: { category: PageCategory; url: string; via: "link" | "probe" }[] = [];
  const priority: PageCategory[] = [
    "privacy", "terms", "pricing", "refund", "cookies", "contact", "security", "dpa", "sla", "about",
  ];
  for (const cat of priority) {
    const link = linkByCat.get(cat);
    if (link) {
      toFetch.push({ category: cat, url: link.href, via: "link" });
    } else {
      for (const p of FALLBACK_PATHS[cat]) {
        toFetch.push({ category: cat, url: `${origin}${p}`, via: "probe" });
      }
    }
  }

  const seen = new Set<PageCategory>();
  let fetched = 0;
  for (const item of toFetch) {
    if (seen.has(item.category)) continue;
    if (fetched >= MAX_FOLLOWED_PAGES) break;
    if (Date.now() - started > TOTAL_BUDGET_MS) {
      crawl.notes.push("Crawl time budget reached; some pages not checked.");
      break;
    }
    fetched++;
    const page = await fetchText(item.url, PAGE_TIMEOUT_MS);
    if (!page.ok || !page.html) continue;
    // A probe that lands on a soft-404 homepage clone is filtered by title/length.
    if (item.via === "probe" && page.html.length < 400) continue;
    seen.add(item.category);
    crawl.found.push({
      category: item.category,
      url: item.url,
      title: extractTitle(page.html),
      via: item.via,
      excerpt: stripTags(page.html).slice(0, 220) || null,
    });
  }

  return crawl;
}

/**
 * Render a crawl as an authoritative evidence block for the agent prompt.
 * Empty string when the homepage couldn't be fetched (agent falls back to
 * search-only, unchanged behavior).
 */
export function crawlToPromptBlock(crawl: SiteCrawl): string {
  if (!crawl.homepageOk) {
    return `FIRST-PARTY SITE CRAWL: homepage fetch failed — ${crawl.notes.join(" ")} Fall back to web_search, and treat page absence as UNVERIFIED rather than confirmed-missing.`;
  }

  const foundLines = crawl.found.length
    ? crawl.found
        .map(
          (p) =>
            `  - ${p.category.toUpperCase()}: FOUND at ${p.url} (${p.via === "link" ? "linked from homepage" : "confirmed by direct fetch"})${p.title ? ` — "${p.title}"` : ""}`,
        )
        .join("\n")
    : "  - (no legal/pricing/contact pages confirmed)";

  const checkedCats = new Set(crawl.found.map((p) => p.category));
  const missing = (["privacy", "terms", "pricing", "refund", "contact"] as PageCategory[]).filter(
    (c) => !checkedCats.has(c),
  );

  const contactBits = [
    crawl.contact.email ? "email" : null,
    crawl.contact.phone ? "phone" : null,
    crawl.contact.form ? "contact form" : null,
  ].filter(Boolean);

  return [
    `FIRST-PARTY SITE CRAWL for ${crawl.domain} (AUTHORITATIVE — obtained by directly fetching the live site, not via a search index):`,
    `Pages CONFIRMED to exist:`,
    foundLines,
    `Homepage contact signals: ${contactBits.length ? contactBits.join(", ") : "none detected"}.`,
    missing.length
      ? `Not confirmed by crawl (may still exist deeper — mark UNVERIFIED, do not assert as absent unless web_search also finds nothing): ${missing.join(", ")}.`
      : `All key transparency pages were confirmed.`,
    `RULE: If a page is listed as FOUND above, it EXISTS. Never state in any verdict or evidence that a confirmed page is missing. Score the transparency dimension using these confirmed pages as first-party evidence.`,
  ].join("\n");
}
