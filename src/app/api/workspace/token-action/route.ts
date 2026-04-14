import { NextResponse } from "next/server";

import type { TokenActionId } from "@/lib/billing/catalog";
import { MAX_ENTITLEMENT_ERROR } from "@/lib/billing/max-access";
import { getOptionalWorkspaceSessionFromRequest } from "@/lib/auth/session";
import { getProductRepository } from "@/lib/product/repository";

export async function POST(request: Request) {
  const session = await getOptionalWorkspaceSessionFromRequest(request);

  if (!session) {
    return NextResponse.json(
      {
        error: "Sign in first so the token action can be attached to a workspace.",
        redirectTo: "/app/login?next=/pricing",
      },
      { status: 401 },
    );
  }

  const body = (await request.json()) as {
    actionId?: TokenActionId;
    actionKey?: string;
    label?: string;
  };

  if (!body.actionId || !body.actionKey || !body.label) {
    return NextResponse.json(
      { error: "Missing token action details." },
      { status: 400 },
    );
  }

  const repository = getProductRepository(session);
  const workspace = await repository.ensureWorkspace(session, request);

  try {
    const updatedWorkspace = await repository.consumeTokenAction(workspace.id, session, {
      actionId: body.actionId,
      actionKey: body.actionKey,
      label: body.label,
    });

    return NextResponse.json({
      balance: updatedWorkspace.tokenBalance,
      ok: true,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_TOKENS") {
      return NextResponse.json(
        {
          error: "This workspace is out of tokens. Add more on pricing before continuing.",
          redirectTo: "/pricing",
        },
        { status: 402 },
      );
    }

    if (error instanceof Error && error.message === MAX_ENTITLEMENT_ERROR) {
      return NextResponse.json(
        {
          error: "MAX upgrade required to use this action.",
          redirectTo: "/pricing",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The token action could not be completed.",
      },
      { status: 400 },
    );
  }
}
