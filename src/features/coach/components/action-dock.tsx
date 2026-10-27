"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { isCoachFormRoute } from "@/features/coach/lib/coach-form-routes";
import { cn } from "@/lib/utils";

export function ActionDock({ children, className }: { children: ReactNode; className?: string }) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "fixed inset-x-0 z-30 mx-auto max-w-[var(--app-max-width)] px-4",
        isCoachFormRoute(pathname)
          ? "bottom-[calc(0.875rem+env(safe-area-inset-bottom))]"
          : "bottom-[calc(5.9rem+env(safe-area-inset-bottom))]",
        className,
      )}
    >
      {children}
    </div>
  );
}
