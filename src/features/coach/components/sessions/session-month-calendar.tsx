"use client";

import { jalaaliMonthLength, toJalaali } from "jalaali-js";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { WEEK_DAY_META, WEEK_DAY_ORDER, type WeekDay, weekDayOfDate } from "@/features/coach/lib/coach-data";
import { toPersianDigits } from "@/lib/digits";
import { JALALI_MONTHS, toGregorianDate } from "@/lib/jalali";
import { cn } from "@/lib/utils";

type MonthView = { jy: number; jm: number };

function monthOfIso(isoDate: string): MonthView | null {
  const [gy, gm, gd] = isoDate.slice(0, 10).split("-").map(Number);
  if (!gy || !gm || !gd) return null;
  return toJalaali(gy, gm, gd);
}

function dayIso(view: MonthView, day: number): string | null {
  return toGregorianDate(`${view.jy}/${view.jm}/${day}`);
}

type SessionMonthCalendarProps = {
  weekDays: WeekDay[];
  value: string;
  capIso: string;
  onChange: (isoDate: string) => void;
  recorded?: readonly string[];
};

// A Jalali month grid where only the class's own days are tappable; months past the cap
// (today) are unreachable.
export function SessionMonthCalendar({ weekDays, value, capIso, onChange, recorded }: SessionMonthCalendarProps) {
  const recordedSet = new Set(recorded ?? []);
  const [viewed, setViewed] = useState<MonthView | null>(() => monthOfIso(value) ?? monthOfIso(capIso));

  // External date changes (جلسه قبل/بعد, deep links) pull the viewed month along.
  useEffect(() => {
    const target = monthOfIso(value) ?? monthOfIso(capIso);
    if (!target) return;
    setViewed((current) => (current && current.jy === target.jy && current.jm === target.jm ? current : target));
  }, [value, capIso]);

  if (!viewed) return null;

  const capMonth = monthOfIso(capIso);
  const monthLength = jalaaliMonthLength(viewed.jy, viewed.jm);
  const firstIso = dayIso(viewed, 1) ?? capIso;
  const offset = WEEK_DAY_ORDER.indexOf(weekDayOfDate(firstIso));
  const nextDisabled = capMonth !== null && viewed.jy === capMonth.jy && viewed.jm === capMonth.jm;

  const shiftMonth = (delta: number) => {
    setViewed((current) => {
      if (!current) return current;
      const { jy, jm } = current;
      return delta < 0
        ? { jy: jm === 1 ? jy - 1 : jy, jm: jm === 1 ? 12 : jm - 1 }
        : { jy: jm === 12 ? jy + 1 : jy, jm: jm === 12 ? 1 : jm + 1 };
    });
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <Button type="button" variant="ghost" size="icon-sm" aria-label="ماه قبل" onClick={() => shiftMonth(-1)}>
          <ChevronRight aria-hidden="true" />
        </Button>
        <b className="text-[13px] font-extrabold text-ink tabular-nums">
          {JALALI_MONTHS[viewed.jm - 1]} {toPersianDigits(String(viewed.jy))}
        </b>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="ماه بعد" disabled={nextDisabled} onClick={() => shiftMonth(1)}>
          <ChevronLeft aria-hidden="true" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {WEEK_DAY_ORDER.map((day) => (
          <span key={day} className="grid h-7 place-items-center text-[9px] font-bold whitespace-nowrap text-ink-subtle">
            {WEEK_DAY_META[day].label}
          </span>
        ))}

        {WEEK_DAY_ORDER.slice(0, offset).map((blank) => (
          <span key={blank} />
        ))}

        {Array.from({ length: monthLength }, (_, index) => {
          const day = index + 1;
          const iso = dayIso(viewed, day);
          const selected = iso === value;
          const today = iso === capIso;
          const selectable = iso !== null && weekDays.includes(weekDayOfDate(iso)) && iso <= capIso;

          if (!selectable) {
            return (
              <span
                key={day}
                className={cn(
                  "mx-auto grid size-9 place-items-center rounded-lg text-[12px] font-bold tabular-nums",
                  iso !== null && weekDays.includes(weekDayOfDate(iso)) ? "text-ink-muted" : "text-ink-subtle/40",
                )}
              >
                {toPersianDigits(String(day))}
              </span>
            );
          }

          return (
            <button
              key={day}
              type="button"
              onClick={() => onChange(iso)}
              className={cn(
                "relative mx-auto grid size-9 place-items-center rounded-lg text-[12px] font-bold tabular-nums transition-colors",
                selected
                  ? "bg-brand-600 text-white"
                  : today
                    ? "text-accent-ink ring-1 ring-inset ring-brand-300"
                    : "text-ink hover:bg-muted",
              )}
            >
              {toPersianDigits(String(day))}
              {recordedSet.has(iso) ? (
                <span className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-current" aria-hidden="true" />
              ) : null}
            </button>
          );
        })}
      </div>

      {recorded && recorded.length > 0 ? (
        <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-ink-subtle">
          <span className="size-1.5 rounded-full bg-ink-body" aria-hidden="true" />
          حضور و غیاب ثبت شده
        </p>
      ) : null}
    </div>
  );
}
