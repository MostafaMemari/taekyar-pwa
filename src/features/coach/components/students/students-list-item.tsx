import { BadgeCheck, ChevronLeft } from "lucide-react";
import { BeltStrip } from "@/components/shared/taekyar-mark";
import { Card } from "@/components/ui/card";
import { PersonAvatar } from "@/features/coach/components/person-avatar";
import { StatusBadge } from "@/features/coach/components/status-badge";
import type { AgeCategoryRecord, StudentRecord } from "@/features/coach/lib/student-api";
import {
  AGE_CATEGORY_LABELS,
  ageCategoryOf,
  beltKeyOf,
  FEE_META,
  INSURANCE_META,
  insuranceStatusOf,
} from "@/features/coach/lib/students-options";
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
      ? "بدون بیمه"
      : insurance === "expired"
        ? "بیمه منقضی"
        : `بیمه تا ${toPersianDigits(toJalaliDate(student.sportsInsuranceDate ?? ""))}`;

  const feeMeta = student.feeStatus ? FEE_META[student.feeStatus] : null;
  const FeeIcon = feeMeta?.icon;

  const ageCategory = ageCategoryOf(student.birthDate, ageCategories);
  const beltName = student.currentBelt?.belt.name;
  const belt = beltName ? getStudentBeltMeta(beltKeyOf(beltName)) : null;

  // The avatar wears the student's belt: a two-tone ring for poom ranks, solid for the rest.
  const beltRing = belt
    ? { background: `linear-gradient(to bottom, ${belt.color} 50%, ${belt.bottomColor ?? belt.color} 50%)` }
    : undefined;

  return (
    <button
      type="button"
      onClick={() => onSelect(student)}
      className="block w-full text-start transition duration-150 active:scale-[0.995]"
    >
      <Card className="flex-row items-center gap-3 rounded-2xl px-3 py-3">
        <span className="relative shrink-0 rounded-full p-[2.5px]" style={beltRing}>
          <PersonAvatar name={student.fullName} className="ring-2 ring-card" />
          {student.userId ? (
            <span className="absolute -bottom-0.5 -end-0.5 grid size-[18px] place-items-center rounded-full bg-card">
              <BadgeCheck className="size-4 fill-sky-600 text-white" aria-hidden="true" />
            </span>
          ) : null}
        </span>

        <span className="min-w-0 flex-1">
          <b className="block truncate text-[13px] font-extrabold text-ink">{student.fullName}</b>

          <span className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1.5">
            {ageCategory ? (
              <StatusBadge tone="neutral" className="shrink-0 gap-0.5 px-1.5 py-[2px] text-[10px] [&>svg]:size-2.5!">
                {AGE_CATEGORY_LABELS[ageCategory]}
              </StatusBadge>
            ) : null}
            <StatusBadge tone={insuranceMeta.tone} className="shrink-0 gap-0.5 px-1.5 py-[2px] text-[10px] [&>svg]:size-2.5!">
              <InsuranceIcon className="size-2.5" aria-hidden="true" />
              {insuranceLabel}
            </StatusBadge>
            {feeMeta && FeeIcon ? (
              <StatusBadge tone={feeMeta.tone} className="shrink-0 gap-0.5 px-1.5 py-[2px] text-[10px] [&>svg]:size-2.5!">
                <FeeIcon className="size-2.5" aria-hidden="true" />
                {student.feeStatus === "OWED" ? "بدهکار" : "تسویه"}
              </StatusBadge>
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
