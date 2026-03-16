"use client";

import * as SeparatorPrimitive from "@radix-ui/react-separator";

function Separator(
  props: React.ComponentProps<typeof SeparatorPrimitive.Root>,
) {
  return (
    <SeparatorPrimitive.Root
      className="bg-border/80 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px"
      {...props}
    />
  );
}

export { Separator };
