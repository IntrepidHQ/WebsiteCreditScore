import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import type { Scan } from "@/lib/db/scans";

export type ScanAccessKind = "owner" | "share";
export type ScanAccessRecord = {
  id: string;
  scan_id: string;
  kind: ScanAccessKind;
  expires_at: string | null;
  revoked_at: string | null;
};

export function scanAccessCookieName(scanId: string): string {
  return `wcs_scan_access_${scanId}`;
}

export function createRawAccessToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashAccessToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function usable(row: ScanAccessRecord | null, kind?: ScanAccessKind): boolean {
  if (!row || (kind && row.kind !== kind) || row.revoked_at) return false;
  return !row.expires_at || new Date(row.expires_at).getTime() > Date.now();
}

export async function createScanAccessToken(
  scanId: string,
  kind: ScanAccessKind,
  opts: { label?: string; expiresAt?: string | null } = {},
): Promise<{ token: string; id: string }> {
  const token = createRawAccessToken();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scan_access_tokens")
    .insert({
      scan_id: scanId,
      token_hash: hashAccessToken(token),
      kind,
      label: opts.label ?? null,
      expires_at: opts.expiresAt ?? null,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(`Failed to create scan access token: ${error?.message ?? "unknown error"}`);
  return { token, id: data.id as string };
}

export async function createScanOwnerToken(scanId: string): Promise<string> {
  return (await createScanAccessToken(scanId, "owner", { label: "scan owner" })).token;
}

export async function verifyScanAccess(
  scanId: string,
  token: string | null | undefined,
  kind?: ScanAccessKind,
): Promise<ScanAccessRecord | null> {
  if (!token) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scan_access_tokens")
    .select("id, scan_id, kind, expires_at, revoked_at")
    .eq("scan_id", scanId)
    .eq("token_hash", hashAccessToken(token))
    .maybeSingle();
  if (error || !data) return null;
  const row = data as ScanAccessRecord;
  return usable(row, kind) ? row : null;
}

export async function revokeScanShareToken(scanId: string, tokenId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("scan_access_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", tokenId)
    .eq("scan_id", scanId)
    .eq("kind", "share");
  if (error) throw new Error(`Failed to revoke scan share token: ${error.message}`);
}

export function scanRequiresAccess(scan: Pick<Scan, "access_required" | "is_public_example">): boolean {
  return Boolean(scan.access_required);
}
