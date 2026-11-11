"use client";

import { BadgeCheck, Check, Copy, Medal, ShieldCheck, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { BeltStrip } from "@/components/shared/taekyar-mark";
import { Button } from "@/components/ui/button";
import { FeePaymentSheet } from "@/features/coach/components/clubs/fee/fee-payment-sheet";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { PersonAvatar } from "@/features/coach/components/person-avatar";
import { StatusBadge } from "@/features/coach/components/status-badge";
import { useStudentClubs } from "@/features/coach/hooks/use-clubs";
import { currentFeeMonth } from "@/features/coach/lib/fee-api";
import type { AgeCategoryRecord, StudentRecord } from "@/features/coach/lib/student-api";
import { GENDER_OPTIONS } from "@/features/coach/lib/student-form-options";
import {
  AGE_CATEGORY_LABELS,
  ageCategoryOf,
  beltKeyOf,
  INSURANCE_META,
  insuranceStatusOf,
  membershipChargeOf,
} from "@/features/coach/lib/students-options";
import { toPersianDigits } from "@/lib/digits";
import { toJalaliDate } from "@/lib/jalali";
import { getStudentBeltMeta } from "@/lib/student-belts";
import { StudentInsuranceSheet } from "./student-insurance-sheet";
import { StudentMembershipSheet } from "./student-membership-sheet";

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
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [insuranceOpen, setInsuranceOpen] = useState(false);
  const [membershipOpen, setMembershipOpen] = useState(false);
  const [feeOpen, setFeeOpen] = useState(false);
  const { data: memberships } = useStudentClubs(student?.id ?? "");

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

  const membershipDue = membershipChargeOf(student?.membershipYear)?.due ?? null;

  const nextBeltTime = student?.currentBelt?.nextBeltDate ? new Date(student.currentBelt.nextBeltDate).getTime() : null;
  const examDue = nextBeltTime !== null && nextBeltTime < Date.now();
  const examSoon = !examDue && nextBeltTime !== null && nextBeltTime < Date.now() + 30 * DAY_MS;

  const activeMemberships = (memberships ?? []).filter((membership) => membership.isActive);
  const feeClubId = activeMemberships[0]?.club.id ?? "";
  const feeClubs = activeMemberships.map((membership) => membership.club);

  // One-tap fixes for whatever the sheet flags; each opens its own sheet or the belt flow.
  const actions = [
    ...(insurance === "none" || insurance === "expired"
      ? [{ icon: ShieldCheck, label: insurance === "none" ? "ثبت بیمه" : "تمدید بیمه", onClick: () => setInsuranceOpen(true) }]
      : []),
    ...(examDue && student
      ? [
          {
            icon: Medal,
            label: "اختصاص کمربند",
            onClick: () => {
              onOpenChange(false);
              router.push(`/coach/students/${student.id}/belt`);
            },
          },
        ]
      : []),
    ...(membershipDue === null || membershipDue > 0
      ? [{ icon: BadgeCheck, label: "تمدید شارژ", onClick: () => setMembershipOpen(true) }]
      : []),
    { icon: Wallet, label: "ثبت شهریه", onClick: () => setFeeOpen(true) },
  ];

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

        {actions.length > 0 ? (
          <div className={cnActionGrid(actions.length)}>
            {actions.map((action) => (
              <Button
                key={action.label}
                type="button"
                variant="outline"
                className="h-10 gap-1.5 rounded-xl text-[12px] font-bold"
                onClick={action.onClick}
              >
                <action.icon data-icon="inline-start" aria-hidden="true" />
                {action.label}
              </Button>
            ))}
          </div>
        ) : null}

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
          <Row label="شارژ بانک اطلاعاتی">
            {membershipDue === null ? (
              "ثبت نشده"
            ) : membershipDue === 0 ? (
              <span className="text-success">معتبر</span>
            ) : (
              <span className="text-warning">{toPersianDigits(String(membershipDue))} سال شارژ</span>
            )}
          </Row>
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
                className="size-auto w-14"
              />
              <span className="min-w-0">
                <b className="block text-[13px] font-extrabold text-ink">{belt.label}</b>
                <span className="text-[12px] font-medium text-ink-muted">کمربند فعلی</span>
              </span>
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

      {student ? (
        <>
          <StudentInsuranceSheet
            open={insuranceOpen}
            onOpenChange={setInsuranceOpen}
            studentId={student.id}
            hasInsurance={Boolean(student.sportsInsuranceDate)}
          />
          <StudentMembershipSheet open={membershipOpen} onOpenChange={setMembershipOpen} studentId={student.id} />
          <FeePaymentSheet
            open={feeOpen}
            onOpenChange={setFeeOpen}
            clubId={feeClubId}
            clubs={feeClubs}
            month={currentFeeMonth()}
            initialStudentId={student.id}
          />
        </>
      ) : null}
    </SheetFrame>
  );
}

// Four actions fill a 2x2 grid; fewer stay single-column so buttons never stretch awkwardly.
function cnActionGrid(count: number) {
  return count > 1 ? "grid grid-cols-2 gap-2" : "grid grid-cols-1 gap-2";
}
