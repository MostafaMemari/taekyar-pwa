"use client";

import { Landmark, Loader2, User } from "lucide-react";
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
import { useRecordFeePayment, useSaveClubFee } from "@/features/coach/hooks/use-fee-mutations";
import type { ClubRecord } from "@/features/coach/lib/club-api";
import type { FeeMonth } from "@/features/coach/lib/fee-api";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { digitsOnly, formatMoney } from "@/lib/digits";
import { FeeMonthSelect } from "./fee-month-select";

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
  // Pass the coach's clubs so the sheet can offer a picker; a single club needs none.
  clubs?: ClubRecord[];
  month: FeeMonth;
  // Preselects one student, e.g. when the sheet opens from a student's quick info.
  initialStudentId?: string;
}) {
  const router = useRouter();
  const [pickedClubId, setPickedClubId] = useState<string | null>(null);
  const activeClubId = pickedClubId ?? clubId;
  const { data: members, isLoading: membersLoading } = useClubMembers(activeClubId);
  const { data: fee } = useClubFee(activeClubId);
  const record = useRecordFeePayment();
  const saveFee = useSaveClubFee();
  const [studentId, setStudentId] = useState<string | null>(initialStudentId ?? null);
  const [picked, setPicked] = useState<FeeMonth>(month);
  // Stays null until the coach types, so the stored fee amount shows through untouched.
  const [amount, setAmount] = useState<string | null>(null);
  const [feeAmount, setFeeAmount] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const close = () => {
    setPickedClubId(null);
    setStudentId(initialStudentId ?? null);
    setPicked(month);
    setAmount(null);
    setFeeAmount(null);
    setNote("");
    record.reset();
    saveFee.reset();
    onOpenChange(false);
  };

  const clubOptions = (clubs ?? []).map((club) => ({ value: club.id, label: club.name }));
  const activeMembers = (members ?? []).filter((member) => member.isActive);
  const amountValue = amount ?? (fee ? String(Math.trunc(Number(fee.monthlyAmount))) : "");
  const feeValue = feeAmount ?? "";
  const canSubmit = activeClubId !== "" && studentId !== null && fee !== null && !membersLoading && !record.isMutating;

  const submitFee = async () => {
    if (activeClubId === "" || feeValue === "") return;
    try {
      await saveFee.trigger({ clubId: activeClubId, monthlyAmount: Number(feeValue) });
      setFeeAmount(null);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
    }
  };

  const submit = async () => {
    if (!studentId || activeClubId === "") return;
    try {
      await record.trigger({
        clubId: activeClubId,
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
        {clubOptions.length > 1 ? (
          <AuthField label="باشگاه" htmlFor="feePaymentClub" required>
            <AuthSelect
              id="feePaymentClub"
              icon={Landmark}
              placeholder="انتخاب باشگاه"
              value={activeClubId}
              onValueChange={(value) => {
                setPickedClubId(value);
                setStudentId(null);
              }}
              options={clubOptions}
            />
          </AuthField>
        ) : null}

        {fee || activeClubId === "" ? null : (
          <div className="flex flex-col gap-2.5 rounded-xl bg-muted/60 p-3">
            <p className="text-[12px] font-bold leading-5 text-ink-muted">برای این باشگاه هنوز شهریه ای ثبت نشده است</p>
            <AuthField label="مبلغ شهریه ماهانه (تومان)" htmlFor="feeInlineAmount">
              <AuthInput
                id="feeInlineAmount"
                inputMode="numeric"
                dir="ltr"
                maxLength={15}
                value={feeValue === "" ? "" : formatMoney(feeValue)}
                onChange={(event) => setFeeAmount(digitsOnly(event.target.value, 12))}
              />
            </AuthField>
            {saveFee.error ? (
              <p role="alert" className="rounded-xl bg-danger-soft px-3 py-2 text-[12px] font-bold leading-5 text-danger">
                {apiErrorMessage(saveFee.error)}
              </p>
            ) : null}
            <Button
              type="button"
              variant="brand"
              className="h-11 w-full rounded-xl text-[12px] font-extrabold"
              disabled={feeValue === "" || Number(feeValue) <= 0 || saveFee.isMutating}
              onClick={() => void submitFee()}
            >
              {saveFee.isMutating ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" /> : null}
              {saveFee.isMutating ? "در حال ثبت..." : "ثبت شهریه برای باشگاه"}
            </Button>
          </div>
        )}

        <AuthField label="هنرجو" htmlFor="feePaymentStudent" required>
          <AuthSelect
            id="feePaymentStudent"
            icon={User}
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

        {fee ? (
          <AuthField label="مبلغ (تومان)" htmlFor="feePaymentAmount" optional hint="خالی بماند مبلغ شهریه باشگاه ثبت می شود">
            <AuthInput
              id="feePaymentAmount"
              inputMode="numeric"
              dir="ltr"
              maxLength={15}
              value={amountValue === "" ? "" : formatMoney(amountValue)}
              onChange={(event) => setAmount(digitsOnly(event.target.value, 12))}
            />
          </AuthField>
        ) : null}

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
