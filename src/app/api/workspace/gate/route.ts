import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

/**
 * Read-only diagnostics for why /app may not load after Plan A setup.
 * Open in the browser while signed in (same cookies as /app). No secrets returned.
 *
 * This route is excluded from Supabase middleware so getUser + cookie refresh happen
 * only here and Set-Cookie is applied to this JSON response (avoids "Auth session missing"
 * from a second getUser on stale request cookies in the same request).
 */
export const GET = async (request: NextRequest) => {
  const base: Record<string, unknown> = {
    supabaseEnvConfigured: hasSupabaseEnv(),
  };

  if (!hasSupabaseEnv()) {
    return NextResponse.json({
      ...base,
      step: "configure_env",
      hint: "Set NEXT_PUBLIC_SUPABASE_URL and a public anon key on Vercel, then redeploy.",
    });
  }

  const { url, anonKey } = getSupabaseEnv();
  const pendingCookies: { name: string; value: string; options: CookieOptions }[] = [];

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach((c) => pendingCookies.push(c));
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const applyCookies = (res: NextResponse) => {
    pendingCookies.forEach(({ name, value, options }) => {
      res.cookies.set(name, value, options);
    });
    return res;
  };

  if (userError) {
    const isMissingSession =
      /session missing|auth session missing/i.test(userError.message) ||
      userError.message.includes("Auth session missing");
    return applyCookies(
      NextResponse.json({
        ...base,
        step: "auth_read_failed",
        authError: userError.message,
        hint: isMissingSession
          ? "No Supabase auth cookie on this request. Sign in at /app/login on this exact host (www vs non-www must match), or you are in a private window. If you were signed in, try one full page load of /app first, then open this URL again."
          : "Session cookies may be invalid. Try signing out at /auth/logout, then sign in again on the same hostname you use for the site.",
      }),
    );
  }

  if (!user?.id) {
    return applyCookies(
      NextResponse.json({
        ...base,
        step: "not_signed_in",
        hint: "Sign in at /app/login, then reload this page (same browser tab/session). Use the same hostname (www or apex) as in Supabase Auth URL configuration.",
      }),
    );
  }

  base.authenticated = true;
  base.userIdPrefix = `${user.id.slice(0, 8)}…`;

  const { data: rows, error: wsError } = await supabase
    .from("workspaces")
    .select("id, created_at")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(5);

  if (wsError) {
    const msg = wsError.message ?? "";
    const code = wsError.code ?? "";
    const isMissingTable = /relation|does not exist|42P01/i.test(msg);
    const isRlsRecursion = code === "42P17" || /infinite recursion.*policy/i.test(msg);
    return applyCookies(
      NextResponse.json({
        ...base,
        step: "workspace_query_failed",
        workspaceError: msg.slice(0, 400),
        workspaceCode: code,
        hint: isRlsRecursion
          ? "RLS policy recursion on workspaces — run supabase/migrations/20260405180000_fix_workspaces_rls_recursion.sql in the Supabase SQL Editor."
          : isMissingTable
            ? "Tables missing — run supabase/migrations/20260330232000_init_schema.sql in the SQL Editor."
            : "Check Supabase logs; often RLS or wrong project vs Vercel env keys.",
      }),
    );
  }

  const count = rows?.length ?? 0;

  if (count === 0) {
    return applyCookies(
      NextResponse.json({
        ...base,
        step: "no_workspace_row",
        hint:
          "No workspace row yet — it is created when you first open /app (not from scans). Sign in, then load /app in this browser. If /app redirects or errors, fix RLS/migrations first; this endpoint only checks the database.",
      }),
    );
  }

  if (count > 1) {
    return applyCookies(
      NextResponse.json({
        ...base,
        step: "duplicate_workspace_rows",
        rowCount: count,
        hint: "Multiple workspaces for one owner_user_id can break .maybeSingle(). Keep one row per user in SQL Editor.",
      }),
    );
  }

  return applyCookies(
    NextResponse.json({
      ...base,
      step: "ok",
      workspaceIdPrefix: `${rows[0].id.slice(0, 12)}…`,
      hint: "DB gate looks fine. If /app still errors, check Vercel function logs for React/Server Component stack traces.",
    }),
  );
};
