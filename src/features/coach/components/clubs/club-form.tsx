"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { CoachPageHeader } from "@/features/coach/components/coach-page-header";
import { FormDock } from "@/features/coach/components/form-dock";
import { useSaveClub } from "@/features/coach/hooks/use-club-mutations";
import { useClub } from "@/features/coach/hooks/use-clubs";
import type { ClubInput } from "@/features/coach/lib/club-api";
import { type ClubFormValues, clubFormSchema, clubToForm, emptyClubForm } from "@/features/coach/lib/club-form-model";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { ClubCoverFields } from "./club-cover-fields";
import { ClubFormFieldsSkeleton } from "./club-form-fields-skeleton";
import { ClubInfoFields } from "./club-info-fields";

export function ClubForm({ mode, clubId }: { mode: "create" | "edit"; clubId?: string }) {
  const router = useRouter();
  const { data: club, error: loadError, isLoading } = useClub(clubId);
  const save = useSaveClub(clubId);

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClubFormValues>({
    resolver: zodResolver(clubFormSchema),
    defaultValues: emptyClubForm,
  });

  // Revalidating the club while the coach types must not overwrite what they entered, so the form is filled once.
  const filled = useRef(false);

  useEffect(() => {
    if (!club || filled.current) return;

    filled.current = true;
    reset(clubToForm(club));
  }, [club, reset]);

  const submit = handleSubmit(async (values) => {
    const input: ClubInput = { name: values.name, address: values.address || null };

    try {
      const saved = await save.trigger(input);
      router.push(clubId ? `/coach/clubs/${saved.id}` : "/coach/clubs");
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
    }
  });

  const failure = save.error ?? loadError;

  return (
    <main className="min-h-dvh px-4 pb-44 pt-[max(1rem,env(safe-area-inset-top))] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <CoachPageHeader
        title={mode === "edit" ? "ویرایش باشگاه" : "ثبت باشگاه جدید"}
        subtitle={club?.name}
        backHref={clubId ? `/coach/clubs/${clubId}` : "/coach/clubs"}
      />

      <form className="mt-4 flex flex-col gap-4" onSubmit={submit} noValidate>
        <ClubCoverFields />
        {isLoading ? (
          <ClubFormFieldsSkeleton />
        ) : (
          <ClubInfoFields
            control={control}
            gender={club?.gender ?? null}
            nameError={errors.name?.message}
            addressError={errors.address?.message}
          />
        )}

        <AuthFormError message={failure ? apiErrorMessage(failure) : ""} />

        <FormDock
          cancelHref={clubId ? `/coach/clubs/${clubId}` : "/coach/clubs"}
          submitLabel={mode === "edit" ? "ذخیره تغییرات" : "ایجاد باشگاه"}
          pending={isSubmitting || isLoading}
        />
      </form>
    </main>
  );
}
