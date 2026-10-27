"use client";

import { ChevronLeft } from "lucide-react";
import { Controller } from "react-hook-form";
import { AuthField } from "@/components/shared/auth-field";
import { BeltPicker } from "@/components/shared/belt-picker";
import { DatePicker } from "@/components/shared/date-picker";
import { Button } from "@/components/ui/button";
import { type StudentSignupFormHandle, StudentSignupStep } from "@/features/auth/components/student-signup-step";
import { STUDENT_BELT_GROUPS } from "@/lib/student-belts";

type StudentSignupStepBeltProps = {
  form: StudentSignupFormHandle;
  onBack: () => void;
  onNext: () => void;
};

export function StudentSignupStepBelt({ form, onBack, onNext }: StudentSignupStepBeltProps) {
  const errors = form.formState.errors;

  return (
    <StudentSignupStep current={1} title="کمربند فعلی" lead="کمربند فعلی و تاریخ دریافت آن را انتخاب کنید.">
      <form
        className="mt-4 flex flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          onNext();
        }}
        noValidate
      >
        <div className="flex flex-col gap-4">
          <Controller
            control={form.control}
            name="belt"
            render={({ field }) => (
              <BeltPicker
                label="کمربند فعلی"
                value={field.value || null}
                groups={STUDENT_BELT_GROUPS}
                onChange={(value) => field.onChange(value ?? "")}
                error={errors.belt?.message}
              />
            )}
          />

          <AuthField label="تاریخ دریافت کمربند" htmlFor="beltDate" required error={errors.beltDate?.message}>
            <Controller
              control={form.control}
              name="beltDate"
              render={({ field }) => (
                <DatePicker
                  id="beltDate"
                  title="تاریخ دریافت کمربند"
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                  defaultValue="1402/01/01"
                  fromYear={1390}
                  toYear={1405}
                />
              )}
            />
          </AuthField>
        </div>

        <div className="cta-dock cta-row mt-6 gap-3">
          <Button type="button" variant="outline" size="cta" onClick={onBack}>
            بازگشت
          </Button>
          <Button type="submit" variant="brand" size="cta">
            <span>مرحله بعد</span>
            <ChevronLeft data-icon="inline-end" aria-hidden="true" />
          </Button>
        </div>
      </form>
    </StudentSignupStep>
  );
}
