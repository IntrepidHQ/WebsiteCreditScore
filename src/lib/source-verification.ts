import type { WCSReport } from "@/lib/schema";

const MAX_BODY_CHARS = 12_000;
const EXCERPT_CHARS = 280;

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function htmlTitle(body: string) {
  const match = body.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeHtml(match[1]).slice(0, 180) : undefined;
}

function htmlExcerpt(body: string) {
  const description = body.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    ?? body.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  const text = decodeHtml(description?.[1] ?? body);
  return text ? text.slice(0, EXCERPT_CHARS) : undefined;
}

async function verifySource(source: WCSReport["sources"][number]) {
  const checkedAt = new Date().toISOString();
  const abort = new AbortController();
  const timeout = setTimeout(() => abort.abort(), 3500);
  try {
    const response = await fetch(source.url, {
      signal: abort.signal,
      headers: {
        "User-Agent": "WebsiteCreditScore/1.0 source-verifier",
        Range: "bytes=0-12000",
        Accept: "text/html,application/xhtml+xml,text/plain;q=0.8,*/*;q=0.1",
      },
      redirect: "follow",
      cache: "no-store",
    });
    const contentType = response.headers.get("content-type") ?? "";
    const body = contentType.includes("text") || contentType.includes("html")
      ? (await response.text()).slice(0, MAX_BODY_CHARS)
      : "";
    const reachable = response.ok;
    return {
      ...source,
      checked_at: checkedAt,
      reachable,
      page_title: htmlTitle(body) ?? source.title,
      excerpt: htmlExcerpt(body),
      confidence: !reachable ? "unverified" as const : source.confidence,
    };
  } catch {
    return { ...source, checked_at: checkedAt, reachable: false, confidence: "unverified" as const };
  } finally {
    clearTimeout(timeout);
  }
}

async function inBatches<T>(items: T[], size: number, task: (item: T) => Promise<T>) {
  const output: T[] = [];
  for (let index = 0; index < items.length; index += size) {
    output.push(...await Promise.all(items.slice(index, index + size).map(task)));
  }
  return output;
}

/** Verify source availability without making report completion depend on it. */
export async function verifyReportSources(report: WCSReport): Promise<WCSReport> {
  const sources = await inBatches([...report.sources], 4, verifySource);
  const byUrl = new Map(sources.map((source) => [source.url, source]));
  return {
    ...report,
    sources,
    dimensions: report.dimensions.map((dimension) => ({
      ...dimension,
      evidence: dimension.evidence.map((evidence) => {
        const source = byUrl.get(evidence.url);
        return source ? {
          ...evidence,
          confidence: source.confidence,
          checked_at: source.checked_at,
          reachable: source.reachable,
          page_title: source.page_title,
          excerpt: source.excerpt,
        } : evidence;
      }),
    })),
  };
}
