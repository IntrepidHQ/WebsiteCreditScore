import { type NextRequest } from "next/server";

import { updateSupabaseSession } from "@/lib/supabase/middleware";

export const middleware = async (request: NextRequest) => updateSupabaseSession(request);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
