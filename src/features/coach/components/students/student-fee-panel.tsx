"use client";

import { Fragment } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/features/coach/components/error-state";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { StatusBadge } from "@/features/coach/components/status-badge";
import { useStudentFee } from "@/features/coach/hooks/use-fee";
import type { ClubMembershipRecord } from "@/features/coach/lib/club-api";
import { feeMonthLabel, feeMonthOfDate } from "@/features/coach/lib/fee-api";
import { FEE_PAYMENT_VOID_META, FEE_PERIOD_META } from "@/features/coach/lib/students-options";
import { apiErrorMessage } from "@/lib/api/client";
import { formatMoney, toPersianDigits } from "@/lib/digits";
import { toJalaliDateTime } from "@/lib/jalali";
import { cn } from "@/lib/utils";

// The student profile's fee tab: month statuses plus payment history for every club membership,
// including the paused ones — paid history must not disappear when a membership is deactivated.
export function StudentFeePanel({
  studentId,
  memberships,
  isLoading,
}: {
  studentId: string;
  memberships: ClubMembershipRecord[];
  isLoading: boolean;
}) {
  const clubs = memberships.map((membership) => membership.club);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1].map((row) => (
          <Skeleton key={row} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (clubs.length === 0) {
    return (
      <section>
        <SectionHeading title="شهریه" />
        <p className="rounded-xl bg-muted/60 p-3 text-center text-[12px] font-semibold leading-5 text-ink-subtle">
          هنرجو عضو هیچ باشگاهی نیست
        </p>
      </section>
    );
  }

  return (
    <>
      {clubs.map((club) => (
        <StudentFeeClubSection key={club.id} studentId={studentId} clubId={club.id} clubName={club.name} />
      ))}
    </>
  );
}

// One card per club: the month rows carry the charges, the labeled tail carries the payments.
function StudentFeeClubSection({ studentId, clubId, clubName }: { studentId: string; clubId: string; clubName: string }) {
  const fee = useStudentFee(clubId, studentId);
  const periods = fee.data?.periods ?? [];
  const payments = fee.data?.payments ?? [];

  return (
    <section>
      <SectionHeading title={clubName} />

      {fee.error ? (
        <ErrorState title="خواندن شهریه انجام نشد" message={apiErrorMessage(fee.error)} onRetry={() => void fee.mutate()} />
      ) : fee.isLoading ? (
        <Skeleton className="h-24 rounded-2xl" />
      ) : periods.length === 0 ? (
        <Card className="gap-0 px-4 py-1">
          <p className="py-3 text-center text-[12px] font-semibold leading-5 text-ink-subtle">شهریه ای برای این باشگاه ثبت نشده است</p>
        </Card>
      ) : (
        <Card className="gap-0 px-4 py-1">
          {periods.map((period, index) => {
            const meta = FEE_PERIOD_META[period.status];

            return (
              <Fragment key={period.periodStart}>
                {index > 0 ? <Separator /> : null}
                <div className="flex items-center gap-3 py-2.5">
                  <span className="min-w-0 flex-1">
                    <b className="flex items-center gap-1.5 truncate text-[12px] font-semibold text-ink-body">
                      <span className="truncate">{feeMonthLabel(feeMonthOfDate(period.periodStart))}</span>
                      <StatusBadge tone={meta.tone} className="shrink-0 px-1.5 py-[3px] text-[11px]">
                        {meta.label}
                      </StatusBadge>
                    </b>
                    <span className="mt-0.5 block truncate text-[12px] font-medium tabular-nums text-ink-subtle">
                      {period.expectedAmount !== null
                        ? `شهریه ماهانه: ${formatMoney(period.expectedAmount)} · پرداخت شده: ${formatMoney(period.paidAmount)}`
                        : `پرداخت شده: ${formatMoney(period.paidAmount)}`}
                    </span>
                  </span>
                </div>
              </Fragment>
            );
          })}

          <Separator />

          <div className="flex items-center justify-between gap-3 py-2.5">
            <b className="text-[12px] font-extrabold text-ink-body">پرداخت ها</b>
            {payments.length > 0 ? <StatusBadge>{toPersianDigits(String(payments.length))} پرداخت</StatusBadge> : null}
          </div>

          {payments.length === 0 ? (
            <p className="pb-3 text-center text-[12px] font-semibold leading-5 text-ink-subtle">پرداختی ثبت نشده است</p>
          ) : (
            payments.map((payment, index) => {
              const voided = payment.status === "CONFIRMED" ? null : FEE_PAYMENT_VOID_META[payment.status];
              const reason = voided ? payment[voided.reasonKey] : null;

              return (
                <Fragment key={payment.id}>
                  {index > 0 ? <Separator /> : null}
                  <div className={cn("flex items-center gap-3 py-2.5", voided && "opacity-55")}>
                    <span className="min-w-0 flex-1">
                      <b className="flex items-center gap-1.5 truncate text-[12px] font-semibold text-ink-body">
                        <span className="truncate">{feeMonthLabel(feeMonthOfDate(payment.period.periodStart))}</span>
                        {voided ? (
                          <StatusBadge tone={voided.tone} className="shrink-0 px-1.5 py-[3px] text-[11px]">
                            {voided.label}
                          </StatusBadge>
                        ) : null}
                      </b>
                      <span className="mt-0.5 block truncate text-[12px] font-medium tabular-nums text-ink-subtle">
                        {toJalaliDateTime(payment.paidAt)}
                        {payment.note ? ` · ${payment.note}` : ""}
                        {reason ? ` · ${reason}` : ""}
                      </span>
                    </span>
                    <b className="shrink-0 text-[12px] font-extrabold tabular-nums text-ink-body">{formatMoney(payment.amount)}</b>
                  </div>
                </Fragment>
              );
            })
          )}
        </Card>
      )}
    </section>
  );
}
