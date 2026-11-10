"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthField } from "@/components/shared/auth-field";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { AuthInput } from "@/components/shared/auth-input";
import { AuthSelect } from "@/components/shared/auth-select";
import { Button } from "@/components/ui/button";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { useClubMembers } from "@/features/coach/hooks/use-clubs";
import { useClubFee } from "@/features/coach/hooks/use-fee";
import { useRecordFeePayment } from "@/features/coach/hooks/use-fee-mutations";
import type { FeeMonth } from "@/features/coach/lib/fee-api";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { digitsOnly } from "@/lib/digits";
import { FeeMonthSelect } from "./fee-month-select";

export function FeePaymentSheet({
  open,
  onOpenChange,
  clubId,
  month,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clubId: string;
  month: FeeMonth;
}) {
  const router = useRouter();
  const { data: members, isLoading: membersLoading } = useClubMembers(clubId);
  const { data: fee } = useClubFee(clubId);
  const record = useRecordFeePayment(clubId);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [picked, setPicked] = useState<FeeMonth>(month);
  // Stays null until the coach types, so the stored fee amount shows through untouched.
  const [amount, setAmount] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const close = () => {
    setStudentId(null);
    setPicked(month);
    setAmount(null);
    setNote("");
    record.reset();
    onOpenChange(false);
  };

  const activeMembers = (members ?? []).filter((member) => member.isActive);
  const amountValue = amount ?? (fee ? String(Math.trunc(Number(fee.monthlyAmount))) : "");
  const canSubmit = studentId !== null && !membersLoading && !record.isMutating;

  const submit = async () => {
    if (!studentId) return;
    try {
      await record.trigger({
        studentId,
        year: picked.year,
        month: picked.month,
        ...(amountValue !== "" && { amount: Number(amountValue) }),
        ...(note.trim() && { note: note.trim() }),
      });
      close();
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
    }
  };

  return (
    <SheetFrame
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : close())}
      title="ثبت پرداخت شهریه"
      description="پرداخت هنرجو برای ماه انتخاب شده ثبت می شود"
    >
      <div className="mt-3 flex flex-col gap-3">
        {fee ? null : (
          <p className="rounded-xl bg-danger-soft/60 p-3 text-[12px] font-bold leading-5 text-danger">ابتدا شهریه باشگاه را تنظیم کنید</p>
        )}

        <AuthField label="هنرجو" htmlFor="feePaymentStudent" required>
          <AuthSelect
            id="feePaymentStudent"
            placeholder="انتخاب هنرجو"
            value={studentId}
            onValueChange={setStudentId}
            disabled={membersLoading}
            options={activeMembers.map((member) => ({ value: member.studentId, label: member.student.fullName }))}
          />
        </AuthField>

        <AuthField label="ماه پرداخت" htmlFor="feePaymentMonth">
          <FeeMonthSelect value={picked} onChange={setPicked} />
        </AuthField>

        <AuthField label="مبلغ (تومان)" htmlFor="feePaymentAmount" optional hint="خالی بماند مبلغ شهریه باشگاه ثبت می شود">
          <AuthInput
            id="feePaymentAmount"
            inputMode="numeric"
            dir="ltr"
            maxLength={12}
            value={amountValue}
            onChange={(event) => setAmount(digitsOnly(event.target.value, 12))}
          />
        </AuthField>

        <AuthField label="توضیح" htmlFor="feePaymentNote" optional>
          <AuthInput
            id="feePaymentNote"
            maxLength={200}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="مثلا قسط اول"
          />
        </AuthField>

        <AuthFormError message={record.error ? apiErrorMessage(record.error) : ""} />

        <div className="flex items-center gap-2 border-t border-[var(--line-2)] pt-3">
          <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={close} disabled={record.isMutating}>
            انصراف
          </Button>
          <Button
            type="button"
            variant="brand"
            className="h-11 flex-1 rounded-xl text-[12px]"
            disabled={!canSubmit || !fee}
            onClick={() => void submit()}
          >
            {record.isMutating ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" /> : null}
            {record.isMutating ? "در حال ثبت..." : "ثبت پرداخت"}
          </Button>
        </div>
      </div>
    </SheetFrame>
  );
}
