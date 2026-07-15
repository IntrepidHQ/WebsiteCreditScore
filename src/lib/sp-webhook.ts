import "server-only";
import { createHmac } from "crypto";
import type { WCSReport } from "@/lib/schema";
import { deriveClientSlug } from "@/lib/sp-slug";

export { deriveClientSlug };

/**
 * WCS → StrategyPresentation Studio webhook client.
 *
 * Matches the contract verified in
 * StrategyPresentation/apps/studio/src/lib/webhook-verify.ts:
 *   - signedPayload = `${unixSeconds}.${rawBody}`
 *   - header X-WCS-Signature: "sha256=" + hmacSHA256(signedPayload, SP_WEBHOOK_SECRET)
 *   - header X-WCS-Timestamp: unix seconds (±5 min window on the SP side)
 *   - SP is idempotent by clientSlug — re-posting the same slug returns the
 *     existing strategy instead of creating a duplicate.
 *
 * The shared secret SP_WEBHOOK_SECRET must be identical in both apps.
 */

export type SPTier = "standard" | "nonprofit";
export type SPSource = "wcs" | "brainztem" | "sp-demo";

export interface SPWebhookPayload {
  wcsReport: WCSReport;
  clientName: string;
  /** lowercase alphanumeric + hyphens, max 63 chars — becomes the subdomain */
  clientSlug: string;
  tier: SPTier;
  /** deck template (summit/signal/…); SP defaults to signal when omitted */
  templateId?: string;
  /** which funnel produced this — drives the deck's closing CTA on the SP side */
  source?: SPSource;
  /** Brainztem trial token, when the scan came through a trial */
  sandboxToken?: string;
  gatePassword?: string;
  gateSignedDate?: string;
}

export interface SPWebhookResult {
  ok: boolean;
  strategyId?: string;
  status?: string;
  isNew?: boolean;
  error?: string;
  httpStatus: number;
}

export function spWebhookConfigured(): boolean {
  return Boolean(process.env.SP_WEBHOOK_SECRET);
}

function spWebhookUrl(): string {
  return (
    process.env.SP_WEBHOOK_URL ??
    "https://studio.strategypresentation.com/api/webhook"
  );
}

/**
 * Sign and POST a completed WCS scan to SP Studio. Returns a structured result
 * (never throws on HTTP failure — the caller decides how to surface it).
 */
export async function signAndPostToSP(payload: SPWebhookPayload): Promise<SPWebhookResult> {
  const secret = process.env.SP_WEBHOOK_SECRET;
  if (!secret) {
    return { ok: false, error: "SP_WEBHOOK_SECRET not set", httpStatus: 0 };
  }

  const body = JSON.stringify(payload);
  const ts = Math.floor(Date.now() / 1000).toString();
  const signedPayload = `${ts}.${body}`;
  const sig = "sha256=" + createHmac("sha256", secret).update(signedPayload).digest("hex");

  try {
    const res = await fetch(spWebhookUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-WCS-Signature": sig,
        "X-WCS-Timestamp": ts,
      },
      body,
    });

    const data = (await res.json().catch(() => ({}))) as {
      strategyId?: string;
      status?: string;
      new?: boolean;
      error?: string;
    };

    if (!res.ok) {
      return { ok: false, error: data.error ?? `HTTP ${res.status}`, httpStatus: res.status };
    }

    return {
      ok: true,
      strategyId: data.strategyId,
      status: data.status,
      isNew: data.new,
      httpStatus: res.status,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "network error",
      httpStatus: 0,
    };
  }
}

/**
 * Auto-build a Strategy Presentation from a completed scan — the automated
 * counterpart to the admin handoff button. Best-effort: derives the client
 * name/slug, defaults to the `signal` template, and always resolves (never
 * throws) so it can be fired-and-awaited off the scan pipeline without ever
 * breaking a scan. Idempotent on the SP side by clientSlug. Bounded so a slow
 * SP can't hold a serverless function open.
 */
export async function autoHandoffToSP(
  report: WCSReport,
  opts?: { source?: SPSource; timeoutMs?: number },
): Promise<SPWebhookResult> {
  if (!spWebhookConfigured()) {
    return { ok: false, error: "SP_WEBHOOK_SECRET not set", httpStatus: 0 };
  }
  const payload: SPWebhookPayload = {
    wcsReport: report,
    clientName: report.company_name?.trim() || report.domain,
    clientSlug: deriveClientSlug(report.domain),
    tier: "standard",
    templateId: "signal",
    source: opts?.source ?? "wcs",
  };
  const timeout = new Promise<SPWebhookResult>((resolve) =>
    setTimeout(() => resolve({ ok: false, error: "timeout", httpStatus: 0 }), opts?.timeoutMs ?? 8000),
  );
  return Promise.race([signAndPostToSP(payload), timeout]);
}
