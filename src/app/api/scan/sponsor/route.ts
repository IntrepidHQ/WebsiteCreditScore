import { NextRequest, NextResponse } from "next/server";
import {
  completeSponsorTicket,
  createSponsorStartTicket,
  sponsorCookieName,
  sponsorUnlockEnabled,
} from "@/lib/sponsor-unlock";

export const runtime = "nodejs";

function cleanDomain(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const domain = raw.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  return domain && domain.length <= 253 ? domain : null;
}

const cookie = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 10 * 60 };

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as { action?: unknown; domain?: unknown };
  const domain = cleanDomain(body.domain);
  if (!domain) return NextResponse.json({ error: "A valid domain is required" }, { status: 400 });
  if (!sponsorUnlockEnabled()) return NextResponse.json({ error: "Sponsor unlock is not configured" }, { status: 503 });

  if (body.action === "start") {
    const ticket = createSponsorStartTicket(domain);
    const res = NextResponse.json({ started: true, skipAtSeconds: 10, completeAtSeconds: 30 });
    res.cookies.set(sponsorCookieName, ticket, cookie);
    return res;
  }

  if (body.action === "complete") {
    const started = req.cookies.get(sponsorCookieName)?.value;
    if (!started) return NextResponse.json({ error: "Start the sponsor preview first" }, { status: 409 });
    const completed = completeSponsorTicket(started, domain);
    if (!completed) return NextResponse.json({ error: "Keep watching to unlock this scan" }, { status: 409 });
    const res = NextResponse.json({ sponsorToken: completed.ticket });
    res.cookies.set("wcs_sponsor_redeemed", completed.jti, cookie);
    res.cookies.delete(sponsorCookieName);
    return res;
  }

  return NextResponse.json({ error: "Unknown sponsor action" }, { status: 400 });
}
