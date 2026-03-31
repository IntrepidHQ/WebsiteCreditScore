import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function hasStripeServerEnv() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripeServerMode() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    return null;
  }

  if (key.startsWith("sk_test_")) {
    return "test" as const;
  }

  if (key.startsWith("sk_live_")) {
    return "live" as const;
  }

  return "unknown" as const;
}

export function assertStripeServerModeSafe() {
  const mode = getStripeServerMode();

  if (!mode) {
    throw new Error("Missing STRIPE_SECRET_KEY.");
  }

  if (process.env.NODE_ENV !== "production" && mode === "live") {
    throw new Error("Live Stripe key is blocked outside production.");
  }

  return mode;
}

export function validateStripeWebhookSecretMode() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const mode = getStripeServerMode();

  if (!secret || !mode || mode === "unknown") {
    return;
  }

  const webhookMode = secret.startsWith("whsec_test_")
    ? "test"
    : secret.startsWith("whsec_live_")
      ? "live"
      : "unknown";

  if (webhookMode !== "unknown" && webhookMode !== mode) {
    throw new Error("Stripe webhook secret mode does not match Stripe secret key mode.");
  }
}

export function getStripeServerClient() {
  assertStripeServerModeSafe();

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: "2026-03-25.dahlia",
    });
  }

  return stripeClient;
}
