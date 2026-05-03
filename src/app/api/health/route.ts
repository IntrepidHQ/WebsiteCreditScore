import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, { ok: boolean; detail: string }> = {};

  // 1. Env var presence (never expose values)
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "ANTHROPIC_API_KEY",
  ] as const;

  for (const key of required) {
    const val = process.env[key];
    checks[key] = val
      ? { ok: true, detail: `set (${val.length} chars)` }
      : { ok: false, detail: "MISSING" };
  }

  // 2. Supabase SELECT
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("scans").select("id").limit(1);
    checks["supabase_select"] = error
      ? { ok: false, detail: error.message }
      : { ok: true, detail: "ok" };
  } catch (err) {
    checks["supabase_select"] = {
      ok: false,
      detail: err instanceof Error ? err.message : String(err),
    };
  }

  // 3. Supabase INSERT — same operation scan/start does
  try {
    const { randomUUID } = await import("crypto");
    const testId = randomUUID();
    const supabase = await createClient();
    const { error } = await supabase.from("scans").insert({
      id: testId,
      domain: "health-check.internal",
      status: "pending",
      paid: true,
      stripe_session_id: `health_${testId.slice(0, 12)}`,
    });
    if (error) {
      checks["supabase_insert"] = { ok: false, detail: error.message };
    } else {
      // clean up
      await supabase.from("scans").delete().eq("id", testId);
      checks["supabase_insert"] = { ok: true, detail: "ok" };
    }
  } catch (err) {
    checks["supabase_insert"] = {
      ok: false,
      detail: err instanceof Error ? err.message : String(err),
    };
  }

  const allOk = Object.values(checks).every((c) => c.ok);
  return NextResponse.json({ ok: allOk, checks }, { status: allOk ? 200 : 500 });
}
