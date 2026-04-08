#!/usr/bin/env node
/**
 * Batch-compress raster screenshots (PNG/JPEG) to WebP for lighter assets.
 * Matches runtime defaults in src/lib/utils/site-screenshot.ts (quality ~82, max edges).
 *
 * Usage:
 *   node scripts/compress-screenshots.cjs [directory]
 *   pnpm compress:screenshots
 *
 * Default directory: ./public
 */

const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");

const DEFAULT_DIR = path.join(process.cwd(), "public");
const MAX_WIDTH = 1440;
const MAX_HEIGHT = 2400;
const WEBP_QUALITY = 82;

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) {
        continue;
      }

      out.push(...(await walk(full)));
    } else if (/\.(png|jpe?g)$/i.test(entry.name)) {
      out.push(full);
    }
  }

  return out;
}

async function compressFile(filePath) {
  const pipeline = sharp(filePath).resize({
    width: MAX_WIDTH,
    height: MAX_HEIGHT,
    fit: "inside",
    withoutEnlargement: true,
  });

  const webpBuffer = await pipeline.webp({ quality: WEBP_QUALITY, effort: 4 }).toBuffer();
  const original = await fs.stat(filePath);
  const outPath = filePath.replace(/\.(png|jpe?g)$/i, ".webp");

  if (webpBuffer.length >= original.size) {
    console.log(`[skip] ${path.relative(process.cwd(), filePath)} — WebP not smaller`);
    return { skipped: true, written: false };
  }

  await fs.writeFile(outPath, webpBuffer);
  console.log(
    `[ok] ${path.relative(process.cwd(), outPath)} (${original.size} → ${webpBuffer.length} bytes)`,
  );

  return { skipped: false, written: true };
}

async function main() {
  const target = path.resolve(process.argv[2] ?? DEFAULT_DIR);
  const stat = await fs.stat(target).catch(() => null);

  if (!stat) {
    console.error(`Not found: ${target}`);
    process.exit(1);
  }

  const files = stat.isDirectory() ? await walk(target) : [target];
  let written = 0;
  let skipped = 0;

  for (const file of files) {
    const result = await compressFile(file).catch((err) => {
      console.error(`[err] ${file}:`, err.message);
      return { skipped: true, written: false };
    });

    if (result.written) written += 1;
    if (result.skipped) skipped += 1;
  }

  console.log(`Done. ${written} written, ${skipped} skipped or unchanged.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
