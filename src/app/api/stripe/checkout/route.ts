import { NextResponse } from "next/server";

import { buildCheckoutSessionParams } from "@/lib/billing/checkout";
import {
  assertStripeServerModeSafe,
  getStripeServerClient,
  hasStripeServerEnv,
} from "@/lib/billing/stripe";
import { getOptionalWorkspaceSession } from "@/lib/auth/session";
import { getProductRepository } from "@/lib/product/repository";
import type { BillingAddOnId, BillingPlanId } from "@/lib/billing/catalog";

export async function POST(request: Request) {
  if (!hasStripeServerEnv()) {
    return NextResponse.json(
      { error: "Stripe is not configured in this environment yet." },
      { status: 503 },
    );
  }
  try {
    assertStripeServerModeSafe();
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Stripe mode is not safe for this environment.",
      },
      { status: 400 },
    );
  }

  const session = await getOptionalWorkspaceSession();

  if (!session) {
    return NextResponse.json(
      { error: "Sign in first so the purchase can be applied to a workspace." },
      { status: 401 },
    );
  }

  const body = (await request.json()) as {
    addOnQuantities?: Partial<Record<BillingAddOnId, number>>;
    email?: string | null;
    planId?: BillingPlanId | null;
  };

  const repository = getProductRepository(session);
  const workspace = await repository.ensureWorkspace(session);
  const stripe = getStripeServerClient();
  const origin = new URL(request.url).origin;

  try {
    const checkoutSession = await stripe.checkout.sessions.create(
      buildCheckoutSessionParams({
        planId: body.planId,
        addOnQuantities: body.addOnQuantities,
        email: body.email ?? session.email,
        origin,
        workspace,
      }),
    );

    if (!checkoutSession.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Checkout could not be created.",
      },
      { status: 400 },
    );
  }
}
