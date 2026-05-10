import "server-only";
import { createHmac } from "crypto";
import type { WCSReport } from "@/lib/schema";

interface SPWebhookPayload {
  wcsReport: WCSReport;
  clientName: string;
  clientSlug: string;
  tier: "standard" | "nonprofit";
  gatePassword?: string;
  gateSignedDate?: string;
  sourceScanId?: string;
}

interface SPWebhookResult {
  ok: boolean;
  strategyId?: string;
  isNew?: boolean;
  error?: string;
}

const DEFAULT_URL = "https://studio.strategypresentation.com/api/webhook";

export async function triggerStrategyPresentation(
  payload: SPWebhookPayload,
): Promise<SPWebhookResult> {
  const secret = process.env.SP_WEBHOOK_SECRET;
  const url = process.env.SP_WEBHOOK_URL ?? DEFAULT_URL;

  if (!secret) {
    return { ok: false, error: "SP_WEBHOOK_SECRET not configured" };
  }

  const body = JSON.stringify(payload);
  const ts = Math.floor(Date.now() / 1000).toString();
  const sig =
    "sha256=" +
    createHmac("sha256", secret).update(`${ts}.${body}`).digest("hex");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-WCS-Signature": sig,
        "X-WCS-Timestamp": ts,
      },
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `HTTP ${res.status}: ${text}` };
    }

    const data = (await res.json()) as { strategyId: string; new?: boolean };
    return { ok: true, strategyId: data.strategyId, isNew: data.new ?? false };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// Build a slug from a domain (mirrors the brief's recommendation).
export function slugFromDomain(domain: string): string {
  return domain
    .toLowerCase()
    .replace(/^www\./, "")
    .replace(/\.[a-z]+$/, "") // drop TLD
    .replace(/\./g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 63);
}
