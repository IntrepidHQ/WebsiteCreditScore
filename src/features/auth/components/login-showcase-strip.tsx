/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils/cn";

const SHOWCASE = [
  {
    src: "/previews/saas-current.svg",
    label: "Live preview",
    caption: "Desktop + mobile shots",
  },
  {
    src: "/previews/saas-future.svg",
    label: "Score breakdown",
    caption: "Category benchmarks",
  },
  {
    src: "/previews/healthcare-current.svg",
    label: "Audit report",
    caption: "Shareable with clients",
  },
] as const;

type Layout = "horizontal" | "stacked";

/**
 * Product preview cards for the login hero. Uses theme tokens so cards match the active theme.
 */
export const LoginShowcaseStrip = ({
  className,
  layout = "horizontal",
}: {
  className?: string;
  layout?: Layout;
}) => {
  const stacked = layout === "stacked";

  return (
    <div
      className={cn(
        "grid gap-2.5",
        stacked ? "grid-cols-1" : "grid-cols-3",
        className,
      )}
    >
      {SHOWCASE.map((item) => (
        <div
          className={cn(
            "overflow-hidden rounded-2xl border border-border/60 bg-panel/50 shadow-sm backdrop-blur-[2px]",
          )}
          key={item.src}
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-background-alt/60">
            <img
              alt=""
              className="h-full w-full object-cover object-top opacity-[0.92]"
              height={300}
              src={item.src}
              width={400}
            />
          </div>
          <div className="space-y-0.5 px-3 py-2.5">
            <p className="text-xs font-semibold text-foreground">{item.label}</p>
            <p className="text-[11px] leading-snug text-muted">{item.caption}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
