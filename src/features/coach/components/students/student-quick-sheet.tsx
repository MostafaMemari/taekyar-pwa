"use client";

import { BadgeCheck, CalendarPlus, Check, ChevronLeft, Copy, Medal, ShieldCheck, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { BeltStrip } from "@/components/shared/taekyar-mark";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FeePaymentForm } from "@/features/coach/components/clubs/fee/fee-payment-form";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { PersonAvatar } from "@/features/coach/components/person-avatar";
import { StatusBadge } from "@/features/coach/components/status-badge";
import { useClubs, useStudentClubs } from "@/features/coach/hooks/use-clubs";
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
import { cn } from "@/lib/utils";
import { StudentInsuranceForm } from "./student-insurance-form";
import { StudentMembershipForm } from "./student-membership-form";
import { StudentSessionEnrollForm } from "./student-session-enroll-form";

type QuickView = "info" | "insurance" | "membership" | "fee" | "enroll";

// Actions swap this sheet's content instead of stacking a second sheet on top.
const VIEW_META: Record<Exclude<QuickView, "info">, { title: string; description: string }> = {
  insurance: { title: "ثبت بیمه ورزشی", description: "تاریخ اعتبار بیمه سالانه هنرجو را تایید کنید" },
  membership: { title: "تمدید سال عضویت", description: "تایید تمدید سال عضویت هنرجو" },
  fee: { title: "ثبت پرداخت شهریه", description: "پرداخت هنرجو برای ماه انتخاب شده ثبت می شود" },
  enroll: { title: "افزودن به کلاس", description: "هنرجو به کلاس انتخاب شده اضافه می شود" },
};

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
  const [view, setView] = useState<QuickView>("info");
  const [enrollClubId, setEnrollClubId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { data: memberships, isLoading: clubsLoading } = useStudentClubs(student?.id ?? "");
  const { data: clubs } = useClubs();

  // Reopening starts from the info view even if the sheet was closed mid-form.
  useEffect(() => {
    if (!open) {
      setView("info");
      setEnrollClubId(null);
    }
  }, [open]);

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
  const clubNames = new Map((clubs?.clubs ?? []).map((club) => [club.id, club.name]));

  // One-tap fixes for whatever the sheet flags; each swaps the sheet's content or opens the belt flow.
  const actions = [
    ...(insurance === "none" || insurance === "expired"
      ? [{ icon: ShieldCheck, label: insurance === "none" ? "ثبت بیمه" : "تمدید بیمه", onClick: () => setView("insurance") }]
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
      ? [{ icon: BadgeCheck, label: "تمدید شارژ", onClick: () => setView("membership") }]
      : []),
    { icon: Wallet, label: "ثبت شهریه", onClick: () => setView("fee") },
    { icon: CalendarPlus, label: "افزودن به کلاس", onClick: () => setView("enroll") },
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
    <SheetFrame
      open={open}
      onOpenChange={onOpenChange}
      // Back unwinds the enroll drill first: sessions to clubs, then clubs to info.
      onBack={view === "info" ? undefined : view === "enroll" && enrollClubId ? () => setEnrollClubId(null) : () => setView("info")}
      title={
        view === "info"
          ? "اطلاعات سریع هنرجو"
          : view === "enroll" && enrollClubId
            ? `کلاس های ${clubNames.get(enrollClubId) ?? "باشگاه"}`
            : VIEW_META[view].title
      }
      description={view === "info" ? "اطلاعات پرونده هنرجو" : VIEW_META[view].description}
    >
      {view === "insurance" && student ? (
        <StudentInsuranceForm studentId={student.id} hasInsurance={Boolean(student.sportsInsuranceDate)} onDone={() => setView("info")} />
      ) : view === "membership" && student ? (
        <StudentMembershipForm studentId={student.id} onDone={() => setView("info")} />
      ) : view === "fee" && student ? (
        // The no-club notice inside the form must not flash while the memberships load.
        clubsLoading ? (
          <output aria-busy="true" aria-label="خواندن باشگاه های هنرجو" className="mt-3 flex flex-col gap-2">
            {[0, 1, 2].map((row) => (
              <Skeleton key={row} className="h-12 w-full rounded-xl" />
            ))}
          </output>
        ) : (
          <FeePaymentForm
            clubId={feeClubId}
            clubs={feeClubs}
            month={currentFeeMonth()}
            initialStudentId={student.id}
            onDone={() => setView("info")}
          />
        )
      ) : view === "enroll" && student ? (
        <StudentSessionEnrollForm
          studentId={student.id}
          clubId={enrollClubId}
          onPickClub={setEnrollClubId}
          onDone={() => {
            setView("info");
            setEnrollClubId(null);
          }}
        />
      ) : (
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
            <div className="overflow-hidden rounded-2xl border border-[var(--line-2)]">
              {actions.map((action, index) => (
                <button
                  key={action.label}
                  type="button"
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-start transition-colors hover:bg-muted/50 active:bg-muted",
                    index > 0 && "border-t border-[var(--line-3)]",
                  )}
                  onClick={action.onClick}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-accent-ink">
                    <action.icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1 text-[13px] font-bold text-ink">{action.label}</span>
                  <ChevronLeft className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
                </button>
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
                  {copied ? (
                    <Check className="size-3.5 text-success" aria-hidden="true" />
                  ) : (
                    <Copy className="size-3.5" aria-hidden="true" />
                  )}
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

          <Button
            variant="brand"
            className="mt-4 h-11 w-full rounded-xl text-[12px]"
            render={<Link href={`/coach/students/${student?.id ?? ""}`} />}
            nativeButton={false}
          >
            مشاهده پرونده کامل
          </Button>
        </div>
      )}
    </SheetFrame>
  );
}
