"use client";

import { CalendarDays, MapPin } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { StatusBadge } from "@/features/coach/components/status-badge";
import { useBeltExams } from "@/features/coach/hooks/use-belt-exams";
import { examFillPercent } from "@/features/coach/lib/exam-api";
import { toPersianDigits } from "@/lib/digits";
import { durationLabel, toJalaliDate, toJalaliDayMonth } from "@/lib/jalali";
import { cn } from "@/lib/utils";

const DAY_MS = 86_400_000;

function countdownTone(days: number): "danger" | "warning" | "neutral" {
  return days <= 7 ? "danger" : days <= 30 ? "warning" : "neutral";
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
          <p className="px-4 py-6 text-center text-[12px] font-medium text-ink-subtle">آزمون کمربندی پیش رو ثبت نشده است</p>
        ) : (
          <ul>
            {exams.map((exam, index) => {
              const [day, ...month] = toJalaliDayMonth(exam.eventDate).split(" ");
              // registerDate is the registration deadline; a past deadline on an upcoming exam closes it.
              const registerOpen = new Date(exam.registerDate) >= today;
              const eventDay = new Date(exam.eventDate);
              eventDay.setHours(0, 0, 0, 0);
              const daysLeft = Math.max(0, Math.round((eventDay.getTime() - today.getTime()) / DAY_MS));
              const places = exam.eventPlaces.join(" · ");

              return (
                <li key={exam.id} className={cn("flex items-center gap-3 px-4 py-3", index > 0 && "border-t border-[var(--line-2)]")}>
                  {/* A fixed 1:1 square tile, centred vertically in the row. */}
                  <span className="flex size-14 shrink-0 flex-col items-center justify-center rounded-[10px] bg-muted">
                    <b className="text-[15px] leading-5 font-extrabold tabular-nums text-ink">{day}</b>
                    <span className="text-[12px] leading-4 font-medium text-ink-muted">{month.join(" ")}</span>
                  </span>

                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-bold text-ink">{toPersianDigits(exam.name)}</p>
                        <p className="mt-0.5 flex items-center gap-2.5 text-[12px] font-medium text-ink-subtle">
                          <span className="flex shrink-0 items-center gap-1">
                            <CalendarDays className="size-3.5" aria-hidden="true" />
                            {registerOpen ? `ثبت نام تا ${toJalaliDate(exam.registerDate)}` : "پایان ثبت نام"}
                          </span>
                          {places ? (
                            <span className="flex min-w-0 items-center gap-1 truncate">
                              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                              <span className="truncate">{places}</span>
                            </span>
                          ) : null}
                        </p>
                      </div>

                      {/* Natural width; its left edge sits flush over the bar's left edge below. */}
                      <StatusBadge tone={countdownTone(daysLeft)} className="shrink-0 tabular-nums">
                        {daysLeft === 0 ? "امروز" : durationLabel(today, eventDay)}
                      </StatusBadge>
                    </div>

                    {/* Spans the whole column, so its left edge lines up flush with the chip's left edge. */}
                    <div className="h-2 overflow-hidden rounded-full bg-[var(--line-2)]">
                      <div
                        className="bar-fill block h-full w-full rounded-full transition-[clip-path] duration-500 motion-safe:animate-[bar-reveal_900ms_cubic-bezier(0.22,1,0.36,1)]"
                        style={{
                          clipPath: `inset(0 ${100 - Math.max(1, examFillPercent(exam))}% 0 0)`,
                          backgroundColor: daysLeft <= 7 ? "var(--st-red)" : daysLeft <= 30 ? "var(--st-orange)" : "var(--st-green)",
                        }}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </section>
  );
}
