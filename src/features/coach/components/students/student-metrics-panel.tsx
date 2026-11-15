"use client";

import { Ruler, Scale } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import { AuthField } from "@/components/shared/auth-field";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { AuthInput } from "@/components/shared/auth-input";
import { SheetActions } from "@/components/shared/sheet-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { useStudentMetrics } from "@/features/coach/hooks/use-student-metrics";
import { useAddStudentMetrics } from "@/features/coach/hooks/use-student-mutations";
import type { StudentMetricRecord } from "@/features/coach/lib/student-api";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { digitsOnly, toPersianDigits } from "@/lib/digits";

const chartConfig = {
  height: { label: "قد", color: "var(--ak-600)" },
  weight: { label: "وزن", color: "var(--ak-400)" },
} satisfies ChartConfig;

const tickFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { day: "2-digit", month: "2-digit" });
const timeFormatter = new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });

type MetricPoint = { label: string; height: number; weight: number };

function chartDataOf(metrics: StudentMetricRecord[]): MetricPoint[] {
  // Recharts axis tooltips look up the record by its label, so records sharing a date need unique labels.
  const dates = metrics.map((metric) => tickFormatter.format(new Date(metric.recordedAt)));
  const shared = new Set(dates.filter((date, index) => dates.indexOf(date) !== index));
  return metrics.map((metric, index) => ({
    label: shared.has(dates[index]) ? `${dates[index]} · ${timeFormatter.format(new Date(metric.recordedAt))}` : dates[index],
    height: Number(metric.height),
    weight: Number(metric.weight),
  }));
}

export function StudentMetricsPanel({ studentId }: { studentId: string }) {
  const router = useRouter();
  const metrics = useStudentMetrics(studentId);
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [heightError, setHeightError] = useState("");
  const [weightError, setWeightError] = useState("");
  const [saved, setSaved] = useState(false);
  const add = useAddStudentMetrics();

  const openForm = () => {
    setHeight("");
    setWeight("");
    setHeightError("");
    setWeightError("");
    setSaved(false);
    setOpen(true);
  };

  const submit = async () => {
    const heightProblem =
      height === "" ? "قد را وارد کنید." : Number(height) < 50 || Number(height) > 260 ? "قد باید بین ۵۰ تا ۲۶۰ سانتی متر باشد." : "";
    const weightProblem =
      weight === "" ? "وزن را وارد کنید." : Number(weight) < 10 || Number(weight) > 300 ? "وزن باید بین ۱۰ تا ۳۰۰ کیلوگرم باشد." : "";
    setHeightError(heightProblem);
    setWeightError(weightProblem);
    if (heightProblem || weightProblem) return;

    try {
      await add.trigger({ id: studentId, height: Number(height), weight: Number(weight) });
      setOpen(false);
      setSaved(true);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) router.replace("/login");
    }
  };

  const records = metrics.data;
  const latest = records && records.length > 0 ? records[records.length - 1] : null;
  const trend = records && records.length > 1 ? chartDataOf(records) : null;

  return (
    <section>
      <SectionHeading title="قد و وزن" />

      <Card className="gap-0 p-4">
        {latest && records ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { label: "قد", color: "var(--color-height)", unit: "سانتی متر", from: records[0].height, to: latest.height },
                { label: "وزن", color: "var(--color-weight)", unit: "کیلوگرم", from: records[0].weight, to: latest.weight },
              ] as const
            ).map((series) => (
              <span
                key={series.label}
                className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-[11px] font-bold text-ink"
              >
                <span className="size-2 rounded-full" style={{ background: series.color }} aria-hidden="true" />
                {series.label}
                <span className="tabular-nums">
                  {records.length > 1 ? (
                    <>
                      {toPersianDigits(String(Number(series.from)))} <span className="text-ink-subtle">←</span>{" "}
                    </>
                  ) : null}
                  {toPersianDigits(String(Number(series.to)))}
                </span>
                <span className="font-medium text-ink-subtle">{series.unit}</span>
              </span>
            ))}
          </div>
        ) : null}

        {metrics.error ? (
          <p className="mt-2 text-[12px] font-bold leading-5 text-danger">{apiErrorMessage(metrics.error)}</p>
        ) : !records ? (
          <output
            className={latest ? "mt-3 flex flex-col gap-2" : "flex flex-col gap-2"}
            aria-busy="true"
            aria-label="در حال بارگذاری اندازه گیری ها"
          >
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-44 w-full rounded-xl" />
          </output>
        ) : trend ? (
          <ChartContainer config={chartConfig} className="mx-auto mt-3 h-44 w-full">
            <AreaChart data={trend} accessibilityLayer={false} margin={{ top: 12, right: 16, left: 16, bottom: 4 }}>
              <defs>
                <linearGradient id="metricsHeightFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-height)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-height)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="metricsWeightFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-weight)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-weight)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tickFormatter={(label) => label.split(" · ")[0]}
                padding={{ left: 24, right: 24 }}
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                tick={{ fontSize: 10, fontWeight: 700 }}
                className="fill-muted-foreground"
              />
              <YAxis
                yAxisId="height"
                orientation="right"
                width={30}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                domain={["dataMin - 6", "dataMax + 6"]}
                tick={{ fontSize: 10, fontWeight: 700 }}
                tickFormatter={(value) => toPersianDigits(String(value))}
                className="fill-muted-foreground"
              />
              <YAxis
                yAxisId="weight"
                orientation="left"
                width={30}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                domain={["dataMin - 6", "dataMax + 6"]}
                tick={{ fontSize: 10, fontWeight: 700 }}
                tickFormatter={(value) => toPersianDigits(String(value))}
                className="fill-muted-foreground"
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <>
                        <span
                          className="size-2.5 shrink-0 rounded-[2px]"
                          style={{ background: `var(--color-${String(name)})` }}
                          aria-hidden="true"
                        />
                        <span className="flex flex-1 items-center justify-between gap-3 leading-none">
                          <span className="text-muted-foreground">
                            {chartConfig[name as keyof typeof chartConfig]?.label ?? String(name)}
                          </span>
                          <span className="font-medium tabular-nums text-foreground">
                            {toPersianDigits(String(value))} {name === "height" ? "سانتی متر" : "کیلوگرم"}
                          </span>
                        </span>
                      </>
                    )}
                  />
                }
              />
              {/* Area svg props (stroke, strokeWidth, fillOpacity) leak into dot objects — set them explicitly so dots stay small and solid. */}
              <Area
                yAxisId="height"
                dataKey="height"
                type="monotone"
                stroke="var(--color-height)"
                strokeWidth={2.5}
                fill="url(#metricsHeightFill)"
                dot={{ r: 4, fill: "var(--color-height)", fillOpacity: 1, stroke: "none" }}
                activeDot={{ r: 5.5, fill: "var(--color-height)", fillOpacity: 1, stroke: "none" }}
              />
              <Area
                yAxisId="weight"
                dataKey="weight"
                type="monotone"
                stroke="var(--color-weight)"
                strokeWidth={2.5}
                fill="url(#metricsWeightFill)"
                dot={{ r: 4, fill: "var(--color-weight)", fillOpacity: 1, stroke: "none" }}
                activeDot={{ r: 5.5, fill: "var(--color-weight)", fillOpacity: 1, stroke: "none" }}
              />
            </AreaChart>
          </ChartContainer>
        ) : latest ? (
          <p className="mt-2 text-[12px] font-medium leading-5 text-ink-subtle">
            با ثبت اندازه گیری های بعدی، روند قد و وزن اینجا رسم می شود
          </p>
        ) : (
          <p className="rounded-xl bg-muted/60 p-3 text-center text-[12px] font-semibold leading-5 text-ink-subtle">
            هنوز اندازه گیری ای برای این هنرجو ثبت نشده است
          </p>
        )}

        {saved ? <p className="mt-2 text-[12px] font-bold text-success">اندازه گیری جدید ثبت شد</p> : null}

        <Button type="button" variant="outline" className="mt-3 h-11 w-full rounded-xl text-[12px] font-bold" onClick={openForm}>
          ثبت اندازه گیری
        </Button>
      </Card>

      <SheetFrame
        open={open}
        onOpenChange={setOpen}
        title="ثبت اندازه گیری"
        description="قد و وزن جدید به سابقه اندازه گیری ها اضافه می شود"
      >
        <div className="grid grid-cols-2 gap-3">
          <AuthField label="قد (سانتی متر)" htmlFor="metricHeight" required error={heightError}>
            <AuthInput
              id="metricHeight"
              dir="ltr"
              inputMode="numeric"
              maxLength={3}
              icon={Ruler}
              placeholder={toPersianDigits("170")}
              value={toPersianDigits(height)}
              onChange={(event) => {
                setHeight(digitsOnly(event.target.value, 3));
                setHeightError("");
              }}
            />
          </AuthField>

          <AuthField label="وزن (کیلوگرم)" htmlFor="metricWeight" required error={weightError}>
            <AuthInput
              id="metricWeight"
              dir="ltr"
              inputMode="numeric"
              maxLength={3}
              icon={Scale}
              placeholder={toPersianDigits("60")}
              value={toPersianDigits(weight)}
              onChange={(event) => {
                setWeight(digitsOnly(event.target.value, 3));
                setWeightError("");
              }}
            />
          </AuthField>
        </div>

        <AuthFormError message={add.error ? apiErrorMessage(add.error) : ""} />

        <SheetActions onSecondary={() => setOpen(false)}>
          <Button
            variant="brand"
            className="h-11 flex-[2] rounded-xl text-[12px] font-bold"
            disabled={add.isMutating}
            onClick={() => void submit()}
          >
            {add.isMutating ? "در حال ثبت..." : "ثبت اندازه گیری"}
          </Button>
        </SheetActions>
      </SheetFrame>
    </section>
  );
}
