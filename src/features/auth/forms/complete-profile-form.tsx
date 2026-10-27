"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronRight, Mars, Venus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { AuthField } from "@/components/shared/auth-field";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { AuthInput } from "@/components/shared/auth-input";
import { DatePicker } from "@/components/shared/date-picker";
import { Segmented } from "@/components/shared/segmented";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { type CompleteStudentProfileData, completeStudentProfile } from "@/features/auth/api";
import { type CompleteProfileValues, completeProfileSchema } from "@/features/auth/schemas";
import { clearSession, getSession } from "@/features/auth/session";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { digitsOnly, toPersianDigits } from "@/lib/digits";
import { toGregorianDate } from "@/lib/jalali";

const GENDER_OPTIONS = [
  { value: "MALE", label: "مرد", icon: Mars },
  { value: "FEMALE", label: "زن", icon: Venus },
] as const;

const defaultValues: CompleteProfileValues = {
  fullName: "",
  nationalCode: "",
  gender: "MALE",
  birthDate: "",
  fatherName: "",
  phoneNumber: "",
};

export function CompleteProfileForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompleteProfileValues>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues,
  });

  const submit = handleSubmit(async (values) => {
    if (!getSession()) {
      router.replace("/login");
      return;
    }

    setError("");

    const birthDate = toGregorianDate(values.birthDate);
    const data: CompleteStudentProfileData = {
      fullName: values.fullName,
      nationalCode: values.nationalCode,
      gender: values.gender,
      ...(birthDate ? { birthDate } : {}),
      ...(values.fatherName ? { fatherName: values.fatherName } : {}),
      ...(values.phoneNumber ? { phoneNumber: values.phoneNumber } : {}),
    };

    try {
      await completeStudentProfile(data);
      router.replace("/student");
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        clearSession();
        router.replace("/login");
        return;
      }

      setError(apiErrorMessage(requestError));
    }
  });

  return (
    <main className="app-frame min-h-dvh">
      <form className="mx-auto w-full max-w-md px-5 pb-40 pt-6" onSubmit={submit} noValidate>
        <header className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="size-10 rounded-full"
            render={<Link href="/student" />}
            nativeButton={false}
            aria-label="بازگشت"
          >
            <ChevronRight data-icon="inline-start" aria-hidden="true" />
          </Button>
          <h1 className="min-w-0 flex-1 text-[17px] font-extrabold text-ink">تکمیل پروفایل هنرجو</h1>
        </header>

        <Card className="mt-6 rounded-[22px]">
          <CardContent>
            <FieldGroup className="gap-4">
              <AuthField label="نام و نام خانوادگی" htmlFor="fullName" error={errors.fullName?.message}>
                <Controller
                  control={control}
                  name="fullName"
                  render={({ field }) => (
                    <AuthInput
                      id="fullName"
                      name={field.name}
                      autoComplete="name"
                      value={field.value}
                      onChange={(event) => field.onChange(event.target.value)}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                  )}
                />
              </AuthField>

              <AuthField
                label="کد ملی"
                htmlFor="nationalCode"
                hint="اگر مربی شما پیش تر پروفایلی برای شما ساخته است، همان کد ملی را وارد کنید تا پروفایل به حساب شما متصل شود."
                error={errors.nationalCode?.message}
              >
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

              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <Segmented
                    label="جنسیت"
                    required={false}
                    value={field.value || null}
                    options={GENDER_OPTIONS}
                    onChange={(value) => field.onChange(value)}
                    error={errors.gender?.message}
                  />
                )}
              />

              <AuthField label="تاریخ تولد" htmlFor="birthDate">
                <Controller
                  control={control}
                  name="birthDate"
                  render={({ field }) => (
                    <DatePicker
                      id="birthDate"
                      title="تاریخ تولد"
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      defaultValue="1387/01/01"
                      fromYear={1345}
                      toYear={1405}
                    />
                  )}
                />
              </AuthField>

              <AuthField label="نام پدر" htmlFor="fatherName" error={errors.fatherName?.message}>
                <Controller
                  control={control}
                  name="fatherName"
                  render={({ field }) => (
                    <AuthInput
                      id="fatherName"
                      name={field.name}
                      value={field.value}
                      onChange={(event) => field.onChange(event.target.value)}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                  )}
                />
              </AuthField>

              <AuthField label="شماره تماس" htmlFor="phoneNumber" error={errors.phoneNumber?.message}>
                <Controller
                  control={control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <AuthInput
                      id="phoneNumber"
                      name={field.name}
                      dir="ltr"
                      inputMode="tel"
                      autoComplete="tel"
                      maxLength={11}
                      className="text-center font-bold tracking-widest"
                      value={toPersianDigits(field.value)}
                      onChange={(event) => field.onChange(digitsOnly(event.target.value, 11))}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                  )}
                />
              </AuthField>
            </FieldGroup>
          </CardContent>
        </Card>

        <AuthFormError message={error} />

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-5 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur">
          <div className="mx-auto flex w-full max-w-md items-center gap-3">
            <Button variant="outline" size="cta" className="flex-1" render={<Link href="/student" />} nativeButton={false}>
              انصراف
            </Button>
            <Button type="submit" variant="brand" size="cta" className="flex-[2]" disabled={isSubmitting}>
              <span>{isSubmitting ? "در حال ذخیره..." : "ذخیره اطلاعات"}</span>
              <Check data-icon="inline-end" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
