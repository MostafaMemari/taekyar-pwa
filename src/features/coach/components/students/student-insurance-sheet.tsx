"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthField } from "@/components/shared/auth-field";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { DatePicker } from "@/components/shared/date-picker";
import { Button } from "@/components/ui/button";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { useRenewStudentInsurance } from "@/features/coach/hooks/use-student-mutations";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { addJalaliYears, todayJalali, toGregorianDate } from "@/lib/jalali";

// One insurance form shared by the student panels and the quick-info sheet.
export function StudentInsuranceSheet({
  open,
  onOpenChange,
  studentId,
  hasInsurance,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  hasInsurance: boolean;
}) {
  const router = useRouter();
  const [date, setDate] = useState(() => addJalaliYears(todayJalali(), 1));
  const renew = useRenewStudentInsurance();
  const year = Number(date.split("/")[0]);

  // Every open starts from the exact one-year-ahead date the backend expects.
  useEffect(() => {
    if (open) setDate(addJalaliYears(todayJalali(), 1));
  }, [open]);

  const submit = async () => {
    const sportsInsuranceDate = toGregorianDate(date);
    if (!sportsInsuranceDate) return;

    try {
      await renew.trigger({ id: studentId, sportsInsuranceDate });
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) router.replace("/login");
    }
  };

  return (
    <SheetFrame open={open} onOpenChange={onOpenChange} title="ثبت بیمه ورزشی" description="تاریخ اعتبار بیمه سالانه هنرجو را تایید کنید">
      <AuthField label="تاریخ اعتبار بیمه" htmlFor="insuranceDate" required hint="باید دقیقاً یک سال بعد از امروز باشد">
        <DatePicker
          id="insuranceDate"
          title="تاریخ اعتبار بیمه"
          value={date}
          onChange={setDate}
          defaultValue={addJalaliYears(todayJalali(), 1)}
          fromYear={year - 1}
          toYear={year}
        />
      </AuthField>

      <p className="rounded-xl bg-info-soft/60 p-3 text-[12px] leading-5 text-ink-muted">
        ۷ روز قبل از انقضای بیمه، یادآوری به مربی ارسال می شود
      </p>

      <AuthFormError message={renew.error ? apiErrorMessage(renew.error) : ""} />

      <div className="flex gap-2 pt-1">
        <Button variant="outline" className="h-11 flex-1 rounded-xl" onClick={() => onOpenChange(false)}>
          انصراف
        </Button>
        <Button
          variant="brand"
          className="h-11 flex-1 rounded-xl text-[12px] font-semibold"
          disabled={renew.isMutating}
          onClick={() => void submit()}
        >
          {renew.isMutating ? "در حال ثبت..." : hasInsurance ? "تمدید بیمه" : "ثبت بیمه"}
        </Button>
      </div>
    </SheetFrame>
  );
}
