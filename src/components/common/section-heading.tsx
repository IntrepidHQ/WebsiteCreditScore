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
        "max-w-3xl space-y-4",
        align === "center" && "mx-auto text-center",
      )}
    >
      <Badge variant="accent" className="w-fit">
        {eyebrow}
      </Badge>
      <div className="space-y-3">
        <h2 className="font-display text-[2.45rem] font-semibold leading-[0.94] tracking-[-0.04em] text-foreground sm:text-[3.35rem] lg:text-[3.15rem]">
          {title}
        </h2>
        <p className="max-w-2xl text-[1rem] leading-7 text-muted sm:text-[1.05rem] sm:leading-8">
          {description}
        </p>
      </div>
    </div>
  );
}
