"use client";

import { Banknote, Loader2, Trash2 } from "lucide-react";
import { Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { ErrorState } from "@/features/coach/components/error-state";
import { LoadMoreSentinel } from "@/features/coach/components/load-more-sentinel";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { StatusBadge } from "@/features/coach/components/status-badge";
import { useFeePayments } from "@/features/coach/hooks/use-fee";
import { useRemoveFeePayment } from "@/features/coach/hooks/use-fee-mutations";
import type { FeeMonth, FeePaymentRecord } from "@/features/coach/lib/fee-api";
import { feeMonthLabel } from "@/features/coach/lib/fee-api";
import { apiErrorMessage } from "@/lib/api/client";
import { formatMoney, toPersianDigits } from "@/lib/digits";
import { toJalaliDate } from "@/lib/jalali";
import { FeePaymentSheet } from "./fee-payment-sheet";

export function FeePaymentsCard({ clubId, month }: { clubId: string; month: FeeMonth }) {
  const { payments, total, hasMore, error, isLoading, isValidating, mutate, setSize } = useFeePayments(clubId, month.year, month.month);
  const remove = useRemoveFeePayment(clubId);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [target, setTarget] = useState<FeePaymentRecord | null>(null);

  const confirmRemove = async () => {
    if (!target) return;
    try {
      await remove.trigger({ paymentId: target.id });
      setTarget(null);
    } catch {
      // the error stays visible on the sheet; keep it open so the coach can retry
    }
  };

  return (
    <section>
      <SectionHeading
        title={`پرداخت های ${feeMonthLabel(month)}`}
        action={
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 gap-1 rounded-lg px-2.5 text-[11px] font-bold"
              onClick={() => setSheetOpen(true)}
            >
              <Banknote data-icon="inline-start" aria-hidden="true" />
              ثبت پرداخت
            </Button>
            {total !== undefined ? <StatusBadge>{toPersianDigits(String(total))} پرداخت</StatusBadge> : null}
          </div>
        }
      />

      {error ? (
        <ErrorState title="خواندن پرداخت ها انجام نشد" message={apiErrorMessage(error)} onRetry={() => void mutate()} />
      ) : isLoading && !payments.length ? (
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((row) => (
            <Skeleton key={row} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <p className="rounded-xl bg-muted/60 p-3 text-center text-[12px] font-semibold leading-5 text-ink-subtle">
          پرداختی برای این ماه ثبت نشده است
        </p>
      ) : (
        <Card className="gap-0 px-4 py-1">
          {payments.map((payment, index) => (
            <Fragment key={payment.id}>
              {index > 0 ? <Separator /> : null}
              <div className="flex items-center gap-3 py-2.5">
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-[12px] font-semibold text-ink-body">{payment.student.fullName}</b>
                  <span className="mt-0.5 block truncate text-[12px] font-medium tabular-nums text-ink-subtle">
                    {toJalaliDate(payment.paidAt)}
                    {payment.note ? ` · ${payment.note}` : ""}
                  </span>
                </span>
                <b className="shrink-0 text-[12px] font-extrabold tabular-nums text-ink-body">{formatMoney(payment.amount)}</b>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 rounded-lg text-ink-subtle hover:bg-danger-soft hover:text-danger"
                  aria-label={`حذف پرداخت ${payment.student.fullName}`}
                  onClick={() => {
                    remove.reset();
                    setTarget(payment);
                  }}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </Fragment>
          ))}

          {isValidating && hasMore ? <Skeleton className="h-14 w-full rounded-xl" /> : null}
          <LoadMoreSentinel
            disabled={!hasMore || isValidating || Boolean(error)}
            onLoadMore={() => void setSize((current) => current + 1)}
          />
        </Card>
      )}

      <SheetFrame
        open={target !== null}
        onOpenChange={(open) => {
          if (!open) setTarget(null);
        }}
        title="حذف پرداخت"
        description="این پرداخت حذف شود؟"
      >
        <p className="rounded-xl bg-muted/60 p-3 text-[12px] leading-5 text-ink-muted">
          با حذف پرداخت {target?.student.fullName ?? ""}، این ماه برای او دوباره بدهکار می شود
        </p>

        {remove.error ? (
          <p role="alert" className="rounded-xl bg-danger-soft px-3 py-2 text-[12px] font-bold leading-5 text-danger">
            {apiErrorMessage(remove.error)}
          </p>
        ) : null}

        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="h-11 flex-1 rounded-xl" onClick={() => setTarget(null)} disabled={remove.isMutating}>
            انصراف
          </Button>
          <Button
            variant="destructive"
            className="h-11 flex-[2] rounded-xl text-[12px] font-semibold"
            onClick={() => void confirmRemove()}
            disabled={remove.isMutating}
          >
            {remove.isMutating ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" /> : null}
            {remove.isMutating ? "در حال حذف..." : "حذف"}
          </Button>
        </div>
      </SheetFrame>

      <FeePaymentSheet open={sheetOpen} onOpenChange={setSheetOpen} clubId={clubId} month={month} />
    </section>
  );
}
