"use client";

import { useRouter } from "next/navigation";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { Button } from "@/components/ui/button";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { useRenewStudentMembershipYear } from "@/features/coach/hooks/use-student-mutations";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { toPersianDigits } from "@/lib/digits";
import { todayJalali } from "@/lib/jalali";

// One membership-renewal confirmation shared by the panels and the quick-info sheet.
export function StudentMembershipSheet({
  open,
  onOpenChange,
  studentId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
}) {
  const router = useRouter();
  const renew = useRenewStudentMembershipYear();
  const currentYear = toPersianDigits(todayJalali().split("/")[0]);

  const submit = async () => {
    try {
      await renew.trigger(studentId);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) router.replace("/login");
    }
  };

  return (
    <SheetFrame open={open} onOpenChange={onOpenChange} title="تمدید سال عضویت" description="تایید تمدید سال عضویت هنرجو">
      <p className="mt-3 rounded-xl bg-info-soft/60 p-3 text-[12px] leading-5 text-ink-muted">
        سال عضویت به سال جاری ({currentYear}) به روز می شود
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
          {renew.isMutating ? "در حال تمدید..." : "تمدید عضویت"}
        </Button>
      </div>
    </SheetFrame>
  );
}
