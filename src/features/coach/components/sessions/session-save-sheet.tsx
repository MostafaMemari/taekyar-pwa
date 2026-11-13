"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ding-toaster";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { SheetActions } from "@/components/shared/sheet-actions";
import { Button } from "@/components/ui/button";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { useSaveSession } from "@/features/coach/hooks/use-session-mutations";
import { useSession } from "@/features/coach/hooks/use-sessions";
import { emptySessionForm, type SessionFormValues, sessionFormSchema, sessionToForm } from "@/features/coach/lib/session-form-model";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { SessionInfoFields } from "./session-info-fields";
import { SessionScheduleFields } from "./session-schedule-fields";

export function SessionSaveSheet({
  open,
  onOpenChange,
  sessionId,
  clubId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId?: string;
  // Presets the club select for sessions opened from a club context; edit pins it through the record.
  clubId?: string;
}) {
  return (
    <SheetFrame
      open={open}
      onOpenChange={onOpenChange}
      title={sessionId ? "ویرایش کلاس" : "ثبت کلاس جدید"}
      description={sessionId ? "نام، باشگاه و زمان بندی کلاس را ویرایش کنید" : "نام، باشگاه، روزها و ساعت برگزاری را وارد کنید"}
    >
      <SessionSaveSheetForm open={open} onOpenChange={onOpenChange} sessionId={sessionId} presetClubId={clubId} />
    </SheetFrame>
  );
}

// One RHF instance refills once per open: edit waits for the record, create starts from the preset club.
function SessionSaveSheetForm({
  open,
  onOpenChange,
  sessionId,
  presetClubId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId?: string;
  presetClubId?: string;
}) {
  const router = useRouter();
  const { data: session } = useSession(sessionId);
  const save = useSaveSession(sessionId);

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SessionFormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: emptySessionForm,
  });

  const filled = useRef(false);

  useEffect(() => {
    if (!open) {
      filled.current = false;
      return;
    }
    if (filled.current || (sessionId !== undefined && !session)) return;

    filled.current = true;
    reset(session ? sessionToForm(session) : { ...emptySessionForm, ...(presetClubId ? { clubId: presetClubId } : {}) });
  }, [open, session, sessionId, presetClubId, reset]);

  const submit = handleSubmit(async (values) => {
    try {
      await save.trigger(values);
      toast.success(sessionId ? "کلاس ذخیره شد" : "کلاس ثبت شد");
      onOpenChange(false);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
      else toast.error(apiErrorMessage(requestError));
    }
  });

  return (
    <>
      <div className="no-scrollbar mt-3 flex max-h-[68dvh] flex-col gap-4 overflow-y-auto">
        <SessionInfoFields
          control={control}
          clubLocked={sessionId !== undefined}
          initialClubId={presetClubId}
          nameError={errors.name?.message}
          clubIdError={errors.clubId?.message}
        />
        <SessionScheduleFields
          control={control}
          weekDaysError={errors.weekDays?.message}
          startTimeError={errors.startTime?.message}
          endTimeError={errors.endTime?.message}
        />
        <AuthFormError message={save.error ? apiErrorMessage(save.error) : ""} />
      </div>

      <SheetActions className="mt-3" onSecondary={() => onOpenChange(false)} secondaryDisabled={isSubmitting}>
        <Button
          type="button"
          variant="brand"
          className="h-11 flex-[2] rounded-xl text-[12px] font-bold"
          disabled={isSubmitting}
          onClick={() => void submit()}
        >
          {isSubmitting ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" /> : null}
          {sessionId !== undefined ? "ذخیره تغییرات" : "ایجاد کلاس"}
        </Button>
      </SheetActions>
    </>
  );
}
