#!/usr/bin/env node
/**
 * Hits /api/preview for sample URLs so Browserless + Supabase L2 cache are warmed.
 * Run with the app up: PREVIEW_WARM_BASE_URL=http://localhost:3000 node scripts/warm-sample-previews.mjs
 * Production: PREVIEW_WARM_BASE_URL=https://your-domain.com node scripts/warm-sample-previews.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const versionFile = readFileSync(join(root, "src/lib/utils/preview-capture-version.ts"), "utf8");
const versionMatch = versionFile.match(/PREVIEW_CAPTURE_VERSION = "([^"]+)"/);
const version = versionMatch?.[1] ?? "unknown";

const base = process.env.PREVIEW_WARM_BASE_URL ?? "http://localhost:3000";

const targets = [
  ["https://www.saunderswoodworkllc.com", "desktop"],
  ["https://www.saunderswoodworkllc.com", "mobile"],
];

for (const [url, device] of targets) {
  const u = new URL("/api/preview", base);
  u.searchParams.set("url", url);
  u.searchParams.set("device", device);
  u.searchParams.set("v", version);
  const res = await fetch(u);
  const line = res.ok ? "OK" : `FAIL ${res.status}`;
  console.log(line, u.toString());
}
