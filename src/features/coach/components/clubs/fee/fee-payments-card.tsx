"use client";

import { Loader2, RotateCcw, Trash2 } from "lucide-react";
import { Fragment, useState } from "react";
import { toast } from "@/components/ding-toaster";
import { AuthField } from "@/components/shared/auth-field";
import { AuthInput } from "@/components/shared/auth-input";
import { SheetActions } from "@/components/shared/sheet-actions";
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
import { useCancelFeePayment, useRefundFeePayment } from "@/features/coach/hooks/use-fee-mutations";
import type { FeeMonth, FeePaymentRecord } from "@/features/coach/lib/fee-api";
import { feeMonthLabel } from "@/features/coach/lib/fee-api";
import { apiErrorMessage } from "@/lib/api/client";
import { formatMoney, toPersianDigits } from "@/lib/digits";
import { toJalaliDateTime } from "@/lib/jalali";
import { cn } from "@/lib/utils";

const SETTLED_META: Record<
  "CANCELLED" | "REFUNDED",
  { label: string; tone: "danger" | "warning"; reasonKey: "cancelReason" | "refundNote" }
> = {
  CANCELLED: { label: "لغو شده", tone: "danger", reasonKey: "cancelReason" },
  REFUNDED: { label: "برگشت داده شد", tone: "warning", reasonKey: "refundNote" },
};

export function FeePaymentsCard({ clubId, month }: { clubId: string; month: FeeMonth }) {
  const { payments, total, hasMore, error, isLoading, isValidating, mutate, setSize } = useFeePayments(clubId, month.year, month.month);
  const cancel = useCancelFeePayment(clubId);
  const refund = useRefundFeePayment(clubId);
  const [cancelTarget, setCancelTarget] = useState<FeePaymentRecord | null>(null);
  const [refundTarget, setRefundTarget] = useState<FeePaymentRecord | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [refundReason, setRefundReason] = useState("");

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    try {
      await cancel.trigger({ paymentId: cancelTarget.id, reason: cancelReason || undefined });
      setCancelTarget(null);
      toast.success("پرداخت لغو شد");
    } catch (requestError) {
      toast.error(apiErrorMessage(requestError));
    }
  };

  const confirmRefund = async () => {
    if (!refundTarget) return;
    try {
      await refund.trigger({ paymentId: refundTarget.id, reason: refundReason || undefined });
      setRefundTarget(null);
      toast.success("وجه برگشت داده شد");
    } catch (requestError) {
      toast.error(apiErrorMessage(requestError));
    }
  };

  return (
    <section>
      <SectionHeading
        title={`پرداخت های ${feeMonthLabel(month)}`}
        action={total !== undefined ? <StatusBadge>{toPersianDigits(String(total))} پرداخت</StatusBadge> : null}
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
          {payments.map((payment, index) => {
            const settled = payment.status === "CONFIRMED" ? null : SETTLED_META[payment.status];
            const reason = settled ? payment[settled.reasonKey] : null;

            return (
              <Fragment key={payment.id}>
                {index > 0 ? <Separator /> : null}
                <div className={cn("flex items-center gap-3 py-2.5", settled && "opacity-55")}>
                  <span className="min-w-0 flex-1">
                    <b className="flex items-center gap-1.5 truncate text-[12px] font-semibold text-ink-body">
                      <span className="truncate">{payment.student.fullName}</span>
                      {settled ? <StatusBadge tone={settled.tone}>{settled.label}</StatusBadge> : null}
                    </b>
                    <span className="mt-0.5 block truncate text-[12px] font-medium tabular-nums text-ink-subtle">
                      {toJalaliDateTime(payment.paidAt)}
                      {payment.note ? ` · ${payment.note}` : ""}
                      {reason ? ` · ${reason}` : ""}
                    </span>
                  </span>
                  <b className="shrink-0 text-[12px] font-extrabold tabular-nums text-ink-body">{formatMoney(payment.amount)}</b>
                  {settled ? null : (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 rounded-lg text-ink-subtle hover:bg-info-soft hover:text-info"
                        aria-label={`برگشت وجه پرداخت ${payment.student.fullName}`}
                        onClick={() => {
                          setRefundReason("");
                          setRefundTarget(payment);
                        }}
                      >
                        <RotateCcw className="size-4" aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 rounded-lg text-ink-subtle hover:bg-danger-soft hover:text-danger"
                        aria-label={`لغو پرداخت ${payment.student.fullName}`}
                        onClick={() => {
                          setCancelReason("");
                          setCancelTarget(payment);
                        }}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </>
                  )}
                </div>
              </Fragment>
            );
          })}

          {isValidating && hasMore ? <Skeleton className="h-14 w-full rounded-xl" /> : null}
          <LoadMoreSentinel
            disabled={!hasMore || isValidating || Boolean(error)}
            onLoadMore={() => void setSize((current) => current + 1)}
          />
        </Card>
      )}

      <SheetFrame
        open={cancelTarget !== null}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
        title="لغو پرداخت"
        description="این پرداخت لغو شود؟"
      >
        <p className="rounded-xl bg-muted/60 p-3 text-[12px] leading-5 text-ink-muted">
          با لغو پرداخت {cancelTarget?.student.fullName ?? ""}، این ماه برای او دوباره بدهکار می شود
        </p>

        <AuthField label="دلیل" optional htmlFor="cancelPaymentReason">
          <AuthInput
            id="cancelPaymentReason"
            value={cancelReason}
            maxLength={200}
            onChange={(event) => setCancelReason(event.target.value)}
          />
        </AuthField>

        <SheetActions onSecondary={() => setCancelTarget(null)} secondaryDisabled={cancel.isMutating}>
          <Button
            variant="destructive"
            className="h-11 flex-[2] rounded-xl text-[12px] font-bold"
            onClick={() => void confirmCancel()}
            disabled={cancel.isMutating}
          >
            {cancel.isMutating ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" /> : null}
            {cancel.isMutating ? "در حال لغو..." : "لغو پرداخت"}
          </Button>
        </SheetActions>
      </SheetFrame>

      <SheetFrame
        open={refundTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRefundTarget(null);
        }}
        title="برگشت وجه"
        description="وجه این پرداخت برگشت داده شود؟"
      >
        <p className="rounded-xl bg-muted/60 p-3 text-[12px] leading-5 text-ink-muted">
          با برگشت وجه {refundTarget?.student.fullName ?? ""}، این ماه برای او دوباره بدهکار می شود
        </p>

        <AuthField label="دلیل" optional htmlFor="refundPaymentReason">
          <AuthInput
            id="refundPaymentReason"
            value={refundReason}
            maxLength={200}
            onChange={(event) => setRefundReason(event.target.value)}
          />
        </AuthField>

        <SheetActions onSecondary={() => setRefundTarget(null)} secondaryDisabled={refund.isMutating}>
          <Button
            variant="destructive"
            className="h-11 flex-[2] rounded-xl text-[12px] font-bold"
            onClick={() => void confirmRefund()}
            disabled={refund.isMutating}
          >
            {refund.isMutating ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" /> : null}
            {refund.isMutating ? "در حال برگشت..." : "برگشت وجه"}
          </Button>
        </SheetActions>
      </SheetFrame>
    </section>
  );
}
