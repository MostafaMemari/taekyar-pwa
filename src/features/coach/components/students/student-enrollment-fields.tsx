"use client";

import { ShieldCheck } from "lucide-react";
import { type Control, Controller, type FieldErrors } from "react-hook-form";
import { AuthField } from "@/components/shared/auth-field";
import { DatePicker } from "@/components/shared/date-picker";
import { PhotoPicker } from "@/components/shared/photo-picker";
import { Input } from "@/components/ui/input";
import { FormSection } from "@/features/coach/components/form-section";
import type { StudentFormValues } from "@/features/coach/lib/student-form-model";
import { digitsOnly, toPersianDigits } from "@/lib/digits";

type FieldsProps = {
  control: Control<StudentFormValues>;
  errors: FieldErrors<StudentFormValues>;
  showImageExpiry?: boolean;
};

export function StudentEnrollmentFields({ control, errors, showImageExpiry = false }: FieldsProps) {
  return (
    <FormSection icon={ShieldCheck} title="عضویت و بیمه" tone="sky">
      <div className="grid grid-cols-2 gap-3">
        <AuthField label="سال عضویت" htmlFor="membershipYear" optional error={errors.membershipYear?.message}>
          <Controller
            control={control}
            name="membershipYear"
            render={({ field }) => (
              <Input
                id="membershipYear"
                name={field.name}
                dir="ltr"
                inputMode="numeric"
                maxLength={4}
                placeholder={toPersianDigits("1404")}
                value={toPersianDigits(field.value)}
                onChange={(event) => field.onChange(digitsOnly(event.target.value, 4))}
                onBlur={field.onBlur}
                ref={field.ref}
                className="h-12 rounded-xl px-3 text-center text-sm font-semibold"
              />
            )}
          />
        </AuthField>

        <AuthField label="تاریخ بیمه ورزشی" htmlFor="insuranceDate" optional error={errors.insuranceDate?.message}>
          <Controller
            control={control}
            name="insuranceDate"
            render={({ field }) => (
              <DatePicker
                id="insuranceDate"
                title="تاریخ بیمه ورزشی"
                value={field.value}
                onChange={field.onChange}
                defaultValue="1405/02/19"
                fromYear={1395}
                toYear={1406}
              />
            )}
          />
        </AuthField>
      </div>

      {showImageExpiry ? (
        <AuthField
          label="تاریخ انقضای عکس پرونده"
          htmlFor="expireImageDate"
          optional
          hint="یادآوری تمدید عکس، ۷ روز قبل از انقضا برای شما ارسال می شود."
        >
          <Controller
            control={control}
            name="expireImageDate"
            render={({ field }) => (
              <DatePicker
                id="expireImageDate"
                title="تاریخ انقضای عکس پرونده"
                value={field.value}
                onChange={field.onChange}
                defaultValue="1405/08/01"
                fromYear={1395}
                toYear={1406}
              />
            )}
          />
        </AuthField>
      ) : null}

      <PhotoPicker label="تصویر هنرجو" optional hint="JPG یا PNG — حداکثر ۵ مگابایت" />
    </FormSection>
  );
}
