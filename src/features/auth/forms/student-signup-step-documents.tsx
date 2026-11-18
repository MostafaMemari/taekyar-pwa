"use client";

import { ChevronLeft, Ruler, Scale } from "lucide-react";
import Link from "next/link";
import type { BaseSyntheticEvent } from "react";
import { Controller } from "react-hook-form";
import { AuthField } from "@/components/shared/auth-field";
import { AuthInput } from "@/components/shared/auth-input";
import { Button } from "@/components/ui/button";
import { type StudentSignupFormHandle, StudentSignupStep } from "@/features/auth/components/student-signup-step";
import { digitsOnly, toPersianDigits } from "@/lib/digits";

type StudentSignupStepDocumentsProps = {
  form: StudentSignupFormHandle;
  onBack: () => void;
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
  onSkip: () => void;
};

export function StudentSignupStepDocuments({ form, onBack, onSubmit, onSkip }: StudentSignupStepDocumentsProps) {
  const errors = form.formState.errors;

  return (
    <StudentSignupStep
      current={2}
      title="مدارک و مشخصات"
      lead={
        <>
          مشخصات جسمی؛ <b className="font-extrabold text-ink-body">همه اختیاری</b>.
        </>
      }
    >
      <form className="mt-4 flex flex-1 flex-col" onSubmit={onSubmit} noValidate>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <AuthField label="وزن (کیلوگرم)" htmlFor="weight" optional hint="تعیین رده وزنی" error={errors.weight?.message}>
              <Controller
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <AuthInput
                    id="weight"
                    name={field.name}
                    dir="ltr"
                    inputMode="numeric"
                    maxLength={3}
                    icon={Scale}
                    placeholder={toPersianDigits("60")}
                    value={toPersianDigits(field.value)}
                    onChange={(event) => field.onChange(digitsOnly(event.target.value, 3))}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                )}
              />
            </AuthField>

            <AuthField label="قد (سانتی متر)" htmlFor="height" optional error={errors.height?.message}>
              <Controller
                control={form.control}
                name="height"
                render={({ field }) => (
                  <AuthInput
                    id="height"
                    name={field.name}
                    dir="ltr"
                    inputMode="numeric"
                    maxLength={3}
                    icon={Ruler}
                    placeholder={toPersianDigits("170")}
                    value={toPersianDigits(field.value)}
                    onChange={(event) => field.onChange(digitsOnly(event.target.value, 3))}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                )}
              />
            </AuthField>
          </div>
        </div>

        <div className="cta-dock mt-6">
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" className="h-11 flex-1 rounded-xl" onClick={onBack}>
              بازگشت
            </Button>
            <Button type="submit" variant="brand" className="h-11 flex-[2] rounded-xl text-[12px] font-bold">
              <span>ثبت و دریافت کد تایید</span>
              <ChevronLeft data-icon="inline-end" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <Link href="/signup/mobile?role=student" onClick={onSkip} className="mt-3 block text-center text-[12px] font-bold text-ink-subtle">
          رد کردن (بعداً تکمیل می کنم)
        </Link>
      </form>
    </StudentSignupStep>
  );
}
