"use client";

import { useId, useState } from "react";
import { Calendar, CheckCircle2, Mail, Phone } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useThemeStore } from "@/store/theme-store";
import { useUiStore } from "@/store/ui-store";

export function ContactModal() {
  const branding = useThemeStore((state) => state.branding);
  const isOpen = useUiStore((state) => state.contactModalOpen);
  const setOpen = useUiStore((state) => state.setContactModalOpen);
  const nameId = useId();
  const emailId = useId();
  const websiteId = useId();
  const urgencyId = useId();
  const helperId = useId();
  const successId = useId();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    website: "",
    urgency: "",
  });

  function updateField(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setSubmitted(false);
        }
        setOpen(open);
      }}
    >
        <DialogContent>
        <DialogHeader>
          <DialogTitle>Book a strategy call</DialogTitle>
          <DialogDescription>
            Share the essentials and keep the project moving while you line up the
            discovery call, creative brief, and next-step scope conversation.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div
            className="rounded-[calc(var(--theme-radius))] border border-success/25 bg-success/10 p-5 text-sm text-foreground"
            id={successId}
            role="status"
          >
            <div className="mb-3 flex items-center gap-2 text-success">
              <CheckCircle2 aria-hidden="true" className="size-5" />
              Discovery request saved
            </div>
            <p className="leading-6 text-muted">
              The request is ready for handoff. From here, the typical next step is
              to confirm timing, review the packet together, and finalize the brief.
            </p>
          </div>
        ) : (
          <form
            className="space-y-4"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
          >
            <p className="text-sm leading-6 text-muted" id={helperId}>
              Tell us who this is for and what feels most urgent so the first call stays focused.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor={nameId}>
                Client name
              </label>
              <Input
                autoComplete="name"
                id={nameId}
                onChange={(event) => updateField("name", event.target.value)}
                required
                value={form.name}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor={emailId}>
                Email address
              </label>
              <Input
                autoComplete="email"
                id={emailId}
                onChange={(event) => updateField("email", event.target.value)}
                required
                type="email"
                value={form.email}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor={websiteId}>
                Company website
              </label>
              <Input
                autoComplete="url"
                id={websiteId}
                onChange={(event) => updateField("website", event.target.value)}
                type="url"
                value={form.website}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor={urgencyId}>
                What feels most urgent right now?
              </label>
              <textarea
                className="min-h-32 w-full rounded-[8px] border border-border bg-panel/70 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus-visible:border-accent/60 focus-visible:ring-2 focus-visible:ring-accent/35"
                id={urgencyId}
                onChange={(event) => updateField("urgency", event.target.value)}
                value={form.urgency}
              />
            </div>
            <Button
              className="w-full"
              disabled={!form.name.trim() || !form.email.trim()}
              size="lg"
              type="submit"
            >
              Book Strategy Call
            </Button>
          </form>
        )}

        <div
          aria-describedby={submitted ? successId : helperId}
          className="grid gap-3 rounded-[calc(var(--theme-radius))] border border-border/70 bg-background-alt/75 p-4 text-sm text-muted sm:grid-cols-3"
        >
          <div className="flex items-center gap-2">
            <Calendar aria-hidden="true" className="size-4 text-accent" />
            45-minute strategy review
          </div>
          <div className="flex items-center gap-2">
            <Mail aria-hidden="true" className="size-4 text-accent" />
            {branding.contactEmail}
          </div>
          <div className="flex items-center gap-2">
            <Phone aria-hidden="true" className="size-4 text-accent" />
            {branding.contactPhone}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
