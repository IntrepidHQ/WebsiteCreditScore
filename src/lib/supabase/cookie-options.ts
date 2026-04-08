import type { CookieOptions } from "@supabase/ssr";

/**
 * Supabase merges these with its defaults. `secure` must be true on HTTPS production
 * so browsers treat session cookies as expected; keep false in local dev over http.
 */
export const getSupabaseCookieOptions = (request?: Request): CookieOptions => {
  const fromUrl =
    request &&
    (() => {
      try {
        return new URL(request.url).protocol === "https:";
      } catch {
        return false;
      }
    })();

  const secure = process.env.NODE_ENV === "production" || Boolean(fromUrl);

  return {
    path: "/",
    sameSite: "lax",
    maxAge: 400 * 24 * 60 * 60,
    secure,
  };
};
