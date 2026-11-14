"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ding-toaster";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { SheetActions } from "@/components/shared/sheet-actions";
import { TimePicker } from "@/components/shared/time-picker";
import { Button } from "@/components/ui/button";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { useSaveSession } from "@/features/coach/hooks/use-session-mutations";
import { useSession } from "@/features/coach/hooks/use-sessions";
import { emptySessionForm, type SessionFormValues, sessionFormSchema, sessionToForm } from "@/features/coach/lib/session-form-model";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { SessionInfoFields } from "./session-info-fields";
import { SessionScheduleFields } from "./session-schedule-fields";

type TimeField = "startTime" | "endTime";

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
  const router = useRouter();
  const { data: session } = useSession(sessionId);
  const save = useSaveSession(sessionId);
  // The time pickers swap views inside this sheet instead of stacking a second sheet on top of it.
  const [picker, setPicker] = useState<TimeField | null>(null);
  // Clearing picker on close re-renders the tall form mid-exit, so the sheet visibly grows while
  // sliding out; the view is read from this ref while closed and the state resets for the next open.
  const lastViewRef = useRef<TimeField | null>(null);
  if (picker) lastViewRef.current = picker;

  const {
    control,
    reset,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SessionFormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: emptySessionForm,
  });

  // Refills once per open: edit waits for the record, create starts from the preset club.
  const filled = useRef(false);

  useEffect(() => {
    if (!open) {
      filled.current = false;
      setPicker(null);
      return;
    }
    if (filled.current || (sessionId !== undefined && !session)) return;

    filled.current = true;
    reset(session ? sessionToForm(session) : { ...emptySessionForm, ...(clubId ? { clubId } : {}) });
  }, [open, session, sessionId, clubId, reset]);

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

  // While closed the last view stays on screen through the exit animation; opening always starts on the form.
  const view = open ? picker : lastViewRef.current;

  return (
    <SheetFrame
      open={open}
      onOpenChange={onOpenChange}
      onBack={view ? () => setPicker(null) : undefined}
      title={view ? (view === "startTime" ? "انتخاب ساعت شروع" : "انتخاب ساعت پایان") : sessionId ? "ویرایش کلاس" : "ثبت کلاس جدید"}
      description={view ? "ساعت برگزاری کلاس را انتخاب کنید" : "نام، باشگاه، روزها و ساعت برگزاری را وارد کنید"}
    >
      {view ? (
        // Same soft entrance the quick sheet replays on view swaps — only this view, not the form.
        <div key={view} className="animate-in fade-in slide-in-from-bottom-2 duration-200 ease-out">
          <TimePicker
            embedded
            title={view === "startTime" ? "ساعت شروع" : "ساعت پایان"}
            value={watch(view)}
            onChange={(value) => setValue(view, value, { shouldValidate: true })}
            onDone={() => setPicker(null)}
            onCancel={() => setPicker(null)}
          />
        </div>
      ) : (
        <>
          <div className="no-scrollbar -mx-1.5 -mb-1.5 mt-3 flex max-h-[68dvh] flex-col gap-4 overflow-y-auto px-1.5 pb-1.5">
            <SessionInfoFields
              control={control}
              clubLocked={sessionId !== undefined}
              initialClubId={clubId}
              nameError={errors.name?.message}
              clubIdError={errors.clubId?.message}
            />
            <SessionScheduleFields
              control={control}
              weekDaysError={errors.weekDays?.message}
              onPickTime={setPicker}
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
      )}
    </SheetFrame>
  );
}
