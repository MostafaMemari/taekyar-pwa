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
    <div className="flex min-h-10 items-center justify-between gap-3 px-3">
      <span className="shrink-0 text-[12px] font-medium text-ink-muted">{label}</span>
      <span className="min-w-0 text-end text-[13px] font-bold text-ink">{children}</span>
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
  const insuranceLabel =
    insurance === "none"
      ? insuranceMeta.shortLabel
      : `${insurance === "expired" ? "منقضی" : "تا"} ${toPersianDigits(toJalaliDate(student?.sportsInsuranceDate ?? ""))}`;
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
      <div className="mt-3 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="relative shrink-0">
            <PersonAvatar name={student?.fullName ?? ""} className="size-14" />
            {student?.userId ? (
              <span className="absolute -bottom-1 -end-1 grid size-[18px] place-items-center rounded-full bg-card">
                <BadgeCheck className="size-4 fill-sky-600 text-white" aria-hidden="true" />
              </span>
            ) : null}
          </span>
          <span className="min-w-0 flex-1">
            <b className="block truncate text-[15px] font-extrabold text-ink">{student?.fullName}</b>
            <span className="mt-0.5 block text-[12px] font-medium text-ink-subtle">
              {student?.userId ? "حساب کاربری متصل" : "حساب کاربری ندارد"}
            </span>
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {ageCategory ? (
            <StatusBadge tone="neutral" className="px-1.5 py-1 text-[12px]">
              {AGE_CATEGORY_LABELS[ageCategory]}
            </StatusBadge>
          ) : null}
          {membershipDue !== null ? (
            <StatusBadge tone={membershipDue === 0 ? "success" : "warning"} className="px-1.5 py-1 text-[12px]">
              {membershipDue === 0 ? "اشتراک معتبر" : `${toPersianDigits(String(membershipDue))} سال شارژ`}
            </StatusBadge>
          ) : null}
          <StatusBadge tone={insuranceMeta.tone} className="px-1.5 py-1 text-[12px]">
            {insuranceLabel}
          </StatusBadge>
          {examDue ? (
            <StatusBadge tone="danger" className="px-1.5 py-1 text-[12px]">
              وقت آزمون رسیده
            </StatusBadge>
          ) : examSoon ? (
            <StatusBadge tone="warning" className="px-1.5 py-1 text-[12px]">
              نزدیک آزمون
            </StatusBadge>
          ) : null}
        </div>

        <div className="divide-y divide-[var(--line-3)] rounded-2xl bg-muted/40 py-1">
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
          <Row label="تاریخ تولد">{student?.birthDate ? toJalaliDate(student.birthDate) : "ثبت نشده"}</Row>
          <Row label="جنسیت">{genderLabel ?? "ثبت نشده"}</Row>
          {height || weight ? (
            <Row label="قد و وزن">{[height ? `قد ${height}` : null, weight ? `وزن ${weight}` : null].filter(Boolean).join(" · ")}</Row>
          ) : null}
          {!belt ? <Row label="کمربند">ثبت نشده</Row> : null}
        </div>

        {belt ? (
          <div className="rounded-2xl bg-brand-50/60 py-1">
            <div className="flex min-h-10 items-center gap-3 px-3">
              <BeltStrip
                color={belt.color}
                bottomColor={belt.bottomColor}
                outline={belt.outline}
                stripes={belt.stripeCount}
                className="size-auto w-12"
              />
              <b className="text-[13px] font-extrabold text-ink">{belt.label}</b>
            </div>
            <div className="divide-y divide-[var(--line-3)]">
              {student?.currentBelt?.beltDate ? <Row label="تاریخ اخذ">{toJalaliDate(student.currentBelt.beltDate)}</Row> : null}
              {student?.currentBelt?.nextBeltDate ? <Row label="آزمون بعدی">{toJalaliDate(student.currentBelt.nextBeltDate)}</Row> : null}
            </div>
          </div>
        ) : null}
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
