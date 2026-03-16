import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import { chromium } from "playwright-core";

import type { PreviewDevice } from "@/lib/types/audit";

const CACHE_DIR = path.join("/tmp", "craydl-site-previews");
const CACHE_TTL_MS = 1000 * 60 * 60 * 12;
const SCREENSHOT_WAIT_MS = 1200;

const previewCache = new Map<string, Promise<PreviewImageResult>>();

type PreviewImageResult = {
  buffer: Buffer;
  contentType: string;
  source: "screenshot" | "remote-image";
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

function createCacheKey(url: string, device: PreviewDevice) {
  return createHash("sha256").update(`${url}:${device}`).digest("hex").slice(0, 24);
}

async function ensureCacheDirectory() {
  await fs.mkdir(CACHE_DIR, { recursive: true });
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
  };
}

async function writeScreenshotToCache(cacheKey: string, buffer: Buffer) {
  await ensureCacheDirectory();
  await fs.writeFile(path.join(CACHE_DIR, `${cacheKey}.png`), buffer);
}

async function resolveBrowserExecutablePath() {
  for (const candidate of browserCandidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      continue;
    }
  }

  throw new Error("No local browser executable found for site previews.");
}

async function captureScreenshot(url: string, device: PreviewDevice) {
  const executablePath = await resolveBrowserExecutablePath();
  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: [
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

    await page.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => undefined,
      });
    });

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 25000,
    });
    await page.waitForLoadState("networkidle", { timeout: 4000 }).catch(() => undefined);
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
    await page.waitForTimeout(SCREENSHOT_WAIT_MS);

    const buffer = await page.screenshot({
      type: "png",
      fullPage: false,
      animations: "disabled",
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
  };
}

async function buildPreviewImage(
  url: string,
  device: PreviewDevice,
  fallbackImageUrl?: string,
) {
  const cacheKey = createCacheKey(url, device);
  const cached = await readFreshScreenshotFromCache(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const buffer = await captureScreenshot(url, device);
    await writeScreenshotToCache(cacheKey, buffer);

    return {
      buffer,
      contentType: "image/png",
      source: "screenshot" as const,
    };
  } catch (error) {
    if (fallbackImageUrl) {
      return fetchRemoteImage(fallbackImageUrl);
    }

    throw error;
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
