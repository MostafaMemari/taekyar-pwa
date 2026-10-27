import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function AuthPageTitle({ className, ...props }: ComponentProps<"h1">) {
  return <h1 className={cn("text-[24px] font-extrabold leading-9 text-ink", className)} {...props} />;
}
