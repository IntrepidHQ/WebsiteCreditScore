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
import { getBrowserlessApiKey } from "@/lib/utils/browserless-env";
import { PREVIEW_CAPTURE_VERSION } from "@/lib/utils/preview-capture-version";

const CACHE_DIR = path.join("/tmp", "craydl-site-previews");
const CACHE_TTL_MS = 1000 * 60 * 60 * 12;
const SCREENSHOT_WAIT_MS = 2400;
const SCROLL_STEP_DELAY_MS = 160;
const CAPTURE_BUDGET_MS = 22000;
const GOTO_TIMEOUT_MS = 14000;
const LOAD_STATE_TIMEOUT_MS = 11000;
const NETWORK_IDLE_TIMEOUT_MS = 4500;
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

export type LayerDiagnostic = {
  layer: string;
  status: "hit" | "skip" | "fail";
  ms: number;
  error?: string;
};

export type PreviewDiagnostics = {
  layers: LayerDiagnostic[];
  totalMs: number;
};

export type PreviewImageResult = {
  buffer: Buffer;
  contentType: string;
  source: "screenshot" | "remote-image" | "placeholder" | "storage";
  reason: string;
  /** Public CDN URL when the image is persisted to Supabase Storage. */
  storageUrl?: string;
  /** Per-layer timing and status diagnostics. */
  diagnostics?: PreviewDiagnostics;
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
    await page.waitForLoadState("load", { timeout: LOAD_STATE_TIMEOUT_MS }).catch(() => undefined);
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

        video {
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
        try {
          await document.fonts?.ready;
        } catch {
          /* ignore */
        }
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
    await page
      .waitForFunction(
        () => (document.body?.innerText?.trim().length ?? 0) > 320,
        { timeout: 9000 },
      )
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
 * Browserless `waitForFunction` body: scrolls so lazy-hydrated pages (e.g. Wikipedia
 * mobile) paint main content, then scrolls back to top before the screenshot.
 * @see https://docs.browserless.io/rest-apis/request-configuration#waitforfunction
 */
const BROWSERLESS_SCROLL_SETTLE_FN = `async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  try {
    await document.fonts?.ready;
  } catch {
    /* ignore */
  }
  document.querySelectorAll('img[loading="lazy"]').forEach((el) => el.setAttribute("loading", "eager"));
  const root = document.scrollingElement || document.documentElement;
  const maxScroll = Math.max(0, root.scrollHeight - window.innerHeight);
  const step = Math.max(260, Math.floor(window.innerHeight * 0.58));
  let y = 0;
  let i = 0;
  while (y <= maxScroll && i < 36) {
    window.scrollTo(0, y);
    await sleep(120);
    y += step;
    i += 1;
  }
  window.scrollTo(0, 0);
  await sleep(320);
  return true;
}`;

/**
 * Lazy health check — runs once per process lifetime on the first
 * Browserless call.  If the API key or endpoint is bad we flag it and
 * skip all future attempts, saving up to 96 seconds of wasted timeout.
 */
let browserlessVerified: boolean | null = null;

async function verifyBrowserlessOnce(): Promise<boolean> {
  if (browserlessVerified !== null) return browserlessVerified;

  const apiKey = getBrowserlessApiKey();
  if (!apiKey) {
    browserlessVerified = false;
    return false;
  }

  const baseEndpoint =
    process.env.BROWSERLESS_ENDPOINT?.trim() ?? "https://chrome.browserless.io";
  const pingUrl = `${baseEndpoint}/screenshot?token=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(pingUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: "about:blank",
        options: { type: "png" },
        gotoOptions: { waitUntil: "domcontentloaded", timeout: 8000 },
      }),
      signal: AbortSignal.timeout(12_000),
    });

    if (res.ok) {
      console.info("[site-preview] Browserless health check passed ✓");
      browserlessVerified = true;
      return true;
    }

    const detail = await res.text().catch(() => "");

    if (res.status === 401) {
      console.error(
        "[site-preview] Browserless API key is invalid or expired (BROWSERLESS_API / BROWSERLESS_TOKEN). Falling back to PageSpeed.",
      );
    } else if (res.status === 404) {
      console.error(`[site-preview] Browserless endpoint returned 404. Try setting BROWSERLESS_ENDPOINT to https://production-sfo.browserless.io`);
    } else if (res.status === 400) {
      console.error(`[site-preview] Browserless rejected the payload (400). Check API version compatibility. Detail: ${detail.slice(0, 200)}`);
    } else {
      console.error(`[site-preview] Browserless health check failed with ${res.status}: ${detail.slice(0, 200)}`);
    }

    browserlessVerified = false;
    return false;
  } catch (err) {
    console.error("[site-preview] Browserless health check failed (network error):", err);
    browserlessVerified = false;
    return false;
  }
}

/**
 * Capture a full-page screenshot via the Browserless REST API.
 * This is the primary live-capture method in serverless environments — it
 * offloads headless Chrome to a reliable external service, eliminating the
 * binary-size issues that plague @sparticuz/chromium on Vercel/Lambda.
 *
 * Requires BROWSERLESS_API, BROWSERLESS_TOKEN, or BROWSERLESS_KEY (API token).
 * The endpoint base can be overridden with BROWSERLESS_ENDPOINT; defaults
 * to the standard Browserless cloud cluster.
 */
async function captureViaBrowserless(
  url: string,
  device: PreviewDevice,
): Promise<Buffer> {
  const apiKey = getBrowserlessApiKey();
  if (!apiKey) throw new Error("Browserless API key not configured (BROWSERLESS_API or BROWSERLESS_TOKEN)");

  const healthy = await verifyBrowserlessOnce();
  if (!healthy) throw new Error("Browserless health check failed — skipping");

  const isDesktop = device === "desktop";
  const baseEndpoint =
    process.env.BROWSERLESS_ENDPOINT?.trim() ?? "https://chrome.browserless.io";

  const apiUrl = `${baseEndpoint}/screenshot?token=${encodeURIComponent(apiKey)}`;

  const basePayload = {
    url,
    options: {
      fullPage: true,
      type: "png",
      animations: "disabled",
    },
    viewport: isDesktop
      ? { width: 1440, height: 900, deviceScaleFactor: 1 }
      : { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
    userAgent: isDesktop
      ? "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36"
      : "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    addStyleTag: [
      {
        content: `
          *, *::before, *::after {
            animation: none !important;
            transition: none !important;
            scroll-behavior: auto !important;
          }
          video { visibility: hidden !important; }
          ::-webkit-scrollbar { display: none !important; }
        `,
      },
    ],
    bestAttempt: true,
    waitForFunction: {
      fn: BROWSERLESS_SCROLL_SETTLE_FN,
      timeout: 16_000,
    },
  };

  // Use `waitForTimeout` (Browserless REST); `waitFor` is not documented and may be ignored.
  const attempts: Array<{
    gotoOptions: { waitUntil: string; timeout: number };
    waitForTimeout?: number;
  }> = [
    { gotoOptions: { waitUntil: "load", timeout: 26_000 }, waitForTimeout: 1000 },
    { gotoOptions: { waitUntil: "domcontentloaded", timeout: 24_000 }, waitForTimeout: 1800 },
  ];

  let lastError: unknown;

  for (const attempt of attempts) {
    try {
      const body = {
        ...basePayload,
        gotoOptions: attempt.gotoOptions,
        ...(attempt.waitForTimeout != null ? { waitForTimeout: attempt.waitForTimeout } : {}),
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(48_000),
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        throw new Error(`Browserless API returned ${response.status}: ${detail.slice(0, 200)}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      if (!bufferLooksLikeRasterImage(buffer)) {
        throw new Error("Browserless returned a non-image response body.");
      }

      return buffer;
    } catch (err) {
      lastError = err;
      console.warn("[site-preview] Browserless capture attempt failed:", err);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
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
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY?.trim();
  const keyParam = apiKey ? `&key=${encodeURIComponent(apiKey)}` : "";
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&category=performance${keyParam}`;

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
  const buildStart = Date.now();
  const layers: LayerDiagnostic[] = [];
  const cacheKey = createCacheKey(cacheIdentityUrl, device);

  function trackLayer(layer: string, status: "hit" | "skip" | "fail", startMs: number, error?: string) {
    layers.push({ layer, status, ms: Date.now() - startMs, error });
  }

  function attachDiagnostics(result: PreviewImageResult): PreviewImageResult {
    const diagnostics: PreviewDiagnostics = { layers, totalMs: Date.now() - buildStart };
    console.info(`[site-preview] ${cacheIdentityUrl} → ${result.reason} (${diagnostics.totalMs}ms) layers: ${layers.map((l) => `${l.layer}:${l.status}:${l.ms}ms`).join(", ")}`);
    return { ...result, diagnostics };
  }

  // L1: in-process disk cache (warm serverless instances)
  {
    const t = Date.now();
    const cached = await readFreshScreenshotFromCache(cacheKey);
    if (cached) {
      trackLayer("L1-disk", "hit", t);
      return attachDiagnostics(cached);
    }
    trackLayer("L1-disk", "skip", t);
  }

  // L2: Supabase Storage (persists across deploys and cold starts)
  {
    const t = Date.now();
    const canUseRemote = getScreenshotPublicUrl(cacheKey) !== null;

    if (canUseRemote) {
      const remoteBuffer = await downloadScreenshot(cacheKey);

      if (remoteBuffer && bufferLooksLikeRasterImage(remoteBuffer)) {
        const format = detectBufferImageFormat(remoteBuffer);
        const contentType = format === "webp" ? "image/webp" : "image/png";

        writeScreenshotToCache(cacheKey, remoteBuffer, contentType).catch(() => {});
        trackLayer("L2-storage", "hit", t);

        return attachDiagnostics({
          buffer: remoteBuffer,
          contentType,
          source: "storage",
          reason: "storage-hit",
          storageUrl: getScreenshotPublicUrl(cacheKey, format) ?? undefined,
        });
      }

      trackLayer("L2-storage", "skip", t);
    } else {
      trackLayer("L2-storage", "skip", t, "unconfigured");
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

  // L3a: Browserless API — primary live capture in serverless.
  if (getBrowserlessApiKey()) {
    const t = Date.now();
    try {
      const rawBuffer = await withTimeout(
        captureViaBrowserless(captureUrl, device),
        58_000,
        "Browserless capture timed out.",
      );
      trackLayer("L3a-browserless", "hit", t);
      return attachDiagnostics(await compressAndCache(rawBuffer, "browserless-api"));
    } catch (err) {
      trackLayer("L3a-browserless", "fail", t, err instanceof Error ? err.message : String(err));
      console.warn("[site-preview] Browserless capture failed, trying next layer:", err);
    }
  } else {
    trackLayer("L3a-browserless", "skip", Date.now(), "unconfigured");
  }

  // L3b: Local Playwright capture — works in local dev; SKIPPED in serverless
  // environments where @sparticuz/chromium binaries reliably fail (~22s waste).
  if (!isServerlessRuntime) {
    const t = Date.now();
    try {
      const rawBuffer = await withTimeout(
        captureScreenshot(captureUrl, device),
        CAPTURE_BUDGET_MS,
        "Screenshot capture budget exceeded.",
      );
      trackLayer("L3b-playwright", "hit", t);
      return attachDiagnostics(await compressAndCache(rawBuffer, "captured-live"));
    } catch (err) {
      trackLayer("L3b-playwright", "fail", t, err instanceof Error ? err.message : String(err));
      console.warn("[site-preview] Playwright capture failed, trying next layer:", err);
    }
  } else {
    trackLayer("L3b-playwright", "skip", Date.now(), "serverless-runtime");
  }

  // L4: External screenshot API fallback (Google PageSpeed — reliable in serverless)
  {
    const t = Date.now();
    try {
      const rawBuffer = await withTimeout(
        captureViaExternalApi(captureUrl, device),
        16000,
        "External screenshot API timed out.",
      );
      trackLayer("L4-pagespeed", "hit", t);
      return attachDiagnostics(await compressAndCache(rawBuffer, "external-api-fallback"));
    } catch (err) {
      trackLayer("L4-pagespeed", "fail", t, err instanceof Error ? err.message : String(err));
    }
  }

  // L5: OG image fallback
  if (fallbackImageUrl) {
    const t = Date.now();
    try {
      const remoteImage = await withTimeout(
        fetchRemoteImage(fallbackImageUrl),
        REMOTE_IMAGE_TIMEOUT_MS,
        "Remote image fallback timed out.",
      );
      const compressed = await compressScreenshot(remoteImage.buffer, device);
      trackLayer("L5-og-image", "hit", t);
      return attachDiagnostics({
        buffer: compressed.buffer,
        contentType: compressed.contentType,
        source: "remote-image",
        reason: "fallback-og-image",
      });
    } catch (err) {
      trackLayer("L5-og-image", "fail", t, err instanceof Error ? err.message : String(err));
    }
  } else {
    trackLayer("L5-og-image", "skip", Date.now(), "no-og-url");
  }

  // L6: SVG placeholder (last resort)
  trackLayer("L6-placeholder", "hit", Date.now());
  return attachDiagnostics({
    ...createPlaceholderImage(cacheIdentityUrl, device),
    reason: fallbackImageUrl ? "fallback-placeholder-after-og-failed" : "fallback-placeholder-no-og-image",
  });
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
