"use client";

import { ChevronLeft, Ruler, Scale } from "lucide-react";
import Link from "next/link";
import type { BaseSyntheticEvent } from "react";
import { Controller } from "react-hook-form";
import { AuthField } from "@/components/shared/auth-field";
import { AuthInput } from "@/components/shared/auth-input";
import { DatePicker } from "@/components/shared/date-picker";
import { PhotoPicker } from "@/components/shared/photo-picker";
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
          عکس، بیمه و مشخصات جسمی؛ <b className="font-extrabold text-ink-body">همه اختیاری</b>.
        </>
      }
    >
      <form className="mt-4 flex flex-1 flex-col" onSubmit={onSubmit} noValidate>
        <PhotoPicker label="عکس پروفایل" hint="JPG یا PNG، حداکثر ۵ مگابایت" optional />

        <div className="mt-4 grid gap-4">
          <AuthField label="تاریخ بیمه ورزشی" htmlFor="insuranceDate" optional hint="۷ روز قبل از انقضا یادآوری می شود.">
            <Controller
              control={form.control}
              name="insuranceDate"
              render={({ field }) => (
                <DatePicker
                  id="insuranceDate"
                  title="تاریخ بیمه ورزشی"
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                  fromYear={1395}
                  toYear={1406}
                />
              )}
            />
          </AuthField>

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

        <div className="cta-dock cta-row mt-6 gap-3">
          <Button type="button" variant="outline" size="cta" onClick={onBack}>
            بازگشت
          </Button>
          <Button type="submit" variant="brand" size="cta">
            <span>ثبت و دریافت کد تایید</span>
            <ChevronLeft data-icon="inline-end" aria-hidden="true" />
          </Button>
        </div>

        <Link href="/signup/mobile?role=student" onClick={onSkip} className="mt-3 block text-center text-[12px] font-bold text-ink-subtle">
          رد کردن (بعداً تکمیل می کنم)
        </Link>
      </form>
    </StudentSignupStep>
  );
}
