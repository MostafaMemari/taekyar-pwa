"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { SORT_OPTIONS, type SortKey } from "@/features/coach/lib/students-options";
import { cn } from "@/lib/utils";

export function SortStudentsSheet({
  open,
  onOpenChange,
  sort,
  onSortChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sort: SortKey;
  onSortChange: (value: SortKey) => void;
}) {
  return (
    <SheetFrame open={open} onOpenChange={onOpenChange} title="مرتب سازی هنرجویان" description="ترتیب نمایش هنرجویان را انتخاب کنید.">
      <RadioGroup
        value={sort}
        onValueChange={(value) => {
          onSortChange(value as SortKey);
          onOpenChange(false);
        }}
        className="gap-2"
      >
        {SORT_OPTIONS.map((option) => (
          <Label
            key={option.value}
            className={cn(
              "flex items-center gap-3 rounded-xl border border-input bg-field px-3 py-2.5 shadow-field transition-colors hover:bg-muted/40",
              sort === option.value && "border-primary/35 bg-brand-50/60",
            )}
          >
            <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", option.tile)}>
              <option.icon className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <b className="block text-[13px] font-extrabold text-ink">{option.label}</b>
              <span className="text-[11px] font-medium text-ink-subtle">{option.description}</span>
            </span>
            <RadioGroupItem value={option.value} />
          </Label>
        ))}
      </RadioGroup>
    </SheetFrame>
  );
}
