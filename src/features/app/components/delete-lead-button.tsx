"use client";

import { Trash2 } from "lucide-react";

import { deleteLeadAction } from "@/app/app/actions";
import { Button } from "@/components/ui/button";

export function DeleteLeadButton({
  leadId,
  returnTo,
  label,
}: {
  leadId: string;
  returnTo: string;
  label?: string;
}) {
  return (
    <form
      action={deleteLeadAction}
      onSubmit={(event) => {
        if (!window.confirm("Delete this saved scan and remove its lead record?")) {
          event.preventDefault();
        }
      }}
    >
      <input name="leadId" type="hidden" value={leadId} />
      <input name="returnTo" type="hidden" value={returnTo} />
      <Button
        aria-label={label ?? "Delete saved scan"}
        className="text-danger hover:border-danger/40 hover:text-danger"
        size="icon"
        type="submit"
        variant="outline"
      >
        <Trash2 className="size-4" />
      </Button>
    </form>
  );
}
