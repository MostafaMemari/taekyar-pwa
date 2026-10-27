import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function CoachSheet({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("coach-sheet", className)}>{children}</div>;
}
