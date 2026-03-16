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

    let cancelled = false;
    let printed = false;
    const images = Array.from(document.images);
    let fallbackTimeout = 0;

    const openPrintDialog = () => {
      if (cancelled || printed) {
        return;
      }

      printed = true;
      window.clearTimeout(fallbackTimeout);
      window.setTimeout(() => {
        if (!cancelled) {
          window.print();
        }
      }, 120);
    };

    const pendingImages = images.filter((image) => !image.complete);

    if (!pendingImages.length) {
      openPrintDialog();
      return;
    }

    let settledCount = 0;
    const cleanupFns = pendingImages.map((image) => {
      const handleSettled = () => {
        settledCount += 1;

        if (settledCount >= pendingImages.length) {
          openPrintDialog();
        }
      };

      image.addEventListener("load", handleSettled, { once: true });
      image.addEventListener("error", handleSettled, { once: true });

      return () => {
        image.removeEventListener("load", handleSettled);
        image.removeEventListener("error", handleSettled);
      };
    });

    fallbackTimeout = window.setTimeout(() => {
      openPrintDialog();
    }, 3200);

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimeout);
      cleanupFns.forEach((cleanup) => cleanup());
    };
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
