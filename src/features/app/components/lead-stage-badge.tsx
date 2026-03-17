import { cn } from "@/lib/utils/cn";
import type { LeadStage } from "@/lib/types/product";

const stageLabelMap: Record<LeadStage, string> = {
  new: "New",
  "audit-ready": "Audit ready",
  "packet-sent": "Packet sent",
  "follow-up-due": "Follow-up due",
  "discovery-booked": "Discovery booked",
  "brief-approved": "Brief approved",
  won: "Won",
  lost: "Lost",
};

const stageClassMap: Record<LeadStage, string> = {
  new: "border-border bg-panel text-foreground",
  "audit-ready": "border-accent/30 bg-accent/10 text-accent",
  "packet-sent": "border-warning/30 bg-warning/10 text-warning",
  "follow-up-due": "border-warning/30 bg-warning/10 text-warning",
  "discovery-booked": "border-success/30 bg-success/10 text-success",
  "brief-approved": "border-success/30 bg-success/10 text-success",
  won: "border-success/30 bg-success/10 text-success",
  lost: "border-danger/30 bg-danger/10 text-danger",
};

export function LeadStageBadge({ stage }: { stage: LeadStage }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
        stageClassMap[stage],
      )}
    >
      {stageLabelMap[stage]}
    </span>
  );
}
