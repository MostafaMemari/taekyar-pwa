"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/ding-toaster";
import { AuthField } from "@/components/shared/auth-field";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { DatePicker } from "@/components/shared/date-picker";
import { SheetActions } from "@/components/shared/sheet-actions";
import { Button } from "@/components/ui/button";
import { useRenewStudentInsurance } from "@/features/coach/hooks/use-student-mutations";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { addJalaliYears, todayJalali, toGregorianDate } from "@/lib/jalali";

// Insurance form without its own sheet: the panel sheet wraps it, the quick-info sheet swaps it in.
export function StudentInsuranceForm({
  studentId,
  hasInsurance,
  onDone,
}: {
  studentId: string;
  hasInsurance: boolean;
  onDone: () => void;
}) {
  const router = useRouter();
  // Fresh mount on every open, so the initializer alone starts from the full-year date the backend accepts.
  const defaultDate = addJalaliYears(todayJalali(), 1);
  const [date, setDate] = useState(defaultDate);
  const [dateError, setDateError] = useState("");
  const renew = useRenewStudentInsurance();
  // Bounds come from the default, so a cleared value can never collapse the year wheel.
  const year = Number(defaultDate.split("/")[0]);

  const submit = async () => {
    const sportsInsuranceDate = toGregorianDate(date);
    if (!sportsInsuranceDate) {
      setDateError("تاریخ اعتبار بیمه را انتخاب کنید");
      return;
    }

    try {
      await renew.trigger({ id: studentId, sportsInsuranceDate });
      toast.success("بیمه ثبت شد");
      onDone();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) router.replace("/login");
    }
  };

  return (
    <>
      <AuthField label="تاریخ اعتبار بیمه" htmlFor="insuranceDate" required hint="از امروز تا یک سال بعد از امروز">
        <DatePicker
          id="insuranceDate"
          title="تاریخ اعتبار بیمه"
          value={date}
          onChange={(next) => {
            setDate(next);
            setDateError("");
          }}
          defaultValue={defaultDate}
          from={todayJalali()}
          to={defaultDate}
          fromYear={year - 1}
          toYear={year}
        />
      </AuthField>

      <p className="rounded-xl bg-info-soft/60 p-3 text-[12px] leading-5 text-ink-muted">
        ۷ روز قبل از انقضای بیمه، یادآوری به مربی ارسال می شود
      </p>

      <AuthFormError message={dateError || (renew.error ? apiErrorMessage(renew.error) : "")} />

      <SheetActions onSecondary={onDone}>
        <Button
          variant="brand"
          className="h-11 flex-[2] rounded-xl text-[12px] font-bold"
          disabled={renew.isMutating}
          onClick={() => void submit()}
        >
          {renew.isMutating ? "در حال ثبت..." : hasInsurance ? "تمدید بیمه" : "ثبت بیمه"}
        </Button>
      </SheetActions>
    </>
  );
}
