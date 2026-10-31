"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { StatusBadge } from "@/features/coach/components/status-badge";
import { useBeltExams } from "@/features/coach/hooks/use-belt-exams";
import { toPersianDigits } from "@/lib/digits";
import { toJalaliDate, toJalaliDayMonth } from "@/lib/jalali";
import { cn } from "@/lib/utils";

export function DashboardExams() {
  const { data, isLoading } = useBeltExams();
  const today = new Date();
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
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        ) : exams.length === 0 ? (
          <p className="p-4 text-center text-sm font-semibold text-ink-muted">آزمون کمربندی پیش رو ثبت نشده است.</p>
        ) : (
          exams.map((exam, index) => {
            const [day, ...month] = toJalaliDayMonth(exam.eventDate).split(" ");
            const open = new Date(exam.registerDate) <= new Date();

            return (
              <div key={exam.id} className={cn("flex items-center gap-3 px-4 py-3", index > 0 && "border-t border-[var(--line-2)]")}>
                <span className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-muted py-1.5 text-ink">
                  <b className="text-base leading-5 font-extrabold tabular-nums">{day}</b>
                  <span className="text-xs font-medium">{month.join(" ")}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-5 font-bold text-ink">{exam.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <StatusBadge tone={open ? "success" : "neutral"} className="text-xs">
                      {open ? "در حال ثبت نام" : "به زودی"}
                    </StatusBadge>
                    <span className="text-xs text-ink-muted">
                      دوره {toPersianDigits(String(exam.examNumber))} ·{" "}
                      {open ? `ثبت نام تا ${toJalaliDate(exam.eventDate)}` : `ثبت نام از ${toJalaliDate(exam.registerDate)}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </Card>
    </section>
  );
}
