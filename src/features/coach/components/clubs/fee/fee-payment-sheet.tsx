"use client";

import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import type { ClubRecord } from "@/features/coach/lib/club-api";
import type { FeeMonth } from "@/features/coach/lib/fee-api";
import { FeePaymentForm } from "./fee-payment-form";

export function FeePaymentSheet({
  open,
  onOpenChange,
  clubId,
  clubs,
  month,
  initialStudentId,
  subtitle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clubId: string;
  clubs?: ClubRecord[];
  month: FeeMonth;
  initialStudentId?: string;
  // Names the pinned student and month, e.g. from the debtor list.
  subtitle?: string;
}) {
  return (
    <SheetFrame
      open={open}
      onOpenChange={onOpenChange}
      title="ثبت پرداخت شهریه"
      subtitle={subtitle}
      description="پرداخت هنرجو برای ماه انتخاب شده ثبت می شود"
    >
      {/* A fresh form per pinned student; the sheet itself stays mounted so its open animation runs. */}
      <FeePaymentForm
        key={initialStudentId ?? "none"}
        clubId={clubId}
        clubs={clubs}
        month={month}
        initialStudentId={initialStudentId}
        onDone={() => onOpenChange(false)}
      />
    </SheetFrame>
  );
}
