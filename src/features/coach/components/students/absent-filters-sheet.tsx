"use client";

import { Landmark, Wallet } from "lucide-react";
import type { ReactNode } from "react";
import { SheetActions } from "@/components/shared/sheet-actions";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import type { ClubRecord } from "@/features/coach/lib/club-api";
import { FEE_META, STUDENT_FEE_STATUSES, type StudentFeeStatus } from "@/features/coach/lib/students-options";
import { toPersianDigits } from "@/lib/digits";

function SectionTitle({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <h3 className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-muted">
      {icon}
      {children}
    </h3>
  );
}

export function AbsentStudentsFiltersSheet({
  open,
  onOpenChange,
  club,
  fee,
  clubs,
  resultCount,
  onClubChange,
  onFeeChange,
  onClear,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  club: string;
  fee: StudentFeeStatus | null;
  clubs: ClubRecord[];
  resultCount?: number;
  onClubChange: (value: string) => void;
  onFeeChange: (value: "" | StudentFeeStatus) => void;
  onClear: () => void;
}) {
  const activeCount = (club ? 1 : 0) + (fee ? 1 : 0);

  return (
    <SheetFrame
      open={open}
      onOpenChange={onOpenChange}
      title="فیلتر غیبت ها"
      description="باشگاه و وضعیت شهریه را برای محدود کردن فهرست انتخاب کنید"
    >
      <div className="mt-3 flex flex-col gap-5 pb-1">
        <section className="flex flex-col gap-2">
          <SectionTitle icon={<Landmark className="size-3.5" aria-hidden="true" />}>باشگاه</SectionTitle>

          <ToggleGroup
            value={club ? [club] : [""]}
            onValueChange={(next) => {
              const selected = next[0];
              if (selected !== undefined) onClubChange(selected);
            }}
            variant="outline"
            size="sm"
            spacing={1.5}
            className="flex w-full flex-wrap"
            aria-label="فیلتر باشگاه"
          >
            {[{ id: "", name: "همه" }, ...clubs].map((item) => (
              <ToggleGroupItem
                key={item.id || "all"}
                value={item.id}
                className="h-9 gap-1 rounded-xl px-2.5 text-[12px] font-bold aria-pressed:border-primary/35 aria-pressed:bg-brand-50 aria-pressed:text-accent-ink"
              >
                {item.name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </section>

        <section className="flex flex-col gap-2">
          <SectionTitle icon={<Wallet className="size-3.5" aria-hidden="true" />}>وضعیت شهریه</SectionTitle>

          <ToggleGroup
            value={[fee ?? ""]}
            onValueChange={(next) => {
              const selected = next[0] as "" | StudentFeeStatus | undefined;
              if (selected !== undefined) onFeeChange(selected);
            }}
            variant="outline"
            size="sm"
            spacing={1.5}
            className="grid w-full grid-cols-3"
            aria-label="فیلتر وضعیت شهریه"
          >
            {[{ value: "", label: "همه" }, ...STUDENT_FEE_STATUSES.map((value) => ({ value, label: FEE_META[value].shortLabel }))].map(
              (option) => (
                <ToggleGroupItem
                  key={option.value || "all"}
                  value={option.value}
                  className="h-9 rounded-xl text-[12px] font-bold aria-pressed:border-primary/35 aria-pressed:bg-brand-50 aria-pressed:text-accent-ink"
                >
                  {option.label}
                </ToggleGroupItem>
              ),
            )}
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
          {resultCount === undefined ? "نمایش نتایج" : `نمایش ${toPersianDigits(String(resultCount))} هنرجو`}
        </Button>
      </SheetActions>
    </SheetFrame>
  );
}
