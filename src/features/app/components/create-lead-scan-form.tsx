"use client";

import { useFormStatus } from "react-dom";

import { ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

const CreateLeadScanFormFields = ({
  autoFocus,
  idleSubmitLabel,
  pendingSubmitLabel,
  placeholder,
}: {
  autoFocus?: boolean;
  idleSubmitLabel: string;
  pendingSubmitLabel: string;
  placeholder: string;
}) => {
  const { pending } = useFormStatus();

  return (
    <>
      <div
        className={cn(
          "flex min-w-0 flex-1 items-stretch rounded-[8px] border border-border bg-panel/70 shadow-[var(--theme-shadow)] transition",
          "focus-within:border-accent/60 focus-within:bg-elevated focus-within:ring-2 focus-within:ring-accent/35",
          pending && "pointer-events-none opacity-60",
        )}
      >
        <span
          aria-hidden="true"
          className="flex items-center border-r border-border/60 bg-background/35 px-3 text-sm tabular-nums text-muted select-none"
        >
          https://
        </span>
        <Input
          aria-label="Website domain or URL. https:// is added if you only type the domain."
          autoComplete="url"
          autoFocus={autoFocus}
          className="min-w-0 flex-1 rounded-none rounded-r-[8px] border-0 bg-transparent px-3 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={pending}
          inputMode="url"
          name="url"
          placeholder={placeholder}
          required
          type="text"
        />
      </div>
      <Button
        aria-busy={pending}
        className="min-w-[10.5rem] sm:min-w-[12rem]"
        disabled={pending}
        type="submit"
      >
        {pending ? (
          <>
            <Loader2 aria-hidden className="size-4 animate-spin" />
            {pendingSubmitLabel}
          </>
        ) : (
          <>
            {idleSubmitLabel}
            <ArrowRight aria-hidden className="size-4" />
          </>
        )}
      </Button>
    </>
  );
};

/**
 * HTML form POST to `/api/app/create-lead` with a pending state on the button and URL field
 * (native navigation; `useFormStatus` tracks submit without a client-side fetch).
 */
export const CreateLeadScanForm = ({
  autoFocus,
  idleSubmitLabel,
  pendingSubmitLabel,
  placeholder,
}: {
  autoFocus?: boolean;
  idleSubmitLabel: string;
  pendingSubmitLabel: string;
  placeholder: string;
}) => {
  return (
    <form
      action="/api/app/create-lead"
      className="flex flex-col gap-3 sm:flex-row"
      method="post"
    >
      <CreateLeadScanFormFields
        autoFocus={autoFocus}
        idleSubmitLabel={idleSubmitLabel}
        pendingSubmitLabel={pendingSubmitLabel}
        placeholder={placeholder}
      />
    </form>
  );
};
