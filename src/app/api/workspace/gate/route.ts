import { NextResponse } from "next/server";

import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Read-only diagnostics for why /app may not load after Plan A setup.
 * Open in the browser while signed in (same cookies as /app). No secrets returned.
 */
export const GET = async () => {
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

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return NextResponse.json({
      ...base,
      step: "auth_read_failed",
      authError: userError.message,
      hint: "Session cookies may be missing or invalid. Try signing out, then sign in again.",
    });
  }

  if (!user?.id) {
    return NextResponse.json({
      ...base,
      step: "not_signed_in",
      hint: "Sign in at /app/login, then reload this page (same browser tab/session).",
    });
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
    return NextResponse.json({
      ...base,
      step: "workspace_query_failed",
      workspaceError: msg.slice(0, 400),
      workspaceCode: code,
      hint: isRlsRecursion
        ? "RLS policy recursion on workspaces — run supabase/migrations/20260405180000_fix_workspaces_rls_recursion.sql in the Supabase SQL Editor."
        : isMissingTable
          ? "Tables missing — run supabase/migrations/20260330232000_init_schema.sql in the SQL Editor."
          : "Check Supabase logs; often RLS or wrong project vs Vercel env keys.",
    });
  }

  const count = rows?.length ?? 0;

  if (count === 0) {
    return NextResponse.json({
      ...base,
      step: "no_workspace_row",
      hint:
        "No workspace row yet — it is created when you first open /app (not from scans). Sign in, then load /app in this browser. If /app redirects or errors, fix RLS/migrations first; this endpoint only checks the database.",
    });
  }

  if (count > 1) {
    return NextResponse.json({
      ...base,
      step: "duplicate_workspace_rows",
      rowCount: count,
      hint: "Multiple workspaces for one owner_user_id can break .maybeSingle(). Keep one row per user in SQL Editor.",
    });
  }

  return NextResponse.json({
    ...base,
    step: "ok",
    workspaceIdPrefix: `${rows[0].id.slice(0, 12)}…`,
    hint: "DB gate looks fine. If /app still errors, check Vercel function logs for React/Server Component stack traces.",
  });
};
