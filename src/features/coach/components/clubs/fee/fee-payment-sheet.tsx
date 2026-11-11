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
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clubId: string;
  clubs?: ClubRecord[];
  month: FeeMonth;
  initialStudentId?: string;
}) {
  return (
    <SheetFrame open={open} onOpenChange={onOpenChange} title="ثبت پرداخت شهریه" description="پرداخت هنرجو برای ماه انتخاب شده ثبت می شود">
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-200 ease-out">
        <FeePaymentForm
          clubId={clubId}
          clubs={clubs}
          month={month}
          initialStudentId={initialStudentId}
          onDone={() => onOpenChange(false)}
        />
      </div>
    </SheetFrame>
  );
}
