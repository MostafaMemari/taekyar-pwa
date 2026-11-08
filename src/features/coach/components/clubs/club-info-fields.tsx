"use client";

import { Info, Landmark } from "lucide-react";
import { type Control, Controller, useWatch } from "react-hook-form";
import { AuthField } from "@/components/shared/auth-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormSection } from "@/features/coach/components/form-section";
import type { ClubFormValues } from "@/features/coach/lib/club-form-model";
import { GENDER_META, type Gender } from "@/features/coach/lib/coach-data";
import { toPersianDigits } from "@/lib/digits";

type FieldsProps = {
  control: Control<ClubFormValues>;
  gender: Gender | null;
  nameError?: string;
  addressError?: string;
};

export function ClubInfoFields({ control, gender, nameError, addressError }: FieldsProps) {
  const address = useWatch({ control, name: "address" });

  return (
    <FormSection icon={Landmark} title="اطلاعات باشگاه">
      <AuthField label="نام باشگاه" htmlFor="name" required hint="۲ تا ۸۰ کاراکتر" error={nameError}>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input
              id="name"
              name={field.name}
              maxLength={80}
              placeholder="مثلاً باشگاه بلوار مارلیک"
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
              ref={field.ref}
              className="h-12 rounded-xl px-4 text-sm"
            />
          )}
        />
      </AuthField>

      <AuthField label="آدرس" htmlFor="address" hint="اختیاری، ۵ تا ۲۰۰ کاراکتر" error={addressError}>
        <Controller
          control={control}
          name="address"
          render={({ field }) => (
            <Textarea
              id="address"
              name={field.name}
              rows={3}
              maxLength={200}
              placeholder="آدرس کامل سالن ورزشی..."
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
              ref={field.ref}
              className="min-h-24 resize-none rounded-xl px-4 py-3 text-sm leading-6"
            />
          )}
        />
        <p className="text-end text-[12px] font-semibold text-ink-subtle" dir="ltr">
          {toPersianDigits(String(address.length))} / {toPersianDigits("200")}
        </p>
      </AuthField>

      <Alert className="rounded-xl border-none bg-info-soft/60 p-3 text-start">
        <Info className="text-info" aria-hidden="true" />
        <AlertDescription className="text-[12px] leading-5 text-ink-muted">
          جنسیت باشگاه از پروفایل مربی گرفته می شود{gender ? ` و روی «${GENDER_META[gender].clubLabel}» ثابت است` : ""}؛ فقط هنرجویان هم جنس
          قابل افزودن هستند.
        </AlertDescription>
      </Alert>
    </FormSection>
  );
}
