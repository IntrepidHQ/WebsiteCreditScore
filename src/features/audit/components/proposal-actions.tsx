"use client";

import { useState } from "react";
import {
  Copy,
  Download,
  FileText,
  MailPlus,
  Share2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuditReport } from "@/lib/types/audit";
import { useThemeStore } from "@/store/theme-store";
import { useUiStore } from "@/store/ui-store";

export function ProposalActions({ report }: { report: AuditReport }) {
  const [message, setMessage] = useState("");
  const setContactModalOpen = useUiStore((state) => state.setContactModalOpen);
  const accentColor = useThemeStore((state) => state.tokens.accentColor);
  const packetHref = `/packet/${report.id}?url=${encodeURIComponent(report.normalizedUrl)}`;
  const pdfHref = `${packetHref}&print=1&accent=${encodeURIComponent(accentColor)}`;
  const briefHref = `/brief/${report.id}?url=${encodeURIComponent(report.normalizedUrl)}`;

  async function copyLink() {
    if (typeof window === "undefined") {
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    setMessage(`Audit workspace link for ${report.title} copied.`);
  }

  async function copyEmail() {
    if (typeof window === "undefined") {
      return;
    }

    const emailDraft = `Subject: ${report.outreachEmail.subject}\n\n${report.outreachEmail.body}\n\nClient packet: ${window.location.origin}${packetHref}`;
    await navigator.clipboard.writeText(emailDraft);
    setMessage("Intro email and packet link copied.");
  }

  return (
    <section className="presentation-section pb-24" id="next-steps">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Outreach and next steps"
          title="Package the opportunity before the first call"
          description="Use the full audit internally. Send the packet, tighten the email, then move into the brief."
        />
        <Card className="overflow-hidden">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
                <CardTitle className="text-4xl">Ready to send the first touch?</CardTitle>
                <p className="max-w-2xl text-sm leading-6 text-muted">
                  Keep the working audit detailed and the client-facing touchpoint tight.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[calc(var(--theme-radius))] border border-border/70 bg-background-alt/70 p-5">
              <div className="mb-4 flex items-center gap-2 text-accent">
                <Sparkles className="size-4" />
                Outreach toolkit
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button onClick={copyEmail}>
                  <MailPlus className="size-4" />
                  Copy intro email
                </Button>
                <Button asChild variant="secondary">
                  <Link href={packetHref} target="_blank">
                    <Download className="size-4" />
                    Open client packet
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href={briefHref}>
                    <FileText className="size-4" />
                    Open creative brief
                  </Link>
                </Button>
                <Button onClick={() => setContactModalOpen(true)}>Book Strategy Call</Button>
                <Button onClick={copyLink} variant="secondary">
                  <Share2 className="size-4" />
                  Copy workspace link
                </Button>
                <Button asChild variant="secondary">
                  <Link href={pdfHref} target="_blank">
                    <Copy className="size-4" />
                    Save as PDF
                  </Link>
                </Button>
              </div>
              <div className="mt-5 rounded-[calc(var(--theme-radius))] border border-border/70 bg-panel/55 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Email preview</p>
                <p className="mt-3 text-sm font-semibold text-foreground">
                  {report.outreachEmail.subject}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {report.outreachEmail.previewLine}
                </p>
              </div>
            </div>
            <div className="rounded-[calc(var(--theme-radius))] border border-border/70 bg-panel/55 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Deal flow</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-border/70 bg-background-alt/75 px-4 py-3 text-sm text-foreground">
                  1. Send the email and short client packet.
                </div>
                <div className="rounded-2xl border border-border/70 bg-background-alt/75 px-4 py-3 text-sm text-foreground">
                  2. Use the questionnaire to learn goals, scope, and constraints.
                </div>
                <div className="rounded-2xl border border-border/70 bg-background-alt/75 px-4 py-3 text-sm text-foreground">
                  3. Approve the creative brief before the UI/UX wireframe handoff.
                </div>
                <div className="rounded-2xl border border-accent/20 bg-accent/8 px-4 py-3 text-sm text-foreground">
                  4. Move into wireframes once the brief is approved.
                </div>
              </div>
              {message ? (
                <p className="mt-4 rounded-2xl border border-accent/20 bg-accent/8 px-4 py-3 text-sm text-foreground">
                  {message}
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
