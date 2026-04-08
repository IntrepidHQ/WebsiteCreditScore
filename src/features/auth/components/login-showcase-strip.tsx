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

type ShowcaseTone = "dark" | "light";

/** Product preview strip for auth marketing surfaces. */
export const LoginShowcaseStrip = ({
  className,
  tone,
}: {
  className?: string;
  tone: ShowcaseTone;
}) => {
  const dark = tone === "dark";

  return (
    <div className={className}>
      <p
        className={cn(
          "text-[11px] font-semibold uppercase tracking-[0.2em]",
          dark ? "text-white/55" : "text-muted",
        )}
      >
        Inside the workspace
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {SHOWCASE.map((item) => (
          <div
            className={cn(
              "overflow-hidden rounded-2xl border shadow-sm",
              dark
                ? "border-white/10 bg-white/[0.06] shadow-none"
                : "border-border/50 bg-panel/40",
            )}
            key={item.src}
          >
            <div
              className={cn(
                "relative aspect-[4/3] w-full overflow-hidden",
                dark ? "bg-black/25" : "bg-background-alt/80",
              )}
            >
              <img
                alt=""
                className="h-full w-full object-cover object-top"
                height={300}
                src={item.src}
                width={400}
              />
            </div>
            <div className="space-y-0.5 px-3 py-2.5">
              <p
                className={cn("text-xs font-semibold", dark ? "text-white" : "text-foreground")}
              >
                {item.label}
              </p>
              <p className={cn("text-[11px] leading-snug", dark ? "text-white/60" : "text-muted")}>
                {item.caption}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
