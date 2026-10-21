import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { SectionHeading, StatusBadge } from "@/components/coach/coach-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WEEKLY_ATTENDANCE, WEEKLY_TOTAL } from "@/lib/coach/coach-data";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

export function DashboardAttendance() {
  const average = Math.round((WEEKLY_TOTAL.present / WEEKLY_TOTAL.total) * 100);
  const previousAverage = Math.round((WEEKLY_TOTAL.previousPresent / WEEKLY_TOTAL.previousTotal) * 100);
  const delta = average - previousAverage;
  const sign = delta >= 0 ? "+" : "−";
  const strongDays = WEEKLY_ATTENDANCE.filter((item) => item.value >= 80).length;

  return (
    <section>
      <SectionHeading
        title="حضور این هفته"
        action={
          <StatusBadge tone={delta >= 0 ? "success" : "danger"} className="gap-1">
            <TrendingUp className="size-3" aria-hidden="true" />
            {toPersianDigits(String(Math.abs(delta)))}٪ {sign === "+" ? "بیشتر" : "کمتر"}
          </StatusBadge>
        }
      />
      <Card className="gap-0 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-ink-subtle">میانگین حضور</span>
            <div className="mt-1 flex items-baseline gap-2">
              <b className="text-[28px] font-extrabold leading-none tabular-nums text-ink">{toPersianDigits(String(average))}٪</b>
              <span className={cn("text-[10px] font-extrabold", delta >= 0 ? "text-success" : "text-danger")}>
                {sign}
                {toPersianDigits(String(Math.abs(delta)))}٪
              </span>
            </div>
            <span className="mt-1.5 block text-[10px] font-medium text-ink-subtle">
              {toPersianDigits(`${WEEKLY_TOTAL.present} حاضر از ${WEEKLY_TOTAL.total} رکورد`)}
            </span>
          </div>

          <div className="flex flex-col items-end gap-1.5 pt-0.5 text-[9px] font-bold text-ink-subtle">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-brand-500" aria-hidden="true" />
              این هفته
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-border" aria-hidden="true" />
              هفته قبل
            </span>
            <span className="flex items-center gap-1">
              <span className="h-0 w-4 border-t border-dashed border-brand-400/70" aria-hidden="true" />
              هدف ۹۰٪
            </span>
          </div>
        </div>

        <div
          role="img"
          aria-label={`حضور روزانه این هفته در برابر هفته قبل، میانگین ${toPersianDigits(String(average))} درصد`}
          className="relative mt-5 h-[124px]"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[100px]">
            <div className="absolute inset-x-0 top-0 border-t border-dashed border-border" />
            <div className="absolute inset-x-0 top-[10%] border-t border-dashed border-brand-400/50" />
            <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-border/70" />
            <div className="absolute inset-x-0 bottom-0 border-t border-border" />
          </div>

          <div className="absolute inset-x-0 top-0 flex h-[100px] items-end gap-1.5">
            {WEEKLY_ATTENDANCE.map((item, index) => (
              <div key={item.day} className="relative flex h-full flex-1 items-end justify-center gap-[3px]">
                <span
                  className="w-[10px] rounded-t-full bg-border/70"
                  style={{ height: `${item.previous}%` }}
                  title={`${item.day} هفته قبل: ${toPersianDigits(String(item.previous))} درصد`}
                />
                <span
                  className={cn(
                    "w-[13px] rounded-t-full bg-gradient-to-t",
                    index === 0 ? "from-brand-600 to-brand-400" : "from-brand-600 to-brand-500",
                  )}
                  style={{ height: `${item.value}%` }}
                  title={`${item.day} این هفته: ${toPersianDigits(String(item.value))} درصد`}
                />
              </div>
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-0 flex gap-1.5">
            {WEEKLY_ATTENDANCE.map((item, index) => (
              <span key={item.day} className="flex flex-1 flex-col items-center gap-0.5">
                <span className={cn("text-[9.5px] font-extrabold leading-3", index === 0 ? "text-accent-ink" : "text-ink-subtle")}>
                  {item.day}
                </span>
                <span className="text-[8.5px] font-medium leading-3 tabular-nums text-ink-subtle">
                  {toPersianDigits(String(item.value))}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-[var(--line-2)] pt-2.5">
          <span className="text-[10px] font-bold text-ink-subtle">{toPersianDigits(String(strongDays))} روز بالای ۸۰٪ حضور</span>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-[10px] font-extrabold text-accent-ink"
            render={<Link href="/coach/sessions" />}
            nativeButton={false}
          >
            گزارش کامل
          </Button>
        </div>
      </Card>
    </section>
  );
}
