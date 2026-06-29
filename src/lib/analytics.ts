"use client";

import { track } from "@vercel/analytics";

/**
 * Centralized funnel analytics for the $1 scan flow.
 *
 * Every event the conversion funnel depends on goes through here so the names
 * stay consistent and we can see exactly where users drop off:
 *
 *   scan_form_viewed
 *     → tier_selected / max_mode_toggled
 *     → otp_sent → otp_verified            (free path)
 *     → checkout_opened → checkout_quantity_selected  (paid path)
 *     → scan_started
 *     → scan_completed / scan_failed
 *     → cta_strategy_call_clicked / share_link_copied
 *
 * Uses Vercel Analytics custom events (already wired via <Analytics/> in the
 * root layout). Values are kept to primitives — Vercel only accepts
 * string | number | boolean | null in event properties.
 */

export type ScanTier = "quick" | "standard" | "deep";
export type ScanMode = "standard" | "max";

type Props = Record<string, string | number | boolean | null>;

function emit(event: string, props?: Props) {
  try {
    track(event, props);
  } catch {
    // Analytics must never break the user flow.
  }
}

export const analytics = {
  scanFormViewed: (props: { tier: ScanTier; mode: ScanMode }) =>
    emit("scan_form_viewed", props),

  tierSelected: (props: { tier: ScanTier; mode: ScanMode }) =>
    emit("tier_selected", props),

  maxModeToggled: (props: { enabled: boolean }) =>
    emit("max_mode_toggled", props),

  otpSent: () => emit("otp_sent"),

  otpVerified: () => emit("otp_verified"),

  checkoutOpened: (props: { tier: ScanTier; mode: ScanMode }) =>
    emit("checkout_opened", props),

  checkoutQuantitySelected: (props: {
    tier: ScanTier;
    mode: ScanMode;
    quantity: number;
    cents: number;
  }) => emit("checkout_quantity_selected", props),

  scanStarted: (props: {
    tier: ScanTier;
    mode: ScanMode;
    source: "first-free" | "wallet" | "paid";
  }) => emit("scan_started", props),

  scanCompleted: (props: { grade: string; score: number; cached: boolean }) =>
    emit("scan_completed", props),

  scanFailed: (props: { reason: string }) => emit("scan_failed", props),

  ctaStrategyCallClicked: (props: { placement: string; domain: string }) =>
    emit("cta_strategy_call_clicked", props),

  shareLinkCopied: () => emit("share_link_copied"),
};
