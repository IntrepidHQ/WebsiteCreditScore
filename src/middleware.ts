import { type NextRequest } from "next/server";

import { updateSupabaseSession } from "@/lib/supabase/middleware";

export const middleware = async (request: NextRequest) => updateSupabaseSession(request);

export const config = {
  matcher: [
    // Exclude /api/workspace/gate: middleware getUser() refreshes cookies on its own
    // response, but Route Handlers still read the original request cookies in the same
    // trip — a second getUser() then sees a rotated/missing refresh ("Auth session missing").
    "/((?!_next/static|_next/image|favicon.ico|api/workspace/gate|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
