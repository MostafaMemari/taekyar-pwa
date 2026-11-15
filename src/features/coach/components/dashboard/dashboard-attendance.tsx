"use client";

import { ChevronLeft, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { useAbsentStudents, useCoachWeeklyAttendance } from "@/features/coach/hooks/use-attendance";
import { todayWeekDay, WEEK_DAY_META, type WeekDay } from "@/features/coach/lib/coach-data";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

const chartConfig = {
  percent: { label: "حضور", color: "var(--ak-600)" },
} satisfies ChartConfig;

function rate(present: number, total: number) {
  return total > 0 ? Math.round((present / total) * 100) : 0;
}

export function DashboardAttendance() {
  const { data, isLoading } = useCoachWeeklyAttendance();
  const { data: absentees } = useAbsentStudents({ minAbsences: 2 });
  const today = todayWeekDay();

  const hasRecords = data !== undefined && (data.thisWeek.total > 0 || data.lastWeek.total > 0);
  const average = data ? rate(data.thisWeek.present, data.thisWeek.total) : 0;
  const previousAverage = data ? rate(data.lastWeek.present, data.lastWeek.total) : 0;
  const comparable = data !== undefined && data.thisWeek.total > 0 && data.lastWeek.total > 0;
  const delta = average - previousAverage;
  const isUp = delta >= 0;

  const days =
    data?.days.map((day) => ({
      key: day.weekDay,
      label: WEEK_DAY_META[day.weekDay as WeekDay].label,
      percent: rate(day.present, day.total),
      present: day.present,
      total: day.total,
      isToday: day.weekDay === today,
    })) ?? [];

  return (
    <section>
      <SectionHeading title="حضور این هفته" action={<span className="text-[12px] font-medium text-ink-subtle">۷ روز اخیر</span>} />
      <Card className="gap-0 p-4">
        {isLoading && !data ? (
          <Skeleton className="h-52 w-full" />
        ) : !hasRecords ? (
          <p className="py-4 text-center text-[12px] font-medium text-ink-subtle">در دو هفته اخیر حضور و غیابی ثبت نشده است</p>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <b className="text-[26px] font-extrabold leading-8 tabular-nums text-ink">{toPersianDigits(String(average))}٪</b>
                <span className="min-w-0">
                  <span className="block text-[12px] font-semibold text-ink">میانگین حضور این هفته</span>
                  {comparable ? (
                    <span
                      className={cn(
                        "mt-0.5 flex items-center gap-1 text-[11px] font-semibold tabular-nums",
                        isUp ? "text-success" : "text-danger",
                      )}
                    >
                      {isUp ? <TrendingUp className="size-3" aria-hidden="true" /> : <TrendingDown className="size-3" aria-hidden="true" />}
                      {isUp ? "+" : "−"}
                      {toPersianDigits(String(Math.abs(delta)))}٪ نسبت به هفته قبل
                    </span>
                  ) : null}
                </span>
              </div>
              <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold tabular-nums text-ink-muted">
                {toPersianDigits(String(data.thisWeek.present))} از {toPersianDigits(String(data.thisWeek.total))} ثبت
              </span>
            </div>

            <p className="sr-only">
              {days
                .map((day) => `${day.label} ${toPersianDigits(String(day.present))} حضور از ${toPersianDigits(String(day.total))}`)
                .join("، ")}
            </p>

            <ChartContainer config={chartConfig} className="mt-4 aspect-auto h-36 w-full" aria-hidden="true">
              <BarChart data={days} accessibilityLayer={false} margin={{ top: 12, right: 0, left: 0, bottom: 0 }} barCategoryGap="28%">
                <defs>
                  <linearGradient id="attendanceBarToday" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-percent)" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="var(--color-percent)" stopOpacity={0.5} />
                  </linearGradient>
                  <linearGradient id="attendanceBarRest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-percent)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-percent)" stopOpacity={0.16} />
                  </linearGradient>
                </defs>
                <YAxis hide domain={[0, 100]} />
                <XAxis
                  dataKey="label"
                  reversed
                  interval={0}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 10, fontWeight: 600 }}
                  className="fill-ink-subtle"
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.label ?? ""}
                      formatter={(value, _name, item) => (
                        <>
                          <span className="size-2.5 shrink-0 rounded-[3px] bg-brand-600" aria-hidden="true" />
                          <span className="flex flex-1 items-center justify-between gap-3 leading-none">
                            <span className="text-muted-foreground">حضور</span>
                            <span className="font-medium tabular-nums text-foreground">
                              {toPersianDigits(String(item?.payload?.present ?? 0))} از {toPersianDigits(String(item?.payload?.total ?? 0))}
                              {item?.payload?.total === 0 ? "" : ` · ${toPersianDigits(String(value))}٪`}
                            </span>
                          </span>
                        </>
                      )}
                    />
                  }
                />
                <Bar dataKey="percent" radius={[8, 8, 0, 0]} maxBarSize={20} isAnimationActive={false}>
                  {days.map((day) => (
                    <Cell
                      key={day.key}
                      fill={day.total === 0 ? "transparent" : day.isToday ? "url(#attendanceBarToday)" : "url(#attendanceBarRest)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>

            {absentees && absentees.length > 0 ? (
              <Link
                href="/coach/students/absences"
                className="-mx-4 -mb-4 mt-4 flex items-center justify-between gap-2 border-t border-[var(--line-2)] bg-muted/40 px-4 py-2.5 transition-colors active:bg-muted/60"
              >
                <span className="min-w-0 truncate text-[12px] font-semibold text-ink-muted">
                  غیبت ها:{" "}
                  {absentees
                    .slice(0, 3)
                    .map((student) => `${student.fullName} (${toPersianDigits(String(student.absentCount))})`)
                    .join(" · ")}
                </span>
                <span className="flex shrink-0 items-center gap-0.5 text-[12px] font-bold text-accent-ink">
                  مشاهده همه
                  <ChevronLeft className="size-3.5" aria-hidden="true" />
                </span>
              </Link>
            ) : null}
          </>
        )}
      </Card>
    </section>
  );
}
