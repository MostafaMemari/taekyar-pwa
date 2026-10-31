import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { SectionHeading } from "@/features/coach/components/section-heading";
import type { StudentAttendanceEntry } from "@/features/coach/lib/attendance-api";
import { ATTENDANCE_META } from "@/features/coach/lib/coach-data";
import { toPersianDigits } from "@/lib/digits";
import { toJalaliMonth, toJalaliMonthName } from "@/lib/jalali";

const chartConfig = {
  present: { label: ATTENDANCE_META.PRESENT.label, color: ATTENDANCE_META.PRESENT.color },
  late: { label: ATTENDANCE_META.LATE.label, color: ATTENDANCE_META.LATE.color },
  excused: { label: ATTENDANCE_META.EXCUSED.label, color: ATTENDANCE_META.EXCUSED.color },
  absent: { label: ATTENDANCE_META.ABSENT.label, color: ATTENDANCE_META.ABSENT.color },
} satisfies ChartConfig;

const MONTHS_SHOWN = 6;

export function StudentAttendanceTrend({ records }: { records: StudentAttendanceEntry[] }) {
  const months = new Map<string, { month: string; present: number; late: number; excused: number; absent: number }>();

  for (const record of [...records].sort((a, b) => a.sessionDate.localeCompare(b.sessionDate))) {
    const key = toJalaliMonth(record.sessionDate);
    const bucket = months.get(key) ?? { month: toJalaliMonthName(record.sessionDate), present: 0, late: 0, excused: 0, absent: 0 };
    if (record.status === "PRESENT") bucket.present += 1;
    if (record.status === "LATE") bucket.late += 1;
    if (record.status === "EXCUSED") bucket.excused += 1;
    if (record.status === "ABSENT") bucket.absent += 1;
    months.set(key, bucket);
  }

  const data = [...months.values()].slice(-MONTHS_SHOWN);
  if (data.length === 0) return null;

  return (
    <section>
      <SectionHeading title="روند حضور و غیاب" action={<span className="text-[10px] font-bold text-ink-subtle">۶ ماه اخیر</span>} />
      <Card className="gap-0 p-4">
        <ChartContainer config={chartConfig} className="mx-auto h-44 w-full">
          <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="month"
              reversed
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              tick={{ fontSize: 10, fontWeight: 700 }}
              className="fill-muted-foreground"
            />
            <YAxis
              orientation="right"
              width={24}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tick={{ fontSize: 10, fontWeight: 700 }}
              tickFormatter={(value) => toPersianDigits(String(value))}
              className="fill-muted-foreground"
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name, item) => (
                    <>
                      <span className="size-2.5 shrink-0 rounded-[2px]" style={{ background: item?.color }} aria-hidden="true" />
                      <span className="flex flex-1 items-center justify-between gap-3 leading-none">
                        <span className="text-muted-foreground">
                          {chartConfig[name as keyof typeof chartConfig]?.label ?? String(name)}
                        </span>
                        <span className="font-medium tabular-nums text-foreground">{toPersianDigits(String(value))} جلسه</span>
                      </span>
                    </>
                  )}
                />
              }
            />
            <Bar dataKey="present" stackId="sessions" maxBarSize={40} fill="var(--color-present)" />
            <Bar dataKey="late" stackId="sessions" maxBarSize={40} fill="var(--color-late)" />
            <Bar dataKey="excused" stackId="sessions" maxBarSize={40} fill="var(--color-excused)" />
            <Bar dataKey="absent" stackId="sessions" maxBarSize={40} fill="var(--color-absent)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </Card>
    </section>
  );
}
