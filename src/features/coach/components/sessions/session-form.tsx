"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { CoachPageHeader } from "@/features/coach/components/coach-page-header";
import { FormDock } from "@/features/coach/components/form-dock";
import { useSaveSession } from "@/features/coach/hooks/use-session-mutations";
import { useSession } from "@/features/coach/hooks/use-sessions";
import { emptySessionForm, type SessionFormValues, sessionFormSchema, sessionToForm } from "@/features/coach/lib/session-form-model";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { SessionInfoFields } from "./session-info-fields";
import { SessionScheduleFields } from "./session-schedule-fields";

export function SessionForm({ mode, sessionId }: { mode: "create" | "edit"; sessionId?: string }) {
  const router = useRouter();
  const { data: session, error: loadError, isLoading } = useSession(sessionId);
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

  // Revalidating the class while the coach types must not overwrite what they entered, so the form is filled once.
  const filled = useRef(false);

  useEffect(() => {
    if (!session || filled.current) return;

    filled.current = true;
    reset(sessionToForm(session));
  }, [session, reset]);

  const submit = handleSubmit(async (values) => {
    try {
      const saved = await save.trigger(values);
      router.push(`/coach/sessions/${saved.id}`);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
    }
  });

  const failure = save.error ?? loadError;

  return (
    <main className="min-h-dvh px-4 pb-44 pt-[max(1rem,env(safe-area-inset-top))] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <CoachPageHeader
        title={mode === "edit" ? "ویرایش کلاس" : "کلاس جدید"}
        subtitle={session?.name}
        backHref={sessionId ? `/coach/sessions/${sessionId}` : "/coach/sessions"}
      />

      <form className="mt-4 flex flex-col gap-4" onSubmit={submit} noValidate>
        <SessionInfoFields
          control={control}
          clubLocked={Boolean(sessionId)}
          nameError={errors.name?.message}
          clubIdError={errors.clubId?.message}
        />
        <SessionScheduleFields
          control={control}
          weekDaysError={errors.weekDays?.message}
          startTimeError={errors.startTime?.message}
          endTimeError={errors.endTime?.message}
        />

        <AuthFormError message={failure ? apiErrorMessage(failure) : ""} />

        <FormDock
          cancelHref={sessionId ? `/coach/sessions/${sessionId}` : "/coach/sessions"}
          submitLabel={mode === "edit" ? "ذخیره تغییرات" : "ایجاد کلاس"}
          pending={isSubmitting || (mode === "edit" && isLoading)}
        />
      </form>
    </main>
  );
}
