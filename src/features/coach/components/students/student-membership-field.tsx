"use client";

import { ShieldCheck } from "lucide-react";
import { type Control, Controller } from "react-hook-form";
import { AuthField } from "@/components/shared/auth-field";
import { Input } from "@/components/ui/input";
import { FormSection } from "@/features/coach/components/form-section";
import type { StudentFormValues } from "@/features/coach/lib/student-form-model";
import { digitsOnly, toPersianDigits } from "@/lib/digits";

// Insurance never comes from this form: the server registers it for exactly one year via PATCH /student/:id/insurance.
export function StudentMembershipField({ control }: { control: Control<StudentFormValues> }) {
  return (
    <FormSection icon={ShieldCheck} title="عضویت">
      <AuthField label="سال عضویت" htmlFor="membershipYear" optional>
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
    </FormSection>
  );
}
