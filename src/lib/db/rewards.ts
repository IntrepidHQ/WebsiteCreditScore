import "server-only";
import { randomBytes } from "node:crypto";
import { createClient } from "@/lib/supabase/server";

export const PUBLIC_SCAN_POINTS = 10;
export const GIFT_COMPLETION_POINTS = 25;
export const PRIVATE_SCAN_POINT_COST = 100;

export async function rewardSystemAvailable(): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.from("wallets").select("points_balance").limit(1);
  return !error;
}

export async function getRewardBalance(walletId: string): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("wallets").select("points_balance").eq("id", walletId).maybeSingle();
  if (error) throw new Error(`Rewards are not available: ${error.message}`);
  return Number(data?.points_balance ?? 0);
}

export async function createScanGift(walletId: string): Promise<string> {
  const supabase = await createClient();
  const code = randomBytes(9).toString("base64url");
  const { error } = await supabase.from("scan_gifts").insert({ code, sender_wallet_id: walletId });
  if (error) throw new Error(`Failed to create scan gift: ${error.message}`);
  return code;
}

export async function claimScanGift(code: string, recipientWalletId: string, scanId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: gift } = await supabase
    .from("scan_gifts")
    .select("id, sender_wallet_id")
    .eq("code", code)
    .is("claimed_at", null)
    .maybeSingle();
  if (!gift || gift.sender_wallet_id === recipientWalletId) return false;

  const { data, error } = await supabase
    .from("scan_gifts")
    .update({
      claimed_by_wallet_id: recipientWalletId,
      completed_scan_id: scanId,
      claimed_at: new Date().toISOString(),
    })
    .eq("id", gift.id)
    .is("claimed_at", null)
    .select("sender_wallet_id")
    .maybeSingle();
  if (error || !data) return false;

  await supabase.from("scans").update({ referrer_wallet_id: data.sender_wallet_id }).eq("id", scanId);
  return true;
}

export async function awardCompletedPublicScan(scanId: string): Promise<void> {
  const supabase = await createClient();
  const { data: scan } = await supabase
    .from("scans")
    .select("wallet_id, referrer_wallet_id, access_required")
    .eq("id", scanId)
    .maybeSingle();
  if (!scan || scan.access_required || !scan.wallet_id) return;

  await supabase.rpc("award_scan_points", {
    p_wallet_id: scan.wallet_id,
    p_scan_id: scanId,
    p_type: "public_scan",
    p_points: PUBLIC_SCAN_POINTS,
  });
  if (scan.referrer_wallet_id) {
    await supabase.rpc("award_scan_points", {
      p_wallet_id: scan.referrer_wallet_id,
      p_scan_id: scanId,
      p_type: "gift_completed",
      p_points: GIFT_COMPLETION_POINTS,
    });
  }
}

export async function redeemPrivateScanCredit(walletId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("redeem_wallet_points", {
    p_wallet_id: walletId,
    p_cost: PRIVATE_SCAN_POINT_COST,
  });
  if (error) throw new Error(`Failed to redeem points: ${error.message}`);
  return data === true;
}
