import { BeltStrip } from "@/components/shared/taekyar-mark";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { GENDER_META } from "@/features/coach/lib/coach-data";
import type { StudentDetailRecord } from "@/features/coach/lib/student-api";
import { beltKeyOf, insuranceStatusOf } from "@/features/coach/lib/students-options";
import { toPersianDigits } from "@/lib/digits";
import { toJalaliDate } from "@/lib/jalali";
import { PROVINCES } from "@/lib/provinces";
import { getStudentBeltMeta } from "@/lib/student-belts";

const NOT_SET = "ثبت نشده";
const INSURANCE_EXPIRING_DAYS = 30;

function InfoRow({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--line-1)] py-2.5 last:border-b-0">
      <dt className="shrink-0 text-[11.5px] font-medium text-ink-subtle">{label}</dt>
      <dd className="min-w-0 truncate text-[12px] font-extrabold text-ink" dir={ltr ? "ltr" : undefined}>
        {value}
      </dd>
    </div>
  );
}

export function StudentInfoPanel({ student }: { student: StudentDetailRecord }) {
  const assignment = student.currentBelt;
  const belt = assignment ? getStudentBeltMeta(beltKeyOf(assignment.belt.name)) : null;
  const dimensions =
    student.height && student.weight
      ? `${toPersianDigits(student.height)} سانتی متر · ${toPersianDigits(student.weight)} کیلوگرم`
      : NOT_SET;
  const province = PROVINCES.find((option) => option.value === student.province)?.label ?? student.province ?? NOT_SET;
  const insuranceDate = student.sportsInsuranceDate;
  const insuranceLabel = insuranceDate
    ? `${insuranceStatusOf(insuranceDate, INSURANCE_EXPIRING_DAYS) === "expired" ? "منقضی" : "معتبر تا"} ${toJalaliDate(insuranceDate)}`
    : NOT_SET;

  return (
    <div className="flex flex-col gap-4">
      <Card className="gap-0 p-0">
        <div className="px-4 pt-4">
          <SectionHeading title="مشخصات هنرجو" className="mb-0" />
        </div>

        <dl className="mt-2 px-4 pb-2">
          <InfoRow label="کد ملی" value={toPersianDigits(student.nationalCode)} ltr />
          <InfoRow label="جنسیت" value={GENDER_META[student.gender].label} />
          <InfoRow label="تاریخ تولد" value={student.birthDate ? toJalaliDate(student.birthDate) : NOT_SET} />
          <InfoRow label="نام پدر" value={student.fatherName || NOT_SET} />
          <InfoRow label="شماره تماس" value={student.phoneNumber ? toPersianDigits(student.phoneNumber) : NOT_SET} ltr />
          <InfoRow label="تلفن ثابت" value={student.landlineNumber ? toPersianDigits(student.landlineNumber) : NOT_SET} ltr />
          <InfoRow label="استان" value={province} />
          <InfoRow label="قد / وزن" value={dimensions} />
          <InfoRow label="سال عضویت" value={student.membershipYear ? toPersianDigits(String(student.membershipYear)) : NOT_SET} />
          <InfoRow label="بیمه ورزشی" value={insuranceLabel} />
          <InfoRow label="انقضای عکس پرونده" value={student.expireImageDate ? toJalaliDate(student.expireImageDate) : NOT_SET} />
          <InfoRow label="تاریخ ثبت پرونده" value={toJalaliDate(student.createdAt)} />
        </dl>
      </Card>

      <Card className="gap-0 p-4">
        <SectionHeading title="کمربند فعلی" className="mb-4" />

        {belt && assignment ? (
          <div className="flex items-center gap-4">
            <BeltStrip
              color={belt.color}
              bottomColor={belt.bottomColor}
              outline={belt.outline}
              stripes={belt.stripeCount}
              className="size-auto w-24 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <b className="block text-[14px] font-extrabold text-ink">{belt.label}</b>
              <p className="mt-1 text-[11px] font-medium text-ink-subtle">تاریخ دریافت: {toJalaliDate(assignment.beltDate)}</p>
            </div>
          </div>
        ) : (
          <p className="text-[11.5px] leading-5 text-ink-subtle">هنوز کمربندی برای این هنرجو ثبت نشده است.</p>
        )}

        <p className="mt-3 border-t border-[var(--line-1)] pt-2.5 text-[11px] leading-5 text-ink-muted">
          برای تغییر کمربند از گزینه «تخصیص کمربند» در پرونده هنرجو استفاده کنید.
        </p>
      </Card>
    </div>
  );
}
