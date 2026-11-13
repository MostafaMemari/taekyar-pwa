"use client";

import { useRouter } from "next/navigation";
import { toast } from "@/components/ding-toaster";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { SheetActions } from "@/components/shared/sheet-actions";
import { Button } from "@/components/ui/button";
import { useRenewStudentMembershipYear } from "@/features/coach/hooks/use-student-mutations";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { toPersianDigits } from "@/lib/digits";
import { todayJalali } from "@/lib/jalali";

// Membership-renewal confirmation without its own sheet: the panel sheet wraps it, the quick-info sheet swaps it in.
export function StudentMembershipForm({ studentId, onDone }: { studentId: string; onDone: () => void }) {
  const router = useRouter();
  const renew = useRenewStudentMembershipYear();
  const currentYear = toPersianDigits(todayJalali().split("/")[0]);

  const submit = async () => {
    try {
      await renew.trigger(studentId);
      toast.success("سال عضویت تمدید شد");
      onDone();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) router.replace("/login");
    }
  };

  return (
    <>
      <p className="mt-3 rounded-xl bg-info-soft/60 p-3 text-[12px] leading-5 text-ink-muted">
        سال عضویت به سال جاری ({currentYear}) به روز می شود
      </p>
      <AuthFormError message={renew.error ? apiErrorMessage(renew.error) : ""} />
      <SheetActions onSecondary={onDone}>
        <Button
          variant="brand"
          className="h-11 flex-[2] rounded-xl text-[12px] font-bold"
          disabled={renew.isMutating}
          onClick={() => void submit()}
        >
          {renew.isMutating ? "در حال تمدید..." : "تمدید عضویت"}
        </Button>
      </SheetActions>
    </>
  );
}
