import { NextRequest, NextResponse } from "next/server";
import { FIRST_SCAN_COOKIE, hasUsedFreeScan, ipHashFromRequest } from "@/lib/free-scan";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const cookieClaimed = req.cookies.get(FIRST_SCAN_COOKIE)?.value === "1";
  const ipHash = ipHashFromRequest(req);
  const ipClaimed = !cookieClaimed && ipHash ? await hasUsedFreeScan(ipHash) : false;
  const available = !cookieClaimed && !ipClaimed;

  return NextResponse.json(
    {
      freeScanAvailable: available,
      freeTier: { tier: "quick", mode: "standard" },
      visibility: "public",
      paidVisibility: "private",
    },
    { headers: { "cache-control": "private, no-store" } },
  );
}
