"use client";

import { CalendarDays, MapPin } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
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

function ExamRowSkeleton() {
  return (
    <div className="flex items-start gap-3">
      <Skeleton className="size-14 shrink-0 rounded-[10px]" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1.5">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
        </div>
        <Skeleton className="mt-2 h-3 w-3/5" />
        <Skeleton className="mt-2.5 h-2 w-full rounded-full" />
      </div>
    </div>
  );
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
      <SectionHeading
        title="آزمون های پیش رو"
        action={exams.length > 0 ? <StatusBadge tone="brand">{toPersianDigits(String(exams.length))} آزمون</StatusBadge> : null}
      />
      <Card className="gap-0 p-0">
        {isLoading && !data ? (
          <div className="flex flex-col gap-3 p-4">
            <ExamRowSkeleton />
            <ExamRowSkeleton />
          </div>
        ) : exams.length === 0 ? (
          <Empty className="min-h-[35dvh] border-none bg-transparent p-4">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="size-14 rounded-2xl bg-brand-50 text-accent-ink">
                <CalendarDays aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle className="text-[14px] font-extrabold text-ink">آزمون کمربندی پیش رو ثبت نشده است</EmptyTitle>
              <EmptyDescription className="text-[12px] leading-5 text-ink-subtle">
                آزمون هایی که اعلام شوند با شمارش معکوس اینجا می آیند
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
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
                    <div>
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <p className="min-w-0 truncate text-[13px] font-bold text-ink">{toPersianDigits(exam.name)}</p>
                          <span className="shrink-0 text-[11px] font-semibold text-ink-subtle tabular-nums">
                            دوره {toPersianDigits(String(exam.examNumber))}
                          </span>
                        </div>

                        {/* Natural width; its left edge sits flush over the bar's left edge below. */}
                        <StatusBadge tone={countdownTone(daysLeft)} className="shrink-0 px-1.5 py-[3px] text-[11px] tabular-nums">
                          {daysLeft === 0 ? "امروز" : durationLabel(today, eventDay)}
                        </StatusBadge>
                      </div>

                      <p className="mt-1.5 flex items-center gap-2.5 text-[12px] font-medium text-ink-subtle">
                        <span className="flex shrink-0 items-center gap-1">
                          <CalendarDays className="size-3.5" aria-hidden="true" />
                          {registerOpen ? `ثبت نام تا ${toJalaliDate(exam.registerDate)}` : "پایان ثبت نام"}
                        </span>
                        {places ? (
                          <span className="ms-auto flex min-w-0 items-center gap-1 truncate">
                            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                            <span className="truncate">{places}</span>
                          </span>
                        ) : null}
                      </p>
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
