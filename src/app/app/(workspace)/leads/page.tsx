import { LeadsKanbanBoard } from "@/features/app/components/leads-kanban-board";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWorkspaceDashboardContext } from "@/lib/product/context";

export default async function LeadsPage() {
  const { dashboard } = await getWorkspaceDashboardContext();

  return (
    <Card>
      <CardHeader>
        <p className="text-xs uppercase tracking-[0.24em] text-muted">Lead pipeline</p>
        <CardTitle className="mt-2 text-[clamp(3.8rem,3.1rem+1vw,5rem)] leading-[0.92]">
          Manage leads
        </CardTitle>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Drag-free Kanban: move deals through contacted, agreement, and payment phases using the stage
          control on each card. Open a lead for the full audit and reminders.
        </p>
      </CardHeader>
      <CardContent>
        {dashboard.leads.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/60 bg-panel/30 px-4 py-10 text-center text-sm text-muted">
            No leads yet. Save an audit from a report or scan a URL from the dashboard to populate this
            board.
          </p>
        ) : (
          <LeadsKanbanBoard leads={dashboard.leads} />
        )}
      </CardContent>
    </Card>
  );
}
