/**
 * Parse `#rrggbb` (or `rrggbb`) into linear-ish 0–1 RGB for GPU uniforms.
 */
export const hexToRgbUnit = (hex: string): [number, number, number] => {
  const normalized = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return [0.92, 0.72, 0.28];
  }
  const n = Number.parseInt(normalized, 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  return [r, g, b];
};
