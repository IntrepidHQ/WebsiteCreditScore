import { NextResponse } from "next/server";

import { getScreenshotPublicUrl } from "@/lib/supabase/storage";
import { getBrowserlessApiKey } from "@/lib/utils/browserless-env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * No secrets exposed — only whether each integration is configured.
 * Use after deploy: GET /api/health/screenshots
 */
export async function GET() {
  const serverless = Boolean(
    process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.AWS_EXECUTION_ENV,
  );
  const browserless = Boolean(getBrowserlessApiKey());
  const supabasePublic = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim());
  const supabaseUpload = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
  const pagespeedKey = Boolean(process.env.GOOGLE_PAGESPEED_API_KEY?.trim());
  const l2CanResolvePublicUrl = getScreenshotPublicUrl("health-probe", "webp") !== null;

  const readyForServerlessCapture = serverless ? browserless || pagespeedKey : true;

  return NextResponse.json(
    {
      serverless,
      readyForServerlessCapture,
      capture: {
        /** Local dev only — skipped when VERCEL is set. */
        localPlaywrightAvailable: !serverless,
        browserless,
        pagespeedKey,
      },
      storage: {
        nextPublicSupabaseUrl: supabasePublic,
        serviceRoleForUpload: supabaseUpload,
        l2PublicUrlResolvable: l2CanResolvePublicUrl,
      },
      hints: readyForServerlessCapture
        ? []
        : [
            "Set BROWSERLESS_API (or BROWSERLESS_TOKEN / BROWSERLESS_KEY) and/or GOOGLE_PAGESPEED_API_KEY in Vercel → Environment Variables for Production (serverless capture skips local Playwright).",
            "Vercel Hobby limits function duration (~10s); use Pro or expect timeouts for slow sites — /api/preview uses maxDuration 60 when your plan allows it.",
            "Set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY so successful captures persist to Storage and repeat views skip Browserless.",
          ],
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
