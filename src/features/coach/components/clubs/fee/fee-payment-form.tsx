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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useClubMembers } from "@/features/coach/hooks/use-clubs";
import { useClubFee, useClubFeeRates, useFeeMonthStates } from "@/features/coach/hooks/use-fee";
import { useRecordFeePayment, useSaveClubFee } from "@/features/coach/hooks/use-fee-mutations";
import type { ClubRecord } from "@/features/coach/lib/club-api";
import { currentFeeMonth, type FeeMonth, rateAmountForMonth } from "@/features/coach/lib/fee-api";
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
  const { data: fee, isLoading: feeLoading } = useClubFee(activeClubId);
  const { data: rates, isLoading: ratesLoading } = useClubFeeRates(activeClubId);
  const record = useRecordFeePayment();
  const saveFee = useSaveClubFee();
  const [studentId, setStudentId] = useState<string | null>(initialStudentId ?? null);

  // The picker normally starts at the current month, but a preset owed month (debtor list) may reach into the past.
  const now = currentFeeMonth();
  const start = month.year < now.year || (month.year === now.year && month.month < now.month) ? month : now;
  const [picked, setPicked] = useState<FeeMonth>(start);
  // The inline first-rate input keeps its own draft.
  const [feeAmount, setFeeAmount] = useState<string | null>(null);
  // The amount draft stays null until the coach types, so the month's remaining balance is the live default.
  const [amount, setAmount] = useState<string | null>(null);
  const [settleMode, setSettleMode] = useState<"settled" | "partial">("settled");
  const [note, setNote] = useState("");

  const monthStates = useFeeMonthStates(
    studentId !== null ? activeClubId : null,
    studentId,
    Array.from({ length: 12 - start.month + 1 }, (_, index) => ({ year: start.year, month: start.month + index })),
  );

  const clubOptions = (clubs ?? [])
    .filter((club) => club.isActive || club.id === activeClubId)
    .map((club) => ({ value: club.id, label: club.name }));
  const clubInactive = (clubs ?? []).find((club) => club.id === activeClubId)?.isActive === false;
  const clubMissing = fixedStudent && clubOptions.length === 0;
  const activeMembers = (members ?? []).filter((member) => member.isActive);
  const feeValue = feeAmount ?? "";
  const pickedState = monthStates.data?.find((state) => state.year === picked.year && state.month === picked.month);
  const monthSettled = pickedState?.settled ?? false;
  // The rate that covers the picked month — a scheduled rate must not prefill earlier months.
  const monthRate = rates ? rateAmountForMonth(rates, picked) : null;
  const remaining = Math.max((monthRate ?? Number(fee?.monthlyAmount ?? 0)) - (pickedState?.paidAmount ?? 0), 0);
  const amountValue = amount ?? (remaining > 0 ? String(remaining) : "");
  const canSubmit =
    activeClubId !== "" &&
    !clubInactive &&
    studentId !== null &&
    fee !== null &&
    !membersLoading &&
    monthStates.data !== undefined &&
    !monthSettled &&
    amountValue !== "" &&
    Number(amountValue) > 0 &&
    !record.isMutating;

  const submitFee = async () => {
    if (activeClubId === "" || feeValue === "" || clubInactive) return;
    try {
      await saveFee.trigger({ clubId: activeClubId, monthlyAmount: Number(feeValue) });
      setFeeAmount(null);
      toast.success("شهریه ذخیره شد");
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
    }
  };

  // Every month or student switch resets the draft, so the stale figure never leaks across.
  const resetDraft = () => {
    setAmount(null);
    setSettleMode("settled");
  };

  const changeAmount = (raw: string) => {
    const value = digitsOnly(raw, 12);
    setAmount(value);
    // Typing below the remaining balance is an installment; reaching it settles the month.
    if (value !== "") setSettleMode(Number(value) < remaining ? "partial" : "settled");
  };

  const submit = async () => {
    if (!studentId || activeClubId === "") return;
    try {
      await record.trigger({
        clubId: activeClubId,
        studentId,
        year: picked.year,
        month: picked.month,
        amount: Number(amountValue),
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
                  resetDraft();
                }}
                options={clubOptions}
                disabled={fixedStudent && clubOptions.length === 1}
              />
            </AuthField>
          ) : null}
          {clubInactive ? (
            <p className="rounded-xl bg-muted/60 p-3 text-[12px] font-bold leading-5 text-ink-muted">
              این باشگاه غیرفعال است و امکان ثبت شهریه وجود ندارد
            </p>
          ) : null}
          {/* The first-rate setup only shows once the fee query settled, so it never flashes while loading. */}
          {fee || feeLoading || activeClubId === "" || clubInactive ? null : (
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
              <div className="mt-2 h-44 overflow-y-auto no-scrollbar rounded-xl border border-[var(--line-2)]">
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
                        onClick={() => {
                          setStudentId(member.studentId);
                          resetDraft();
                        }}
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
            <FeeMonthSelect
              value={picked}
              onChange={(month) => {
                setPicked(month);
                resetDraft();
              }}
              fromMonth={start.month}
              disabledMonths={monthStates.data?.filter((state) => state.settled).map((state) => state.month)}
            />
          </AuthField>
          {/* The rate line holds its own spot with a same-size skeleton while the rates load, so the amount
              and the action row never shift when it lands. */}
          {rates ? (
            <p className="text-[12px] font-semibold leading-5 text-ink-subtle">
              {monthRate !== null
                ? `شهریه ماهانه: ${formatMoney(monthRate)} تومان`
                : "مبلغ این ماه بر اساس نرخ پیشین این باشگاه محاسبه می شود"}
            </p>
          ) : ratesLoading ? (
            <Skeleton className="h-5 w-3/4" />
          ) : null}
          <AuthField label="مبلغ پرداخت (تومان)" htmlFor="feePaymentAmount" required>
            <AuthInput
              id="feePaymentAmount"
              inputMode="numeric"
              dir="ltr"
              maxLength={15}
              value={amountValue === "" ? "" : formatMoney(amountValue)}
              onChange={(event) => changeAmount(event.target.value)}
            />
          </AuthField>
          <ToggleGroup
            aria-label="نوع پرداخت"
            value={[settleMode]}
            onValueChange={(next) => {
              const selected = next[0];
              if (!selected) return;
              setSettleMode(selected as "settled" | "partial");
              // Settling pins the amount to the remaining balance; a partial intent with the full
              // amount left in would settle on the backend anyway, so the field asks for a figure.
              if (selected === "settled" && remaining > 0) setAmount(String(remaining));
              if (selected === "partial" && Number(amountValue) >= remaining) setAmount("");
            }}
            variant="segmented"
            spacing={1}
            className="w-full rounded-full bg-muted p-1"
          >
            {[
              { value: "settled", label: "تسویه شده" },
              { value: "partial", label: "پرداخت ناقص" },
            ].map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                className="h-9 flex-1 rounded-full text-[12px] font-bold aria-pressed:bg-background aria-pressed:text-accent-ink"
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
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
          {monthSettled ? "این ماه تسویه شده است" : "ثبت پرداخت"}
        </Button>
      </SheetActions>
    </div>
  );
}
