import { BeltStrip } from "@/components/shared/taekyar-mark";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { StatusBadge } from "@/features/coach/components/status-badge";
import type { StudentBeltAssignment } from "@/features/coach/lib/student-api";
import { beltKeyOf } from "@/features/coach/lib/students-options";
import { toPersianDigits } from "@/lib/digits";
import { toJalaliDate } from "@/lib/jalali";
import { ageFromIso, beltDotStyle, getStudentBeltMeta, nextStudentBelt } from "@/lib/student-belts";

const DAY_MS = 86_400_000;

// Calendar-exact breakdown so 112 days reads like «۳ ماه و ۲۲ روز», borrowing month lengths as it goes.
function durationLabel(from: Date, to: Date): string {
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();

  if (days < 0) {
    months -= 1;
    days += new Date(to.getFullYear(), to.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const parts: string[] = [];
  if (years > 0) parts.push(`${toPersianDigits(String(years))} سال`);
  if (months > 0) parts.push(`${toPersianDigits(String(months))} ماه`);
  if (days > 0 || parts.length === 0) parts.push(`${toPersianDigits(String(days))} روز`);
  return parts.join(" و ");
}

export function StudentBeltPanel({ assignment, birthDate }: { assignment: StudentBeltAssignment | null; birthDate: string | null }) {
  if (!assignment) {
    return (
      <section>
        <SectionHeading title="کمربند و ارتقا" />
        <Card className="gap-0 p-4">
          <p className="text-[12px] leading-5 text-ink-subtle">هنوز کمربندی برای این هنرجو ثبت نشده است.</p>
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
  const today = new Date();
  const target = nextDate === null ? null : new Date(`${nextDate.slice(0, 10)}T00:00:00`);

  return (
    <section>
      <SectionHeading
        title="کمربند و ارتقا"
        action={nextMeta ? <StatusBadge tone={isDue ? "success" : "neutral"}>{isDue ? "قابل ارتقا" : "در مسیر"}</StatusBadge> : null}
      />

      <Card className="gap-0 p-4">
        <div className="flex items-center gap-3">
          <BeltStrip
            color={belt.color}
            bottomColor={belt.bottomColor}
            outline={belt.outline}
            stripes={belt.stripeCount}
            className="w-24 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <span className="block text-[12px] font-medium text-ink-muted">کمربند فعلی</span>
            <p className="mt-0.5 text-[15px] font-extrabold text-ink">{belt.label}</p>
            <p className="mt-0.5 text-[12px] font-medium text-ink-subtle">دریافت {toJalaliDate(assignment.beltDate)}</p>
          </div>
        </div>

        {nextKey && nextMeta ? (
          <div className="mt-4 border-t border-[var(--line-2)] pt-3">
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2">
                <span className="size-2.5 shrink-0 rounded-full ring-2 ring-ink/10" style={beltDotStyle(nextKey)} aria-hidden="true" />
                <b className="truncate text-[13px] font-bold text-ink">{nextMeta.label}</b>
                <span className="shrink-0 text-[12px] font-medium text-ink-subtle">کمربند بعدی</span>
              </span>
              <span
                className={isDue ? "shrink-0 text-[12px] font-semibold text-danger" : "shrink-0 text-[12px] font-semibold text-ink-muted"}
              >
                {target === null ? "بدون موعد" : isDue ? `${durationLabel(target, today)} گذشته` : `${durationLabel(today, target)} مانده`}
              </span>
            </div>

            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-[var(--line-2)]">
              <div
                className="h-full w-full origin-left rounded-full transition-transform duration-500"
                style={{
                  transform: `scaleX(${percent / 100})`,
                  background: isDue || percent >= 80 ? "var(--st-green)" : percent >= 50 ? "var(--st-amber)" : "var(--st-red)",
                }}
              />
            </div>

            <p className="mt-2 text-[12px] font-medium text-ink-subtle">
              {nextDate === null
                ? "موعد کمربند بعدی هنوز محاسبه نشده است"
                : isDue
                  ? `موعد از ${toJalaliDate(nextDate)} گذشته است`
                  : `از ${toJalaliDate(nextDate)} در دسترس است`}
            </p>
          </div>
        ) : (
          <p className="mt-3 border-t border-[var(--line-2)] pt-3 text-[12px] font-medium text-ink-subtle">
            این هنرجو بالاترین کمربند را گرفته است.
          </p>
        )}
      </Card>
    </section>
  );
}
