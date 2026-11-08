"use client";

import type { LucideIcon } from "lucide-react";
import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type CoachActionMenuItem = {
  icon: LucideIcon;
  label: string;
  tone?: "default" | "danger";
  onSelect: () => void;
};

// The «عملیات ...» sheets: icon-tile rows separated by hairlines, shared by the club, class and student detail menus.
export function CoachActionMenu({ items }: { items: CoachActionMenuItem[] }) {
  return (
    <div className="flex flex-col py-1">
      {items.map((item, index) => {
        const danger = item.tone === "danger";

        return (
          <Fragment key={item.label}>
            {index > 0 ? <Separator /> : null}
            <Button
              type="button"
              variant="ghost"
              className={cn(
                "h-14 w-full justify-start gap-3 rounded-xl px-2 text-[13px] font-semibold",
                danger ? "text-destructive hover:bg-danger-soft hover:text-danger" : "text-ink-body",
              )}
              onClick={item.onSelect}
            >
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-[10px]",
                  danger ? "bg-danger-soft text-danger" : "bg-muted text-ink-muted",
                )}
              >
                <item.icon className="size-[18px]" aria-hidden="true" />
              </span>
              {item.label}
            </Button>
          </Fragment>
        );
      })}
    </div>
  );
}
