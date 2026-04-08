import type { CookieOptions } from "@supabase/ssr";

/**
 * Optional `AUTH_COOKIE_DOMAIN` (e.g. `.websitecreditscore.com`) shares the Supabase session
 * between `www` and apex. Omit on localhost and Vercel preview hosts (`*.vercel.app`).
 */
const resolveAuthCookieDomain = (): string | undefined => {
  const explicit = process.env.AUTH_COOKIE_DOMAIN?.trim();
  if (explicit) {
    return explicit;
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!site || process.env.NODE_ENV !== "production") {
    return undefined;
  }

  try {
    const { hostname } = new URL(site);
    if (hostname === "localhost" || hostname.endsWith(".local")) {
      return undefined;
    }
    if (hostname.endsWith(".vercel.app")) {
      return undefined;
    }

    const parts = hostname.split(".");
    if (parts.length < 2) {
      return undefined;
    }

    return `.${parts.slice(-2).join(".")}`;
  } catch {
    return undefined;
  }
};

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
  const domain = resolveAuthCookieDomain();

  return {
    path: "/",
    sameSite: "lax",
    maxAge: 400 * 24 * 60 * 60,
    secure,
    ...(domain ? { domain } : {}),
  };
};
