"use client";

import { Check, Copy } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { useAgeCategories } from "@/features/coach/hooks/use-age-categories";
import { useWeightClassSuggestion } from "@/features/coach/hooks/use-weight-class";
import type { StudentAttendance } from "@/features/coach/lib/attendance-api";
import { GENDER_META } from "@/features/coach/lib/coach-data";
import type { AgeCategoryRecord, StudentDetailRecord } from "@/features/coach/lib/student-api";
import { membershipChargeOf } from "@/features/coach/lib/students-options";
import { toPersianDigits } from "@/lib/digits";
import { toJalaliDate } from "@/lib/jalali";
import { PROVINCES } from "@/lib/provinces";
import { ageFromIso } from "@/lib/student-belts";
import { StudentAttendanceTrend } from "./student-attendance-trend";
import { StudentBeltPanel } from "./student-belt-panel";
import { StudentInsurancePanel } from "./student-insurance-panel";

const NOT_SET = "ثبت نشده";

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-3 border-b border-[var(--line-2)] px-4 last:border-b-0">
      <dt className="shrink-0 text-[12px] font-medium text-ink-muted">{label}</dt>
      <dd className="min-w-0 truncate text-[13px] font-bold text-ink">{children}</dd>
    </div>
  );
}

function NationalCodeRow({ nationalCode }: { nationalCode: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(nationalCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable (insecure context); nothing to recover
    }
  };

  return (
    <InfoRow label="کد ملی">
      <span className="inline-flex items-center gap-1.5">
        {toPersianDigits(nationalCode)}
        <button
          type="button"
          aria-label="کپی کد ملی"
          onClick={() => void copy()}
          className="grid size-6 place-items-center rounded-md text-ink-subtle transition-colors hover:bg-muted hover:text-ink"
        >
          {copied ? <Check className="size-3.5 text-success" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
        </button>
      </span>
    </InfoRow>
  );
}

function PhoneRow({ label, value }: { label: string; value: string | null }) {
  return (
    <InfoRow label={label}>
      {value ? (
        <a href={`tel:${value}`} dir="ltr" className="text-accent-ink underline-offset-4 hover:underline">
          {toPersianDigits(value)}
        </a>
      ) : (
        NOT_SET
      )}
    </InfoRow>
  );
}

function nextDayIso(iso: string) {
  const date = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

// Same bounds the backend uses to place a student in an age category: birthDate >= startDate && < endDate + 1 day.
function ageCategoryForBirthDate(birthDate: string | null, categories: AgeCategoryRecord[]) {
  if (!birthDate) return null;
  const day = birthDate.slice(0, 10);
  return categories.find((category) => day >= category.startDate.slice(0, 10) && day < nextDayIso(category.endDate)) ?? null;
}

function StudentWeightClassRow({ student }: { student: StudentDetailRecord }) {
  const { data: categories } = useAgeCategories();
  const category = ageCategoryForBirthDate(student.birthDate, categories ?? []);
  const weightKg = student.weight ? Number(student.weight) : null;
  const ready = category !== null && weightKg !== null && weightKg > 0;
  const { data: suggestion, error } = useWeightClassSuggestion(
    ready ? { ageCategoryId: category.id, gender: student.gender, weightKg } : null,
  );

  let value: ReactNode = NOT_SET;
  if (ready) {
    if (error) value = <span className="text-ink-subtle">در دسترس نیست</span>;
    else if (!suggestion) value = <Skeleton className="h-4 w-20" />;
    else value = suggestion.weightClass.label;
  }

  return <InfoRow label="رده وزنی پیشنهادی">{value}</InfoRow>;
}

export function StudentInfoPanel({ student, attendance }: { student: StudentDetailRecord; attendance?: StudentAttendance }) {
  const charge = membershipChargeOf(student.membershipYear);
  const dimensions =
    student.height && student.weight
      ? `${toPersianDigits(student.height)} سانتی متر · ${toPersianDigits(student.weight)} کیلوگرم`
      : NOT_SET;
  const province = PROVINCES.find((option) => option.value === student.province)?.label ?? student.province ?? NOT_SET;
  const age = student.birthDate ? ageFromIso(student.birthDate) : null;

  return (
    <div className="flex flex-col gap-4">
      <StudentBeltPanel assignment={student.currentBelt} birthDate={student.birthDate} />

      <StudentInsurancePanel expiryDate={student.sportsInsuranceDate} studentId={student.id} />

      <section>
        <SectionHeading title="شناسنامه" />
        <Card className="gap-0 py-1">
          <NationalCodeRow nationalCode={student.nationalCode} />
          <InfoRow label="تاریخ تولد">
            {student.birthDate ? toJalaliDate(student.birthDate) : NOT_SET}
            {age ? ` · ${toPersianDigits(String(age))} ساله` : ""}
          </InfoRow>
          <InfoRow label="جنسیت">{GENDER_META[student.gender].label}</InfoRow>
          <InfoRow label="استان">{province}</InfoRow>
        </Card>
      </section>

      <section>
        <SectionHeading title="تماس" />
        <Card className="gap-0 py-1">
          <PhoneRow label="شماره تماس" value={student.phoneNumber} />
          <PhoneRow label="تلفن ثابت" value={student.landlineNumber} />
          <InfoRow label="نام پدر">{student.fatherName || NOT_SET}</InfoRow>
        </Card>
      </section>

      <section>
        <SectionHeading title="پرونده" />
        <Card className="gap-0 py-1">
          <InfoRow label="سال عضویت">{student.membershipYear ? toPersianDigits(String(student.membershipYear)) : NOT_SET}</InfoRow>
          <InfoRow label="شارژ بانک اطلاعاتی">
            {charge === null ? (
              NOT_SET
            ) : charge.due === 0 ? (
              <span className="text-success">معتبر</span>
            ) : (
              <span className="text-warning">{toPersianDigits(String(charge.due))} سال شارژ</span>
            )}
          </InfoRow>
          <InfoRow label="قد / وزن">{dimensions}</InfoRow>
          <StudentWeightClassRow student={student} />
          <InfoRow label="انقضای عکس پرونده">{student.expireImageDate ? toJalaliDate(student.expireImageDate) : NOT_SET}</InfoRow>
          <InfoRow label="تاریخ ثبت پرونده">{toJalaliDate(student.createdAt)}</InfoRow>
        </Card>
      </section>

      {attendance ? <StudentAttendanceTrend records={attendance.records} /> : null}
    </div>
  );
}
