"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The one footer for every sheet: outlined secondary action and the primary at a fixed 1:2 ratio.
export function SheetActions({
  secondaryLabel = "انصراف",
  onSecondary,
  secondaryDisabled,
  className,
  children,
}: {
  secondaryLabel?: string;
  onSecondary: () => void;
  secondaryDisabled?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex items-center gap-2 border-t border-[var(--line-2)] pt-3", className)}>
      <Button type="button" variant="outline" className="h-11 flex-1 rounded-xl" onClick={onSecondary} disabled={secondaryDisabled}>
        {secondaryLabel}
      </Button>
      {children}
    </div>
  );
}
