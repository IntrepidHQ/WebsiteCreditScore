/**
 * Browserless API token resolution for Vercel/serverless (Playwright is skipped there).
 * Supports common env names so production picks up the key even if the dashboard label differs.
 */
export const getBrowserlessApiKey = (): string | undefined => {
  const key =
    process.env.BROWSERLESS_API?.trim() ||
    process.env.BROWSERLESS_TOKEN?.trim() ||
    process.env.BROWSERLESS_KEY?.trim();

  return key || undefined;
};

/** Tries custom endpoint first, then Browserless cloud clusters (404 on one region is common). */
export const getBrowserlessEndpointBases = (): string[] => {
  const custom = process.env.BROWSERLESS_ENDPOINT?.trim();
  const defaults = ["https://chrome.browserless.io", "https://production-sfo.browserless.io"];
  const ordered = custom ? [custom, ...defaults.filter((d) => d.replace(/\/$/, "") !== custom.replace(/\/$/, ""))] : defaults;
  return [...new Set(ordered.map((b) => b.replace(/\/$/, "")))];
};
