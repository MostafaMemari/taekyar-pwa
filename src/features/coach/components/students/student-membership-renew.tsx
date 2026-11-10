"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { useRenewStudentMembershipYear } from "@/features/coach/hooks/use-student-mutations";
import { membershipChargeOf } from "@/features/coach/lib/students-options";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { toPersianDigits } from "@/lib/digits";
import { todayJalali } from "@/lib/jalali";

const NOT_SET = "ثبت نشده";

export function StudentMembershipRenew({ studentId, membershipYear }: { studentId: string; membershipYear: number | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [renewed, setRenewed] = useState(false);
  const renew = useRenewStudentMembershipYear();

  const charge = membershipChargeOf(membershipYear);
  const currentYear = toPersianDigits(todayJalali().split("/")[0]);

  const submit = async () => {
    try {
      await renew.trigger(studentId);
      setOpen(false);
      setRenewed(true);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) router.replace("/login");
    }
  };

  return (
    <section>
      <SectionHeading title="تمدید عضویت" />

      <Card className="gap-0 p-4">
        <div className="flex min-h-6 items-center justify-between gap-3">
          <span className="shrink-0 text-[12px] font-medium text-ink-muted">سال عضویت</span>
          <span className="text-[13px] font-bold text-ink">{membershipYear ? toPersianDigits(String(membershipYear)) : NOT_SET}</span>
        </div>
        <div className="mt-3 flex min-h-6 items-center justify-between gap-3">
          <span className="shrink-0 text-[12px] font-medium text-ink-muted">شارژ بانک اطلاعاتی</span>
          {charge === null ? (
            <span className="text-[13px] font-bold text-ink">{NOT_SET}</span>
          ) : charge.due === 0 ? (
            <span className="text-[13px] font-bold text-success">معتبر</span>
          ) : (
            <span className="text-[13px] font-bold text-warning">{toPersianDigits(String(charge.due))} سال شارژ</span>
          )}
        </div>

        {renewed ? <p className="mt-2 text-[12px] font-bold text-success">سال عضویت به سال جاری به روز شد.</p> : null}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 w-full rounded-xl text-[12px] font-bold"
          onClick={() => {
            setOpen(true);
            setRenewed(false);
          }}
        >
          تمدید سال عضویت
        </Button>

        <SheetFrame open={open} onOpenChange={setOpen} title="تمدید سال عضویت" description="تایید تمدید سال عضویت هنرجو">
          <p className="rounded-xl bg-info-soft/60 p-3 text-[12px] leading-5 text-ink-muted">
            سال عضویت به سال جاری ({currentYear}) به روز می شود و شارژ بانک اطلاعاتی این هنرجو معتبر می شود.
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
              {renew.isMutating ? "در حال تمدید..." : "تمدید عضویت"}
            </Button>
          </div>
        </SheetFrame>
      </Card>
    </section>
  );
}
