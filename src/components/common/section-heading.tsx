import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "max-w-4xl space-y-4",
        align === "center" && "mx-auto text-center",
      )}
    >
      <Badge variant="accent" className="w-fit">
        {eyebrow}
      </Badge>
      <div className="space-y-3">
        <h2 className="font-display text-[clamp(4.25rem,3.6rem+1.6vw,5.8rem)] font-semibold leading-[0.88] tracking-[-0.05em] text-foreground">
          {title}
        </h2>
        <p className="max-w-3xl text-[1.08rem] leading-8 text-muted sm:text-[1.16rem] sm:leading-9">
          {description}
        </p>
      </div>
    </div>
  );
}
