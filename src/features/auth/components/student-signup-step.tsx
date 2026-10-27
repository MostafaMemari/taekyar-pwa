"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import { AuthPageLead, AuthPageTitle } from "@/components/shared/auth-brand-header";
import { AuthScreen } from "@/components/shared/auth-screen";
import { Stepper } from "@/components/shared/stepper";
import type { StudentSignupForm } from "@/features/auth/schemas";

export const STUDENT_SIGNUP_STEPS = [{ label: "اطلاعات پایه" }, { label: "کمربند" }, { label: "مدارک" }];

export type StudentSignupFormHandle = UseFormReturn<StudentSignupForm>;

const loginFooter = (
  <>
    قبلاً ثبت نام کرده اید؟
    <Link href="/login" className="ms-1 font-bold text-accent-ink">
      ورود
    </Link>
  </>
);

type StudentSignupStepProps = {
  current: number;
  title: string;
  lead: ReactNode;
  children: ReactNode;
};

export function StudentSignupStep({ current, title, lead, children }: StudentSignupStepProps) {
  return (
    <AuthScreen subtitle="ثبت نام هنرجو" backHref="/" showHeader={false} footer={loginFooter}>
      <Stepper steps={STUDENT_SIGNUP_STEPS} current={current} label="مراحل ثبت نام" />

      <div className="mt-6 flex flex-1 flex-col">
        <AuthPageTitle className="text-[22px] leading-8">{title}</AuthPageTitle>
        <AuthPageLead>{lead}</AuthPageLead>
        {children}
      </div>
    </AuthScreen>
  );
}
