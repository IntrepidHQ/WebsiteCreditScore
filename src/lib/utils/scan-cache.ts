import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

import type { AuditReport } from "@/lib/types/audit";
import { createWebsiteScreenshotUrl, normalizeUrl } from "@/lib/utils/url";

const CACHE_DIR = path.join("/tmp", "craydl-scan-cache");
const RECENT_FILE = path.join(CACHE_DIR, "_recent-scans.json");
const CACHE_TTL_MS = 1000 * 60 * 60 * 4; // 4 hours
const MAX_RECENT_SCANS = 24;
const RECENT_SCANS_TABLE = "public_recent_scans";

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

type RecentScanRow = {
  normalized_url: string;
  title: string;
  score: number;
  summary: string;
  report_id: string;
  preview_image: string | null;
  scanned_at: string;
};

function cacheKey(normalizedUrl: string) {
  return createHash("sha256").update(normalizedUrl).digest("hex").slice(0, 24);
}

function getSupabaseRecentScansClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) {
    return null;
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

function rowToEntry(row: RecentScanRow): RecentScanEntry {
  return {
    normalizedUrl: row.normalized_url,
    title: row.title,
    score: row.score,
    summary: row.summary,
    scannedAt: row.scanned_at,
    reportId: row.report_id,
    previewImage: row.preview_image ?? undefined,
  };
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

/**
 * Touch recent-scans list when serving a cache hit (keeps homepage ordering fresh).
 */
export async function touchRecentScanFromReport(report: AuditReport): Promise<void> {
  await addRecentScan({
    normalizedUrl: report.normalizedUrl,
    title: report.title,
    score: report.overallScore,
    summary: report.executiveSummary,
    scannedAt: new Date().toISOString(),
    reportId: report.id,
    previewImage: createWebsiteScreenshotUrl(
      normalizeUrl(report.normalizedUrl, { stripWww: false }),
      "desktop",
    ),
  });
}

async function addRecentScan(entry: RecentScanEntry): Promise<void> {
  const supabase = getSupabaseRecentScansClient();
  if (supabase) {
    const { error } = await supabase.from(RECENT_SCANS_TABLE).upsert(
      {
        normalized_url: entry.normalizedUrl,
        title: entry.title,
        score: entry.score,
        summary: entry.summary,
        report_id: entry.reportId,
        preview_image: entry.previewImage ?? null,
        scanned_at: entry.scannedAt,
      },
      { onConflict: "normalized_url" },
    );
    if (error) {
      console.warn("[scan-cache] Supabase recent scan upsert failed:", error.message);
    }
    await trimRecentScansRemote(supabase);
    return;
  }

  try {
    await ensureCacheDir();
    const existing = await getRecentScansFromFile();

    const filtered = existing.filter((scan) => scan.normalizedUrl !== entry.normalizedUrl);
    filtered.unshift(entry);

    const trimmed = filtered.slice(0, MAX_RECENT_SCANS);
    await fs.writeFile(RECENT_FILE, JSON.stringify(trimmed));
  } catch {
    // Non-critical
  }
}

async function trimRecentScansRemote(supabase: NonNullable<ReturnType<typeof getSupabaseRecentScansClient>>) {
  const { data, error } = await supabase
    .from(RECENT_SCANS_TABLE)
    .select("normalized_url, scanned_at")
    .order("scanned_at", { ascending: false });

  if (error || !data?.length || data.length <= MAX_RECENT_SCANS) {
    return;
  }

  const drop = data.slice(MAX_RECENT_SCANS);
  const keys = drop.map((r) => r.normalized_url).filter(Boolean);
  if (!keys.length) {
    return;
  }

  await supabase.from(RECENT_SCANS_TABLE).delete().in("normalized_url", keys);
}

async function getRecentScansFromFile(): Promise<RecentScanEntry[]> {
  try {
    const raw = await fs.readFile(RECENT_FILE, "utf-8");
    return JSON.parse(raw) as RecentScanEntry[];
  } catch {
    return [];
  }
}

/**
 * Get the list of recent public scans (newest first).
 */
export async function getRecentScans(): Promise<RecentScanEntry[]> {
  const supabase = getSupabaseRecentScansClient();
  if (supabase) {
    const { data, error } = await supabase
      .from(RECENT_SCANS_TABLE)
      .select("*")
      .order("scanned_at", { ascending: false })
      .limit(MAX_RECENT_SCANS);

    if (error) {
      console.warn("[scan-cache] Supabase recent scan list failed:", error.message);
      return [];
    }

    return (data as RecentScanRow[]).map(rowToEntry);
  }

  return getRecentScansFromFile();
}
