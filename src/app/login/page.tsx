"use client";

import { ChevronLeft, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useState } from "react";
import { AuthPageLead, AuthPageTitle } from "@/components/shared/auth-brand-header";
import { AuthField, AuthInput } from "@/components/shared/auth-field";
import { AuthScreen } from "@/components/shared/auth-screen";
import { Button } from "@/components/ui/button";
import { digitsOnly, toPersianDigits } from "@/lib/digits";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobile, setMobile] = useState(() => digitsOnly(searchParams.get("mobile") ?? "", 11));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(mobile ? `/verify?mobile=${mobile}` : "/verify");
  };

  return (
    <AuthScreen
      subtitle="سامانه مدیریت تکواندو"
      backHref="/"
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

      <form className="mt-7" onSubmit={handleSubmit} noValidate>
        <AuthField label="شماره موبایل" htmlFor="mobile" hint={`مثال: ${toPersianDigits("09121234567")}`}>
          <AuthInput
            id="mobile"
            name="mobile"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            autoFocus
            maxLength={11}
            dir="ltr"
            icon={Smartphone}
            className="text-center text-base font-bold tracking-widest"
            placeholder={toPersianDigits("09121234567")}
            value={toPersianDigits(mobile)}
            onChange={(event) => setMobile(digitsOnly(event.target.value, 11))}
          />
        </AuthField>

        <Button type="submit" variant="brand" size="cta" className="mt-5 w-full">
          <span>دریافت کد تایید</span>
          <ChevronLeft data-icon="inline-end" aria-hidden="true" />
        </Button>
      </form>
    </AuthScreen>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
