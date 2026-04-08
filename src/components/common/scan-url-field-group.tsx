"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

export type ScanUrlFieldGroupProps = {
  autoFocus?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  /** Uncontrolled field name (e.g. workspace form POST). */
  name?: string;
  /** Controlled value for client-driven submits. */
  value?: string;
  onValueChange?: (value: string) => void;
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
};

/**
 * Shared URL row: visible `https://` prefix + domain/path field.
 * Server-side `normalizeUrl()` prepends https when the value has no scheme.
 */
export function ScanUrlFieldGroup({
  autoFocus,
  disabled,
  placeholder = "example.com",
  name,
  value,
  onValueChange,
  id,
  className,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
}: ScanUrlFieldGroupProps) {
  const controlled = value !== undefined && onValueChange !== undefined;

  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 items-stretch rounded-[8px] border border-border bg-panel/70 shadow-[var(--theme-shadow)] transition",
        "focus-within:border-accent/60 focus-within:bg-elevated focus-within:ring-2 focus-within:ring-accent/35",
        disabled && "pointer-events-none opacity-60",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex items-center border-r border-border/60 bg-background/35 px-3 text-sm tabular-nums text-muted select-none"
      >
        https://
      </span>
      {controlled ? (
        <Input
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          autoComplete="url"
          autoFocus={autoFocus}
          className="min-w-0 flex-1 rounded-none rounded-r-[8px] border-0 bg-transparent px-3 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={disabled}
          enterKeyHint="go"
          id={id}
          inputMode="url"
          onChange={(event) => onValueChange(event.target.value)}
          placeholder={placeholder}
          required
          type="text"
          value={value}
        />
      ) : (
        <Input
          aria-label="Website domain or URL. https:// is added if you only type the domain."
          autoComplete="url"
          autoFocus={autoFocus}
          className="min-w-0 flex-1 rounded-none rounded-r-[8px] border-0 bg-transparent px-3 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={disabled}
          inputMode="url"
          name={name}
          placeholder={placeholder}
          required
          type="text"
        />
      )}
    </div>
  );
}
