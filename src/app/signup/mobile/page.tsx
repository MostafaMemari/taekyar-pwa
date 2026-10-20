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

function SignupMobileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") === "coach" ? "coach" : "student";
  const backHref = role === "coach" ? "/signup/coach" : "/signup/student";
  const [mobile, setMobile] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams({ from: "signup", role });
    if (mobile) params.set("mobile", mobile);
    router.push(`/verify?${params.toString()}`);
  };

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

      <form className="mt-7 flex flex-1 flex-col" onSubmit={handleSubmit} noValidate>
        <AuthField label="شماره موبایل" htmlFor="mobile" required hint={`مثال: ${toPersianDigits("09121234567")}`}>
          <AuthInput
            id="mobile"
            name="mobile"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={11}
            dir="ltr"
            icon={Smartphone}
            className="text-center text-base font-bold tracking-widest"
            placeholder={toPersianDigits("09121234567")}
            value={toPersianDigits(mobile)}
            onChange={(event) => setMobile(digitsOnly(event.target.value, 11))}
          />
        </AuthField>

        <div className="cta-dock cta-row mt-6 gap-3">
          <Button variant="outline" size="cta" render={<Link href={backHref} />} nativeButton={false}>
            بازگشت
          </Button>
          <Button type="submit" variant="brand" size="cta">
            <span>دریافت کد تایید</span>
            <ChevronLeft data-icon="inline-end" aria-hidden="true" />
          </Button>
        </div>

        <Link href="/" className="mt-3 block text-center text-[11.5px] font-bold text-ink-subtle">
          انصراف از ثبت نام
        </Link>
      </form>
    </AuthScreen>
  );
}

export default function SignupMobilePage() {
  return (
    <Suspense>
      <SignupMobileForm />
    </Suspense>
  );
}
