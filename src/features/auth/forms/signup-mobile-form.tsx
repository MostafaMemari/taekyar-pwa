"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { AuthField } from "@/components/shared/auth-field";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { AuthInput } from "@/components/shared/auth-input";
import { AuthPageLead } from "@/components/shared/auth-page-lead";
import { AuthPageTitle } from "@/components/shared/auth-page-title";
import { AuthScreen } from "@/components/shared/auth-screen";
import { Button } from "@/components/ui/button";
import { requestCoachSignupOtp, requestStudentSignupOtp } from "@/features/auth/api";
import { clearPendingSignup, readPendingSignup, setPendingSignupMobile } from "@/features/auth/pending-signup";
import { type MobileForm, mobileFormSchema } from "@/features/auth/schemas";
import { apiErrorMessage } from "@/lib/api/client";
import { digitsOnly, toPersianDigits } from "@/lib/digits";

export function SignupMobileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") === "coach" ? "coach" : "student";
  const backHref = role === "coach" ? "/signup/coach" : "/signup/student";
  const [error, setError] = useState("");
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MobileForm>({
    resolver: zodResolver(mobileFormSchema),
    defaultValues: { mobile: "" },
  });

  useEffect(() => {
    const mobile = readPendingSignup()?.mobile;
    if (mobile) setValue("mobile", digitsOnly(mobile, 11));
  }, [setValue]);

  const submit = handleSubmit(async ({ mobile }) => {
    setError("");

    const signup = readPendingSignup();
    if (!signup || signup.kind !== role) {
      setError("اطلاعات ثبت نام پیدا نشد. لطفاً فرم ثبت نام را دوباره تکمیل کنید.");
      return;
    }

    try {
      if (signup.kind === "student") {
        await requestStudentSignupOtp(mobile, signup.studentData);
      } else {
        await requestCoachSignupOtp(mobile, signup.coachData);
      }

      setPendingSignupMobile(mobile);
      router.push(`/verify?from=signup&role=${role}&mobile=${mobile}`);
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    }
  });

  const message = errors.mobile?.message ?? error;

  return (
    <AuthScreen
      subtitle={role === "coach" ? "ثبت نام مربی" : "ثبت نام هنرجو"}
      backHref={backHref}
      showHeader={false}
      footer={
        <>
          قبلاً ثبت نام کرده اید؟
          <Link href="/login" className="ms-1 font-bold text-accent-ink">
            ورود
          </Link>
        </>
      }
    >
      <AuthPageTitle>شماره موبایل را وارد کنید</AuthPageTitle>
      <AuthPageLead>کد تایید به این شماره ارسال می شود؛ در گام بعد آن را وارد می کنید.</AuthPageLead>

      <form className="mt-7 flex flex-1 flex-col" onSubmit={submit} noValidate>
        <AuthField label="شماره موبایل" htmlFor="mobile" required hint={`مثال: ${toPersianDigits("09121234567")}`}>
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
          <Button variant="outline" size="cta" render={<Link href={backHref} />} nativeButton={false}>
            بازگشت
          </Button>
          <Button type="submit" variant="brand" size="cta" disabled={isSubmitting}>
            <span>{isSubmitting ? "در حال ارسال..." : "دریافت کد تایید"}</span>
            <ChevronLeft data-icon="inline-end" aria-hidden="true" />
          </Button>
        </div>

        <Link href="/" onClick={clearPendingSignup} className="mt-3 block text-center text-[11.5px] font-bold text-ink-subtle">
          انصراف از ثبت نام
        </Link>
      </form>
    </AuthScreen>
  );
}
