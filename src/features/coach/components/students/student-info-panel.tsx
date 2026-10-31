import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/features/coach/components/section-heading";
import type { StudentAttendance } from "@/features/coach/lib/attendance-api";
import { GENDER_META } from "@/features/coach/lib/coach-data";
import type { StudentDetailRecord } from "@/features/coach/lib/student-api";
import { toPersianDigits } from "@/lib/digits";
import { toJalaliDate } from "@/lib/jalali";
import { PROVINCES } from "@/lib/provinces";
import { StudentAttendanceTrend } from "./student-attendance-trend";
import { StudentBeltPanel } from "./student-belt-panel";
import { StudentInsurancePanel } from "./student-insurance-panel";

const NOT_SET = "ثبت نشده";

function InfoRow({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--line-2)] py-2.5 last:border-b-0">
      <dt className="shrink-0 text-[11px] font-medium text-ink-subtle">{label}</dt>
      <dd className="min-w-0 truncate text-[12px] font-extrabold text-ink" dir={ltr ? "ltr" : undefined}>
        {value}
      </dd>
    </div>
  );
}

export function StudentInfoPanel({ student, attendance }: { student: StudentDetailRecord; attendance?: StudentAttendance }) {
  const dimensions =
    student.height && student.weight
      ? `${toPersianDigits(student.height)} سانتی متر · ${toPersianDigits(student.weight)} کیلوگرم`
      : NOT_SET;
  const province = PROVINCES.find((option) => option.value === student.province)?.label ?? student.province ?? NOT_SET;

  return (
    <div className="flex flex-col gap-4">
      <section>
        <SectionHeading title="مشخصات هنرجو" />
        <Card className="gap-0 p-0">
          <dl className="px-4 py-2">
            <InfoRow label="کد ملی" value={toPersianDigits(student.nationalCode)} ltr />
            <InfoRow label="جنسیت" value={GENDER_META[student.gender].label} />
            <InfoRow label="تاریخ تولد" value={student.birthDate ? toJalaliDate(student.birthDate) : NOT_SET} />
            <InfoRow label="نام پدر" value={student.fatherName || NOT_SET} />
            <InfoRow label="شماره تماس" value={student.phoneNumber ? toPersianDigits(student.phoneNumber) : NOT_SET} ltr />
            <InfoRow label="تلفن ثابت" value={student.landlineNumber ? toPersianDigits(student.landlineNumber) : NOT_SET} ltr />
            <InfoRow label="استان" value={province} />
            <InfoRow label="قد / وزن" value={dimensions} />
            <InfoRow label="سال عضویت" value={student.membershipYear ? toPersianDigits(String(student.membershipYear)) : NOT_SET} />
            <InfoRow label="انقضای عکس پرونده" value={student.expireImageDate ? toJalaliDate(student.expireImageDate) : NOT_SET} />
            <InfoRow label="تاریخ ثبت پرونده" value={toJalaliDate(student.createdAt)} />
          </dl>
        </Card>
      </section>

      <StudentInsurancePanel expiryDate={student.sportsInsuranceDate} />
      {attendance ? <StudentAttendanceTrend records={attendance.records} /> : null}
      <StudentBeltPanel assignment={student.currentBelt} birthDate={student.birthDate} />
    </div>
  );
}
