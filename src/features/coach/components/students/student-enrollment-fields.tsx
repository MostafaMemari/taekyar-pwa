"use client";

import { ShieldCheck } from "lucide-react";
import { AuthField } from "@/components/shared/auth-field";
import { DatePicker } from "@/components/shared/date-picker";
import { PhotoPicker } from "@/components/shared/photo-picker";
import { Input } from "@/components/ui/input";
import { FormSection } from "@/features/coach/components/form-section";
import type { StudentFormState, StudentFormUpdater } from "@/features/coach/lib/student-form-model";
import { digitsOnly, toPersianDigits } from "@/lib/digits";

type FieldsProps = {
  form: StudentFormState;
  onChange: StudentFormUpdater;
};

export function StudentEnrollmentFields({ form, onChange, showImageExpiry = false }: FieldsProps & { showImageExpiry?: boolean }) {
  return (
    <FormSection icon={ShieldCheck} title="عضویت و بیمه" tone="sky">
      <div className="grid grid-cols-2 gap-3">
        <AuthField label="سال عضویت" htmlFor="membershipYear" optional>
          <Input
            id="membershipYear"
            name="membershipYear"
            dir="ltr"
            inputMode="numeric"
            maxLength={4}
            placeholder={toPersianDigits("1404")}
            value={toPersianDigits(form.membershipYear)}
            onChange={(event) => onChange("membershipYear", digitsOnly(event.target.value, 4))}
            className="h-12 rounded-xl px-3 text-center text-sm font-semibold"
          />
        </AuthField>

        <AuthField label="تاریخ بیمه ورزشی" htmlFor="insuranceDate" optional>
          <DatePicker
            id="insuranceDate"
            title="تاریخ بیمه ورزشی"
            value={form.insuranceDate}
            onChange={(value) => onChange("insuranceDate", value)}
            defaultValue="1405/02/19"
            fromYear={1395}
            toYear={1406}
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
          <DatePicker
            id="expireImageDate"
            title="تاریخ انقضای عکس پرونده"
            value={form.expireImageDate}
            onChange={(value) => onChange("expireImageDate", value)}
            defaultValue="1405/08/01"
            fromYear={1395}
            toYear={1406}
          />
        </AuthField>
      ) : null}

      <PhotoPicker label="تصویر هنرجو" optional hint="JPG یا PNG — حداکثر ۵ مگابایت" />
    </FormSection>
  );
}
