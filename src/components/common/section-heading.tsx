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
        "max-w-3xl space-y-5",
        align === "center" && "mx-auto text-center",
      )}
    >
      <Badge variant="accent" className="w-fit">
        {eyebrow}
      </Badge>
      <div className="space-y-3">
        <h2 className="font-display text-4xl font-semibold tracking-[-0.03em] text-foreground sm:text-5xl">
          {title}
        </h2>
        <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg">
          {description}
        </p>
      </div>
    </div>
  );
}
