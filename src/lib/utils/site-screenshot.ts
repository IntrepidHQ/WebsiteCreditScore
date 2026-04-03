import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import chromiumLambda from "@sparticuz/chromium";
import { chromium } from "playwright-core";

import type { PreviewDevice } from "@/lib/types/audit";
import {
  downloadScreenshot,
  getScreenshotPublicUrl,
  screenshotExistsInStorage,
  uploadScreenshot,
} from "@/lib/supabase/storage";

const CACHE_DIR = path.join("/tmp", "craydl-site-previews");
const CACHE_TTL_MS = 1000 * 60 * 60 * 12;
const SCREENSHOT_WAIT_MS = 1200;
const SCROLL_STEP_DELAY_MS = 140;
const CAPTURE_BUDGET_MS = 18000;
const GOTO_TIMEOUT_MS = 12000;
const NETWORK_IDLE_TIMEOUT_MS = 1800;
const REMOTE_IMAGE_TIMEOUT_MS = 7000;
const CAPTURE_VERSION = "static-shot-3";

const previewCache = new Map<string, Promise<PreviewImageResult>>();

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
      .filter((file) => file.endsWith(".png"))
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
  const filePath = path.join(CACHE_DIR, `${cacheKey}.png`);
  const stats = await fs.stat(filePath).catch(() => null);

  if (!stats) {
    return null;
  }

  if (Date.now() - stats.mtimeMs > CACHE_TTL_MS) {
    return null;
  }

  const buffer = await fs.readFile(filePath);

  return {
    buffer,
    contentType: "image/png",
    source: "screenshot" as const,
    reason: "cache-hit",
  };
}

async function writeScreenshotToCache(cacheKey: string, buffer: Buffer) {
  await ensureCacheDirectory();
  await pruneCacheDirectory();
  await fs.writeFile(path.join(CACHE_DIR, `${cacheKey}.png`), buffer);
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
    await page.waitForTimeout(SCREENSHOT_WAIT_MS);

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
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a1028"/>
      <stop offset="100%" stop-color="#090d1f"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect x="${device === "mobile" ? 20 : 56}" y="${device === "mobile" ? 34 : 56}" width="${width - (device === "mobile" ? 40 : 112)}" height="${height - (device === "mobile" ? 68 : 112)}" rx="18" fill="#0f1733" stroke="#26305a" stroke-width="2"/>
  <text x="50%" y="45%" fill="#eef2ff" font-size="${device === "mobile" ? 22 : 36}" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto">Preview unavailable</text>
  <text x="50%" y="52%" fill="#8f9aca" font-size="${device === "mobile" ? 14 : 20}" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto">${hostname}</text>
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
  url: string,
  device: PreviewDevice,
  fallbackImageUrl?: string,
): Promise<PreviewImageResult> {
  const cacheKey = createCacheKey(url, device);

  // L1: in-process disk cache (warm serverless instances)
  const cached = await readFreshScreenshotFromCache(cacheKey);

  if (cached) {
    return cached;
  }

  // L2: Supabase Storage (persists across deploys and cold starts)
  const storageUrl = getScreenshotPublicUrl(cacheKey);

  if (storageUrl) {
    const exists = await screenshotExistsInStorage(cacheKey);

    if (exists) {
      const buffer = await downloadScreenshot(cacheKey);

      if (buffer) {
        // Warm the disk cache for subsequent requests in this instance.
        writeScreenshotToCache(cacheKey, buffer).catch(() => {});

        return {
          buffer,
          contentType: "image/png",
          source: "storage",
          reason: "storage-hit",
          storageUrl,
        };
      }
    }
  }

  // L3: Live capture
  try {
    const buffer = await withTimeout(
      captureScreenshot(url, device),
      CAPTURE_BUDGET_MS,
      "Screenshot capture budget exceeded.",
    );
    await writeScreenshotToCache(cacheKey, buffer);

    // Persist to Supabase Storage in the background so future cold starts skip capture.
    if (storageUrl) {
      uploadScreenshot(cacheKey, buffer).catch(() => {});
    }

    return {
      buffer,
      contentType: "image/png",
      source: "screenshot",
      reason: "captured-live",
      storageUrl,
    };
  } catch {
    if (fallbackImageUrl) {
      try {
        const remoteImage = await withTimeout(
          fetchRemoteImage(fallbackImageUrl),
          REMOTE_IMAGE_TIMEOUT_MS,
          "Remote image fallback timed out.",
        );

        return {
          ...remoteImage,
          reason: "fallback-og-image",
        };
      } catch {
        return {
          ...createPlaceholderImage(url, device),
          reason: "fallback-placeholder-after-og-failed",
        };
      }
    }

    return {
      ...createPlaceholderImage(url, device),
      reason: "fallback-placeholder-no-og-image",
    };
  }
}

export async function getSitePreviewImage(
  url: string,
  device: PreviewDevice,
  fallbackImageUrl?: string,
) {
  const cacheKey = `${url}::${device}::${fallbackImageUrl ?? ""}`;
  const existing = previewCache.get(cacheKey);

  if (existing) {
    return existing;
  }

  const pending = buildPreviewImage(url, device, fallbackImageUrl).finally(() => {
    previewCache.delete(cacheKey);
  });
  previewCache.set(cacheKey, pending);

  return pending;
}
