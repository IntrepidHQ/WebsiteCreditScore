import { mkdir, writeFile } from "node:fs/promises";
import { CALIBRATION_CASES } from "@/lib/scanner-evals";
import type { WCSReport } from "@/lib/schema";

const baseUrl = (process.env.WCS_CALIBRATION_URL ?? "https://www.websitecreditscore.com").replace(/\/$/, "");
const compCode = process.env.WCS_COMP_CODE;
const concurrency = Math.max(1, Math.min(3, Number(process.env.WCS_CALIBRATION_CONCURRENCY ?? 2)));
const outputPath = process.env.WCS_CALIBRATION_OUTPUT ?? "artifacts/calibration/2026-09-results.json";

if (!compCode) throw new Error("WCS_COMP_CODE is required to run the calibration set.");

const seededScans: Record<string, string> = {
  "apple.com": "02dcf4a2-28ed-4ee6-be37-d8a79a094558",
  "trustpilot.com": "9615ab5f-1a1f-4381-95ec-d10c3d571dc5",
};

async function readScan(scanId: string): Promise<WCSReport | null> {
  const response = await fetch(`${baseUrl}/api/scan/${scanId}`, { cache: "no-store" });
  if (!response.ok) return null;
  const payload = await response.json() as { status?: string; result?: WCSReport | null; error?: string };
  if (payload.status === "error") throw new Error(payload.error ?? `Scan ${scanId} failed`);
  return payload.status === "done" ? payload.result ?? null : null;
}

async function startScan(domain: string): Promise<string> {
  const response = await fetch(`${baseUrl}/api/scan/start`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      domain,
      tier: "quick",
      mode: "standard",
      intent: "operator",
      compCode,
    }),
  });
  const payload = await response.json() as { scanId?: string; error?: string };
  if (!response.ok || !payload.scanId) throw new Error(`${domain}: ${payload.error ?? `start failed (${response.status})`}`);
  await fetch(`${baseUrl}/api/scan/${payload.scanId}/run`, { method: "POST" });
  return payload.scanId;
}

async function waitForScan(scanId: string, domain: string): Promise<WCSReport> {
  const deadline = Date.now() + 8 * 60_000;
  while (Date.now() < deadline) {
    const report = await readScan(scanId);
    if (report) return report;
    await new Promise((resolve) => setTimeout(resolve, 8_000));
  }
  throw new Error(`${domain}: timed out waiting for ${scanId}`);
}

async function runDomain(domain: string): Promise<WCSReport> {
  const seeded = seededScans[domain];
  if (seeded) {
    const report = await readScan(seeded);
    if (report) {
      console.log(`[calibration] seeded ${domain} from ${seeded}`);
      return report;
    }
  }
  const scanId = await startScan(domain);
  console.log(`[calibration] started ${domain} as ${scanId}`);
  const report = await waitForScan(scanId, domain);
  console.log(`[calibration] completed ${domain}: ${report.overall.score}`);
  return report;
}

const queue = [...CALIBRATION_CASES];
const results: Record<string, WCSReport[]> = {};
const failures: Array<{ domain: string; error: string }> = [];

async function worker() {
  while (queue.length) {
    const calibration = queue.shift();
    if (!calibration) return;
    try {
      results[calibration.domain] = [await runDomain(calibration.domain)];
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push({ domain: calibration.domain, error: message });
      console.error(`[calibration] failed ${calibration.domain}: ${message}`);
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));
await mkdir(outputPath.split("/").slice(0, -1).join("/") || ".", { recursive: true });
await writeFile(outputPath, JSON.stringify(results, null, 2) + "\n", "utf8");
console.log(JSON.stringify({ outputPath, completed: Object.keys(results).length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
