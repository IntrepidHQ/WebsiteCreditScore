import { NextResponse } from "next/server";

import { buildAuditReportFromUrl, enrichReportBenchmarks } from "@/lib/mock/report-builder";
import { inspectWebsite } from "@/lib/utils/site-observation";
import { normalizeUrl } from "@/lib/utils/url";
import { ensurePreviewCachedForObservation } from "@/lib/utils/preview-warm";
import { getCachedReport, cacheReport, touchRecentScanFromReport } from "@/lib/utils/scan-cache";
import { getOptionalWorkspaceSessionFromRequest } from "@/lib/auth/session";
import { getProductRepository } from "@/lib/product/repository";
import {
  DEFAULT_SCAN_COST_CENTS,
  REVENUE_PER_SCAN_CENTS,
  recordScan,
  type ScanPlanSource,
} from "@/lib/billing/scan-cost";
import type { ContentClassification, FetchErrorReason, SiteObservation } from "@/lib/types/audit";
import type { WorkspaceRecord } from "@/lib/types/product";

/**
 * Derive the plan the scan should be attributed to for admin reporting.
 * A workspace with an active paid plan maps to its plan ID; otherwise free.
 */
function resolveScanPlanSource(workspace: WorkspaceRecord | null | undefined): ScanPlanSource {
  if (!workspace) return "free";
  const entitlements = workspace.entitlements ?? [];
  if (entitlements.includes("privacy-pro")) return "privacy-pro";
  if (workspace.billingPlan === "pro") return "pro-50";
  if ((workspace.tokenBalance ?? 0) > 0 || (workspace.creditBalance ?? 0) > 0) {
    return "pay-per-scan";
  }
  return "free";
}

/** Revenue we book for this scan. Free scans attribute 0; paid attribute $1. */
function attributeScanRevenueCents(plan: ScanPlanSource): number {
  return plan === "free" ? 0 : REVENUE_PER_SCAN_CENTS;
}

function userFacingFetchError(reason?: FetchErrorReason, httpStatus?: number): string {
  switch (reason) {
    case "timeout":
      return "This site took too long to respond. It may be down or very slow — try again later.";
    case "dns":
      return "This domain doesn't appear to exist. Check the spelling and try again.";
    case "ssl":
      return "This site has an SSL/TLS certificate problem. We couldn't establish a secure connection.";
    case "blocked":
      return "This site refused our connection. It may be blocking automated requests.";
    case "http-error":
      if (httpStatus && httpStatus >= 500)
        return `This site returned a server error (HTTP ${httpStatus}). It may be down — try again later.`;
      if (httpStatus === 403)
        return "This site blocked our scanner (HTTP 403). The site exists but declined the request.";
      if (httpStatus === 404)
        return "This page was not found (HTTP 404). Check the URL and try again.";
      return `This site returned an error (HTTP ${httpStatus ?? "unknown"}). Check the URL and try again.`;
    default:
      return "We couldn't reach this site. Please check the URL and try again.";
  }
}

function userFacingContentError(classification: ContentClassification, redirectTarget?: string): string | null {
  switch (classification) {
    case "parked-domain":
      return "This domain appears to be parked or for sale. There's no active website to audit.";
    case "search-engine-redirect":
      return "This URL redirected to a search engine. The domain may not have an active website.";
    case "redirect-to-unrelated":
      return `This URL redirected to a different site${redirectTarget ? ` (${new URL(redirectTarget).hostname})` : ""}. Please check the URL.`;
    case "empty-page":
      return "This page appears to be empty. There's not enough content to generate a meaningful audit.";
    case "under-construction":
      return "This site appears to be under construction. There's not enough content for a meaningful audit yet.";
    default:
      return null;
  }
}

async function inspectWithGates(
  normalizedUrl: string,
): Promise<{ ok: true; observation: SiteObservation } | { ok: false; response: NextResponse }> {
  const observation = await inspectWebsite(normalizedUrl);

  if (!observation.fetchSucceeded) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: userFacingFetchError(observation.fetchError, observation.httpStatus) },
        { status: 422 },
      ),
    };
  }

  const contentError = userFacingContentError(
    observation.contentClassification ?? "normal",
    observation.redirectTarget,
  );
  if (contentError) {
    return {
      ok: false,
      response: NextResponse.json({ error: contentError }, { status: 422 }),
    };
  }

  return { ok: true, observation };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: string; persist?: boolean };

    if (!body.url) {
      return NextResponse.json(
        { error: "Enter a website URL to generate the audit." },
        { status: 400 },
      );
    }

    let normalizedUrl: string;
    try {
      normalizedUrl = normalizeUrl(body.url);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Invalid URL format. Please check and try again." },
        { status: 422 },
      );
    }

    const session = await getOptionalWorkspaceSessionFromRequest(request);
    const shouldPersist = body.persist === true && Boolean(session);

    if (shouldPersist && session) {
      const gated = await inspectWithGates(normalizedUrl);
      if (!gated.ok) {
        return gated.response;
      }

      const repository = getProductRepository(session);
      const workspace = await repository.ensureWorkspace(session, request);
      const lead = await repository.createLeadFromUrl(workspace.id, normalizedUrl, session);

      const planSource = resolveScanPlanSource(workspace);
      void recordScan({
        workspaceId: workspace.id,
        userId: session.userId,
        url: lead.normalizedUrl,
        score: lead.currentScore,
        providerCostCents: DEFAULT_SCAN_COST_CENTS,
        revenueCents: attributeScanRevenueCents(planSource),
        planSource,
        status: "complete",
      });

      return NextResponse.json({
        id: lead.id,
        leadId: lead.id,
        normalizedUrl: lead.normalizedUrl,
        persisted: true,
      });
    }

    const cached = await getCachedReport(normalizedUrl);
    if (cached) {
      touchRecentScanFromReport(cached).catch(() => {});
      return NextResponse.json({
        id: cached.id,
        normalizedUrl: cached.normalizedUrl,
        report: cached,
        persisted: false,
      });
    }

    const gated = await inspectWithGates(normalizedUrl);
    if (!gated.ok) {
      return gated.response;
    }
    const { observation } = gated;

    const report = await enrichReportBenchmarks(buildAuditReportFromUrl(normalizedUrl, observation));

    await ensurePreviewCachedForObservation(normalizedUrl, observation).catch((err) => {
      console.warn("[audit] preview warm failed", err);
    });

    await cacheReport(normalizedUrl, report);

    return NextResponse.json({
      id: report.id,
      normalizedUrl: report.normalizedUrl,
      report,
      persisted: false,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_TOKENS") {
      return NextResponse.json(
        { error: "You are out of tokens. Add more on pricing to run another scan." },
        { status: 402 },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate the audit.",
      },
      { status: 400 },
    );
  }
}
