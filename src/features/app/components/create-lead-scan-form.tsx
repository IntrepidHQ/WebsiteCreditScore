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
 * Native POST to `/api/app/create-lead`. A client `fetch` with `redirect: "manual"` often yields
 * an opaque redirect (status 0, no `Location`) for POST in browsers — full document navigation
 * applies `Set-Cookie` correctly for Supabase.
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
      className="space-y-3"
      method="post"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <CreateLeadScanFormFields
          autoFocus={autoFocus}
          idleSubmitLabel={idleSubmitLabel}
          pendingSubmitLabel={pendingSubmitLabel}
          placeholder={placeholder}
        />
      </div>
    </form>
  );
};
