import type { Tool } from "@anthropic-ai/sdk/resources/messages";

import type { LeadStage } from "@/lib/types/product";
import type { ProductRepository } from "@/lib/product/repository";
import type { WorkspaceSession } from "@/lib/types/product";

const PIPELINE_STAGES: LeadStage[] = [
  "new",
  "audit-ready",
  "packet-sent",
  "follow-up-due",
  "discovery-booked",
  "brief-approved",
  "won",
  "lost",
];

const isLeadStage = (value: unknown): value is LeadStage =>
  typeof value === "string" && (PIPELINE_STAGES as string[]).includes(value);

export const buildWorkspaceAgentTools = (): Tool[] => [
  {
    name: "list_workspace_opportunities",
    description:
      "List businesses in this workspace pipeline with id, title, URL, stage, and score. Use for follow-ups and planning outreach.",
    input_schema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Max rows (default 20, max 40)." },
      },
    },
  },
  {
    name: "update_opportunity_stage",
    description: "Move a workspace pipeline row to a new stage (e.g. packet-sent, follow-up-due).",
    input_schema: {
      type: "object",
      properties: {
        leadId: { type: "string" },
        stage: {
          type: "string",
          enum: PIPELINE_STAGES,
        },
      },
      required: ["leadId", "stage"],
    },
  },
];

type ToolHandlerContext = {
  repository: ProductRepository;
  workspaceId: string;
  session: WorkspaceSession;
};

export const handleWorkspaceAgentTool = async (
  name: string,
  input: unknown,
  ctx: ToolHandlerContext,
): Promise<string> => {
  if (name === "list_workspace_opportunities") {
    const limitRaw =
      typeof input === "object" && input && "limit" in input ? (input as { limit?: unknown }).limit : undefined;
    const limit = Math.min(40, Math.max(1, typeof limitRaw === "number" ? limitRaw : 20));
    const dashboard = await ctx.repository.getDashboard(ctx.workspaceId, ctx.session);
    const rows = dashboard.leads.slice(0, limit).map((l) => ({
      id: l.id,
      title: l.title,
      url: l.normalizedUrl,
      stage: l.stage,
      score: l.currentScore,
    }));
    return JSON.stringify({ opportunities: rows });
  }

  if (name === "update_opportunity_stage") {
    if (typeof input !== "object" || !input) {
      return JSON.stringify({ ok: false, error: "Invalid tool input." });
    }
    const { leadId, stage } = input as { leadId?: unknown; stage?: unknown };
    if (typeof leadId !== "string" || !leadId.trim()) {
      return JSON.stringify({ ok: false, error: "leadId is required." });
    }
    if (!isLeadStage(stage)) {
      return JSON.stringify({ ok: false, error: "Invalid stage." });
    }
    const updated = await ctx.repository.updateLeadStage(
      ctx.workspaceId,
      leadId.trim(),
      stage,
      ctx.session,
    );
    if (!updated) {
      return JSON.stringify({ ok: false, error: "Opportunity not found or could not be updated." });
    }
    return JSON.stringify({
      ok: true,
      opportunity: {
        id: updated.id,
        title: updated.title,
        stage: updated.stage,
      },
    });
  }

  return JSON.stringify({ ok: false, error: `Unknown tool: ${name}` });
};
