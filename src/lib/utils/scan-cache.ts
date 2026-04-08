import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import type { AuditReport } from "@/lib/types/audit";
import { createWebsiteScreenshotUrl, normalizeUrl } from "@/lib/utils/url";

const CACHE_DIR = path.join("/tmp", "craydl-scan-cache");
const RECENT_FILE = path.join(CACHE_DIR, "_recent-scans.json");
const CACHE_TTL_MS = 1000 * 60 * 60 * 4; // 4 hours
const MAX_RECENT_SCANS = 24;

export type RecentScanEntry = {
  normalizedUrl: string;
  title: string;
  score: number;
  summary: string;
  scannedAt: string;
  reportId: string;
  /** `/api/preview?...` URL aligned with Supabase storage keys; omitted on older cache rows. */
  previewImage?: string;
};

function cacheKey(normalizedUrl: string) {
  return createHash("sha256").update(normalizedUrl).digest("hex").slice(0, 24);
}

async function ensureCacheDir() {
  await fs.mkdir(CACHE_DIR, { recursive: true });
}

/**
 * Get a cached report for a normalized URL, if one exists and is fresh.
 */
export async function getCachedReport(
  normalizedUrl: string,
): Promise<AuditReport | null> {
  try {
    const filePath = path.join(CACHE_DIR, `${cacheKey(normalizedUrl)}.json`);
    const stats = await fs.stat(filePath).catch(() => null);

    if (!stats || Date.now() - stats.mtimeMs > CACHE_TTL_MS) {
      return null;
    }

    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as AuditReport;
  } catch {
    return null;
  }
}

/**
 * Cache a report for a normalized URL and add to recent scans list.
 */
export async function cacheReport(
  normalizedUrl: string,
  report: AuditReport,
): Promise<void> {
  try {
    await ensureCacheDir();
    const filePath = path.join(CACHE_DIR, `${cacheKey(normalizedUrl)}.json`);
    await fs.writeFile(filePath, JSON.stringify(report));

    // Add to recent scans
    await addRecentScan({
      normalizedUrl,
      title: report.title,
      score: report.overallScore,
      summary: report.executiveSummary,
      scannedAt: new Date().toISOString(),
      reportId: report.id,
      previewImage: createWebsiteScreenshotUrl(
        normalizeUrl(normalizedUrl, { stripWww: false }),
        "desktop",
      ),
    });
  } catch {
    // Non-critical — silently fail
  }
}

async function addRecentScan(entry: RecentScanEntry): Promise<void> {
  try {
    await ensureCacheDir();
    const existing = await getRecentScans();

    // Deduplicate by URL — replace existing entry for same URL
    const filtered = existing.filter(
      (scan) => scan.normalizedUrl !== entry.normalizedUrl,
    );
    filtered.unshift(entry);

    const trimmed = filtered.slice(0, MAX_RECENT_SCANS);
    await fs.writeFile(RECENT_FILE, JSON.stringify(trimmed));
  } catch {
    // Non-critical
  }
}

/**
 * Get the list of recent public scans (newest first).
 */
export async function getRecentScans(): Promise<RecentScanEntry[]> {
  try {
    const raw = await fs.readFile(RECENT_FILE, "utf-8");
    return JSON.parse(raw) as RecentScanEntry[];
  } catch {
    return [];
  }
}
