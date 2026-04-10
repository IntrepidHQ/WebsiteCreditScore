import type { LeadStage } from "@/lib/types/product";

/** Ordered CRM-style pipeline columns (Linear / Notion / Hubspot–inspired). */
export type LeadKanbanColumn = {
  id: string;
  title: string;
  subtitle: string;
  stages: readonly LeadStage[];
};

export const LEAD_KANBAN_COLUMNS: readonly LeadKanbanColumn[] = [
  {
    id: "intake",
    title: "New",
    subtitle: "Audit saved — not contacted yet",
    stages: ["new", "audit-ready"],
  },
  {
    id: "contacted",
    title: "Contacted",
    subtitle: "Outreach, packet, follow-ups",
    stages: ["packet-sent", "follow-up-due"],
  },
  {
    id: "discovery",
    title: "Discovery",
    subtitle: "Call booked / qualification",
    stages: ["discovery-booked"],
  },
  {
    id: "agreement",
    title: "Agreement",
    subtitle: "Scope or contract signed",
    stages: ["brief-approved"],
  },
  {
    id: "won",
    title: "Paid & active",
    subtitle: "Deposit or full payment received",
    stages: ["won"],
  },
  {
    id: "lost",
    title: "Closed lost",
    subtitle: "Not moving forward",
    stages: ["lost"],
  },
] as const;

export const ALL_LEAD_STAGES: LeadStage[] = LEAD_KANBAN_COLUMNS.flatMap((c) => [...c.stages]);

export const isLeadStage = (value: string): value is LeadStage =>
  (ALL_LEAD_STAGES as readonly string[]).includes(value);

export const getKanbanColumnForStage = (stage: LeadStage): LeadKanbanColumn => {
  const found = LEAD_KANBAN_COLUMNS.find((col) => col.stages.includes(stage));
  return found ?? LEAD_KANBAN_COLUMNS[0]!;
};

/** Human label for a granular stage (used in selects). */
export const leadStageLabel = (stage: LeadStage): string => {
  const map: Record<LeadStage, string> = {
    new: "New (just captured)",
    "audit-ready": "Audit ready",
    "packet-sent": "Packet / materials sent",
    "follow-up-due": "Follow-up due",
    "discovery-booked": "Discovery call booked",
    "brief-approved": "Agreement / brief approved",
    won: "Paid — project active",
    lost: "Lost",
  };
  return map[stage];
};
