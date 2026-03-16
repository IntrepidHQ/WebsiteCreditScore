"use client";

import { useEffect } from "react";
import { Download, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PacketToolbar({
  emailSubject,
  emailBody,
  autoPrint = false,
}: {
  emailSubject: string;
  emailBody: string;
  autoPrint?: boolean;
}) {
  useEffect(() => {
    if (!autoPrint) {
      return;
    }

    const timeout = window.setTimeout(() => {
      window.print();
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [autoPrint]);

  return (
    <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 pb-6 print:hidden">
      <Button asChild variant="secondary">
        <a href={`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}>
          <Mail className="size-4" />
          Open email draft
        </a>
      </Button>
      <Button onClick={() => window.print()}>
        <Download className="size-4" />
        Save as PDF
      </Button>
    </div>
  );
}
