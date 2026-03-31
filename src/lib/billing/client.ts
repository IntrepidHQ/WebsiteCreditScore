"use client";

import type { TokenActionId } from "@/lib/billing/catalog";

export class WorkspaceTokenActionError extends Error {
  redirectTo?: string;

  constructor(message: string, redirectTo?: string) {
    super(message);
    this.name = "WorkspaceTokenActionError";
    this.redirectTo = redirectTo;
  }
}

export async function consumeWorkspaceTokenAction(input: {
  actionId: TokenActionId;
  actionKey: string;
  label: string;
}) {
  const response = await fetch("/api/workspace/token-action", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as {
    balance?: number;
    error?: string;
    redirectTo?: string;
  };

  if (!response.ok) {
    throw new WorkspaceTokenActionError(
      payload.error ?? "The token action could not be completed.",
      payload.redirectTo,
    );
  }

  return payload.balance ?? null;
}
