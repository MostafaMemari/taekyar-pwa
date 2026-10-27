import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({ title, action, className }: { title: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-3 flex items-center gap-2", className)}>
      <span className="h-4 w-1 rounded-full bg-gradient-to-b from-brand-400 to-brand-600" aria-hidden="true" />
      <h2 className="text-[14px] font-extrabold text-ink">{title}</h2>
      {action ? <div className="ms-auto">{action}</div> : null}
    </div>
  );
}
