"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Fingerprint, MapPin, Medal, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { AuthField } from "@/components/shared/auth-field";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { AuthInput } from "@/components/shared/auth-input";
import { AuthSelect } from "@/components/shared/auth-select";
import { type BeltOption, BeltPicker } from "@/components/shared/belt-picker";
import { DatePicker } from "@/components/shared/date-picker";
import { Segmented } from "@/components/shared/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { CoachPageHeader } from "@/features/coach/components/coach-page-header";
import { ErrorState } from "@/features/coach/components/error-state";
import { FormDock } from "@/features/coach/components/form-dock";
import { FormSection } from "@/features/coach/components/form-section";
import { useCoachProfile } from "@/features/coach/hooks/use-coach-profile";
import { useUpdateCoachProfile } from "@/features/coach/hooks/use-coach-profile-mutations";
import { GENDER_META } from "@/features/coach/lib/coach-data";
import {
  type CoachProfileFormValues,
  coachProfileFormSchema,
  coachProfileFormToInput,
  coachProfileToForm,
  emptyCoachProfileForm,
} from "@/features/coach/lib/coach-profile-form-model";
import { GENDER_OPTIONS } from "@/features/coach/lib/student-form-options";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { digitsOnly, toPersianDigits } from "@/lib/digits";
import { PROVINCES } from "@/lib/provinces";

const COACH_BELTS: readonly BeltOption[] = [
  { value: "DAN_3", label: "دان ۳", color: "#1F2937", knotColor: "#111827", stripes: 3 },
  { value: "DAN_4", label: "دان ۴", color: "#1F2937", knotColor: "#111827", stripes: 4 },
  { value: "DAN_5", label: "دان ۵", color: "#1F2937", knotColor: "#111827", stripes: 5 },
  { value: "DAN_6", label: "دان ۶", color: "#1F2937", knotColor: "#111827", stripes: 6 },
  { value: "DAN_7", label: "دان ۷", color: "#1F2937", knotColor: "#111827", stripes: 7 },
  { value: "DAN_8", label: "دان ۸", color: "#1F2937", knotColor: "#111827", stripes: 8 },
  { value: "DAN_9", label: "دان ۹", color: "#1F2937", knotColor: "#111827", stripes: 9 },
  { value: "DAN_10", label: "دان ۱۰", color: "#1F2937", knotColor: "#111827", stripes: 10 },
];

export function CoachProfileForm() {
  const router = useRouter();
  const { data: profile, error: loadError, isLoading, mutate } = useCoachProfile();
  const save = useUpdateCoachProfile(profile?.id ?? "");

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CoachProfileFormValues>({
    resolver: zodResolver(coachProfileFormSchema),
    defaultValues: emptyCoachProfileForm,
  });

  // Revalidating the profile while the coach types must not overwrite what they entered, so the form is filled once.
  const filled = useRef(false);

  useEffect(() => {
    if (!profile || filled.current) return;

    filled.current = true;
    reset(coachProfileToForm(profile));
  }, [profile, reset]);

  const submit = handleSubmit(async (values) => {
    try {
      await save.trigger(coachProfileFormToInput(values));
      router.push("/coach/profile");
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
    }
  });

  const failure = save.error ?? loadError;

  return (
    <main className="min-h-dvh px-4 pb-44 pt-[max(1rem,env(safe-area-inset-top))] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <CoachPageHeader title="ویرایش پروفایل مربی" subtitle={profile?.fullName} backHref="/coach/profile" />

      {loadError && !profile ? (
        <ErrorState className="mt-4" title="خواندن پروفایل انجام نشد" message={apiErrorMessage(loadError)} onRetry={() => void mutate()} />
      ) : (
        <form className="mt-4 flex flex-col gap-4" onSubmit={submit} noValidate>
          {isLoading && !profile ? (
            <>
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-52 rounded-2xl" />
            </>
          ) : (
            <>
              <FormSection icon={User} title="مشخصات فردی">
                <AuthField label="نام و نام خانوادگی" htmlFor="fullName" required error={errors.fullName?.message}>
                  <Controller
                    control={control}
                    name="fullName"
                    render={({ field }) => (
                      <AuthInput
                        id="fullName"
                        name={field.name}
                        autoComplete="name"
                        icon={User}
                        placeholder="مثلاً محمدرضا یاری"
                        value={field.value}
                        onChange={(event) => field.onChange(event.target.value)}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                    )}
                  />
                </AuthField>

                <AuthField label="کد ملی" htmlFor="nationalCode" required error={errors.nationalCode?.message}>
                  <Controller
                    control={control}
                    name="nationalCode"
                    render={({ field }) => (
                      <AuthInput
                        id="nationalCode"
                        name={field.name}
                        dir="ltr"
                        inputMode="numeric"
                        autoComplete="off"
                        maxLength={10}
                        icon={Fingerprint}
                        className="text-center font-bold tracking-widest"
                        placeholder={toPersianDigits("0012345678")}
                        value={toPersianDigits(field.value)}
                        onChange={(event) => field.onChange(digitsOnly(event.target.value, 10))}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                    )}
                  />
                </AuthField>

                <Segmented
                  label="جنسیت"
                  value={profile?.gender ?? null}
                  options={GENDER_OPTIONS}
                  onChange={() => undefined}
                  disabled
                  hint={profile ? `${GENDER_META[profile.gender].label} — جنسیت پروفایل مربی قابل تغییر نیست.` : undefined}
                />

                <AuthField label="استان" htmlFor="province" required error={errors.province?.message}>
                  <Controller
                    control={control}
                    name="province"
                    render={({ field }) => (
                      <AuthSelect
                        id="province"
                        icon={MapPin}
                        value={field.value || null}
                        onValueChange={(value) => field.onChange(value ?? "")}
                        placeholder="انتخاب استان"
                        options={PROVINCES}
                      />
                    )}
                  />
                </AuthField>
              </FormSection>

              <FormSection icon={Medal} title="مشخصات حرفه ای" tone="amber">
                <AuthField label="تاریخ تولد" htmlFor="birthDate" optional error={errors.birthDate?.message}>
                  <Controller
                    control={control}
                    name="birthDate"
                    render={({ field }) => (
                      <DatePicker
                        id="birthDate"
                        title="تاریخ تولد"
                        value={field.value}
                        onChange={field.onChange}
                        defaultValue="1365/01/01"
                        fromYear={1345}
                        toYear={1405}
                      />
                    )}
                  />
                </AuthField>

                <Controller
                  control={control}
                  name="belt"
                  render={({ field }) => (
                    <BeltPicker
                      label="کمربند مربی"
                      optional
                      value={field.value || null}
                      options={COACH_BELTS}
                      onChange={(value) => field.onChange(value ?? "")}
                      hint="محدوده مجاز کمربند مربی از دان ۳ تا دان ۱۰ است."
                    />
                  )}
                />
              </FormSection>
            </>
          )}

          <AuthFormError message={failure ? apiErrorMessage(failure) : ""} />

          <FormDock cancelHref="/coach/profile" submitLabel="ذخیره تغییرات" pending={isSubmitting || save.isMutating} />
        </form>
      )}
    </main>
  );
}
