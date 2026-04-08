import { createClient } from "@supabase/supabase-js";

const BUCKET = "site-previews";

export type ScreenshotImageFormat = "webp" | "png";

function objectPath(cacheKey: string, format: ScreenshotImageFormat) {
  return `${cacheKey}.${format}`;
}

/**
 * Returns the public CDN URL for a stored screenshot without making any network call.
 * Returns null when NEXT_PUBLIC_SUPABASE_URL is not configured.
 */
export function getScreenshotPublicUrl(
  cacheKey: string,
  format: ScreenshotImageFormat = "webp",
): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    return null;
  }

  return `${url}/storage/v1/object/public/${BUCKET}/${objectPath(cacheKey, format)}`;
}

/**
 * Downloads a screenshot from Supabase Storage.
 * Returns null when storage is unconfigured, the file does not exist, or the download fails.
 */
export async function downloadScreenshot(cacheKey: string): Promise<Buffer | null> {
  for (const format of ["webp", "png"] as const) {
    const publicUrl = getScreenshotPublicUrl(cacheKey, format);

    if (!publicUrl) {
      return null;
    }

    try {
      const response = await fetch(publicUrl, {
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        continue;
      }

      return Buffer.from(await response.arrayBuffer());
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Uploads a screenshot buffer to Supabase Storage using the service role key.
 * Requires SUPABASE_SERVICE_ROLE_KEY to be set; silently skips otherwise.
 */
export async function uploadScreenshot(
  cacheKey: string,
  buffer: Buffer,
  contentType: "image/png" | "image/webp",
): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return;
  }

  const client = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  const format: ScreenshotImageFormat = contentType === "image/webp" ? "webp" : "png";

  await client.storage.from(BUCKET).upload(objectPath(cacheKey, format), buffer, {
    contentType,
    upsert: true,
    cacheControl: "43200",
  });
}
