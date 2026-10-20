import { WEEKLY_ATTENDANCE, WEEKLY_TOTAL } from "@/components/coach/coach-data";
import { SectionHeading, StatusBadge } from "@/components/coach/coach-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

export function DashboardAttendance() {
  return (
    <section>
      <SectionHeading title="حضور این هفته" action={<StatusBadge tone="neutral">میانگین ۸۷٪</StatusBadge>} className="mb-2" />
      <Card className="gap-0 p-4">
        <div role="img" aria-label="نمودار حضور هنرجویان از شنبه تا جمعه، میانگین ۸۷ درصد" className="relative h-[122px]">
          <div className="pointer-events-none absolute inset-x-1 top-0 h-[96px]">
            <div className="absolute inset-x-0 top-0 border-t border-dashed border-border" />
            <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-border" />
            <div className="absolute inset-x-0 bottom-0 border-t border-border" />
          </div>

          <div className="absolute inset-x-1 top-0 flex h-[96px] items-end gap-2">
            {WEEKLY_ATTENDANCE.map((item, index) => (
              <div key={item.day} className="relative flex h-full flex-1 items-end justify-center">
                <div
                  className={cn("w-[22px] rounded-lg", index === 0 ? "bg-gradient-to-t from-brand-600 to-brand-500" : "bg-brand-600/20")}
                  style={{ height: `${item.value}%` }}
                  title={`${item.day}: ${toPersianDigits(String(item.value))} درصد`}
                />
                {index === 0 || index === 5 ? (
                  <span
                    className={cn("absolute text-[9px] font-extrabold", index === 0 ? "text-accent-ink" : "text-ink-subtle")}
                    style={{ bottom: `calc(${item.value}% + 4px)` }}
                  >
                    {toPersianDigits(String(item.value))}
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          <div className="absolute inset-x-1 bottom-0 flex gap-2">
            {WEEKLY_ATTENDANCE.map((item) => (
              <span key={item.day} className="flex-1 text-center text-[9.5px] font-bold text-ink-subtle">
                {item.day}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-[var(--line-2)] pt-2.5">
          <span className="text-[10px] font-bold text-ink-subtle">
            {toPersianDigits(`${WEEKLY_TOTAL.present} حضور ثبت شده از ${WEEKLY_TOTAL.total} رکورد`)}
          </span>
          <Button variant="link" size="sm" className="h-auto p-0 text-[10px] font-extrabold text-accent-ink">
            گزارش کامل
          </Button>
        </div>
      </Card>
    </section>
  );
}
