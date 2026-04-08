import "server-only";

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const TTL_MS = 7 * 24 * 60 * 60 * 1000;

const cacheDir = () => path.join(process.env.TMPDIR ?? "/tmp", "craydl-firecrawl-cache");

type CacheEntry = { savedAt: number; markdown: string; finalUrl: string; pageTitle: string; metaDescription: string };

const hashKey = (url: string) => createHash("sha256").update(url.trim()).digest("hex");

export const readFirecrawlCache = async (url: string): Promise<CacheEntry | null> => {
  try {
    const file = path.join(cacheDir(), `${hashKey(url)}.json`);
    const raw = await readFile(file, "utf8");
    const parsed = JSON.parse(raw) as CacheEntry;
    if (!parsed?.savedAt || Date.now() - parsed.savedAt > TTL_MS) {
      return null;
    }
    if (typeof parsed.markdown !== "string") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const writeFirecrawlCache = async (url: string, entry: Omit<CacheEntry, "savedAt">) => {
  try {
    const dir = cacheDir();
    await mkdir(dir, { recursive: true });
    const file = path.join(dir, `${hashKey(url)}.json`);
    const payload: CacheEntry = { ...entry, savedAt: Date.now() };
    await writeFile(file, JSON.stringify(payload), "utf8");
  } catch {
    // ignore disk errors (read-only FS, etc.)
  }
};
