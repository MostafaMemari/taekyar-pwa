"use client";

import { useState } from "react";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { DatePicker } from "@/components/shared/date-picker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { StatusBadge } from "@/features/coach/components/status-badge";
import { useRegisterStudentInsurance } from "@/features/coach/hooks/use-student-mutations";
import { INSURANCE_META, insuranceStatusOf, type StudentInsuranceStatus } from "@/features/coach/lib/students-options";
import { apiErrorMessage } from "@/lib/api/client";
import { digitsOnly, toPersianDigits } from "@/lib/digits";
import { todayJalali, toGregorianDate, toJalaliDate } from "@/lib/jalali";
import { cn } from "@/lib/utils";

const DAY_MS = 86_400_000;
const INSURING_DAYS = 30;
const VALIDITY_DAYS = 365;

const TONE_COLOR: Record<StudentInsuranceStatus, string> = {
  valid: "var(--st-green)",
  expiring: "var(--st-amber)",
  expired: "var(--st-red)",
  none: "var(--surface-3)",
};

function daysFromToday(date: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(date).getTime() - today.getTime()) / DAY_MS);
}

export function StudentInsurancePanel({ expiryDate, studentId }: { expiryDate: string | null; studentId: string }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const register = useRegisterStudentInsurance();

  const status = insuranceStatusOf(expiryDate, INSURING_DAYS);
  const meta = INSURANCE_META[status];
  const Icon = meta.icon;
  const daysLeft = expiryDate ? daysFromToday(expiryDate) : null;
  const remaining = daysLeft === null ? 0 : Math.max(0, Math.min(VALIDITY_DAYS, daysLeft));
  const caption =
    daysLeft === null
      ? "برای این هنرجو تاریخ بیمه ثبت نشده است."
      : daysLeft < 0
        ? `${toPersianDigits(String(Math.abs(daysLeft)))} روز از انقضا گذشته است.`
        : `${toPersianDigits(String(daysLeft))} روز تا پایان اعتبار.`;

  const currentJalaliYear = Number(digitsOnly(todayJalali().split("/")[0]));

  const submit = async () => {
    const iso = toGregorianDate(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (iso === null) {
      setError("تاریخ پایان اعتبار بیمه را انتخاب کنید.");
      return;
    }

    const day = new Date(`${iso}T00:00:00`).getTime();
    if (day <= today.getTime()) {
      setError("تاریخ بیمه باید بعد از امروز باشد.");
      return;
    }
    if (day > today.getTime() + VALIDITY_DAYS * DAY_MS) {
      setError("بیمه حداکثر یک سال اعتبار دارد.");
      return;
    }

    setError("");
    try {
      await register.trigger({ id: studentId, isoDate: iso });
      setOpen(false);
    } catch {
      // the hook error is surfaced through AuthFormError
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
            <p className="mt-0.5 text-[12px] font-medium leading-5 text-ink-subtle">{caption}</p>
          </div>
        </div>

        {expiryDate ? (
          <div className="mt-3">
            <div className="h-2 overflow-hidden rounded-full bg-surface-sunken" role="presentation">
              <span
                className="block h-full w-full origin-right rounded-full transition-transform duration-500"
                style={{ transform: `scaleX(${remaining / VALIDITY_DAYS})`, background: TONE_COLOR[status] }}
              />
            </div>
            <p className="mt-1.5 text-[12px] font-semibold text-ink-subtle">
              مانده از یک سال اعتبار بیمه، {toPersianDigits(String(remaining))} روز
            </p>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 w-full rounded-xl text-[12px] font-bold"
            onClick={() => {
              setDate("");
              setError("");
              setOpen(true);
            }}
          >
            ثبت بیمه ورزشی
          </Button>
        )}

        <SheetFrame
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (next) setError("");
          }}
          title="ثبت بیمه ورزشی"
          description="تاریخ پایان اعتبار بیمه هنرجو را انتخاب کنید"
        >
          <div className="mt-3 flex flex-col gap-3">
            <DatePicker
              title="تاریخ پایان اعتبار بیمه"
              value={date}
              onChange={(value) => {
                setDate(value);
                setError("");
              }}
              fromYear={currentJalaliYear}
              toYear={currentJalaliYear + 1}
            />
            <p className="text-[12px] font-medium leading-5 text-ink-subtle">
              بیمه یک ساله است؛ تاریخ انتخابی باید بعد از امروز و حداکثر یک سال آینده باشد.
            </p>
            <AuthFormError message={error || (register.error ? apiErrorMessage(register.error) : "")} />
            <Button
              type="button"
              variant="brand"
              className="h-11 w-full rounded-xl text-[12px]"
              disabled={register.isMutating}
              onClick={() => void submit()}
            >
              {register.isMutating ? "در حال ثبت..." : "ثبت بیمه"}
            </Button>
          </div>
        </SheetFrame>
      </Card>
    </section>
  );
}
