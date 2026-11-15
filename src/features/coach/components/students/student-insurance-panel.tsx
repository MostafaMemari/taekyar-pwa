"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { SheetActions } from "@/components/shared/sheet-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { StatusBadge } from "@/features/coach/components/status-badge";
import { useRemoveStudentInsurance } from "@/features/coach/hooks/use-student-mutations";
import { INSURANCE_META, insuranceStatusOf } from "@/features/coach/lib/students-options";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { toJalaliDate } from "@/lib/jalali";
import { cn } from "@/lib/utils";
import { StudentInsuranceSheet } from "./student-insurance-sheet";

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
  const remove = useRemoveStudentInsurance();

  const status = insuranceStatusOf(expiryDate, INSURING_DAYS);
  const meta = INSURANCE_META[status];
  const Icon = meta.icon;
  const daysLeft = expiryDate ? daysFromToday(expiryDate) : null;
  const elapsed = daysLeft === null ? 0 : Math.max(0, Math.min(1, 1 - daysLeft / VALIDITY_DAYS));

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
                className="bar-fill block h-full w-full rounded-full transition-[clip-path] duration-500 motion-safe:animate-[bar-reveal_900ms_cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  clipPath: `inset(0 ${100 - Math.max(1, Math.round(elapsed * 100))}% 0 0)`,
                  backgroundColor: elapsed >= 0.8 ? "var(--st-red)" : elapsed >= 0.5 ? "var(--st-orange)" : "var(--st-green)",
                }}
              />
            </div>
          </div>
        ) : null}

        {renewed ? <p className="mt-2 text-[12px] font-bold text-success">بیمه ثبت و تا یک سال آینده معتبر شد</p> : null}

        {expiryDate ? (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-xl text-[12px] font-bold"
              onClick={() => {
                setRenewed(false);
                setOpen(true);
              }}
            >
              تمدید بیمه
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-11 w-full rounded-xl text-[12px] font-bold text-danger hover:bg-danger-soft/60"
              onClick={() => setDeleteOpen(true)}
            >
              حذف بیمه
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="mt-3 h-11 w-full rounded-xl text-[12px] font-bold"
            onClick={() => {
              setRenewed(false);
              setOpen(true);
            }}
          >
            ثبت بیمه ورزشی
          </Button>
        )}

        <StudentInsuranceSheet open={open} onOpenChange={setOpen} studentId={studentId} hasInsurance={Boolean(expiryDate)} />

        <SheetFrame open={deleteOpen} onOpenChange={setDeleteOpen} title="حذف بیمه ورزشی" description="تایید حذف بیمه هنرجو">
          <p className="rounded-xl bg-danger-soft/60 p-3 text-[12px] leading-5 text-ink-muted">
            با حذف، بیمه این هنرجو از پرونده برداشته می شود و در آمار و فیلترها بدون بیمه محسوب می شود. این کار قابل بازگشت نیست
          </p>
          <AuthFormError message={remove.error ? apiErrorMessage(remove.error) : ""} />
          <SheetActions onSecondary={() => setDeleteOpen(false)}>
            <Button
              variant="destructive"
              className="h-11 flex-[2] rounded-xl text-[12px] font-bold"
              disabled={remove.isMutating}
              onClick={() => void confirmRemove()}
            >
              {remove.isMutating ? "در حال حذف..." : "حذف بیمه"}
            </Button>
          </SheetActions>
        </SheetFrame>
      </Card>
    </section>
  );
}
