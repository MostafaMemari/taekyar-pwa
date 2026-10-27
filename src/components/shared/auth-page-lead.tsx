import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function AuthPageLead({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("mt-2 text-[13px] font-medium leading-6 text-ink-muted", className)} {...props} />;
}
