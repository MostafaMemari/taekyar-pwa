"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { isCoachFormRoute } from "@/lib/coach/coach-form-routes";
import { cn } from "@/lib/utils";

const SECTION_TONES = {
  brand: "bg-brand-50 text-accent-ink",
  sky: "bg-info-soft text-info",
  emerald: "bg-success-soft text-success",
  amber: "bg-warning-soft text-warning",
  red: "bg-danger-soft text-danger",
} as const;

export function FormSection({
  icon: Icon,
  title,
  tone = "brand",
  children,
}: {
  icon: LucideIcon;
  title: string;
  tone?: keyof typeof SECTION_TONES;
  children: ReactNode;
}) {
  return (
    <Card className="gap-4 p-4">
      <h2 className="flex items-center gap-2 text-[13.5px] font-extrabold text-ink">
        <span className={cn("grid size-7 shrink-0 place-items-center rounded-lg", SECTION_TONES[tone])}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
        {title}
      </h2>
      <FieldGroup className="gap-3.5">{children}</FieldGroup>
    </Card>
  );
}

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

export function FormDock({ cancelHref, submitLabel, icon: Icon }: { cancelHref: string; submitLabel: string; icon?: LucideIcon }) {
  return (
    <ActionDock>
      <div className="flex items-center gap-2 rounded-2xl border border-[var(--card-line)] bg-card/95 p-2 shadow-[var(--card-shadow)] backdrop-blur">
        <Button variant="outline" className="h-11 flex-1 rounded-xl" render={<Link href={cancelHref} />} nativeButton={false}>
          انصراف
        </Button>
        <Button type="submit" variant="brand" className="h-11 flex-[2] rounded-xl text-[12.5px]">
          {Icon ? <Icon data-icon="inline-start" aria-hidden="true" /> : null}
          {submitLabel}
        </Button>
      </div>
    </ActionDock>
  );
}
