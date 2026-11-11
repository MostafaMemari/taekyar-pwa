"use client";

import { BadgeCheck, CalendarPlus, Check, Copy, Medal, ShieldCheck, Wallet } from "lucide-react";
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

function Stat({ label, chip, className, children }: { label: string; chip?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <div className={cn("min-w-0 rounded-xl bg-muted/40 px-3 py-2", className)}>
      <span className="flex items-center justify-between gap-1.5">
        <span className="min-w-0 truncate text-[11px] font-medium text-ink-muted">{label}</span>
        {chip ? <span className="shrink-0">{chip}</span> : null}
      </span>
      <span className="mt-1 flex min-h-5 items-center text-[13px] font-bold text-ink">{children}</span>
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
  const ageCategory = student ? ageCategoryOf(student.birthDate, ageCategories) : null;
  const belt = student?.currentBelt ? getStudentBeltMeta(beltKeyOf(student.currentBelt.belt.name)) : null;
  const metric = student?.metrics[0];
  const height = metricText(metric?.height);
  const weight = metricText(metric?.weight);

  const membershipYear = student?.membershipYear ?? null;
  const membershipDue = membershipChargeOf(membershipYear)?.due ?? null;

  const nextBeltTime = student?.currentBelt?.nextBeltDate ? new Date(student.currentBelt.nextBeltDate).getTime() : null;
  const examDue = nextBeltTime !== null && nextBeltTime < Date.now();
  const examSoon = !examDue && nextBeltTime !== null && nextBeltTime < Date.now() + 30 * DAY_MS;

  const activeMemberships = (memberships ?? []).filter((membership) => membership.isActive);
  const feeClubId = activeMemberships[0]?.club.id ?? "";
  const feeClubs = activeMemberships.map((membership) => membership.club);
  const clubNames = new Map((clubs?.clubs ?? []).map((club) => [club.id, club.name]));

  const beltDates = [
    student?.currentBelt?.beltDate ? `اخذ ${toJalaliDate(student.currentBelt.beltDate)}` : null,
    student?.currentBelt?.nextBeltDate ? `آزمون بعدی ${toJalaliDate(student.currentBelt.nextBeltDate)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  // Always-available actions lead; the conditional fixes follow, so the top of the sheet never reshuffles.
  const actions = [
    { icon: Wallet, label: "ثبت شهریه", onClick: () => setView("fee") },
    { icon: CalendarPlus, label: "افزودن به کلاس", onClick: () => setView("enroll") },
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
        <div className="mt-3 flex flex-col gap-2.5">
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

          {actions.length > 0 ? (
            // Centered pills hug the content, so any action count stays tight instead of leaving a lone tile.
            <div className="flex flex-wrap justify-center gap-1.5">
              {actions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand-50/60 px-3 text-[12px] font-bold text-accent-ink transition-colors hover:bg-brand-50/90 active:bg-brand-50"
                  onClick={action.onClick}
                >
                  <action.icon className="size-3.5" aria-hidden="true" />
                  {action.label}
                </button>
              ))}
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-2">
            <Stat label="کد ملی">
              <span className="min-w-0 truncate">{student ? toPersianDigits(student.nationalCode) : ""}</span>
              <button
                type="button"
                aria-label="کپی کد ملی"
                onClick={() => void copyNationalCode()}
                className="grid size-5 shrink-0 place-items-center rounded-md text-ink-subtle transition-colors hover:bg-muted hover:text-ink"
              >
                {copied ? <Check className="size-3.5 text-success" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
              </button>
            </Stat>
            <Stat
              label="تاریخ تولد"
              chip={
                ageCategory ? (
                  <StatusBadge tone="neutral" className="h-5 px-2 py-0 text-[10px]">
                    {AGE_CATEGORY_LABELS[ageCategory]}
                  </StatusBadge>
                ) : null
              }
            >
              <span className="min-w-0 truncate">{student?.birthDate ? toJalaliDate(student.birthDate) : "ثبت نشده"}</span>
            </Stat>
            <Stat
              label="تاریخ بیمه"
              chip={
                <StatusBadge tone={insuranceMeta.tone} className="h-5 px-2 py-0 text-[10px]">
                  {insuranceMeta.shortLabel}
                </StatusBadge>
              }
            >
              <span className="min-w-0 truncate">
                {student?.sportsInsuranceDate ? toJalaliDate(student.sportsInsuranceDate) : "ثبت نشده"}
              </span>
            </Stat>
            <Stat
              label="شارژ بانک اطلاعاتی"
              chip={
                membershipDue !== null ? (
                  membershipDue === 0 ? (
                    <StatusBadge tone="success" className="h-5 px-2 py-0 text-[10px]">
                      معتبر
                    </StatusBadge>
                  ) : (
                    <StatusBadge tone="warning" className="h-5 px-2 py-0 text-[10px]">
                      {toPersianDigits(String(membershipDue))} سال شارژ
                    </StatusBadge>
                  )
                ) : null
              }
            >
              <span className="min-w-0 truncate">{membershipYear ? `سال ${toPersianDigits(String(membershipYear))}` : "ثبت نشده"}</span>
            </Stat>
            {height || weight ? (
              <Stat label="قد و وزن" className="col-span-2">
                {[height ? `قد ${height}` : null, weight ? `وزن ${weight}` : null].filter(Boolean).join(" · ")}
              </Stat>
            ) : null}
            {!belt ? <Stat label="کمربند">ثبت نشده</Stat> : null}
          </div>

          {belt ? (
            <div className="flex items-center gap-3 rounded-xl bg-brand-50/60 px-3 py-2">
              <BeltStrip
                color={belt.color}
                bottomColor={belt.bottomColor}
                outline={belt.outline}
                stripes={belt.stripeCount}
                className="size-auto w-10 shrink-0"
              />
              <span className="min-w-0 flex-1">
                <b className="block text-[13px] font-extrabold text-ink">{belt.label}</b>
                {beltDates ? <span className="mt-0.5 block truncate text-[11px] font-medium text-ink-muted">{beltDates}</span> : null}
              </span>
              {examDue ? (
                <StatusBadge tone="danger" className="h-5 shrink-0 px-2 py-0 text-[10px]">
                  وقت آزمون رسیده
                </StatusBadge>
              ) : examSoon ? (
                <StatusBadge tone="warning" className="h-5 shrink-0 px-2 py-0 text-[10px]">
                  نزدیک آزمون
                </StatusBadge>
              ) : null}
            </div>
          ) : null}

          <Button
            variant="brand"
            className="mt-2 h-11 w-full rounded-xl text-[12px]"
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
