"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { type Control, Controller, useForm } from "react-hook-form";
import { AuthPageLead, AuthPageTitle } from "@/components/shared/auth-brand-header";
import { AuthField } from "@/components/shared/auth-field";
import { type BeltOption, BeltPicker } from "@/components/shared/belt-picker";
import { DatePicker } from "@/components/shared/date-picker";
import { PhotoPicker } from "@/components/shared/photo-picker";
import { StepOneFields } from "@/components/shared/step-one-fields";
import { Stepper } from "@/components/shared/stepper";
import { Button } from "@/components/ui/button";
import { toCoachSignupData } from "@/features/auth/api";
import { readSignupDraft, savePendingSignup, saveSignupDraft } from "@/features/auth/pending-signup";
import { type CoachSignupValues, coachSignupSchema, type StepOneForm } from "@/features/auth/schemas";

const STEPS = [{ label: "مشخصات پایه" }, { label: "حرفه ای · اختیاری" }];

const COACH_BELTS: readonly BeltOption[] = [
  { value: "DAN_3", label: "دان ۳", color: "#1F2937", knotColor: "#111827", stripes: 3 },
  { value: "DAN_4", label: "دان ۴", color: "#1F2937", knotColor: "#111827", stripes: 4 },
  { value: "DAN_5", label: "دان ۵", color: "#1F2937", knotColor: "#111827", stripes: 5 },
  { value: "DAN_6", label: "دان ۶", color: "#1F2937", knotColor: "#111827", stripes: 6 },
  { value: "DAN_7", label: "دان ۷", color: "#1F2937", knotColor: "#111827", stripes: 7 },
  { value: "DAN_8", label: "دان ۸", color: "#1F2937", knotColor: "#111827", stripes: 8 },
  { value: "DAN_9", label: "دان ۹", color: "#1F2937", knotColor: "#111827", stripes: 9 },
  { value: "DAN_10", label: "دان ۱۰", color: "#1F2937", knotColor: "#111827", stripes: 10 },
];

const defaultValues: CoachSignupValues = {
  fullName: "",
  nationalCode: "",
  gender: "MALE",
  province: "",
  birthDate: "",
  belt: "",
};

export function CoachSignupForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const form = useForm<CoachSignupValues>({
    resolver: zodResolver(coachSignupSchema),
    defaultValues,
  });

  const goTo = (next: number) => {
    setStep(next);
    saveSignupDraft({ kind: "coach", step: next, values: form.getValues() });
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    const draft = readSignupDraft();
    if (draft?.kind !== "coach") return;
    form.reset(draft.values);
    setStep(draft.step);
  }, [form]);

  const nextStep = async () => {
    if (await form.trigger(["fullName", "nationalCode", "gender", "province"])) goTo(1);
  };

  const finish = (values: CoachSignupValues) => {
    saveSignupDraft({ kind: "coach", step, values });
    savePendingSignup({ kind: "coach", coachData: toCoachSignupData(values) });
  };

  const submit = form.handleSubmit((values) => {
    finish(values);
    router.push("/signup/mobile?role=coach");
  });

  if (step === 1) {
    return (
      <>
        <Stepper steps={STEPS} current={1} label="مراحل ثبت نام مربی" />

        <div className="mt-6 flex flex-1 flex-col">
          <div className="flex items-center gap-2">
            <AuthPageTitle className="text-[22px] leading-8">مشخصات حرفه ای</AuthPageTitle>
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-ink-subtle">اختیاری</span>
          </div>
          <AuthPageLead>همه اختیاری؛ بعداً از پروفایل تکمیل کنید.</AuthPageLead>

          <form className="mt-4 flex flex-1 flex-col" onSubmit={submit} noValidate>
            <div className="flex flex-col gap-4">
              <PhotoPicker label="تصویر پروفایل" hint="JPG یا PNG — حداکثر ۵ مگابایت" optional />

              <AuthField label="تاریخ تولد" htmlFor="birthDate" optional>
                <Controller
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <DatePicker
                      id="birthDate"
                      title="تاریخ تولد"
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      defaultValue="1365/01/01"
                      fromYear={1345}
                      toYear={1405}
                    />
                  )}
                />
              </AuthField>

              <Controller
                control={form.control}
                name="belt"
                render={({ field }) => (
                  <BeltPicker
                    label="کمربند مربی"
                    required={false}
                    optional
                    value={field.value || null}
                    options={COACH_BELTS}
                    onChange={(value) => field.onChange(value ?? "")}
                    hint="محدوده مجاز کمربند مربی از دان ۳ تا دان ۱۰ است؛ اگر در این محدوده نیستید، این بخش را خالی بگذارید."
                  />
                )}
              />
            </div>

            <div className="cta-dock cta-row mt-6 gap-3">
              <Button type="button" variant="outline" size="cta" onClick={() => goTo(0)}>
                بازگشت
              </Button>
              <Button type="submit" variant="brand" size="cta">
                <span>ثبت و دریافت کد تایید</span>
                <ChevronLeft data-icon="inline-end" aria-hidden="true" />
              </Button>
            </div>

            <Link
              href="/signup/mobile?role=coach"
              onClick={() => finish(form.getValues())}
              className="mt-3 block text-center text-[11.5px] font-bold text-ink-subtle"
            >
              رد کردن — بعداً تکمیل می کنم
            </Link>
          </form>
        </div>
      </>
    );
  }

  return (
    <>
      <Stepper steps={STEPS} current={0} label="مراحل ثبت نام مربی" />

      <div className="mt-6 flex flex-1 flex-col">
        <AuthPageTitle className="text-[22px] leading-8">مشخصات مربی</AuthPageTitle>
        <AuthPageLead>
          برای ساخت حساب مربی، <b className="font-extrabold text-ink-body">همه موارد اجباری</b> است.
        </AuthPageLead>

        <form
          className="mt-4 flex flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            void nextStep();
          }}
          noValidate
        >
          <StepOneFields
            // RHF control is invariant; the step-one subset is structurally safe.
            control={form.control as unknown as Control<StepOneForm>}
            errors={form.formState.errors}
            withBirthDate={false}
            sampleName="محمدرضا یاری"
            genderLabel="جنسیت"
            genderHint="نمایش باشگاه ها و هنرجویان به این بستگی دارد."
          />

          <div className="cta-dock cta-row mt-6 gap-3">
            <Button variant="outline" size="cta" render={<Link href="/" />} nativeButton={false}>
              بازگشت
            </Button>
            <Button type="submit" variant="brand" size="cta">
              <span>مرحله بعد</span>
              <ChevronLeft data-icon="inline-end" aria-hidden="true" />
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
