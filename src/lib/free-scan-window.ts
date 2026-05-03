/**
 * Temporary test window: scans run without checkout until this UTC timestamp.
 * 24h window requested on 2026-05-02 to debug Anthropic key rotation.
 */
const TEMP_FREE_SCAN_UNTIL_ISO = "2026-05-03T00:00:00.000Z";

export function isTemporaryFreeScanWindow(): boolean {
  return Date.now() < Date.parse(TEMP_FREE_SCAN_UNTIL_ISO);
}

export function getTemporaryFreeScanWindowLabel(): string {
  return TEMP_FREE_SCAN_UNTIL_ISO;
}
