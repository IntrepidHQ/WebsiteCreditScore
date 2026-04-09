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
