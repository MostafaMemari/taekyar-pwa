import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function CoachBand({
  watermark = "تک",
  className,
  children,
}: {
  watermark?: string | null;
  className?: string;
  children: ReactNode;
}) {
  return (
    <header className={cn("coach-band", className)}>
      {watermark ? (
        <span className="coach-band-wm" aria-hidden="true">
          {watermark}
        </span>
      ) : null}
      <div className="relative">{children}</div>
    </header>
  );
}
