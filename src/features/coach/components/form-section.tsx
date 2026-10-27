import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
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
