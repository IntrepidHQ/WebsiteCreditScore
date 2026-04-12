/**
 * Merge Next `cookies()` with the raw `Cookie` request header, letting the **header win**
 * on duplicate names. Route Handlers sometimes expose an incomplete cookie store; the
 * browser always sends the full `Cookie` header on same-origin `fetch`.
 */
export const mergeCookieStoreThenRequestHeader = (
  storeCookies: { name: string; value: string }[],
  requestCookieHeader: string | null,
): { name: string; value: string }[] => {
  const merged = new Map<string, { name: string; value: string }>();

  for (const c of storeCookies) {
    merged.set(c.name, { name: c.name, value: c.value });
  }

  if (requestCookieHeader) {
    for (const segment of requestCookieHeader.split(";")) {
      const trimmed = segment.trim();
      if (!trimmed) {
        continue;
      }

      const eq = trimmed.indexOf("=");
      if (eq === -1) {
        continue;
      }

      const name = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      merged.set(name, { name, value });
    }
  }

  return Array.from(merged.values());
};
