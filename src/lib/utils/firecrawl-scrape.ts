import "server-only";

import { readFirecrawlCache, writeFirecrawlCache } from "@/lib/utils/firecrawl-cache";
import type { FirecrawlScrapePayload } from "@/lib/utils/firecrawl-types";

export type { FirecrawlScrapePayload } from "@/lib/utils/firecrawl-types";

/** Align with disk cache TTL so Firecrawl can serve cached pages when possible. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const getApiKey = () =>
  (process.env.FIRECRAWL_API ?? process.env.FIRECRAWL_API_KEY ?? "").trim();

const normalizeMeta = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim();
  }
  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0].trim();
  }
  return "";
};

/**
 * Single-page markdown scrape via Firecrawl v2. Uses disk cache (see firecrawl-cache)
 * and API maxAge to limit credit use on repeat URLs.
 */
export const scrapeUrlMarkdownWithFirecrawl = async (
  targetUrl: string,
): Promise<FirecrawlScrapePayload | null> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return null;
  }

  const cached = await readFirecrawlCache(targetUrl);
  if (cached) {
    return {
      markdown: cached.markdown,
      finalUrl: cached.finalUrl || targetUrl,
      pageTitle: cached.pageTitle,
      metaDescription: cached.metaDescription,
    };
  }

  const controller = new AbortController();
  const kill = setTimeout(() => controller.abort(), 28_000);

  try {
    const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url: targetUrl,
        formats: ["markdown"],
        onlyMainContent: true,
        timeout: 25_000,
        maxAge: MAX_AGE_MS,
      }),
      signal: controller.signal,
    });

    const json = (await res.json()) as {
      success?: boolean;
      data?: {
        markdown?: string;
        metadata?: {
          title?: unknown;
          description?: unknown;
          url?: string;
          sourceURL?: string;
        };
      };
    };

    if (!res.ok || !json?.success || typeof json.data?.markdown !== "string") {
      return null;
    }

    const md = json.data.markdown.trim();
    if (!md) {
      return null;
    }

    const meta = json.data.metadata ?? {};
    const finalUrl = typeof meta.url === "string" && meta.url.trim() ? meta.url.trim() : targetUrl;
    const pageTitle = normalizeMeta(meta.title);
    const metaDescription = normalizeMeta(meta.description);

    const payload: FirecrawlScrapePayload = {
      markdown: md,
      finalUrl,
      pageTitle,
      metaDescription,
    };

    await writeFirecrawlCache(targetUrl, payload);
    return payload;
  } catch {
    return null;
  } finally {
    clearTimeout(kill);
  }
};
