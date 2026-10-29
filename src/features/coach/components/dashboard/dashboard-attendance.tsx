import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { WEEKLY_ATTENDANCE, WEEKLY_TOTAL } from "@/features/coach/lib/coach-data";
import { toPersianDigits } from "@/lib/digits";

export function DashboardAttendance() {
  const average = Math.round((WEEKLY_TOTAL.present / WEEKLY_TOTAL.total) * 100);
  const previousAverage = Math.round((WEEKLY_TOTAL.previousPresent / WEEKLY_TOTAL.previousTotal) * 100);
  const delta = average - previousAverage;
  const isUp = delta >= 0;

  return (
    <section>
      <SectionHeading title="حضور این هفته" />
      <Card className="gap-0 p-4">
        <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
          <div className="flex items-baseline gap-2">
            <b className="text-2xl font-extrabold tabular-nums text-ink">{toPersianDigits(String(average))}٪</b>
            <span className="flex items-center gap-1 text-xs font-bold text-ink">
              {isUp ? (
                <TrendingUp className="size-3.5 text-success" aria-hidden="true" />
              ) : (
                <TrendingDown className="size-3.5 text-danger" aria-hidden="true" />
              )}
              {isUp ? "+" : "−"}
              {toPersianDigits(String(Math.abs(delta)))}٪ نسبت به هفته قبل
            </span>
          </div>
          <span className="text-xs font-medium text-ink-muted">
            {toPersianDigits(`${WEEKLY_TOTAL.present} حاضر از ${WEEKLY_TOTAL.total} رکورد`)}
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
          {WEEKLY_ATTENDANCE.map((item) => (
            <div key={item.day} className="flex items-end justify-center gap-1">
              <span className="w-3 rounded-t-sm bg-brand-600" style={{ height: `${item.value}%` }} />
              <span className="w-3 rounded-t-sm bg-ink-muted" style={{ height: `${item.previous}%` }} />
            </div>
          ))}
        </div>

        <div className="mt-1.5 grid grid-cols-7 gap-1.5">
          {WEEKLY_ATTENDANCE.map((item) => (
            <div key={item.day} className="flex flex-col items-center">
              <b className="text-xs font-extrabold tabular-nums text-ink">{toPersianDigits(String(item.value))}٪</b>
              <span className="text-xs text-ink-muted">{item.day}</span>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
