"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthField } from "@/components/shared/auth-field";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { DatePicker } from "@/components/shared/date-picker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { StatusBadge } from "@/features/coach/components/status-badge";
import { useRemoveStudentInsurance, useRenewStudentInsurance } from "@/features/coach/hooks/use-student-mutations";
import { INSURANCE_META, insuranceStatusOf } from "@/features/coach/lib/students-options";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { addJalaliYears, todayJalali, toGregorianDate, toJalaliDate } from "@/lib/jalali";
import { cn } from "@/lib/utils";

const INSURING_DAYS = 30;
const VALIDITY_DAYS = 365;

function daysFromToday(date: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(date).getTime() - today.getTime()) / 86_400_000);
}

export function StudentInsurancePanel({ expiryDate, studentId }: { expiryDate: string | null; studentId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [renewed, setRenewed] = useState(false);
  const [date, setDate] = useState(() => addJalaliYears(todayJalali(), 1));
  const renew = useRenewStudentInsurance();
  const remove = useRemoveStudentInsurance();

  const status = insuranceStatusOf(expiryDate, INSURING_DAYS);
  const meta = INSURANCE_META[status];
  const Icon = meta.icon;
  const daysLeft = expiryDate ? daysFromToday(expiryDate) : null;
  const remaining = daysLeft === null ? 0 : Math.max(0, Math.min(VALIDITY_DAYS, daysLeft));
  const year = Number(date.split("/")[0]);

  const submit = async () => {
    const sportsInsuranceDate = toGregorianDate(date);
    if (!sportsInsuranceDate) return;

    try {
      await renew.trigger({ id: studentId, sportsInsuranceDate });
      setOpen(false);
      setRenewed(true);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) router.replace("/login");
    }
  };

  const confirmRemove = async () => {
    try {
      await remove.trigger(studentId);
      setDeleteOpen(false);
      setRenewed(false);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) router.replace("/login");
    }
  };

  return (
    <section>
      <SectionHeading title="بیمه ورزشی" action={<StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>} />

      <Card className="gap-0 p-4">
        <div className="flex items-center gap-3">
          <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", meta.tile)}>
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <b className="block text-[13px] font-extrabold text-ink">{expiryDate ? `اعتبار تا ${toJalaliDate(expiryDate)}` : "ثبت نشده"}</b>
          </div>
        </div>

        {expiryDate ? (
          <div className="mt-3">
            <div className="h-2 overflow-hidden rounded-full bg-surface-sunken" role="presentation">
              <span
                className="block h-full w-full origin-left rounded-full transition-transform duration-500"
                style={{
                  transform: `scaleX(${(VALIDITY_DAYS - remaining) / VALIDITY_DAYS})`,
                  background: remaining <= 30 ? "var(--st-red)" : remaining <= 180 ? "var(--st-amber)" : "var(--st-green)",
                }}
              />
            </div>
          </div>
        ) : null}

        {renewed ? <p className="mt-2 text-[12px] font-bold text-success">بیمه ثبت و تا یک سال آینده معتبر شد.</p> : null}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 w-full rounded-xl text-[12px] font-bold"
          onClick={() => {
            setDate(addJalaliYears(todayJalali(), 1));
            setRenewed(false);
            setOpen(true);
          }}
        >
          {expiryDate ? "تمدید بیمه ورزشی" : "ثبت بیمه ورزشی"}
        </Button>

        {expiryDate ? (
          <Button
            type="button"
            variant="ghost"
            className="mt-1.5 w-full rounded-xl text-[12px] font-bold text-danger hover:bg-danger-soft/60"
            onClick={() => setDeleteOpen(true)}
          >
            حذف بیمه ورزشی
          </Button>
        ) : null}

        <SheetFrame open={open} onOpenChange={setOpen} title="ثبت بیمه ورزشی" description="تاریخ اعتبار بیمه سالانه هنرجو را تایید کنید.">
          <AuthField label="تاریخ اعتبار بیمه" htmlFor="insuranceDate" required hint="باید دقیقاً یک سال بعد از امروز باشد.">
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
            ۷ روز قبل از انقضای بیمه، یادآوری به مربی ارسال می شود.
          </p>

          <AuthFormError message={renew.error ? apiErrorMessage(renew.error) : ""} />

          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="h-11 flex-1 rounded-xl" onClick={() => setOpen(false)}>
              انصراف
            </Button>
            <Button
              variant="brand"
              className="h-11 flex-1 rounded-xl text-[12px] font-semibold"
              disabled={renew.isMutating}
              onClick={() => void submit()}
            >
              {renew.isMutating ? "در حال ثبت..." : expiryDate ? "تمدید بیمه" : "ثبت بیمه"}
            </Button>
          </div>
        </SheetFrame>

        <SheetFrame open={deleteOpen} onOpenChange={setDeleteOpen} title="حذف بیمه ورزشی" description="تایید حذف بیمه هنرجو">
          <p className="rounded-xl bg-danger-soft/60 p-3 text-[12px] leading-5 text-ink-muted">
            با حذف، بیمه این هنرجو از پرونده برداشته می شود و در آمار و فیلترها بدون بیمه محسوب می شود. این کار قابل بازگشت نیست.
          </p>
          <AuthFormError message={remove.error ? apiErrorMessage(remove.error) : ""} />
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="h-11 flex-1 rounded-xl" onClick={() => setDeleteOpen(false)}>
              انصراف
            </Button>
            <Button
              variant="destructive"
              className="h-11 flex-[2] rounded-xl text-[12px] font-semibold"
              disabled={remove.isMutating}
              onClick={() => void confirmRemove()}
            >
              {remove.isMutating ? "در حال حذف..." : "حذف بیمه"}
            </Button>
          </div>
        </SheetFrame>
      </Card>
    </section>
  );
}
