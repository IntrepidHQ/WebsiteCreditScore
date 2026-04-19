/**
 * Stripe webhook event ledger.
 *
 * The route inserts a row before dispatch (dedupes by event_id via
 * `on conflict do nothing`) and updates processed_at / processed_ok /
 * error_message after. Pure no-op when Supabase service-role env is
 * missing — don't block webhook delivery over logging.
 */

import { getSupabaseServiceClient } from "@/lib/supabase/service";

export interface LogWebhookEventArgs {
  eventId: string;
  type: string;
  payload: unknown;
}

export interface LogWebhookEventResult {
  /**
   * True when the handler should run. False only when the event was already
   * processed successfully (true dedupe). Failed-and-retrying events return
   * true so Stripe's retry attempts can complete the handler.
   */
  shouldProcess: boolean;
  /** True when we saw this event_id for the first time. */
  isFirstReceipt: boolean;
}

export async function logStripeWebhookReceived(
  args: LogWebhookEventArgs,
): Promise<LogWebhookEventResult> {
  const client = getSupabaseServiceClient();
  if (!client) {
    return { shouldProcess: true, isFirstReceipt: true }; // no ledger → process
  }

  try {
    const { data, error } = await client
      .from("stripe_webhook_log")
      .insert({
        event_id: args.eventId,
        type: args.type,
        payload: args.payload as Record<string, unknown>,
      })
      .select("event_id")
      .maybeSingle();

    if (!error && data?.event_id) {
      return { shouldProcess: true, isFirstReceipt: true };
    }

    const msg = (error?.message ?? "").toLowerCase();
    const isConflict = error?.code === "23505" || msg.includes("duplicate key");
    if (!isConflict) {
      console.warn("[stripe-webhook-log] insert failed", error?.message);
      return { shouldProcess: true, isFirstReceipt: true }; // fail open
    }

    // Conflict: event_id seen before. Only skip if previous attempt succeeded.
    const { data: existing } = await client
      .from("stripe_webhook_log")
      .select("processed_ok")
      .eq("event_id", args.eventId)
      .maybeSingle();

    const alreadyProcessed = existing?.processed_ok === true;
    return {
      shouldProcess: !alreadyProcessed,
      isFirstReceipt: false,
    };
  } catch (err) {
    console.warn("[stripe-webhook-log] insert threw", err);
    return { shouldProcess: true, isFirstReceipt: true };
  }
}

export async function markStripeWebhookProcessed(
  eventId: string,
  outcome: { ok: boolean; errorMessage?: string | null },
): Promise<void> {
  const client = getSupabaseServiceClient();
  if (!client) {
    return;
  }

  try {
    const { error } = await client
      .from("stripe_webhook_log")
      .update({
        processed_at: new Date().toISOString(),
        processed_ok: outcome.ok,
        error_message: outcome.errorMessage ?? null,
      })
      .eq("event_id", eventId);
    if (error) {
      console.warn("[stripe-webhook-log] update failed", error.message);
    }
  } catch (err) {
    console.warn("[stripe-webhook-log] update threw", err);
  }
}
