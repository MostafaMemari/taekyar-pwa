"use client";

import { Ruler, Scale } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
  height: { label: "قد", color: "var(--chart-1)" },
  weight: { label: "وزن", color: "var(--chart-3)" },
} satisfies ChartConfig;

const tickFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { day: "numeric", month: "numeric" });

type MetricPoint = { label: string; height: number; weight: number };

function chartDataOf(metrics: StudentMetricRecord[]): MetricPoint[] {
  return metrics.map((metric) => ({
    label: tickFormatter.format(new Date(metric.recordedAt)),
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
        {latest ? (
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2.5 rounded-xl bg-muted/60 px-3 py-2.5">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: "var(--color-height)" }} aria-hidden="true" />
              <div className="min-w-0">
                <span className="block text-[11px] font-medium text-ink-subtle">قد</span>
                <b className="block truncate text-[13px] font-extrabold text-ink">
                  {toPersianDigits(String(Number(latest.height)))} سانتی متر
                </b>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-muted/60 px-3 py-2.5">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: "var(--color-weight)" }} aria-hidden="true" />
              <div className="min-w-0">
                <span className="block text-[11px] font-medium text-ink-subtle">وزن</span>
                <b className="block truncate text-[13px] font-extrabold text-ink">
                  {toPersianDigits(String(Number(latest.weight)))} کیلوگرم
                </b>
              </div>
            </div>
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
            <AreaChart data={trend} margin={{ top: 12, right: 16, left: 16, bottom: 4 }}>
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
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="label"
                reversed
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
                cursor={{ strokeDasharray: "3 3" }}
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
              <Area
                yAxisId="height"
                dataKey="height"
                type="monotone"
                stroke="var(--color-height)"
                strokeWidth={2.5}
                fill="url(#metricsHeightFill)"
                dot={{ r: 3, strokeWidth: 2, stroke: "var(--card)" }}
                activeDot={{ r: 4.5, strokeWidth: 2, stroke: "var(--card)" }}
              />
              <Area
                yAxisId="weight"
                dataKey="weight"
                type="monotone"
                stroke="var(--color-weight)"
                strokeWidth={2.5}
                fill="url(#metricsWeightFill)"
                dot={{ r: 3, strokeWidth: 2, stroke: "var(--card)" }}
                activeDot={{ r: 4.5, strokeWidth: 2, stroke: "var(--card)" }}
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
