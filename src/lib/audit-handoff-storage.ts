import type { AuditReport } from "@/lib/types/audit";
import { normalizeUrl } from "@/lib/utils/url";

const AUDIT_HANDOFF_KEY = "wcs:audit-handoff-v1";
/** Stay under common ~5MB sessionStorage limits. */
const MAX_SERIALIZED_CHARS = 4_500_000;

export type AuditHandoffPayload = {
  v: 1;
  reportId: string;
  normalizedUrl: string;
  report: AuditReport;
  storedAt: number;
};

/**
 * Persists the last generated public scan so `/audit/...?from=scan` can render immediately
 * without re-running `buildLiveAuditReportFromUrl` on another serverless instance (where `/tmp`
 * scan cache is not shared).
 */
export const persistAuditHandoff = (report: AuditReport): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  const payload: AuditHandoffPayload = {
    v: 1,
    reportId: report.id,
    normalizedUrl: report.normalizedUrl,
    report,
    storedAt: Date.now(),
  };

  const raw = JSON.stringify(payload);
  if (raw.length > MAX_SERIALIZED_CHARS) {
    return false;
  }

  try {
    sessionStorage.setItem(AUDIT_HANDOFF_KEY, raw);
    return true;
  } catch {
    return false;
  }
};

/**
 * Returns the handed-off report when `reportId` and URL match, then clears storage (one-time).
 */
export const consumeAuditHandoff = (
  expectedReportId: string,
  expectedUrlRaw: string,
): AuditReport | null => {
  if (typeof window === "undefined") {
    return null;
  }

  let normalizedExpected: string;
  try {
    normalizedExpected = normalizeUrl(expectedUrlRaw);
  } catch {
    return null;
  }

  const raw = sessionStorage.getItem(AUDIT_HANDOFF_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuditHandoffPayload>;
    if (parsed.v !== 1 || !parsed.report || !parsed.reportId) {
      return null;
    }

    if (parsed.reportId !== expectedReportId) {
      return null;
    }

    const normalizedStored = normalizeUrl(parsed.normalizedUrl ?? parsed.report.normalizedUrl);
    if (normalizedStored !== normalizedExpected) {
      return null;
    }

    sessionStorage.removeItem(AUDIT_HANDOFF_KEY);
    return parsed.report;
  } catch {
    return null;
  }
};
