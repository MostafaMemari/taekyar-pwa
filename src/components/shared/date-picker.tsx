"use client";

import { CalendarDays, ChevronDown } from "lucide-react";
import { useState } from "react";
import { WheelColumn } from "@/components/shared/wheel-column";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toLatinDigits, toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

const MONTHS = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"] as const;
const MONTH_DAYS = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29] as const;
const LEAP_REMAINDERS = new Set([1, 5, 9, 13, 17, 22, 26, 30]);

type DateParts = { year: number; month: number; day: number };

type DatePickerProps = {
  id?: string;
  title: string;
  value: string;
  onChange: (value: string) => void;
  defaultValue?: string;
  fromYear?: number;
  toYear?: number;
};

function isLeapYear(year: number) {
  // 33-year cycle, accurate for the 1343–1472 range used here.
  return LEAP_REMAINDERS.has(year % 33);
}

function daysInMonth(year: number, month: number) {
  return month === 12 && isLeapYear(year) ? 30 : MONTH_DAYS[month - 1];
}

function parseJalali(value: string): DateParts | null {
  const match = toLatinDigits(value).match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null;
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
      return { year, month, day: Math.min(day, daysInMonth(year, month)) };
    }
  } catch {
    // Fall through to a stable default when the Persian calendar is unavailable.
  }

  return { year: 1400, month: 1, day: 1 };
}

function clampDate(parts: DateParts, fromYear: number, toYear: number): DateParts {
  const year = Math.min(toYear, Math.max(fromYear, parts.year));
  const month = Math.min(12, Math.max(1, parts.month));
  return { year, month, day: Math.min(daysInMonth(year, month), Math.max(1, parts.day)) };
}

export function DatePicker({ id, title, value, onChange, defaultValue, fromYear = 1350, toYear = 1406 }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateParts>({ year: fromYear, month: 1, day: 1 });

  const display = parseJalali(value);
  const days = daysInMonth(draft.year, draft.month);

  const handleOpen = () => {
    const initial = parseJalali(value) ?? parseJalali(defaultValue ?? "") ?? todayJalali();
    setDraft(clampDate(initial, fromYear, toYear));
    setOpen(true);
  };

  const setYear = (year: number) => {
    setDraft((current) => ({ ...current, year, day: Math.min(current.day, daysInMonth(year, current.month)) }));
  };

  const setMonth = (month: number) => {
    setDraft((current) => ({ ...current, month, day: Math.min(current.day, daysInMonth(current.year, month)) }));
  };

  const setDay = (day: number) => {
    setDraft((current) => ({ ...current, day }));
  };

  const confirm = () => {
    onChange(formatJalali(draft));
    setOpen(false);
  };

  const clear = () => {
    onChange("");
    setOpen(false);
  };

  return (
    <>
      <Button
        id={id}
        type="button"
        variant="field"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn("relative h-12 w-full rounded-xl px-11 text-sm font-semibold", display ? "text-ink" : "text-muted-foreground")}
        onClick={handleOpen}
      >
        <CalendarDays className="pointer-events-none absolute start-3.5 text-ink-subtle" aria-hidden="true" />
        <span className="truncate">{display ? toPersianDigits(formatJalali(display)) : "انتخاب تاریخ"}</span>
        <ChevronDown className="pointer-events-none absolute end-3.5 text-ink-faint" aria-hidden="true" />
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
            <SheetDescription className="text-[11px] font-medium leading-5 text-ink-subtle">
              روز، ماه و سال را بالا یا پایین بکشید.
            </SheetDescription>
          </SheetHeader>

          <div className="rounded-2xl bg-muted/60 px-3 pt-3 pb-2">
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-semibold text-ink-subtle">
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
                  min={1}
                  max={days}
                  value={draft.day}
                  onChange={setDay}
                  scrollKey={`${open}-${days}`}
                  showBand={false}
                />

                <WheelColumn
                  className="min-w-0"
                  ariaLabel="ماه"
                  min={1}
                  max={12}
                  value={draft.month}
                  onChange={setMonth}
                  formatValue={(month) => MONTHS[month - 1]}
                  scrollKey={open}
                  showBand={false}
                />

                <WheelColumn
                  className="min-w-0"
                  ariaLabel="سال"
                  min={fromYear}
                  max={toYear}
                  value={draft.year}
                  onChange={setYear}
                  scrollKey={open}
                  showBand={false}
                />
              </div>
            </div>
          </div>

          <SheetFooter className="flex-row gap-3 p-0 pt-1">
            <Button type="button" variant="outline" size="cta" className="flex-1" disabled={!value} onClick={clear}>
              پاک کردن
            </Button>
            <Button type="button" variant="brand" size="cta" className="flex-[2]" onClick={confirm}>
              تایید
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
