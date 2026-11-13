"use client";

import { Check, Landmark, Loader2, Search, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "@/components/ding-toaster";
import { AuthField } from "@/components/shared/auth-field";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { AuthInput } from "@/components/shared/auth-input";
import { AuthSelect } from "@/components/shared/auth-select";
import { SheetActions } from "@/components/shared/sheet-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useClubMembers } from "@/features/coach/hooks/use-clubs";
import { useClubFee, useFeePaidMonths } from "@/features/coach/hooks/use-fee";
import { useRecordFeePayment, useSaveClubFee } from "@/features/coach/hooks/use-fee-mutations";
import type { ClubRecord } from "@/features/coach/lib/club-api";
import { currentFeeMonth, type FeeMonth, rateCoversMonth } from "@/features/coach/lib/fee-api";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { digitsOnly, formatMoney } from "@/lib/digits";
import { cn } from "@/lib/utils";
import { FeeMonthSelect } from "./fee-month-select";

const SEARCH_DEBOUNCE_MS = 400;

// Payment form without its own sheet: the fee sheet wraps it, the quick-info sheet swaps it in.
export function FeePaymentForm({
  clubId,
  clubs,
  month,
  initialStudentId,
  onDone,
}: {
  clubId: string;
  // Pass the coach's clubs so the form can offer a picker; a single club needs none.
  clubs?: ClubRecord[];
  month: FeeMonth;
  // Pins the payment to one student: the picker disappears and a missing club shows a notice instead.
  initialStudentId?: string;
  onDone: () => void;
}) {
  const router = useRouter();
  const [pickedClubId, setPickedClubId] = useState<string | null>(null);
  const activeClubId = pickedClubId ?? clubId;
  const fixedStudent = initialStudentId !== undefined;
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");

  // The API does the search; typing waits for a pause so the list does not refetch per character.
  useEffect(() => {
    const timer = setTimeout(() => setTerm(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  // A pinned student skips the member fetch entirely.
  const { data: members, isLoading: membersLoading } = useClubMembers(fixedStudent ? "" : activeClubId, term || undefined);
  const { data: fee } = useClubFee(activeClubId);
  const record = useRecordFeePayment();
  const saveFee = useSaveClubFee();
  const [studentId, setStudentId] = useState<string | null>(initialStudentId ?? null);

  // The picker normally starts at the current month, but a preset owed month (debtor list) may reach into the past.
  const now = currentFeeMonth();
  const start = month.year < now.year || (month.year === now.year && month.month < now.month) ? month : now;
  const [picked, setPicked] = useState<FeeMonth>(start);
  // The inline first-rate input keeps its own draft; the payment amount is not editable at all.
  const [feeAmount, setFeeAmount] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const paidMonths = useFeePaidMonths(
    studentId !== null ? activeClubId : null,
    studentId,
    Array.from({ length: 12 - start.month + 1 }, (_, index) => ({ year: start.year, month: start.month + index })),
  );

  const clubOptions = (clubs ?? []).map((club) => ({ value: club.id, label: club.name }));
  const clubMissing = fixedStudent && clubOptions.length === 0;
  const activeMembers = (members ?? []).filter((member) => member.isActive);
  const feeValue = feeAmount ?? "";
  const monthPaid = paidMonths.data?.includes(picked.month) ?? false;
  const canSubmit =
    activeClubId !== "" &&
    studentId !== null &&
    fee !== null &&
    !membersLoading &&
    paidMonths.data !== undefined &&
    !monthPaid &&
    !record.isMutating;

  const submitFee = async () => {
    if (activeClubId === "" || feeValue === "") return;
    try {
      await saveFee.trigger({ clubId: activeClubId, monthlyAmount: Number(feeValue) });
      setFeeAmount(null);
      toast.success("شهریه ذخیره شد");
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
        ...(note.trim() && { note: note.trim() }),
      });
      toast.success("پرداخت ثبت شد");
      onDone();
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
    }
  };

  return (
    <div className="mt-3 flex flex-col gap-3">
      {clubMissing ? (
        <p className="rounded-xl bg-muted/60 p-3 text-[12px] font-bold leading-5 text-ink-muted">
          این هنرجو عضو هیچ باشگاه فعالی نیست · برای ثبت شهریه، ابتدا او را در یک باشگاه عضو کنید
        </p>
      ) : (
        <>
          {clubOptions.length > 1 || (fixedStudent && clubOptions.length === 1) ? (
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
                disabled={fixedStudent && clubOptions.length === 1}
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
                ثبت شهریه برای باشگاه
              </Button>
            </div>
          )}

          {fixedStudent ? null : (
            <AuthField label="هنرجو" htmlFor="feePaymentStudent" required>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-subtle"
                  aria-hidden="true"
                />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="جستجوی نام یا کد ملی"
                  aria-label="جستجوی هنرجو"
                  className="h-11 rounded-xl ps-10"
                />
              </div>
              <div className="mt-2 max-h-44 overflow-y-auto no-scrollbar rounded-xl border border-[var(--line-2)]">
                {membersLoading && activeMembers.length === 0 ? (
                  <div className="flex flex-col gap-2 p-2.5">
                    {[0, 1, 2].map((row) => (
                      <Skeleton key={row} className="h-9 w-full rounded-lg" />
                    ))}
                  </div>
                ) : activeMembers.length === 0 ? (
                  <p className="p-3 text-center text-[12px] font-semibold leading-5 text-ink-subtle">
                    {term ? "هنرجویی با این نام یا کد ملی پیدا نشد" : "هنرجوی فعالی در این باشگاه نیست"}
                  </p>
                ) : (
                  activeMembers.map((member) => {
                    const isSelected = studentId === member.studentId;

                    return (
                      <button
                        key={member.studentId}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setStudentId(member.studentId)}
                        className={cn(
                          "flex w-full cursor-pointer items-center gap-2.5 px-3 py-2.5 text-start transition-colors hover:bg-muted/50",
                          isSelected && "bg-brand-50 text-accent-ink",
                        )}
                      >
                        <User className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
                        <span className="min-w-0 flex-1 truncate text-[12px] font-bold text-ink-body">{member.student.fullName}</span>
                        {isSelected ? <Check className="size-4 shrink-0 text-accent-ink" aria-hidden="true" /> : null}
                      </button>
                    );
                  })
                )}
              </div>
            </AuthField>
          )}

          <AuthField label="ماه پرداخت" htmlFor="feePaymentMonth">
            <FeeMonthSelect value={picked} onChange={setPicked} fromMonth={start.month} disabledMonths={paidMonths.data} />
          </AuthField>

          {fee ? (
            <p className="text-[12px] font-semibold leading-5 text-ink-subtle">
              {rateCoversMonth(fee, picked)
                ? `مبلغ قابل پرداخت: ${formatMoney(fee.monthlyAmount)} تومان`
                : "مبلغ این ماه بر اساس نرخ پیشین این باشگاه محاسبه می شود"}
            </p>
          ) : null}

          <AuthField label="توضیح" htmlFor="feePaymentNote" optional>
            <AuthInput
              id="feePaymentNote"
              maxLength={200}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="مثلا پرداخت نقدی"
            />
          </AuthField>
        </>
      )}

      <AuthFormError message={record.error ? apiErrorMessage(record.error) : ""} />

      <SheetActions onSecondary={onDone} secondaryDisabled={record.isMutating}>
        <Button
          type="button"
          variant="brand"
          className="h-11 flex-[2] rounded-xl text-[12px] font-bold"
          disabled={!canSubmit}
          onClick={() => void submit()}
        >
          {record.isMutating ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" /> : null}
          {monthPaid ? "این ماه پرداخت شده است" : "ثبت پرداخت"}
        </Button>
      </SheetActions>
    </div>
  );
}
