import { createClient } from "@supabase/supabase-js";

const BUCKET = "site-previews";

/**
 * Returns the public CDN URL for a stored screenshot without making any network call.
 * Returns null when NEXT_PUBLIC_SUPABASE_URL is not configured.
 */
export function getScreenshotPublicUrl(cacheKey: string): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    return null;
  }

  return `${url}/storage/v1/object/public/${BUCKET}/${cacheKey}.png`;
}

/**
 * Checks whether a screenshot exists in Supabase Storage via a lightweight HEAD request.
 * Returns false when storage is unconfigured or the request fails.
 */
export async function screenshotExistsInStorage(cacheKey: string): Promise<boolean> {
  const publicUrl = getScreenshotPublicUrl(cacheKey);

  if (!publicUrl) {
    return false;
  }

  try {
    const response = await fetch(publicUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(3000),
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Downloads a screenshot from Supabase Storage.
 * Returns null when storage is unconfigured, the file does not exist, or the download fails.
 */
export async function downloadScreenshot(cacheKey: string): Promise<Buffer | null> {
  const publicUrl = getScreenshotPublicUrl(cacheKey);

  if (!publicUrl) {
    return null;
  }

  try {
    const response = await fetch(publicUrl, {
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return null;
    }

    return Buffer.from(await response.arrayBuffer());
  } catch {
    return null;
  }
}

/**
 * Uploads a screenshot buffer to Supabase Storage using the service role key.
 * Requires SUPABASE_SERVICE_ROLE_KEY to be set; silently skips otherwise.
 */
export async function uploadScreenshot(cacheKey: string, buffer: Buffer): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return;
  }

  const client = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  await client.storage.from(BUCKET).upload(`${cacheKey}.png`, buffer, {
    contentType: "image/png",
    upsert: true,
    cacheControl: "43200",
  });
}
