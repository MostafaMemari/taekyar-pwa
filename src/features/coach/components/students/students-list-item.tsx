import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { BeltStrip } from "@/components/shared/taekyar-mark";
import { Card } from "@/components/ui/card";
import { PersonAvatar } from "@/features/coach/components/person-avatar";
import { StatusBadge } from "@/features/coach/components/status-badge";
import type { AgeCategoryRecord, StudentRecord } from "@/features/coach/lib/student-api";
import { AGE_CATEGORY_LABELS, ageCategoryOf, beltKeyOf, INSURANCE_META, insuranceStatusOf } from "@/features/coach/lib/students-options";
import { toPersianDigits } from "@/lib/digits";
import { toJalaliDate } from "@/lib/jalali";
import { getStudentBeltMeta } from "@/lib/student-belts";

export function StudentsListItem({
  student,
  ageCategories,
  expiringDays,
}: {
  student: StudentRecord;
  ageCategories: AgeCategoryRecord[];
  expiringDays: number;
}) {
  const insurance = insuranceStatusOf(student.sportsInsuranceDate, expiringDays);
  const insuranceMeta = INSURANCE_META[insurance];
  const InsuranceIcon = insuranceMeta.icon;
  const insuranceLabel =
    insurance === "none"
      ? insuranceMeta.shortLabel
      : `${insurance === "expired" ? "منقضی" : "تا"} ${toPersianDigits(toJalaliDate(student.sportsInsuranceDate ?? ""))}`;

  const ageCategory = ageCategoryOf(student.birthDate, ageCategories);
  const beltName = student.currentBelt?.belt.name;
  const belt = beltName ? getStudentBeltMeta(beltKeyOf(beltName)) : null;

  return (
    <Link href={`/coach/students/${student.id}`} className="block transition duration-150 active:scale-[0.995]">
      <Card className="flex-row items-center gap-3 rounded-2xl px-3 py-3">
        <PersonAvatar name={student.fullName} />

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <b className="truncate text-[13px] font-extrabold text-ink">{student.fullName}</b>
            <StatusBadge tone={student.userId ? "brand" : "neutral"} className="shrink-0 px-1.5 py-0.5 text-[9px]">
              {student.userId ? "دارای حساب" : "بدون حساب"}
            </StatusBadge>
          </span>
          <span className="mt-1.5 flex items-center gap-1.5">
            <StatusBadge tone={insuranceMeta.tone} className="shrink-0 px-1.5 py-[3px] text-[9px]">
              <InsuranceIcon aria-hidden="true" />
              {insuranceLabel}
            </StatusBadge>
            {ageCategory ? (
              <span className="truncate text-[10px] font-bold text-ink-subtle">{AGE_CATEGORY_LABELS[ageCategory]}</span>
            ) : null}
          </span>
        </span>

        {belt ? (
          <span className="flex w-14 shrink-0 flex-col items-center gap-1">
            <BeltStrip
              color={belt.color}
              bottomColor={belt.bottomColor}
              outline={belt.outline}
              stripes={belt.stripeCount}
              className="size-auto w-12"
            />
            <span className="text-[9px] leading-none font-extrabold text-ink-muted">{belt.label}</span>
          </span>
        ) : (
          <span className="flex w-14 shrink-0 items-center justify-center text-center text-[9px] leading-3 font-bold text-ink-faint">
            بدون کمربند
          </span>
        )}

        <ChevronLeft className="size-4 shrink-0 text-ink-faint" aria-hidden="true" />
      </Card>
    </Link>
  );
}
