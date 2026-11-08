import { Landmark } from "lucide-react";
import { BeltStrip } from "@/components/shared/taekyar-mark";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { StatusBadge } from "@/features/coach/components/status-badge";
import { useBeltExams } from "@/features/coach/hooks/use-belt-exams";
import type { StudentBeltAssignment } from "@/features/coach/lib/student-api";
import { beltApiName, beltKeyOf } from "@/features/coach/lib/students-options";
import { toPersianDigits } from "@/lib/digits";
import { durationLabel, toJalaliDate } from "@/lib/jalali";
import { ageFromIso, beltDotStyle, getStudentBeltMeta, nextStudentBelt } from "@/lib/student-belts";

const DAY_MS = 86_400_000;

export function StudentBeltPanel({ assignment, birthDate }: { assignment: StudentBeltAssignment | null; birthDate: string | null }) {
  const exams = useBeltExams();

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

  // Poom and dan belts are granted through federation exams; the exam periods in the backend announce them.
  const nextIsFederation = nextKey !== null && (nextKey.startsWith("poom") || nextKey.startsWith("dan"));
  const examsLoading = exams.isLoading && !exams.data;
  const federationExam = nextIsFederation
    ? ([...(exams.data ?? [])]
        .filter(
          (exam) =>
            new Date(exam.eventDate).getTime() >= today.getTime() - DAY_MS &&
            (exam.belts ?? []).some((belt) => belt.name.toUpperCase() === beltApiName(nextKey)),
        )
        .sort((a, b) => a.eventDate.localeCompare(b.eventDate))[0] ?? null)
    : null;

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

            {nextIsFederation && !examsLoading ? (
              <div className="mt-3 border-t border-[var(--line-2)] pt-3">
                <span className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-muted">
                  <Landmark className="size-3.5" aria-hidden="true" />
                  آزمون فدراسیون
                </span>
                {federationExam ? (
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-[12px] font-medium text-ink-body">
                      دوره {toPersianDigits(String(federationExam.examNumber))} · برگزاری {toJalaliDate(federationExam.eventDate)}
                    </span>
                    <b className="shrink-0 text-[12px] font-bold text-accent-ink">
                      {new Date(federationExam.eventDate).getTime() - Date.now() <= DAY_MS
                        ? "امروز"
                        : `${durationLabel(today, new Date(federationExam.eventDate))} مانده`}
                    </b>
                  </div>
                ) : (
                  <p className="mt-1.5 text-[12px] font-medium text-ink-subtle">هنوز دوره ای برای این کمربند اعلام نشده است.</p>
                )}
              </div>
            ) : null}
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
