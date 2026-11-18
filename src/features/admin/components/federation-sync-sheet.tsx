"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/components/ding-toaster";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { SheetActions } from "@/components/shared/sheet-actions";
import { Button } from "@/components/ui/button";
import { CoachSelectField } from "@/features/admin/components/coach-select-field";
import { useSyncCoachStudents } from "@/features/admin/hooks/use-federation-mutations";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { toPersianDigits } from "@/lib/digits";

const syncSchema = z.object({
  coachId: z.string().min(1, "مربی را انتخاب کنید"),
});

type SyncFormValues = z.infer<typeof syncSchema>;

const emptySyncForm: SyncFormValues = { coachId: "" };

export function FederationSyncSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const syncAction = useSyncCoachStudents();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SyncFormValues>({ resolver: zodResolver(syncSchema), defaultValues: emptySyncForm });

  const submit = handleSubmit(async (values) => {
    try {
      const result = await syncAction.trigger(values.coachId);
      const { synced, unchanged, failed } = result.summary;
      const parts = [`${toPersianDigits(String(synced))} هنرجو به روز شد`, `${toPersianDigits(String(unchanged))} بدون تغییر`];
      if (failed) parts.push(`${toPersianDigits(String(failed))} ناموفق`);
      toast.success(`همگام سازی فدراسیون: ${parts.join(" · ")}`);
      onOpenChange(false);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
    }
  });

  const pending = isSubmitting || syncAction.isMutating;
  const error = syncAction.error ? apiErrorMessage(syncAction.error) : "";

  return (
    <SheetFrame
      open={open}
      onOpenChange={onOpenChange}
      title="همگام سازی با فدراسیون"
      description="کمربند و پروفایل هنرجویان مربی به روز می شود"
    >
      <div className="mt-3 flex flex-col gap-3.5">
        <Controller
          control={control}
          name="coachId"
          render={({ field }) => (
            <CoachSelectField
              id="federationSyncCoach"
              value={field.value || null}
              onValueChange={(value) => field.onChange(value ?? "")}
              error={errors.coachId?.message}
            />
          )}
        />

        <AuthFormError message={error} />
      </div>

      <SheetActions className="mt-3" onSecondary={() => onOpenChange(false)} secondaryDisabled={pending}>
        <Button
          type="button"
          variant="brand"
          className="h-11 flex-[2] rounded-xl text-[12px] font-bold"
          disabled={pending}
          onClick={() => void submit()}
        >
          {pending ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" /> : null}
          شروع همگام سازی
        </Button>
      </SheetActions>
    </SheetFrame>
  );
}
