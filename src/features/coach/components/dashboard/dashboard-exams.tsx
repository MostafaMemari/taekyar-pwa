"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { useBeltExams } from "@/features/coach/hooks/use-belt-exams";
import { toPersianDigits } from "@/lib/digits";
import { toJalaliDate, toJalaliDayMonth } from "@/lib/jalali";
import { cn } from "@/lib/utils";

const DAY_MS = 86_400_000;

type CountdownTone = "danger" | "warning" | "calm";

const TONE_CLASS: Record<CountdownTone, string> = {
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
  calm: "bg-muted text-ink-muted",
};

function countdownTone(days: number): CountdownTone {
  return days <= 7 ? "danger" : days <= 30 ? "warning" : "calm";
}

export function DashboardExams() {
  const [now] = useState(() => new Date());
  const { data, isLoading } = useBeltExams();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const exams = (data ?? [])
    .filter((exam) => new Date(exam.eventDate) >= today)
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    .slice(0, 3);

  return (
    <section>
      <SectionHeading title="آزمون های پیش رو" />
      <Card className="gap-0 p-0">
        {isLoading && !data ? (
          <div className="flex flex-col gap-2 p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : exams.length === 0 ? (
          <p className="px-4 py-6 text-center text-[12px] font-medium text-ink-subtle">آزمون کمربندی پیش رو ثبت نشده است.</p>
        ) : (
          <ul>
            {exams.map((exam, index) => {
              const [day, ...month] = toJalaliDayMonth(exam.eventDate).split(" ");
              const open = new Date(exam.registerDate) <= now;
              const eventDay = new Date(exam.eventDate);
              eventDay.setHours(0, 0, 0, 0);
              const daysLeft = Math.max(0, Math.round((eventDay.getTime() - today.getTime()) / DAY_MS));
              const place = exam.eventPlaces[0] ?? null;

              return (
                <li key={exam.id} className={cn("flex items-center gap-3 px-4 py-3", index > 0 && "border-t border-[var(--line-2)]")}>
                  <span className="flex w-11 shrink-0 flex-col items-center rounded-[10px] bg-muted py-1">
                    <b className="text-[15px] leading-5 font-extrabold tabular-nums text-ink">{day}</b>
                    <span className="text-[12px] leading-4 font-medium text-ink-muted">{month.join(" ")}</span>
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-ink">{toPersianDigits(exam.name)}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[12px] font-medium text-ink-subtle">
                      <span className={cn("size-1.5 shrink-0 rounded-full", open ? "bg-success" : "bg-ink-faint")} aria-hidden="true" />
                      <span className="truncate">
                        {open ? "ثبت نام باز" : `ثبت نام از ${toJalaliDate(exam.registerDate)}`}
                        {place ? ` · ${place}` : ""}
                      </span>
                    </p>
                  </div>

                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[12px] font-bold tabular-nums",
                      TONE_CLASS[countdownTone(daysLeft)],
                    )}
                  >
                    {daysLeft === 0 ? "امروز" : `${toPersianDigits(String(daysLeft))} روز`}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </section>
  );
}
