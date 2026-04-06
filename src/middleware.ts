import { type NextRequest } from "next/server";

import { updateSupabaseSession } from "@/lib/supabase/middleware";

export const middleware = async (request: NextRequest) => updateSupabaseSession(request);

/**
 * Skip `/api/*` so Route Handlers are the only place that refresh the session on those requests.
 * Otherwise middleware + handler both call `getUser()` in one round-trip: the first refresh can
 * rotate tokens in `Set-Cookie` while the handler still sees the stale `Cookie` header →
 * "Auth session missing" / invalid refresh on create-lead, /api/workspace/gate, etc.
 *
 * @see https://github.com/supabase/ssr/issues/68
 */
export const config = {
  matcher: [
    "/((?!api(?:/|$)|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
