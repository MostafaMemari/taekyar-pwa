import { BadgeCheck, ChevronLeft } from "lucide-react";
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
  onSelect,
}: {
  student: StudentRecord;
  ageCategories: AgeCategoryRecord[];
  expiringDays: number;
  onSelect: (student: StudentRecord) => void;
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
    <button
      type="button"
      onClick={() => onSelect(student)}
      className="block w-full text-start transition duration-150 active:scale-[0.995]"
    >
      <Card className="flex-row items-center gap-3 rounded-2xl px-3 py-3">
        <span className="relative shrink-0">
          <PersonAvatar name={student.fullName} />
          {student.userId ? (
            <span className="absolute -bottom-1 -end-1 grid size-[18px] place-items-center rounded-full bg-card">
              <BadgeCheck className="size-4 fill-sky-600 text-white" aria-hidden="true" />
            </span>
          ) : null}
        </span>

        <span className="min-w-0 flex-1">
          <b className="block truncate text-[13px] font-extrabold text-ink">{student.fullName}</b>
          <span className="mt-1.5 flex items-center gap-1.5">
            <StatusBadge tone={insuranceMeta.tone} className="shrink-0 px-1.5 py-[3px] text-[12px]">
              <InsuranceIcon aria-hidden="true" />
              {insuranceLabel}
            </StatusBadge>
            {ageCategory ? (
              <span className="truncate text-[12px] font-bold text-ink-subtle">{AGE_CATEGORY_LABELS[ageCategory]}</span>
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
            <span className="text-[12px] leading-none font-semibold text-ink-muted">{belt.label}</span>
          </span>
        ) : (
          <span className="flex w-14 shrink-0 items-center justify-center text-center text-[12px] leading-4 font-bold text-ink-subtle">
            بدون کمربند
          </span>
        )}

        <ChevronLeft className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
      </Card>
    </button>
  );
}
