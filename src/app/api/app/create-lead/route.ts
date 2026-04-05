import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getWorkspaceAppContext } from "@/lib/product/context";

export const dynamic = "force-dynamic";

/**
 * HTML form POST target for the dashboard URL scan. Uses a full navigation so
 * Supabase cookies match middleware-refreshed session (Server Actions can see
 * a stale cookie snapshot on the same POST and redirect to login).
 */
export const POST = async (request: Request) => {
  const formData = await request.formData();
  const rawUrl = String(formData.get("url") ?? "").trim();
  const base = new URL(request.url);

  const { repository, session, workspace } = await getWorkspaceAppContext();

  if (!rawUrl) {
    return NextResponse.redirect(new URL("/app?error=missing-url", base.origin));
  }

  try {
    const lead = await repository.createLeadFromUrl(workspace.id, rawUrl, session);
    revalidatePath("/app");
    revalidatePath("/app/leads");
    return NextResponse.redirect(new URL(`/app/leads/${lead.id}`, base.origin));
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_TOKENS") {
      return NextResponse.redirect(new URL("/app?error=insufficient-tokens", base.origin));
    }
    throw error;
  }
};
