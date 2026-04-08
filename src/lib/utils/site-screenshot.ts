import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import chromiumLambda from "@sparticuz/chromium";
import { chromium } from "playwright-core";
import sharp from "sharp";

import type { PreviewDevice } from "@/lib/types/audit";
import {
  downloadScreenshot,
  getScreenshotPublicUrl,
  uploadScreenshot,
  type ScreenshotImageFormat,
} from "@/lib/supabase/storage";
import { PREVIEW_CAPTURE_VERSION } from "@/lib/utils/preview-capture-version";

const CACHE_DIR = path.join("/tmp", "craydl-site-previews");
const CACHE_TTL_MS = 1000 * 60 * 60 * 12;
const SCREENSHOT_WAIT_MS = 1200;
const SCROLL_STEP_DELAY_MS = 140;
const CAPTURE_BUDGET_MS = 18000;
const GOTO_TIMEOUT_MS = 12000;
const NETWORK_IDLE_TIMEOUT_MS = 1800;
const REMOTE_IMAGE_TIMEOUT_MS = 7000;
const CAPTURE_VERSION = PREVIEW_CAPTURE_VERSION;
const COMPRESSION_MAX_WIDTH = 1440;
const COMPRESSION_MAX_HEIGHT = 2400;
const COMPRESSION_QUALITY = 82;

const previewCache = new Map<string, Promise<PreviewImageResult>>();

function bufferLooksLikeRasterImage(buffer: Buffer) {
  if (buffer.length < 12) {
    return false;
  }

  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return true;
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }

  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return true;
  }

  return false;
}

function detectBufferImageFormat(buffer: Buffer): ScreenshotImageFormat {
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "webp";
  }

  return "png";
}

/**
 * Compress a raw screenshot buffer using sharp.
 * Resizes to fit within max dimensions, converts to optimized WebP,
 * then falls back to optimized PNG if WebP is larger (rare for photos).
 */
async function compressScreenshot(
  input: Buffer,
  device: PreviewDevice,
): Promise<{ buffer: Buffer; contentType: string }> {
  try {
    const maxWidth = device === "mobile" ? 780 : COMPRESSION_MAX_WIDTH;
    const maxHeight = device === "mobile" ? 1800 : COMPRESSION_MAX_HEIGHT;

    const pipeline = sharp(input)
      .resize({
        width: maxWidth,
        height: maxHeight,
        fit: "inside",
        withoutEnlargement: true,
      });

    const webpBuffer = await pipeline
      .clone()
      .webp({ quality: COMPRESSION_QUALITY, effort: 4 })
      .toBuffer();

    const pngBuffer = await pipeline
      .clone()
      .png({ compressionLevel: 8, palette: false })
      .toBuffer();

    if (webpBuffer.length <= pngBuffer.length) {
      return { buffer: webpBuffer, contentType: "image/webp" };
    }

    return { buffer: pngBuffer, contentType: "image/png" };
  } catch {
    // If sharp fails, return original uncompressed
    return { buffer: input, contentType: "image/png" };
  }
}

export type PreviewImageResult = {
  buffer: Buffer;
  contentType: string;
  source: "screenshot" | "remote-image" | "placeholder" | "storage";
  reason: string;
  /** Public CDN URL when the image is persisted to Supabase Storage. */
  storageUrl?: string;
};

const browserCandidates = [
  process.env.PLAYWRIGHT_EXECUTABLE_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Arc.app/Contents/MacOS/Arc",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/Applications/Opera.app/Contents/MacOS/Opera",
].filter(Boolean) as string[];

const isServerlessRuntime = Boolean(
  process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.AWS_EXECUTION_ENV,
);

const desktopContext = {
  viewport: { width: 1440, height: 1800 },
  deviceScaleFactor: 1,
  colorScheme: "light" as const,
  ignoreHTTPSErrors: true,
  locale: "en-US",
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
};

const mobileContext = {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  colorScheme: "light" as const,
  ignoreHTTPSErrors: true,
  isMobile: true,
  hasTouch: true,
  locale: "en-US",
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
};

export function createCacheKey(url: string, device: PreviewDevice) {
  return createHash("sha256")
    .update(`${url}:${device}:${CAPTURE_VERSION}`)
    .digest("hex")
    .slice(0, 24);
}

async function ensureCacheDirectory() {
  await fs.mkdir(CACHE_DIR, { recursive: true });
}

async function pruneCacheDirectory() {
  const files = await fs.readdir(CACHE_DIR).catch(() => []);
  const now = Date.now();

  await Promise.all(
    files
      .filter((file) => file.endsWith(".png") || file.endsWith(".webp"))
      .map(async (file) => {
        const filePath = path.join(CACHE_DIR, file);
        const stats = await fs.stat(filePath).catch(() => null);

        if (!stats) {
          return;
        }

        if (now - stats.mtimeMs > CACHE_TTL_MS) {
          await fs.unlink(filePath).catch(() => undefined);
        }
      }),
  );
}

async function readFreshScreenshotFromCache(cacheKey: string) {
  for (const ext of ["webp", "png"] as const) {
    const filePath = path.join(CACHE_DIR, `${cacheKey}.${ext}`);
    const stats = await fs.stat(filePath).catch(() => null);

    if (!stats) {
      continue;
    }

    if (Date.now() - stats.mtimeMs > CACHE_TTL_MS) {
      continue;
    }

    const buffer = await fs.readFile(filePath);

    if (!bufferLooksLikeRasterImage(buffer)) {
      await fs.unlink(filePath).catch(() => undefined);
      continue;
    }

    const format = detectBufferImageFormat(buffer);
    const contentType = format === "webp" ? "image/webp" : "image/png";

    return {
      buffer,
      contentType,
      source: "screenshot" as const,
      reason: "cache-hit",
    };
  }

  return null;
}

async function writeScreenshotToCache(
  cacheKey: string,
  buffer: Buffer,
  contentType: string,
) {
  await ensureCacheDirectory();
  await pruneCacheDirectory();
  const format = contentType.includes("webp") ? "webp" : "png";
  const other: ScreenshotImageFormat = format === "webp" ? "png" : "webp";

  await fs.unlink(path.join(CACHE_DIR, `${cacheKey}.${other}`)).catch(() => undefined);
  await fs.writeFile(path.join(CACHE_DIR, `${cacheKey}.${format}`), buffer);
}

async function resolveBrowserLaunchConfig() {
  if (process.env.PLAYWRIGHT_EXECUTABLE_PATH) {
    try {
      await fs.access(process.env.PLAYWRIGHT_EXECUTABLE_PATH);
      return {
        executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH,
        args: [] as string[],
        headless: true,
      };
    } catch {
      // Continue to runtime-specific fallbacks.
    }
  }

  if (isServerlessRuntime) {
    const executablePath = await chromiumLambda.executablePath();
    return {
      executablePath,
      args: [...chromiumLambda.args],
      headless: true,
    };
  }

  for (const candidate of browserCandidates) {
    try {
      await fs.access(candidate);
      return {
        executablePath: candidate,
        args: [] as string[],
        headless: true,
      };
    } catch {
      continue;
    }
  }

  throw new Error("No local browser executable found for site previews.");
}

async function captureScreenshot(url: string, device: PreviewDevice) {
  const launchConfig = await resolveBrowserLaunchConfig();
  const browser = await chromium.launch({
    executablePath: launchConfig.executablePath,
    headless: launchConfig.headless,
    args: [
      ...launchConfig.args,
      "--disable-blink-features=AutomationControlled",
      "--disable-dev-shm-usage",
      "--hide-scrollbars",
      "--mute-audio",
      "--disable-background-networking",
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
    ],
  });

  try {
    const context = await browser.newContext({
      ...(device === "mobile" ? mobileContext : desktopContext),
    });
    const page = await context.newPage();

    await page.route("**/*", (route) => {
      const resourceType = route.request().resourceType();

      if (resourceType === "media" || resourceType === "eventsource" || resourceType === "websocket") {
        return route.abort();
      }

      return route.continue();
    });

    await page.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => undefined,
      });
    });

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: GOTO_TIMEOUT_MS,
    });
    await page.waitForLoadState("networkidle", { timeout: NETWORK_IDLE_TIMEOUT_MS }).catch(() => undefined);
    await page.emulateMedia({ reducedMotion: "reduce" }).catch(() => undefined);
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation: none !important;
          transition: none !important;
          caret-color: transparent !important;
          scroll-behavior: auto !important;
        }

        video,
        iframe {
          visibility: hidden !important;
        }
      `,
    }).catch(() => undefined);
    await page
      .evaluate(async (scrollDelay) => {
        document.querySelectorAll('img[loading="lazy"]').forEach((image) => {
          image.setAttribute("loading", "eager");
        });

        const wait = (time: number) =>
          new Promise((resolve) => window.setTimeout(resolve, time));
        const scrollRoot = document.scrollingElement || document.documentElement;
        const maxScroll = Math.max(0, scrollRoot.scrollHeight - window.innerHeight);
        const step = Math.max(360, Math.floor(window.innerHeight * 0.85));

        for (let position = 0; position <= maxScroll; position += step) {
          window.scrollTo({ top: position, left: 0, behavior: "auto" });
          await wait(scrollDelay);
        }

        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        await wait(scrollDelay);

        await Promise.all(
          Array.from(document.images)
            .slice(0, 80)
            .map(
              (image) =>
                image.complete
                  ? Promise.resolve()
                  : new Promise((resolve) => {
                      const finish = () => resolve(undefined);
                      image.addEventListener("load", finish, { once: true });
                      image.addEventListener("error", finish, { once: true });
                      window.setTimeout(finish, 1500);
                    }),
            ),
        );
      }, SCROLL_STEP_DELAY_MS)
      .catch(() => undefined);
    await page.evaluate(
      (ms) => new Promise<void>((resolve) => window.setTimeout(resolve, ms)),
      SCREENSHOT_WAIT_MS,
    );

    const buffer = await page.screenshot({
      type: "png",
      fullPage: true,
      animations: "disabled",
      caret: "hide",
      scale: "css",
    });

    await context.close();

    return buffer;
  } finally {
    await browser.close();
  }
}

/**
 * Use an external screenshot API as a reliable fallback when local browser
 * capture fails (common in serverless environments with binary size limits).
 * Uses Google PageSpeed Insights which is free and returns a real rendered screenshot.
 */
async function captureViaExternalApi(
  url: string,
  device: PreviewDevice,
): Promise<Buffer> {
  const strategy = device === "mobile" ? "mobile" : "desktop";
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&category=performance`;

  const response = await fetch(apiUrl, {
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`PageSpeed API returned ${response.status}`);
  }

  const data = (await response.json()) as {
    lighthouseResult?: {
      audits?: {
        "final-screenshot"?: {
          details?: { data?: string };
        };
        "full-page-screenshot"?: {
          details?: { screenshot?: { data?: string } };
        };
      };
    };
  };

  // Try full-page screenshot first, then final screenshot
  const fullPage =
    data.lighthouseResult?.audits?.["full-page-screenshot"]?.details?.screenshot
      ?.data;
  const finalShot =
    data.lighthouseResult?.audits?.["final-screenshot"]?.details?.data;
  const base64Data = fullPage ?? finalShot;

  if (!base64Data) {
    throw new Error("No screenshot data in PageSpeed response");
  }

  // Strip data URL prefix if present
  const raw = base64Data.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(raw, "base64");
}

async function fetchRemoteImage(imageUrl: string) {
  const response = await fetch(imageUrl, {
    headers: {
      accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
    },
    signal: AbortSignal.timeout(12000),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Remote image request failed with ${response.status}.`);
  }

  const contentType = response.headers.get("content-type") ?? "image/jpeg";

  if (!contentType.startsWith("image/")) {
    throw new Error("Remote fallback is not an image.");
  }

  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType,
    source: "remote-image" as const,
    reason: "remote-image-fallback",
  };
}

function createPlaceholderImage(url: string, device: PreviewDevice): PreviewImageResult {
  const hostname = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return "website preview";
    }
  })();
  const width = device === "mobile" ? 390 : 1280;
  const height = device === "mobile" ? 844 : 800;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  <rect width="${width}" height="${height}" fill="#071018"/>
  <rect x="${device === "mobile" ? 20 : 56}" y="${device === "mobile" ? 34 : 56}" width="${width - (device === "mobile" ? 40 : 112)}" height="${height - (device === "mobile" ? 68 : 112)}" rx="12" fill="#101d2b" stroke="#223247" stroke-width="1.5"/>
  <text x="50%" y="44%" fill="#f4f7fb" font-size="${device === "mobile" ? 18 : 28}" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto" font-weight="500">Preview unavailable</text>
  <text x="50%" y="51%" fill="#98a6ba" font-size="${device === "mobile" ? 13 : 17}" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto">${hostname}</text>
</svg>`.trim();

  return {
    buffer: Buffer.from(svg, "utf8"),
    contentType: "image/svg+xml; charset=utf-8",
    source: "placeholder",
    reason: "placeholder-generated",
  };
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), timeoutMs);
    }),
  ]);
}

async function buildPreviewImage(
  cacheIdentityUrl: string,
  captureUrl: string,
  device: PreviewDevice,
  fallbackImageUrl?: string,
): Promise<PreviewImageResult> {
  const cacheKey = createCacheKey(cacheIdentityUrl, device);

  // L1: in-process disk cache (warm serverless instances)
  const cached = await readFreshScreenshotFromCache(cacheKey);

  if (cached) {
    return cached;
  }

  // L2: Supabase Storage (persists across deploys and cold starts)
  const canUseRemote = getScreenshotPublicUrl(cacheKey) !== null;

  if (canUseRemote) {
    // Skip HEAD checks: many public CDNs return 403/405 for HEAD while GET works.
    const remoteBuffer = await downloadScreenshot(cacheKey);

    if (remoteBuffer && bufferLooksLikeRasterImage(remoteBuffer)) {
      const format = detectBufferImageFormat(remoteBuffer);
      const contentType = format === "webp" ? "image/webp" : "image/png";

      writeScreenshotToCache(cacheKey, remoteBuffer, contentType).catch(() => {});

      return {
        buffer: remoteBuffer,
        contentType,
        source: "storage",
        reason: "storage-hit",
        storageUrl: getScreenshotPublicUrl(cacheKey, format) ?? undefined,
      };
    }
  }

  // Helper: compress, cache, and persist a raw screenshot buffer.
  async function compressAndCache(
    rawBuffer: Buffer,
    reason: string,
  ): Promise<PreviewImageResult> {
    const compressed = await compressScreenshot(rawBuffer, device);
    writeScreenshotToCache(cacheKey, compressed.buffer, compressed.contentType).catch(() => {});

    const formatForUrl: ScreenshotImageFormat =
      compressed.contentType === "image/webp" ? "webp" : "png";
    const persistedUrl = getScreenshotPublicUrl(cacheKey, formatForUrl) ?? undefined;

    if (persistedUrl) {
      uploadScreenshot(
        cacheKey,
        compressed.buffer,
        compressed.contentType as "image/png" | "image/webp",
      ).catch((err) => {
        console.error("[site-preview] Supabase upload failed:", err);
      });
    }

    return {
      buffer: compressed.buffer,
      contentType: compressed.contentType,
      source: "screenshot",
      reason,
      storageUrl: persistedUrl,
    };
  }

  // L3: Live capture
  try {
    const rawBuffer = await withTimeout(
      captureScreenshot(captureUrl, device),
      CAPTURE_BUDGET_MS,
      "Screenshot capture budget exceeded.",
    );

    return await compressAndCache(rawBuffer, "captured-live");
  } catch {
    // L4: External screenshot API fallback (reliable in serverless)
    try {
      const rawBuffer = await withTimeout(
        captureViaExternalApi(captureUrl, device),
        16000,
        "External screenshot API timed out.",
      );

      return await compressAndCache(rawBuffer, "external-api-fallback");
    } catch {
      // Continue to OG image / placeholder fallbacks
    }

    if (fallbackImageUrl) {
      try {
        const remoteImage = await withTimeout(
          fetchRemoteImage(fallbackImageUrl),
          REMOTE_IMAGE_TIMEOUT_MS,
          "Remote image fallback timed out.",
        );
        // Compress remote images too
        const compressed = await compressScreenshot(remoteImage.buffer, device);

        return {
          buffer: compressed.buffer,
          contentType: compressed.contentType,
          source: "remote-image",
          reason: "fallback-og-image",
        };
      } catch {
        return {
          ...createPlaceholderImage(cacheIdentityUrl, device),
          reason: "fallback-placeholder-after-og-failed",
        };
      }
    }

    return {
      ...createPlaceholderImage(cacheIdentityUrl, device),
      reason: "fallback-placeholder-no-og-image",
    };
  }
}

export const getSitePreviewImage = async (
  cacheIdentityUrl: string,
  device: PreviewDevice,
  fallbackImageUrl?: string,
  captureUrl?: string,
) => {
  const navigateTo = captureUrl ?? cacheIdentityUrl;
  const dedupeKey = `${cacheIdentityUrl}::${device}::${fallbackImageUrl ?? ""}::${CAPTURE_VERSION}`;
  const existing = previewCache.get(dedupeKey);

  if (existing) {
    return existing;
  }

  const pending = buildPreviewImage(
    cacheIdentityUrl,
    navigateTo,
    device,
    fallbackImageUrl,
  ).finally(() => {
    previewCache.delete(dedupeKey);
  });
  previewCache.set(dedupeKey, pending);

  return pending;
};
