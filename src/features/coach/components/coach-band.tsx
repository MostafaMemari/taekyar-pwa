import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function CoachBand({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <header className={cn("coach-band", className)}>
      <div className="relative">{children}</div>
    </header>
  );
}
