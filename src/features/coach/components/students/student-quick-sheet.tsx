"use client";

import { BadgeCheck, Check, Copy } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import { BeltStrip } from "@/components/shared/taekyar-mark";
import { Button } from "@/components/ui/button";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { PersonAvatar } from "@/features/coach/components/person-avatar";
import { StatusBadge } from "@/features/coach/components/status-badge";
import type { AgeCategoryRecord, StudentRecord } from "@/features/coach/lib/student-api";
import { GENDER_OPTIONS } from "@/features/coach/lib/student-form-options";
import { AGE_CATEGORY_LABELS, ageCategoryOf, beltKeyOf, INSURANCE_META, insuranceStatusOf } from "@/features/coach/lib/students-options";
import { digitsOnly, toPersianDigits } from "@/lib/digits";
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

const DAY_MS = 86_400_000;

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
  const [copied, setCopied] = useState(false);

  const insurance = insuranceStatusOf(student?.sportsInsuranceDate ?? null, expiringDays);
  const insuranceMeta = INSURANCE_META[insurance];
  const ageCategory = student ? ageCategoryOf(student.birthDate, ageCategories) : null;
  const belt = student?.currentBelt ? getStudentBeltMeta(beltKeyOf(student.currentBelt.belt.name)) : null;
  const metric = student?.metrics[0];
  const height = metricText(metric?.height);
  const weight = metricText(metric?.weight);
  const genderLabel = GENDER_OPTIONS.find((option) => option.value === student?.gender)?.label;

  const currentYear = Number(digitsOnly(toJalaliDate(new Date().toISOString()).split("/")[0]));
  const membershipYear = typeof student?.membershipYear === "number" ? student.membershipYear : null;
  const membershipDue = membershipYear === null ? null : Math.max(0, currentYear - membershipYear);

  const nextBeltTime = student?.currentBelt?.nextBeltDate ? new Date(student.currentBelt.nextBeltDate).getTime() : null;
  const examDue = nextBeltTime !== null && nextBeltTime < Date.now();
  const examSoon = !examDue && nextBeltTime !== null && nextBeltTime < Date.now() + 30 * DAY_MS;

  const copyNationalCode = async () => {
    if (!student) return;
    try {
      await navigator.clipboard.writeText(student.nationalCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable (insecure context); nothing to recover
    }
  };

  return (
    <SheetFrame open={open} onOpenChange={onOpenChange} title="اطلاعات سریع هنرجو" description="اطلاعات پرونده هنرجو">
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
          <Row label="کد ملی">
            <span className="inline-flex items-center gap-1.5">
              {student ? toPersianDigits(student.nationalCode) : ""}
              <button
                type="button"
                aria-label="کپی کد ملی"
                onClick={() => void copyNationalCode()}
                className="grid size-6 place-items-center rounded-md text-ink-subtle transition-colors hover:bg-muted hover:text-ink"
              >
                {copied ? <Check className="size-3.5 text-success" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
              </button>
            </span>
          </Row>
          <Row label="تاریخ تولد">
            {student?.birthDate ? toJalaliDate(student.birthDate) : "ثبت نشده"}
            {ageCategory ? ` · ${AGE_CATEGORY_LABELS[ageCategory]}` : ""}
          </Row>
          <Row label="جنسیت">{genderLabel ?? "ثبت نشده"}</Row>
          <Row label="عضویت">
            {membershipDue === null ? (
              "ثبت نشده"
            ) : (
              <span className="flex flex-col items-end gap-1">
                <StatusBadge tone={membershipDue === 0 ? "success" : "warning"} className="px-1.5 py-0.5 text-[12px]">
                  {membershipDue === 0 ? "اشتراک معتبر" : `${toPersianDigits(String(membershipDue))} سال شارژ`}
                </StatusBadge>
                <span className="text-[11px] font-medium text-ink-subtle">سال {toPersianDigits(String(membershipYear))}</span>
              </span>
            )}
          </Row>
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
          {student?.currentBelt?.nextBeltDate ? (
            <Row label="آزمون بعدی">
              <span className="flex flex-col items-end gap-1">
                <span>{toJalaliDate(student.currentBelt.nextBeltDate)}</span>
                {examDue ? (
                  <StatusBadge tone="danger" className="px-1.5 py-0.5 text-[12px]">
                    وقت آزمون رسیده
                  </StatusBadge>
                ) : examSoon ? (
                  <StatusBadge tone="warning" className="px-1.5 py-0.5 text-[12px]">
                    نزدیک آزمون
                  </StatusBadge>
                ) : null}
              </span>
            </Row>
          ) : null}
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
