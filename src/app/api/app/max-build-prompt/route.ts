import { NextResponse } from "next/server";

import { getTokenActionCost } from "@/lib/billing/catalog";
import { isMaxEntitlementError, workspaceHasMaxAccess } from "@/lib/billing/max-access";
import { getOptionalWorkspaceSession } from "@/lib/auth/session";
import { listDataroomForWorkspace } from "@/lib/dataroom/storage";
import { generateMaxHandoffWithClaude } from "@/lib/max/ai-generate-handoff";
import { buildMaxPromptExpanded } from "@/lib/max/prompt-expanded";
import { isUnlimitedWorkspace } from "@/lib/product/unlimited-workspace";
import { getProductRepository } from "@/lib/product/repository";

export async function POST(request: Request) {
  const session = await getOptionalWorkspaceSession();
  if (!session) {
    return NextResponse.json(
      { error: "Sign in required.", code: "AUTH_REQUIRED" },
      { status: 401 },
    );
  }

  let body: { reportId?: string };
  try {
    body = (await request.json()) as { reportId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const reportId = String(body.reportId ?? "").trim();
  if (!reportId) {
    return NextResponse.json({ error: "reportId is required." }, { status: 400 });
  }

  const repository = getProductRepository(session);
  const workspace = await repository.ensureWorkspace(session);

  if (!workspaceHasMaxAccess(workspace)) {
    return NextResponse.json(
      { error: "MAX upgrade required to generate handoff prompts.", code: "MAX_GATED" },
      { status: 403 },
    );
  }

  const cost = getTokenActionCost("max-prompt");
  const balance = workspace.tokenBalance ?? workspace.creditBalance ?? 0;
  if (!isUnlimitedWorkspace() && balance < cost) {
    return NextResponse.json(
      {
        error: "Not enough tokens for MAX prompt.",
        code: "INSUFFICIENT_TOKENS",
        redirectTo: "/pricing",
      },
      { status: 402 },
    );
  }

  const dashboard = await repository.getDashboard(workspace.id, session);
  const saved = dashboard.savedReports.find((r) => r.id === reportId);
  if (!saved?.reportSnapshot) {
    return NextResponse.json({ error: "Saved audit not found in this workspace." }, { status: 404 });
  }

  const dataroomRows = await listDataroomForWorkspace(workspace.id);
  const assetUrls = dataroomRows.map((r) => r.publicUrl);

  const aiPrompt = await generateMaxHandoffWithClaude(saved.reportSnapshot, assetUrls);
  const prompt = aiPrompt ?? buildMaxPromptExpanded(saved.reportSnapshot, { assetUrls });
  const source: "claude" | "template" = aiPrompt ? "claude" : "template";

  try {
    const updated = await repository.consumeTokenAction(workspace.id, session, {
      actionId: "max-prompt",
      actionKey: `report:${reportId}:max`,
      label: "MAX prompt",
    });

    return NextResponse.json({
      prompt,
      source,
      balance: updated.tokenBalance ?? updated.creditBalance ?? balance,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "INSUFFICIENT_TOKENS") {
      return NextResponse.json(
        {
          error: "Not enough tokens for MAX prompt.",
          code: "INSUFFICIENT_TOKENS",
          redirectTo: "/pricing",
        },
        { status: 402 },
      );
    }
    if (isMaxEntitlementError(err)) {
      return NextResponse.json(
        { error: "MAX upgrade required to generate handoff prompts.", code: "MAX_GATED" },
        { status: 403 },
      );
    }
    throw err;
  }
}
