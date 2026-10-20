import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function CoachBand({ watermark = "تک", className, children }: { watermark?: string; className?: string; children: ReactNode }) {
  return (
    <header className={cn("coach-band", className)}>
      <span className="coach-band-wm" aria-hidden="true">
        {watermark}
      </span>
      <div className="relative">{children}</div>
    </header>
  );
}

export function CoachSheet({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("coach-sheet", className)}>{children}</div>;
}
