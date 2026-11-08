"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { SORT_FIELD_META, type StudentSortDirection, type StudentSortField } from "@/features/coach/lib/students-options";
import { cn } from "@/lib/utils";

export function SortStudentsSheet({
  open,
  onOpenChange,
  sortBy,
  sortDirection,
  onFieldChange,
  onDirectionChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sortBy: StudentSortField;
  sortDirection: StudentSortDirection;
  onFieldChange: (field: StudentSortField) => void;
  onDirectionChange: (direction: StudentSortDirection) => void;
}) {
  return (
    <SheetFrame open={open} onOpenChange={onOpenChange} title="مرتب سازی هنرجویان" description="ترتیب نمایش هنرجویان را انتخاب کنید.">
      <div className="flex flex-col gap-4">
        <RadioGroup value={sortBy} onValueChange={(value) => onFieldChange(value as StudentSortField)} className="gap-2">
          {SORT_FIELD_META.map((option) => (
            <Label
              key={option.key}
              className={cn(
                "flex items-center gap-3 rounded-xl border border-input bg-field px-3 py-2.5 shadow-field transition-colors hover:bg-muted/40",
                sortBy === option.key && "border-primary/35 bg-brand-50/60",
              )}
            >
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", option.tile)}>
                <option.icon className="size-5" aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <b className="block text-[13px] font-extrabold text-ink">{option.label}</b>
                <span className="text-[12px] font-medium text-ink-subtle">{option.description}</span>
              </span>
              <RadioGroupItem value={option.key} />
            </Label>
          ))}
        </RadioGroup>

        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] font-semibold text-ink-muted">جهت مرتب سازی</span>
          <ToggleGroup
            value={[sortDirection]}
            onValueChange={(next) => onDirectionChange((next[0] ?? "desc") as StudentSortDirection)}
            variant="outline"
            size="sm"
            spacing={1.5}
            className="w-full"
            aria-label="جهت مرتب سازی"
          >
            <ToggleGroupItem value="desc" className="h-9 flex-1 rounded-lg text-[12px] font-bold">
              نزولی
            </ToggleGroupItem>
            <ToggleGroupItem value="asc" className="h-9 flex-1 rounded-lg text-[12px] font-bold">
              صعودی
            </ToggleGroupItem>
          </ToggleGroup>
          <p className="text-[12px] font-medium leading-5 text-ink-subtle">نزولی: از جدید به قدیم · صعودی: از قدیم به جدید</p>
        </div>
      </div>
    </SheetFrame>
  );
}
