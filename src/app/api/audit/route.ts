import { NextResponse } from "next/server";

import { buildAuditReportFromUrl, enrichReportBenchmarks } from "@/lib/mock/report-builder";
import { inspectWebsite } from "@/lib/utils/site-observation";
import { normalizeUrl } from "@/lib/utils/url";
import { getOptionalWorkspaceSession } from "@/lib/auth/session";
import { getProductRepository } from "@/lib/product/repository";
import type { ContentClassification, FetchErrorReason } from "@/lib/types/audit";

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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: string };

    if (!body.url) {
      return NextResponse.json(
        { error: "Enter a website URL to generate the audit." },
        { status: 400 },
      );
    }

    // Validate URL format early
    let normalizedUrl: string;
    try {
      normalizedUrl = normalizeUrl(body.url);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Invalid URL format. Please check and try again." },
        { status: 422 },
      );
    }

    // Fetch and observe the site
    const observation = await inspectWebsite(normalizedUrl);

    // Gate: fetch must succeed
    if (!observation.fetchSucceeded) {
      return NextResponse.json(
        { error: userFacingFetchError(observation.fetchError, observation.httpStatus) },
        { status: 422 },
      );
    }

    // Gate: content must be a real, auditable website
    const contentError = userFacingContentError(
      observation.contentClassification ?? "normal",
      observation.redirectTarget,
    );
    if (contentError) {
      return NextResponse.json(
        { error: contentError },
        { status: 422 },
      );
    }

    // If authenticated, persist to database
    const session = await getOptionalWorkspaceSession();

    if (session) {
      const repository = getProductRepository(session);
      const workspace = await repository.ensureWorkspace(session);
      const lead = await repository.createLeadFromUrl(workspace.id, body.url, session);

      return NextResponse.json({
        id: lead.id,
        leadId: lead.id,
        normalizedUrl: lead.normalizedUrl,
        persisted: true,
      });
    }

    // Build report with real observation data
    const report = await enrichReportBenchmarks(
      buildAuditReportFromUrl(body.url, observation),
    );

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
