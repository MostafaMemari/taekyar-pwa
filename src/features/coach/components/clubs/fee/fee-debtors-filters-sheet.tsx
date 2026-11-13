"use client";

import { SheetActions } from "@/components/shared/sheet-actions";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";

// Single-select groups always carry an explicit "همه" value, so the selection can never be empty.
export function FeeDebtorsFiltersSheet({
  open,
  onOpenChange,
  status,
  membership,
  minMonths,
  onStatusChange,
  onMembershipChange,
  onMinMonthsChange,
  onClear,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: string;
  membership: string;
  minMonths: string;
  onStatusChange: (value: string) => void;
  onMembershipChange: (value: string) => void;
  onMinMonthsChange: (value: string) => void;
  onClear: () => void;
}) {
  const activeCount = (status !== "ALL" ? 1 : 0) + (membership !== "ALL" ? 1 : 0) + (minMonths !== "1" ? 1 : 0);

  return (
    <SheetFrame
      open={open}
      onOpenChange={onOpenChange}
      title="فیلتر بدهکاران"
      description="وضعیت بدهی، عضویت و تعداد ماه بدهی را برای محدود کردن فهرست انتخاب کنید"
    >
      <div className="mt-3 flex flex-col gap-5">
        <section className="flex flex-col gap-2">
          <h3 className="text-[12px] font-semibold text-ink-muted">وضعیت بدهی</h3>
          <ToggleGroup
            value={status ? [status] : []}
            onValueChange={(next) => onStatusChange(next[0] ?? "ALL")}
            variant="outline"
            size="sm"
            spacing={1.5}
            className="grid w-full grid-cols-3"
            aria-label="فیلتر وضعیت بدهی"
          >
            {[
              { value: "ALL", label: "همه" },
              { value: "UNPAID", label: "پرداخت نشده" },
              { value: "PARTIAL", label: "ناقص" },
            ].map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                className="h-9 rounded-xl px-1 text-[12px] font-bold aria-pressed:border-primary/35 aria-pressed:bg-brand-50 aria-pressed:text-accent-ink"
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-[12px] font-semibold text-ink-muted">وضعیت عضویت</h3>
          <ToggleGroup
            value={membership ? [membership] : []}
            onValueChange={(next) => onMembershipChange(next[0] ?? "ALL")}
            variant="outline"
            size="sm"
            spacing={1.5}
            className="grid w-full grid-cols-3"
            aria-label="فیلتر وضعیت عضویت"
          >
            {[
              { value: "ALL", label: "همه" },
              { value: "active", label: "فعال" },
              { value: "inactive", label: "غیرفعال" },
            ].map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                className="h-9 rounded-xl px-1 text-[12px] font-bold aria-pressed:border-primary/35 aria-pressed:bg-brand-50 aria-pressed:text-accent-ink"
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-[12px] font-semibold text-ink-muted">حداقل بدهی</h3>
          <ToggleGroup
            value={minMonths ? [minMonths] : []}
            onValueChange={(next) => onMinMonthsChange(next[0] ?? "1")}
            variant="outline"
            size="sm"
            spacing={1.5}
            className="grid w-full grid-cols-2"
            aria-label="فیلتر حداقل بدهی"
          >
            {[
              { value: "1", label: "همه ماه ها" },
              { value: "2", label: "۲+ ماه" },
              { value: "3", label: "۳+ ماه" },
              { value: "6", label: "۶+ ماه" },
            ].map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                className="h-9 rounded-xl px-1 text-[12px] font-bold aria-pressed:border-primary/35 aria-pressed:bg-brand-50 aria-pressed:text-accent-ink"
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </section>
      </div>

      <SheetActions
        className="mt-4"
        secondaryLabel="پاک کردن"
        secondaryDisabled={activeCount === 0}
        onSecondary={() => {
          onClear();
          onOpenChange(false);
        }}
      >
        <Button
          type="button"
          variant="brand"
          className="h-11 flex-[2] rounded-xl text-[12px] font-bold"
          onClick={() => onOpenChange(false)}
        >
          نمایش نتایج
        </Button>
      </SheetActions>
    </SheetFrame>
  );
}
