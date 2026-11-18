"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { Control } from "react-hook-form";
import { StepOneFields } from "@/components/shared/step-one-fields";
import { Button } from "@/components/ui/button";
import { type StudentSignupFormHandle, StudentSignupStep } from "@/features/auth/components/student-signup-step";
import type { StepOneForm } from "@/features/auth/schemas";

type StudentSignupStepOneProps = {
  form: StudentSignupFormHandle;
  onNext: () => void;
};

export function StudentSignupStepOne({ form, onNext }: StudentSignupStepOneProps) {
  return (
    <StudentSignupStep
      current={0}
      title="اطلاعات پایه"
      lead={
        <>
          برای ساخت پروفایل هنرجو، <b className="font-extrabold text-ink-body">همه موارد اجباری</b> است
        </>
      }
    >
      <form
        className="mt-4 flex flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          onNext();
        }}
        noValidate
      >
        <StepOneFields
          // RHF control is invariant; the step-one subset is structurally safe.
          control={form.control as unknown as Control<StepOneForm>}
          errors={form.formState.errors}
          withBirthDate
          sampleName="سارا محمدی"
          genderLabel="جنسیت"
        />

        <div className="cta-dock mt-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-11 flex-1 rounded-xl" render={<Link href="/" />} nativeButton={false}>
              بازگشت
            </Button>
            <Button type="submit" variant="brand" className="h-11 flex-[2] rounded-xl text-[12px] font-bold">
              <span>مرحله بعد</span>
              <ChevronLeft data-icon="inline-end" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </form>
    </StudentSignupStep>
  );
}
