import "server-only";
import Stripe from "stripe";

export function createStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY ?? process.env.STRIPE_SECRET;

  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY or STRIPE_SECRET");
  }

  return new Stripe(secretKey, {
    apiVersion: "2025-02-24.acacia",
  });
}
