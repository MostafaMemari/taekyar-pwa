"use client";

import { CalendarDays, Landmark } from "lucide-react";
import type { ReactNode } from "react";
import { SheetActions } from "@/components/shared/sheet-actions";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import type { ClubRecord } from "@/features/coach/lib/club-api";
import { WEEK_DAY_META, WEEK_DAY_ORDER } from "@/features/coach/lib/coach-data";
import { SESSION_FILTER_STATUSES, SESSION_STATUS_META, type SessionFilterStatus } from "@/features/coach/lib/sessions-filters";
import { toPersianDigits } from "@/lib/digits";

function SectionTitle({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <h3 className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-muted">
      {icon}
      {children}
    </h3>
  );
}

export function SessionsFiltersSheet({
  open,
  onOpenChange,
  status,
  club,
  days,
  clubs,
  resultCount,
  onStatusChange,
  onClubChange,
  onDaysChange,
  onClear,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: SessionFilterStatus;
  club: string;
  days: string[];
  clubs: ClubRecord[];
  resultCount?: number;
  onStatusChange: (value: SessionFilterStatus) => void;
  onClubChange: (value: string) => void;
  onDaysChange: (value: string[]) => void;
  onClear: () => void;
}) {
  const activeCount = (status !== "ACTIVE" ? 1 : 0) + (club ? 1 : 0) + days.length;

  return (
    <SheetFrame
      open={open}
      onOpenChange={onOpenChange}
      title="فیلتر کلاس ها"
      description="وضعیت، باشگاه و روزهای برگزاری را برای محدود کردن فهرست انتخاب کنید"
    >
      <div className="mt-3 max-h-[60vh] overflow-y-auto no-scrollbar">
        <div className="flex flex-col gap-5 pb-1">
          <section className="flex flex-col gap-2">
            <SectionTitle icon={<span className="size-3 rounded-full bg-brand-500" aria-hidden="true" />}>وضعیت کلاس</SectionTitle>

            <ToggleGroup
              value={[status]}
              onValueChange={(next) => {
                const selected = next[0] as SessionFilterStatus | undefined;
                if (selected) onStatusChange(selected);
              }}
              variant="outline"
              size="sm"
              spacing={1.5}
              className="grid w-full grid-cols-3"
              aria-label="فیلتر وضعیت کلاس"
            >
              {SESSION_FILTER_STATUSES.map((value) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  className="h-9 rounded-xl text-[12px] font-bold aria-pressed:border-primary/35 aria-pressed:bg-brand-50 aria-pressed:text-accent-ink"
                >
                  {SESSION_STATUS_META[value]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </section>

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
            <SectionTitle icon={<CalendarDays className="size-3.5" aria-hidden="true" />}>روز برگزاری</SectionTitle>

            <ToggleGroup
              multiple
              value={days}
              onValueChange={(next) => onDaysChange(next)}
              variant="outline"
              size="sm"
              spacing={1.5}
              className="grid w-full grid-cols-4"
              aria-label="فیلتر روز برگزاری"
            >
              {WEEK_DAY_ORDER.map((day) => (
                <ToggleGroupItem
                  key={day}
                  value={day}
                  className="h-9 rounded-xl text-[12px] font-bold aria-pressed:border-primary/35 aria-pressed:bg-brand-50 aria-pressed:text-accent-ink"
                >
                  {WEEK_DAY_META[day].label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </section>
        </div>
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
          {resultCount === undefined ? "نمایش نتایج" : `نمایش ${toPersianDigits(String(resultCount))} کلاس`}
        </Button>
      </SheetActions>
    </SheetFrame>
  );
}
