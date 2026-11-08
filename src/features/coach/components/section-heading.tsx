import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({ title, action, className }: { title: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-3 flex items-center gap-2", className)}>
      <h2 className="text-[13px] font-bold text-ink">{title}</h2>
      {action ? <div className="ms-auto">{action}</div> : null}
    </div>
  );
}
