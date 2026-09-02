import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/scan/latest?domain=example.com
// Newest completed PUBLIC scan for a domain so sister products
// can resolve "do you already have a scan for X?" over HTTP against WCS's own
// database — no shared-DB coupling.
export const runtime = "nodejs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "cache-control": "no-store",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

function cleanDomain(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];
}

export async function GET(req: NextRequest) {
  const domain = cleanDomain(req.nextUrl.searchParams.get("domain") ?? "");
  if (!domain || !domain.includes(".") || domain.length > 253) {
    return NextResponse.json({ error: "domain required" }, { status: 400, headers: CORS });
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("scans")
      .select("id, domain, status, created_at")
      .eq("domain", domain)
      .eq("status", "done")
      .eq("access_required", false)
      .order("created_at", { ascending: false })
      .limit(1);
    if (error || !data?.length) {
      return NextResponse.json({ found: false, domain }, { status: 404, headers: CORS });
    }
    return NextResponse.json(
      { found: true, id: data[0].id, domain: data[0].domain, createdAt: data[0].created_at },
      { headers: CORS },
    );
  } catch {
    return NextResponse.json({ found: false, domain }, { status: 502, headers: CORS });
  }
}
