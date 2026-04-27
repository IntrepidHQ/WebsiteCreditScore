import "server-only";
import { createClient } from "@/lib/supabase/server";

export type Tier = "quick" | "standard" | "deep";
export type TierMode = "standard" | "max";

export interface Wallet {
  id: string;
  email: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface WalletCreditRow {
  tier: Tier;
  mode: TierMode;
  balance: number;
}

export type WalletBalances = {
  [K in `${Tier}_${TierMode}`]: number;
};

export const EMPTY_BALANCES: WalletBalances = {
  quick_standard: 0,
  standard_standard: 0,
  deep_standard: 0,
  quick_max: 0,
  standard_max: 0,
  deep_max: 0,
};

export function balanceKey(tier: Tier, mode: TierMode): keyof WalletBalances {
  return `${tier}_${mode}` as keyof WalletBalances;
}

export function totalCredits(balances: WalletBalances): number {
  return Object.values(balances).reduce((a, b) => a + b, 0);
}

/** Fetch wallet by id. Returns null if not found. */
export async function getWallet(id: string): Promise<Wallet | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("wallets").select("*").eq("id", id).single();
  return (data as Wallet) ?? null;
}

/** Create a fresh empty wallet. */
export async function createWallet(opts: {
  email?: string | null;
  stripeCustomerId?: string | null;
} = {}): Promise<Wallet> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wallets")
    .insert({
      email: opts.email ?? null,
      stripe_customer_id: opts.stripeCustomerId ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(`Failed to create wallet: ${error.message}`);
  return data as Wallet;
}

/** Get-or-create. If id is provided and exists, return it; otherwise create new. */
export async function getOrCreateWallet(id?: string | null): Promise<Wallet> {
  if (id) {
    const existing = await getWallet(id);
    if (existing) return existing;
  }
  return createWallet();
}

/** Read all six (tier, mode) balances for a wallet, defaulting missing rows to 0. */
export async function getWalletBalances(walletId: string): Promise<WalletBalances> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("wallet_credits")
    .select("tier, mode, balance")
    .eq("wallet_id", walletId);

  const balances: WalletBalances = { ...EMPTY_BALANCES };
  for (const row of (data ?? []) as WalletCreditRow[]) {
    balances[balanceKey(row.tier, row.mode)] = row.balance;
  }
  return balances;
}

/**
 * Idempotently credit a wallet for a purchase. Safe to call from a webhook retry —
 * the partial unique index on (stripe_session_id, tier, mode) prevents double credit.
 * Returns true if credit was applied, false if already credited.
 */
export async function creditWallet(opts: {
  walletId: string;
  tier: Tier;
  mode: TierMode;
  quantity: number;
  stripeSessionId: string;
}): Promise<boolean> {
  if (opts.quantity <= 0) return false;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("credit_wallet", {
    p_wallet_id: opts.walletId,
    p_tier: opts.tier,
    p_mode: opts.mode,
    p_quantity: opts.quantity,
    p_stripe_session_id: opts.stripeSessionId,
  });
  if (error) throw new Error(`Failed to credit wallet: ${error.message}`);
  return data === true;
}

/**
 * Atomically decrement one credit if the wallet has any for (tier, mode).
 * Returns true if a credit was consumed.
 */
export async function consumeWalletCredit(opts: {
  walletId: string;
  tier: Tier;
  mode: TierMode;
  scanId: string;
}): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("consume_wallet_credit", {
    p_wallet_id: opts.walletId,
    p_tier: opts.tier,
    p_mode: opts.mode,
    p_scan_id: opts.scanId,
  });
  if (error) throw new Error(`Failed to consume wallet credit: ${error.message}`);
  return data === true;
}

/** Update email + customer id on a wallet (called from webhook with Stripe details). */
export async function updateWalletContact(opts: {
  walletId: string;
  email?: string | null;
  stripeCustomerId?: string | null;
}): Promise<void> {
  const supabase = await createClient();
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (opts.email) update.email = opts.email.toLowerCase();
  if (opts.stripeCustomerId) update.stripe_customer_id = opts.stripeCustomerId;
  const { error } = await supabase.from("wallets").update(update).eq("id", opts.walletId);
  if (error) throw new Error(`Failed to update wallet contact: ${error.message}`);
}

/** Look up a wallet by Stripe session id (used by /restore from a receipt link). */
export async function findWalletByStripeSession(sessionId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("wallet_transactions")
    .select("wallet_id")
    .eq("stripe_session_id", sessionId)
    .limit(1)
    .single();
  return (data?.wallet_id as string) ?? null;
}

/** Look up a wallet by exact email match (case-insensitive). */
export async function findWalletByEmail(email: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("wallets")
    .select("id")
    .ilike("email", email.trim())
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();
  return (data?.id as string) ?? null;
}
