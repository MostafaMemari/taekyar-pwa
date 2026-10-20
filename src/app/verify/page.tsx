"use client";

import { ChevronLeft, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useEffect, useState } from "react";
import { AuthPageLead, AuthPageTitle } from "@/components/shared/auth-brand-header";
import { AuthScreen } from "@/components/shared/auth-screen";
import { OtpInput } from "@/components/shared/otp-input";
import { Button } from "@/components/ui/button";
import { formatMobileForDisplay, toPersianDigits } from "@/lib/digits";

const RESEND_SECONDS = 120;

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${toPersianDigits(String(minutes))}:${toPersianDigits(String(rest).padStart(2, "0"))}`;
}

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mobile = searchParams.get("mobile") ?? "";
  const fromSignup = searchParams.get("from") === "signup";
  const role = searchParams.get("role") === "coach" ? "coach" : "student";
  const mobileStepHref = `/signup/mobile?role=${role}`;
  const backHref = fromSignup ? mobileStepHref : mobile ? `/login?mobile=${mobile}` : "/login";
  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = window.setTimeout(() => setSecondsLeft((left) => left - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(fromSignup && role === "coach" ? "/coach" : "/student");
  };

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

      <form className="mt-7" onSubmit={handleSubmit} noValidate>
        <OtpInput value={code} onChange={setCode} />

        <div className="cta-dock cta-row mt-5 gap-3">
          <Button variant="outline" size="cta" render={<Link href={backHref} />} nativeButton={false}>
            بازگشت
          </Button>
          <Button type="submit" variant="brand" size="cta">
            <span>تایید و ادامه</span>
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

      <div className="mt-5 text-center">
        {secondsLeft > 0 ? (
          <p className="text-[12px] font-semibold text-ink-subtle" aria-live="polite">
            ارسال مجدد تا {formatCountdown(secondsLeft)}
          </p>
        ) : (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto p-0 text-[12px] font-bold text-accent-ink"
            onClick={() => setSecondsLeft(RESEND_SECONDS)}
          >
            ارسال مجدد کد
          </Button>
        )}
      </div>

      <p className="mt-auto rounded-xl bg-muted px-3 py-2 text-center text-[10px] font-semibold text-ink-faint">
        نمونه رابط کاربری — بدون اعتبارسنجی
      </p>
    </AuthScreen>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
