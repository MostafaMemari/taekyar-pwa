"use client";

import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CoachActionMenuItem = {
  icon: LucideIcon;
  label: string;
  tone?: "default" | "danger";
  onSelect: () => void;
};

// The «عملیات ...» sheets: compact icon-tile rows, shared by the club, class and student detail menus.
export function CoachActionMenu({ items }: { items: CoachActionMenuItem[] }) {
  return (
    <div className="flex flex-col gap-0.5">
      {items.map((item) => {
        const danger = item.tone === "danger";

        return (
          <Button
            key={item.label}
            type="button"
            variant="ghost"
            className={cn(
              "h-12 w-full justify-start gap-3 rounded-xl px-2 text-[13px] font-medium",
              danger ? "text-destructive hover:bg-danger-soft hover:text-danger" : "text-ink-body",
            )}
            onClick={item.onSelect}
          >
            <span
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-[10px]",
                danger ? "bg-danger-soft text-danger" : "bg-muted text-ink-muted",
              )}
            >
              <item.icon className="size-4" aria-hidden="true" />
            </span>
            {item.label}
          </Button>
        );
      })}
    </div>
  );
}
