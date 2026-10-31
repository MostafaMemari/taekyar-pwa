import { PolarAngleAxis, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { BeltStrip } from "@/components/shared/taekyar-mark";
import { Card } from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { StatusBadge } from "@/features/coach/components/status-badge";
import type { StudentBeltAssignment } from "@/features/coach/lib/student-api";
import { beltKeyOf } from "@/features/coach/lib/students-options";
import { toPersianDigits } from "@/lib/digits";
import { toJalaliDate } from "@/lib/jalali";
import { ageFromIso, beltDotStyle, getStudentBeltMeta, nextStudentBelt } from "@/lib/student-belts";

const DAY_MS = 86_400_000;

const chartConfig = {
  elapsed: { color: "var(--primary)" },
  ready: { color: "var(--st-amber)" },
} satisfies ChartConfig;

export function StudentBeltPanel({ assignment, birthDate }: { assignment: StudentBeltAssignment | null; birthDate: string | null }) {
  if (!assignment) {
    return (
      <section>
        <SectionHeading title="کمربند و ارتقا" />
        <Card className="gap-0 p-4">
          <p className="text-[11px] leading-5 text-ink-subtle">هنوز کمربندی برای این هنرجو ثبت نشده است.</p>
        </Card>
      </section>
    );
  }

  const currentKey = beltKeyOf(assignment.belt.name);
  const belt = getStudentBeltMeta(currentKey);
  const nextKey = nextStudentBelt(currentKey, ageFromIso(birthDate));
  const nextMeta = nextKey ? getStudentBeltMeta(nextKey) : null;

  const nextDate = assignment.nextBeltDate;
  const nextMs = nextDate === null ? null : new Date(nextDate).getTime();
  const startMs = new Date(assignment.beltDate).getTime();
  const daysLeft = nextMs === null ? null : Math.ceil((nextMs - Date.now()) / DAY_MS);
  const windowDays = nextMs === null ? null : Math.max(1, Math.round((nextMs - startMs) / DAY_MS));
  const percent =
    nextMs === null || windowDays === null
      ? 0
      : Math.max(0, Math.min(100, Math.round(((Date.now() - startMs) / DAY_MS / windowDays) * 100)));
  const isDue = daysLeft !== null && daysLeft <= 0;

  return (
    <section>
      <SectionHeading
        title="کمربند و ارتقا"
        action={nextMeta ? <StatusBadge tone={isDue ? "warning" : "neutral"}>{isDue ? "قابل ارتقا" : "در مسیر"}</StatusBadge> : null}
      />

      <Card className="flex-row items-center gap-4 p-4">
        {nextMeta ? (
          <div className="relative size-24 shrink-0">
            <ChartContainer config={chartConfig} className="aspect-auto size-full">
              <RadialBarChart data={[{ percent }]} innerRadius="70%" outerRadius="100%" startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
                <PolarRadiusAxis tick={false} axisLine={false} />
                {/* recharts tweens the sector from a zero sweep, so the ring reads as empty until frames run */}
                <RadialBar
                  dataKey="percent"
                  cornerRadius={10}
                  background
                  isAnimationActive={false}
                  fill={isDue ? "var(--color-ready)" : "var(--color-elapsed)"}
                />
              </RadialBarChart>
            </ChartContainer>

            <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1">
              <b className="text-[16px] font-extrabold leading-none tabular-nums text-ink">
                {daysLeft === null ? "—" : toPersianDigits(String(Math.abs(daysLeft)))}
              </b>
              <span className="text-[10px] font-bold leading-none text-ink-subtle">
                {daysLeft === null ? "بدون موعد" : isDue ? "روز گذشته" : "روز مانده"}
              </span>
            </span>
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <BeltStrip
              color={belt.color}
              bottomColor={belt.bottomColor}
              outline={belt.outline}
              stripes={belt.stripeCount}
              className="w-20 max-w-full shrink-0"
            />
            <b className="truncate text-[13px] font-extrabold text-ink">{belt.label}</b>
          </div>
          <p className="mt-1.5 text-[11px] font-medium text-ink-subtle">دریافت {toJalaliDate(assignment.beltDate)}</p>

          {nextKey && nextMeta ? (
            <div className="mt-3 border-t border-[var(--line-2)] pt-3">
              <div className="flex items-center gap-2">
                <span className="size-3.5 shrink-0 rounded-full ring-2 ring-ink/15" style={beltDotStyle(nextKey)} aria-hidden="true" />
                <b className="truncate text-[13px] font-extrabold text-ink">{nextMeta.label}</b>
              </div>
              <p className="mt-1.5 text-[11px] font-medium text-ink-subtle">
                {nextDate === null ? "موعد کمربند بعدی هنوز محاسبه نشده است" : `از ${toJalaliDate(nextDate)} در دسترس است`}
              </p>
            </div>
          ) : (
            <p className="mt-1.5 text-[11px] font-medium text-ink-subtle">این هنرجو بالاترین کمربند را گرفته است.</p>
          )}
        </div>
      </Card>
    </section>
  );
}
