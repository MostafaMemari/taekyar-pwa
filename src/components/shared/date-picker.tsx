"use client";

import { jalaaliMonthLength } from "jalaali-js";
import { CalendarDays, ChevronDown } from "lucide-react";
import { useState } from "react";
import { SheetActions } from "@/components/shared/sheet-actions";
import { WheelColumn } from "@/components/shared/wheel-column";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toLatinDigits, toPersianDigits } from "@/lib/digits";
import { JALALI_MONTHS } from "@/lib/jalali";
import { cn } from "@/lib/utils";

const MONTHS = JALALI_MONTHS;

type DateParts = { year: number; month: number; day: number };

type DatePickerProps = {
  id?: string;
  title: string;
  value: string;
  onChange: (value: string) => void;
  defaultValue?: string;
  fromYear?: number;
  toYear?: number;
  /** Latin or Persian YYYY/MM/DD — the earliest selectable date, e.g. today for insurance. */
  from?: string;
  /** Latin or Persian YYYY/MM/DD — the latest selectable date, e.g. today for attendance. */
  to?: string;
  /** Renders the wheels inline so a parent sheet can swap views instead of stacking a second sheet. */
  embedded?: boolean;
  onDone?: () => void;
  onCancel?: () => void;
  /** Parent sheets swap their own view; the trigger never opens the nested sheet. */
  onOpenRequest?: () => void;
};

function parseJalali(value: string): DateParts | null {
  const match = toLatinDigits(value).match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > jalaaliMonthLength(year, month)) return null;
  return { year, month, day };
}

function formatJalali({ year, month, day }: DateParts) {
  return `${year}/${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
}

function todayJalali(): DateParts {
  try {
    const parts = new Intl.DateTimeFormat("en-US-u-ca-persian", { year: "numeric", month: "numeric", day: "numeric" }).formatToParts(
      new Date(),
    );
    const read = (type: string) => Number(parts.find((part) => part.type === type)?.value);
    const year = read("year");
    const month = read("month");
    const day = read("day");

    if (year && month >= 1 && month <= 12 && day >= 1) {
      return { year, month, day: Math.min(day, jalaaliMonthLength(year, month)) };
    }
  } catch {
    // Fall through to a stable default when the Persian calendar is unavailable.
  }

  return { year: 1400, month: 1, day: 1 };
}

function DateWheels({
  draft,
  yearMin,
  yearMax,
  monthMin,
  monthMax,
  dayMin,
  dayMax,
  onYearChange,
  onMonthChange,
  onDayChange,
  scrollKey,
}: {
  draft: DateParts;
  yearMin: number;
  yearMax: number;
  monthMin: number;
  monthMax: number;
  dayMin: number;
  dayMax: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onDayChange: (day: number) => void;
  scrollKey: string | boolean;
}) {
  return (
    <div className="rounded-2xl bg-muted/60 px-3 pt-3 pb-2">
      <div className="grid grid-cols-3 gap-2 text-center text-[12px] font-semibold text-ink-subtle">
        <span>روز</span>
        <span>ماه</span>
        <span>سال</span>
      </div>

      <div className="relative mt-1">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 z-0 h-11 -translate-y-1/2 rounded-xl border border-primary/25 bg-background shadow-[0_2px_10px_-2px_rgba(17,24,39,0.14)]"
        />

        <div className="relative z-10 grid grid-cols-3 gap-2">
          <WheelColumn
            className="min-w-0"
            ariaLabel="روز"
            min={dayMin}
            max={dayMax}
            value={draft.day}
            onChange={onDayChange}
            scrollKey={`${scrollKey}-${dayMin}-${dayMax}`}
            showBand={false}
          />

          <WheelColumn
            className="min-w-0"
            ariaLabel="ماه"
            min={monthMin}
            max={monthMax}
            value={draft.month}
            onChange={onMonthChange}
            formatValue={(month) => MONTHS[month - 1]}
            scrollKey={`${scrollKey}-${monthMin}-${monthMax}`}
            showBand={false}
          />

          <WheelColumn
            className="min-w-0"
            ariaLabel="سال"
            min={yearMin}
            max={yearMax}
            value={draft.year}
            onChange={onYearChange}
            scrollKey={scrollKey}
            showBand={false}
          />
        </div>
      </div>
    </div>
  );
}

export function DatePicker({
  id,
  title,
  value,
  onChange,
  defaultValue,
  fromYear = 1350,
  toYear = 1406,
  from,
  to,
  embedded,
  onDone,
  onCancel,
  onOpenRequest,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const floor = parseJalali(from ?? "");
  const limit = parseJalali(to ?? "");
  const yearMin = floor ? Math.max(fromYear, floor.year) : fromYear;
  const yearMax = limit ? Math.min(toYear, limit.year) : toYear;

  const capDay = (year: number, month: number, day: number) => {
    let capped = Math.min(day, jalaaliMonthLength(year, month));
    if (limit && year === limit.year && month === limit.month) capped = Math.min(capped, limit.day);
    if (floor && year === floor.year && month === floor.month) capped = Math.max(capped, floor.day);
    return capped;
  };

  const initialDraft = (): DateParts => {
    const initial = parseJalali(value) ?? parseJalali(defaultValue ?? "") ?? todayJalali();
    const year = Math.min(yearMax, Math.max(yearMin, initial.year));
    let month = Math.min(12, Math.max(1, initial.month));
    if (limit && year === limit.year) month = Math.min(month, limit.month);
    if (floor && year === floor.year) month = Math.max(month, floor.month);
    return { year, month, day: capDay(year, month, initial.day) };
  };

  const [draft, setDraft] = useState<DateParts>(initialDraft);

  const display = parseJalali(value);
  const days = jalaaliMonthLength(draft.year, draft.month);
  const monthMin = floor && draft.year === floor.year ? floor.month : 1;
  const monthMax = limit && draft.year === limit.year ? limit.month : 12;
  const dayMin = floor && draft.year === floor.year && draft.month === floor.month ? floor.day : 1;
  const dayMax = limit && draft.year === limit.year && draft.month === limit.month ? Math.min(days, limit.day) : days;

  const setYear = (year: number) => {
    setDraft((current) => {
      let month = current.month;
      if (limit && year === limit.year) month = Math.min(month, limit.month);
      if (floor && year === floor.year) month = Math.max(month, floor.month);
      return { year, month, day: capDay(year, month, current.day) };
    });
  };

  const setMonth = (month: number) => {
    setDraft((current) => ({ ...current, month, day: capDay(current.year, month, current.day) }));
  };

  const setDay = (day: number) => {
    setDraft((current) => ({ ...current, day }));
  };

  const handleOpen = () => {
    setDraft(initialDraft());
    setOpen(true);
  };

  const confirm = () => {
    onChange(formatJalali(draft));
    setOpen(false);
  };

  const clear = () => {
    onChange("");
    setOpen(false);
  };

  if (embedded) {
    return (
      <>
        <p className="text-[12px] font-medium leading-5 text-ink-subtle">روز، ماه و سال را با کشیدن ستون ها انتخاب کنید</p>
        <div className="mt-3">
          <DateWheels
            draft={draft}
            yearMin={yearMin}
            yearMax={yearMax}
            monthMin={monthMin}
            monthMax={monthMax}
            dayMin={dayMin}
            dayMax={dayMax}
            onYearChange={setYear}
            onMonthChange={setMonth}
            onDayChange={setDay}
            scrollKey="embedded"
          />
        </div>

        <SheetActions
          className="mt-3"
          secondaryLabel="پاک کردن"
          secondaryDisabled={!value}
          onSecondary={() => {
            onChange("");
            onCancel?.();
          }}
        >
          <Button
            type="button"
            variant="brand"
            className="h-11 flex-[2] rounded-xl text-[12px] font-bold"
            onClick={() => {
              onChange(formatJalali(draft));
              onDone?.();
            }}
          >
            تایید
          </Button>
        </SheetActions>
      </>
    );
  }

  return (
    <>
      <Button
        id={id}
        type="button"
        variant="field"
        aria-haspopup={onOpenRequest ? undefined : "dialog"}
        aria-expanded={onOpenRequest ? undefined : open}
        className={cn("relative h-12 w-full rounded-xl px-11 text-sm font-semibold", display ? "text-ink" : "text-muted-foreground")}
        onClick={onOpenRequest ?? handleOpen}
      >
        <CalendarDays className="pointer-events-none absolute start-3.5 text-ink-subtle" aria-hidden="true" />
        <span className="truncate">{display ? toPersianDigits(formatJalali(display)) : "انتخاب تاریخ"}</span>
        <ChevronDown className="pointer-events-none absolute end-3.5 text-ink-subtle" aria-hidden="true" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="mx-auto w-full max-w-md rounded-t-3xl px-5 pt-2 pb-[max(18px,env(safe-area-inset-bottom))]"
        >
          <div className="mx-auto h-1 w-10 shrink-0 rounded-full bg-muted-foreground/25" aria-hidden="true" />

          <SheetHeader className="gap-1 p-0 text-center">
            <SheetTitle className="text-base font-extrabold text-ink">انتخاب {title}</SheetTitle>
            <SheetDescription className="text-[12px] font-medium leading-5 text-ink-subtle">
              روز، ماه و سال را بالا یا پایین بکشید
            </SheetDescription>
          </SheetHeader>

          <div className="mt-3">
            <DateWheels
              draft={draft}
              yearMin={yearMin}
              yearMax={yearMax}
              monthMin={monthMin}
              monthMax={monthMax}
              dayMin={dayMin}
              dayMax={dayMax}
              onYearChange={setYear}
              onMonthChange={setMonth}
              onDayChange={setDay}
              scrollKey={open}
            />
          </div>

          <SheetActions secondaryLabel="پاک کردن" secondaryDisabled={!value} onSecondary={clear}>
            <Button type="button" variant="brand" className="h-11 flex-[2] rounded-xl text-[12px] font-bold" onClick={confirm}>
              تایید
            </Button>
          </SheetActions>
        </SheetContent>
      </Sheet>
    </>
  );
}
