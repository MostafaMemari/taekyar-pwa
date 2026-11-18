"use client";

import { type Control, Controller } from "react-hook-form";
import { AuthField } from "@/components/shared/auth-field";
import { AuthInput } from "@/components/shared/auth-input";
import { Textarea } from "@/components/ui/textarea";
import type { ClubFormValues } from "@/features/coach/lib/club-form-model";

type FieldsProps = {
  control: Control<ClubFormValues>;
  nameError?: string;
  addressError?: string;
};

// Plain field flow, matching the other form sheets — labels and validation errors only, no helper furniture.
export function ClubInfoFields({ control, nameError, addressError }: FieldsProps) {
  return (
    <div className="flex flex-col gap-3.5">
      <AuthField label="نام باشگاه" htmlFor="name" required error={nameError}>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <AuthInput
              id="name"
              name={field.name}
              maxLength={80}
              placeholder="مثلا باشگاه بلوار مارلیک"
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
              ref={field.ref}
            />
          )}
        />
      </AuthField>

      <AuthField label="آدرس" htmlFor="address" error={addressError}>
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
      </AuthField>
    </div>
  );
}
