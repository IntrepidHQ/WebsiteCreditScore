import type { SiteObservation } from "@/lib/types/audit";
import { getSitePreviewImage } from "@/lib/utils/site-screenshot";
import { normalizeUrl } from "@/lib/utils/url";

/**
 * Captures (or loads from Supabase Storage) the desktop preview for this scan and
 * uploads webp/png to the `site-previews` bucket when configured. Subsequent
 * `/api/preview` requests hit L2 storage instead of Browserless, saving API credits.
 */
export const ensurePreviewCachedForObservation = async (
  normalizedAuditUrl: string,
  observation: SiteObservation,
): Promise<void> => {
  const cacheIdentity = normalizeUrl(normalizedAuditUrl, { stripWww: false });
  const captureUrl = observation.finalUrl ?? cacheIdentity;

  await getSitePreviewImage(
    cacheIdentity,
    "desktop",
    observation.ogImage,
    captureUrl,
  );
};
