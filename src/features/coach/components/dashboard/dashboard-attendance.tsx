"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { Bar, BarChart, Cell, PolarAngleAxis, PolarRadiusAxis, RadialBar, RadialBarChart, XAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { useCoachWeeklyAttendance } from "@/features/coach/hooks/use-attendance";
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
      day: WEEK_DAY_META[day.weekDay as WeekDay].label.slice(0, 1),
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
          <Skeleton className="h-44 w-full" />
        ) : !hasRecords ? (
          <p className="py-4 text-center text-[12px] font-medium text-ink-subtle">در دو هفته اخیر حضور و غیابی ثبت نشده است.</p>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <div className="relative size-[84px] shrink-0" aria-hidden="true">
                <ChartContainer config={chartConfig} className="aspect-auto size-full">
                  <RadialBarChart
                    data={[{ percent: average }]}
                    innerRadius="76%"
                    outerRadius="100%"
                    startAngle={90}
                    endAngle={-270}
                    barSize={8}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
                    <PolarRadiusAxis tick={false} axisLine={false} />
                    <RadialBar
                      dataKey="percent"
                      cornerRadius={8}
                      background={{ fill: "var(--line-2)" }}
                      isAnimationActive={false}
                      fill="var(--color-percent)"
                    />
                  </RadialBarChart>
                </ChartContainer>
                <span className="absolute inset-0 grid place-items-center text-[17px] font-extrabold tabular-nums text-ink">
                  {toPersianDigits(String(average))}٪
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-ink">میانگین حضور این هفته</p>
                <p className="mt-1 text-[12px] font-medium tabular-nums text-ink-muted">
                  {toPersianDigits(String(data.thisWeek.present))} حاضر از {toPersianDigits(String(data.thisWeek.total))} رکورد
                </p>
                {comparable ? (
                  <p
                    className={cn(
                      "mt-1.5 flex items-center gap-1 text-[12px] font-semibold tabular-nums",
                      isUp ? "text-success" : "text-danger",
                    )}
                  >
                    {isUp ? (
                      <TrendingUp className="size-3.5" aria-hidden="true" />
                    ) : (
                      <TrendingDown className="size-3.5" aria-hidden="true" />
                    )}
                    {isUp ? "+" : "−"}
                    {toPersianDigits(String(Math.abs(delta)))}٪ نسبت به هفته قبل
                  </p>
                ) : (
                  <p className="mt-1.5 text-[12px] font-medium text-ink-subtle">مقایسه ای با هفته قبل نیست</p>
                )}
              </div>
            </div>

            <p className="sr-only">
              {days
                .map((day) => `${day.label} ${toPersianDigits(String(day.percent))} درصد از ${toPersianDigits(String(day.total))} رکورد`)
                .join("، ")}
            </p>

            <ChartContainer config={chartConfig} className="mt-3 h-[72px] w-full" aria-hidden="true">
              <BarChart data={days} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barCategoryGap="26%">
                <XAxis
                  dataKey="day"
                  reversed
                  tickLine={false}
                  axisLine={false}
                  tickMargin={6}
                  tick={{ fontSize: 12, fontWeight: 500 }}
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
                              {toPersianDigits(String(value))}٪ · {toPersianDigits(String(item?.payload?.present ?? 0))} از{" "}
                              {toPersianDigits(String(item?.payload?.total ?? 0))}
                            </span>
                          </span>
                        </>
                      )}
                    />
                  }
                />
                <Bar dataKey="percent" radius={[3, 3, 0, 0]} maxBarSize={16} fill="var(--color-percent)" isAnimationActive={false}>
                  {days.map((day) => (
                    <Cell
                      key={day.key}
                      fill={
                        day.total === 0
                          ? "var(--line-3)"
                          : day.isToday
                            ? "var(--color-percent)"
                            : "color-mix(in srgb, var(--ak-600) 22%, transparent)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </>
        )}
      </Card>
    </section>
  );
}
