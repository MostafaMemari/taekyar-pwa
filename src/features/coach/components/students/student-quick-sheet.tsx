import { BadgeCheck } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { BeltStrip } from "@/components/shared/taekyar-mark";
import { Button } from "@/components/ui/button";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { PersonAvatar } from "@/features/coach/components/person-avatar";
import { StatusBadge } from "@/features/coach/components/status-badge";
import type { AgeCategoryRecord, StudentRecord } from "@/features/coach/lib/student-api";
import { GENDER_OPTIONS } from "@/features/coach/lib/student-form-options";
import { AGE_CATEGORY_LABELS, ageCategoryOf, beltKeyOf, INSURANCE_META, insuranceStatusOf } from "@/features/coach/lib/students-options";
import { toPersianDigits } from "@/lib/digits";
import { toJalaliDate } from "@/lib/jalali";
import { getStudentBeltMeta } from "@/lib/student-belts";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="shrink-0 text-[12px] font-semibold text-ink-muted">{label}</span>
      <span className="min-w-0 text-end text-[12px] font-bold text-ink">{children}</span>
    </div>
  );
}

function metricText(value: string | number | null | undefined) {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? toPersianDigits(String(parsed)) : null;
}

export function StudentQuickSheet({
  open,
  onOpenChange,
  student,
  ageCategories,
  expiringDays,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentRecord | null;
  ageCategories: AgeCategoryRecord[];
  expiringDays: number;
}) {
  const insurance = insuranceStatusOf(student?.sportsInsuranceDate ?? null, expiringDays);
  const insuranceMeta = INSURANCE_META[insurance];
  const ageCategory = student ? ageCategoryOf(student.birthDate, ageCategories) : null;
  const belt = student?.currentBelt ? getStudentBeltMeta(beltKeyOf(student.currentBelt.belt.name)) : null;
  const metric = student?.metrics[0];
  const height = metricText(metric?.height);
  const weight = metricText(metric?.weight);
  const genderLabel = GENDER_OPTIONS.find((option) => option.value === student?.gender)?.label;

  return (
    <SheetFrame open={open} onOpenChange={onOpenChange} title={student?.fullName ?? "هنرجو"} description="اطلاعات سریع هنرجو">
      <div className="mt-3 flex flex-col">
        <div className="flex items-center gap-3 pb-3">
          <span className="relative shrink-0">
            <PersonAvatar name={student?.fullName ?? ""} className="size-12" />
            {student?.userId ? (
              <span className="absolute -bottom-1 -end-1 grid size-[18px] place-items-center rounded-full bg-card">
                <BadgeCheck className="size-4 fill-sky-600 text-white" aria-hidden="true" />
              </span>
            ) : null}
          </span>
          <span className="min-w-0">
            <b className="block truncate text-[14px] font-extrabold text-ink">{student?.fullName}</b>
            <span className="text-[12px] font-medium text-ink-subtle">{student?.userId ? "حساب کاربری دارد" : "حساب کاربری ندارد"}</span>
          </span>
        </div>

        <div className="divide-y divide-[var(--line-2)] border-t border-[var(--line-2)]">
          <Row label="کد ملی">{student ? toPersianDigits(student.nationalCode) : ""}</Row>
          <Row label="تاریخ تولد">
            {student?.birthDate ? toJalaliDate(student.birthDate) : "ثبت نشده"}
            {ageCategory ? ` · ${AGE_CATEGORY_LABELS[ageCategory]}` : ""}
          </Row>
          <Row label="جنسیت">{genderLabel ?? "ثبت نشده"}</Row>
          <Row label="بیمه">
            <span className="flex flex-col items-end gap-1">
              <StatusBadge tone={insuranceMeta.tone} className="px-1.5 py-0.5 text-[12px]">
                {insuranceMeta.shortLabel}
              </StatusBadge>
              {student?.sportsInsuranceDate ? (
                <span className="text-[11px] font-medium text-ink-subtle">{toJalaliDate(student.sportsInsuranceDate)}</span>
              ) : null}
            </span>
          </Row>
          <Row label="کمربند">
            {belt ? (
              <span className="flex items-center gap-2">
                <BeltStrip
                  color={belt.color}
                  bottomColor={belt.bottomColor}
                  outline={belt.outline}
                  stripes={belt.stripeCount}
                  className="size-auto w-8"
                />
                {belt.label}
              </span>
            ) : (
              "بدون کمربند"
            )}
          </Row>
          {student?.currentBelt?.beltDate ? <Row label="تاریخ اخذ">{toJalaliDate(student.currentBelt.beltDate)}</Row> : null}
          {student?.currentBelt?.nextBeltDate ? <Row label="آزمون بعدی">{toJalaliDate(student.currentBelt.nextBeltDate)}</Row> : null}
          {height || weight ? (
            <Row label="قد و وزن">{[height ? `قد ${height}` : null, weight ? `وزن ${weight}` : null].filter(Boolean).join(" · ")}</Row>
          ) : null}
        </div>
      </div>

      <Button
        variant="brand"
        className="mt-4 h-11 w-full rounded-xl text-[12px]"
        render={<Link href={`/coach/students/${student?.id ?? ""}`} />}
        nativeButton={false}
      >
        مشاهده پرونده کامل
      </Button>
    </SheetFrame>
  );
}
