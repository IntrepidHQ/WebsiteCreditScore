/**
 * Merges the raw `Cookie` header with `cookies().getAll()` so Supabase sees the same tokens
 * the browser sent, while letting the Next cookie store win on duplicates (refreshed values).
 * Mirrors the merge strategy used in `/api/app/create-lead`.
 */
export const mergeCookieHeaderWithStore = (
  cookieHeader: string | null,
  storeCookies: { name: string; value: string }[],
) => {
  const merged = new Map<string, { name: string; value: string }>();

  if (cookieHeader) {
    for (const segment of cookieHeader.split(";")) {
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

  for (const c of storeCookies) {
    merged.set(c.name, { name: c.name, value: c.value });
  }

  return Array.from(merged.values());
};
