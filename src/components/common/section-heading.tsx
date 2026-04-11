import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  contentMaxWidthClassName = "max-w-4xl",
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
  /** Extra classes on the outer wrapper (e.g. full width on wide settings). */
  className?: string;
  /** Override default `max-w-4xl` on the text block for wide layouts. */
  contentMaxWidthClassName?: string;
}) {
  return (
    <div
      className={cn(
        contentMaxWidthClassName,
        "space-y-3",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <Badge variant="accent" className="w-fit">
        {eyebrow}
      </Badge>
      <div className="space-y-2">
        <h2 className="font-display text-[clamp(3.35rem,2.8rem+1.15vw,4.85rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-foreground">
          {title}
        </h2>
        <p className="max-w-3xl text-[1.04rem] leading-7 text-muted sm:text-[1.14rem] sm:leading-8">
          {description}
        </p>
      </div>
    </div>
  );
}
