import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getOptionalWorkspaceSession } from "@/lib/auth/session";
import { getProductRepository } from "@/lib/product/repository";
import { redirectOnRecoverableProductError } from "@/lib/product/workspace-load-errors";
import { normalizeUrl } from "@/lib/utils/url";

export const dynamic = "force-dynamic";

/**
 * JSON API: save the current audit URL as a workspace lead (same as dashboard scan).
 * Requires an authenticated workspace session.
 */
export async function POST(request: Request) {
  let body: { url?: string };
  try {
    body = (await request.json()) as { url?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const rawUrl = typeof body.url === "string" ? body.url.trim() : "";
  if (!rawUrl) {
    return NextResponse.json({ error: "Missing url." }, { status: 400 });
  }

  let normalizedUrl: string;
  try {
    normalizedUrl = normalizeUrl(rawUrl);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid URL." },
      { status: 422 },
    );
  }

  const session = await getOptionalWorkspaceSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const repository = getProductRepository(session);

  let workspace;
  try {
    workspace = await repository.ensureWorkspace(session);
  } catch (err) {
    redirectOnRecoverableProductError(err);
    throw err;
  }

  try {
    const lead = await repository.createLeadFromUrl(workspace.id, normalizedUrl, session);
    revalidatePath("/app");
    revalidatePath("/app/leads");
    revalidatePath(`/app/leads/${lead.id}`);

    return NextResponse.json({
      leadId: lead.id,
      normalizedUrl: lead.normalizedUrl ?? normalizedUrl,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_TOKENS") {
      return NextResponse.json(
        { error: "Insufficient tokens. Add more on pricing to save another audit." },
        { status: 402 },
      );
    }
    throw error;
  }
}
