/**
 * Temporary test window: scans run without checkout until this UTC timestamp.
 * 24h window requested on 2026-04-27.
 */
const TEMP_FREE_SCAN_UNTIL_ISO = "2026-04-28T05:48:00.000Z";

export function isTemporaryFreeScanWindow(): boolean {
  return Date.now() < Date.parse(TEMP_FREE_SCAN_UNTIL_ISO);
}

export function getTemporaryFreeScanWindowLabel(): string {
  return TEMP_FREE_SCAN_UNTIL_ISO;
}
