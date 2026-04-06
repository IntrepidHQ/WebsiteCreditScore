"use client";

import { useFormStatus } from "react-dom";

import { ArrowRight, Loader2 } from "lucide-react";

import { ScanUrlFieldGroup } from "@/components/common/scan-url-field-group";
import { Button } from "@/components/ui/button";

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
      <ScanUrlFieldGroup
        autoFocus={autoFocus}
        disabled={pending}
        name="url"
        placeholder={placeholder}
      />
      <Button
        aria-busy={pending}
        className="h-12 min-w-[10.5rem] sm:min-w-[12rem]"
        disabled={pending}
        size="lg"
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
