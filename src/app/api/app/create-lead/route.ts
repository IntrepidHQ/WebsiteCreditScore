import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { getWorkspaceAppContext } from "@/lib/product/context";
import { redirectOnRecoverableProductError } from "@/lib/product/workspace-load-errors";
import { readSupabaseUserWithRefresh, workspaceSessionFromSupabaseUser } from "@/lib/auth/session";
import { getSupabaseCookieOptions } from "@/lib/supabase/cookie-options";
import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/config";
import { getProductRepository } from "@/lib/product/repository";
import { mergeCookieHeaderWithStore } from "@/lib/supabase/merge-request-cookies";

export const dynamic = "force-dynamic";

const copyResponseCookies = (from: NextResponse, to: NextResponse) => {
  for (const c of from.cookies.getAll()) {
    to.cookies.set(c);
  }
};

const mergedCookiePairs = (request: NextRequest, cookieStore: Awaited<ReturnType<typeof cookies>>) =>
  mergeCookieHeaderWithStore(request.headers.get("cookie"), cookieStore.getAll());

/**
 * HTML form POST from `/app`. When Supabase is enabled, bind `readSupabaseUserWithRefresh()` (and any refresh)
 * to the **redirect** response so rotated tokens are always `Set-Cookie` on the same reply
 * as the 302 — `cookies()` in this route can miss a refresh written only to middleware.
 */
export const POST = async (request: NextRequest) => {
  const formData = await request.formData();
  const rawUrl = String(formData.get("url") ?? "").trim();
  const base = new URL(request.url);

  if (!rawUrl) {
    return NextResponse.redirect(new URL("/app?error=missing-url", base.origin));
  }

  if (!hasSupabaseEnv()) {
    const { repository, session, workspace } = await getWorkspaceAppContext();

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
  }

  const { url: supabaseUrl, anonKey } = getSupabaseEnv();
  const cookieOpts = getSupabaseCookieOptions(request);
  const authSink = NextResponse.redirect(new URL("/app", base.origin));
  const cookieStore = await cookies();

  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookieOptions: cookieOpts,
    cookies: {
      getAll() {
        return mergedCookiePairs(request, cookieStore);
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          authSink.cookies.set(name, value ?? "", { ...cookieOpts, ...options });
        });
      },
    },
  });

  const { user, error: userError } = await readSupabaseUserWithRefresh(supabase);

  if ((userError && !user) || !user) {
    const login = NextResponse.redirect(
      new URL("/app/login?error=session-required&next=%2Fapp", base.origin),
    );
    copyResponseCookies(authSink, login);
    return login;
  }

  const session = workspaceSessionFromSupabaseUser(user);
  const repository = getProductRepository(session);

  let workspace;
  try {
    workspace = await repository.ensureWorkspace(session);
  } catch (err) {
    redirectOnRecoverableProductError(err);
    throw err;
  }

  try {
    const lead = await repository.createLeadFromUrl(workspace.id, rawUrl, session);
    revalidatePath("/app");
    revalidatePath("/app/leads");
    const success = NextResponse.redirect(new URL(`/app/leads/${lead.id}`, base.origin));
    copyResponseCookies(authSink, success);
    return success;
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_TOKENS") {
      const denied = NextResponse.redirect(new URL("/app?error=insufficient-tokens", base.origin));
      copyResponseCookies(authSink, denied);
      return denied;
    }
    throw error;
  }
};
