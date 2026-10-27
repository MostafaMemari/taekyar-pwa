"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { AuthPageLead, AuthPageTitle } from "@/components/shared/auth-brand-header";
import { AuthField, AuthFormError, AuthInput } from "@/components/shared/auth-field";
import { AuthScreen } from "@/components/shared/auth-screen";
import { Button } from "@/components/ui/button";
import { requestLoginOtp } from "@/features/auth/api";
import { type MobileForm, mobileFormSchema } from "@/features/auth/schemas";
import { apiErrorMessage } from "@/lib/api/client";
import { digitsOnly, toPersianDigits } from "@/lib/digits";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MobileForm>({
    resolver: zodResolver(mobileFormSchema),
    defaultValues: { mobile: digitsOnly(searchParams.get("mobile") ?? "", 11) },
  });

  const submit = handleSubmit(async ({ mobile }) => {
    setError("");

    try {
      await requestLoginOtp(mobile);
      router.push(`/verify?mobile=${mobile}`);
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    }
  });

  const message = errors.mobile?.message ?? error;

  return (
    <AuthScreen
      subtitle="سامانه مدیریت تکواندو"
      backHref="/"
      showHeader={false}
      footer={
        <>
          حساب کاربری ندارید؟
          <Link href="/signup/student" className="ms-1 font-bold text-accent-ink">
            ثبت نام هنرجو
          </Link>
          <span className="mx-1 text-ink-faint">|</span>
          <Link href="/signup/coach" className="font-bold text-accent-ink">
            ثبت نام مربی
          </Link>
        </>
      }
    >
      <AuthPageTitle>ورود به حساب</AuthPageTitle>
      <AuthPageLead>شماره موبایل خود را وارد کنید تا کد تایید برای شما ارسال شود.</AuthPageLead>

      <form className="mt-7 flex flex-1 flex-col" onSubmit={submit} noValidate>
        <AuthField label="شماره موبایل" htmlFor="mobile" hint={`مثال: ${toPersianDigits("09121234567")}`}>
          <Controller
            control={control}
            name="mobile"
            render={({ field }) => (
              <AuthInput
                id="mobile"
                name={field.name}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                autoFocus
                maxLength={11}
                dir="ltr"
                icon={Smartphone}
                className="text-center text-base font-bold tracking-widest"
                placeholder={toPersianDigits("09121234567")}
                value={toPersianDigits(field.value)}
                onChange={(event) => field.onChange(digitsOnly(event.target.value, 11))}
                onBlur={field.onBlur}
                ref={field.ref}
              />
            )}
          />
        </AuthField>

        <AuthFormError message={message} />

        <div className="cta-dock cta-row mt-6 gap-3">
          <Button variant="outline" size="cta" render={<Link href="/" />} nativeButton={false}>
            بازگشت
          </Button>
          <Button type="submit" variant="brand" size="cta" disabled={isSubmitting}>
            <span>{isSubmitting ? "در حال ارسال..." : "دریافت کد تایید"}</span>
            <ChevronLeft data-icon="inline-end" aria-hidden="true" />
          </Button>
        </div>
      </form>
    </AuthScreen>
  );
}
