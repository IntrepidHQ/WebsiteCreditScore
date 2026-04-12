import { Check } from "lucide-react";

export const LoginMarketingColumn = ({
  features,
  headingClassName,
  bodyClassName,
}: {
  features: readonly string[];
  headingClassName?: string;
  bodyClassName?: string;
}) => {
  return (
    <div className="min-w-0">
      <h1
        className={
          headingClassName ??
          "font-display text-[2.1rem] leading-[1.08] text-foreground md:text-[2.35rem] md:leading-[1.06] lg:text-[2.65rem] xl:text-[2.85rem]"
        }
      >
        Your website&apos;s<br />
        <span className="gradient-type">credit score,</span>
        <br />
        starts here.
      </h1>

      <p
        className={
          bodyClassName ??
          "mt-3 max-w-xl text-sm leading-6 text-muted md:mt-4 md:text-[0.95rem] md:leading-7"
        }
      >
        Audit any site in seconds. See exactly what&apos;s holding back the score — and what to fix first.
      </p>

      <ul className="mt-4 space-y-1.5 md:mt-5 md:space-y-2">
        {features.map((f) => (
          <li className="flex items-center gap-2.5" key={f}>
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-border/45 bg-[color-mix(in_srgb,var(--theme-accent)_16%,var(--theme-panel))]">
              <Check className="size-2.5 text-foreground" strokeWidth={2.5} />
            </span>
            <span className="text-xs leading-snug text-muted md:text-[0.8125rem] md:leading-relaxed">{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
