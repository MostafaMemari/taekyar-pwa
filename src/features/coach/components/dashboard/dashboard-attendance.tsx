"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { useCoachWeeklyAttendance } from "@/features/coach/hooks/use-attendance";
import { WEEK_DAY_META, type WeekDay } from "@/features/coach/lib/coach-data";
import { toPersianDigits } from "@/lib/digits";

function rate(present: number, total: number) {
  return total > 0 ? Math.round((present / total) * 100) : 0;
}

export function DashboardAttendance() {
  const { data, isLoading } = useCoachWeeklyAttendance();

  const hasRecords = data !== undefined && (data.thisWeek.total > 0 || data.lastWeek.total > 0);
  const average = data ? rate(data.thisWeek.present, data.thisWeek.total) : 0;
  const previousAverage = data ? rate(data.lastWeek.present, data.lastWeek.total) : 0;
  const comparable = data !== undefined && data.thisWeek.total > 0 && data.lastWeek.total > 0;
  const delta = average - previousAverage;
  const isUp = delta >= 0;

  return (
    <section>
      <SectionHeading title="حضور این هفته" />
      <Card className="gap-0 p-4">
        {isLoading && !data ? (
          <Skeleton className="h-28 rounded-xl" />
        ) : !hasRecords ? (
          <p className="py-6 text-center text-sm font-semibold text-ink-muted">در دو هفته اخیر حضور و غیابی ثبت نشده است.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
              <div className="flex items-baseline gap-2">
                <b className="text-2xl font-extrabold tabular-nums text-ink">{toPersianDigits(String(average))}٪</b>
                {comparable ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-ink">
                    {isUp ? (
                      <TrendingUp className="size-3.5 text-success" aria-hidden="true" />
                    ) : (
                      <TrendingDown className="size-3.5 text-danger" aria-hidden="true" />
                    )}
                    {isUp ? "+" : "−"}
                    {toPersianDigits(String(Math.abs(delta)))}٪ نسبت به هفته قبل
                  </span>
                ) : (
                  <span className="text-xs font-bold text-ink-muted"> بدون مقایسه با هفته قبل</span>
                )}
              </div>
              <span className="text-xs font-medium text-ink-muted">
                {toPersianDigits(`${data.thisWeek.present} حاضر از ${data.thisWeek.total} رکورد`)}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-3 text-xs font-medium text-ink-muted">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-brand-600" aria-hidden="true" />
                این هفته
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-ink-muted" aria-hidden="true" />
                هفته قبل
              </span>
            </div>

            <div aria-hidden="true" className="mt-3 grid h-28 grid-cols-7 gap-1.5 border-b border-ink-muted/50">
              {data.days.map((day) => (
                <div key={day.weekDay} className="flex items-end justify-center gap-1">
                  <span className="w-3 rounded-t-sm bg-brand-600" style={{ height: `${rate(day.present, day.total)}%` }} />
                  <span className="w-3 rounded-t-sm bg-ink-muted" style={{ height: `${rate(day.previousPresent, day.previousTotal)}%` }} />
                </div>
              ))}
            </div>

            <div className="mt-1.5 grid grid-cols-7 gap-1.5">
              {data.days.map((day) => (
                <div key={day.weekDay} className="flex flex-col items-center">
                  <b className="text-xs font-extrabold tabular-nums text-ink">
                    {day.total > 0 ? `${toPersianDigits(String(rate(day.present, day.total)))}٪` : "—"}
                  </b>
                  <span className="text-xs text-ink-muted">{WEEK_DAY_META[day.weekDay as WeekDay].label.slice(0, 1)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </section>
  );
}
