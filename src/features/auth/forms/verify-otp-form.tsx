"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { AuthPageLead, AuthPageTitle } from "@/components/shared/auth-brand-header";
import { AuthFormError } from "@/components/shared/auth-field";
import { AuthScreen } from "@/components/shared/auth-screen";
import { OtpInput } from "@/components/shared/otp-input";
import { Button } from "@/components/ui/button";
import { ResendControl } from "@/features/auth/components/resend-control";
import { useVerifyOtp } from "@/features/auth/hooks/use-verify-otp";
import { type OtpForm, otpFormSchema } from "@/features/auth/schemas";
import { formatMobileForDisplay } from "@/lib/digits";

export function VerifyOtpForm() {
  const searchParams = useSearchParams();
  const mobile = searchParams.get("mobile") ?? "";
  const fromSignup = searchParams.get("from") === "signup";
  const role = searchParams.get("role") === "coach" ? "coach" : "student";
  const backHref = fromSignup ? `/signup/mobile?role=${role}` : mobile ? `/login?mobile=${mobile}` : "/login";
  const { verify, error, setError } = useVerifyOtp(mobile);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OtpForm>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: { code: "" },
  });

  const submit = handleSubmit(({ code }) => verify(code));
  const message = errors.code?.message ?? error;

  return (
    <AuthScreen subtitle="تایید شماره موبایل" backHref={backHref} showHeader={false}>
      <AuthPageTitle>کد تایید را وارد کنید</AuthPageTitle>
      <AuthPageLead>
        {mobile ? (
          <>
            کد ۵ رقمی ارسال شده به شماره{" "}
            <b dir="ltr" className="inline-block font-extrabold text-ink">
              {formatMobileForDisplay(mobile)}
            </b>{" "}
            را وارد کنید.
          </>
        ) : (
          "کد ۵ رقمی ارسال شده به شماره موبایل خود را وارد کنید."
        )}
      </AuthPageLead>

      <form className="mt-7" onSubmit={submit} noValidate>
        <Controller control={control} name="code" render={({ field }) => <OtpInput value={field.value} onChange={field.onChange} />} />

        <AuthFormError message={message} />

        <div className="cta-dock cta-row mt-5 gap-3">
          <Button variant="outline" size="cta" render={<Link href={backHref} />} nativeButton={false}>
            بازگشت
          </Button>
          <Button type="submit" variant="brand" size="cta" disabled={isSubmitting}>
            <span>{isSubmitting ? "در حال بررسی..." : "تایید و ادامه"}</span>
            <ChevronLeft data-icon="inline-end" aria-hidden="true" />
          </Button>
        </div>

        {fromSignup ? (
          <Link href="/" className="mt-3 block text-center text-[11.5px] font-bold text-ink-subtle">
            انصراف از ثبت نام
          </Link>
        ) : (
          <Button
            variant="outline"
            size="cta"
            className="mt-2.5 w-full rounded-xl py-3 text-[12.5px]"
            render={<Link href="/login/clubs" />}
            nativeButton={false}
          >
            <ClipboardCheck data-icon="inline-start" aria-hidden="true" />
            <span>ورود به عنوان مربی — انتخاب باشگاه</span>
          </Button>
        )}
      </form>

      <ResendControl mobile={mobile} fromSignup={fromSignup} onError={setError} />
    </AuthScreen>
  );
}
