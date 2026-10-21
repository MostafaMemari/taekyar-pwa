"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { AuthPageLead, AuthPageTitle } from "@/components/shared/auth-brand-header";
import { AuthField } from "@/components/shared/auth-field";
import { type BeltOption, BeltPicker } from "@/components/shared/belt-picker";
import { DatePicker } from "@/components/shared/date-picker";
import { PhotoPicker } from "@/components/shared/photo-picker";
import { type StepOneField, StepOneFields, type StepOneForm } from "@/components/shared/step-one-fields";
import { Stepper } from "@/components/shared/stepper";
import { Button } from "@/components/ui/button";

const STEPS = [{ label: "مشخصات پایه" }, { label: "حرفه ای · اختیاری" }];

const COACH_BELTS: readonly BeltOption[] = [
  { value: "DAN_4", label: "دان ۴", color: "#1F2937", knotColor: "#111827", stripes: 4 },
  { value: "DAN_5", label: "دان ۵", color: "#1F2937", knotColor: "#111827", stripes: 5 },
  { value: "DAN_6", label: "دان ۶", color: "#1F2937", knotColor: "#111827", stripes: 6 },
  { value: "DAN_7", label: "دان ۷", color: "#1F2937", knotColor: "#111827", stripes: 7 },
  { value: "DAN_8", label: "دان ۸", color: "#1F2937", knotColor: "#111827", stripes: 8 },
  { value: "DAN_9", label: "دان ۹", color: "#1F2937", knotColor: "#111827", stripes: 9 },
];

type ProfessionalForm = { birthDate: string; belt: string };

const emptyStepOne: StepOneForm = { fullName: "", nationalCode: "", gender: "MALE", province: "", birthDate: "" };
const emptyProfessional: ProfessionalForm = { birthDate: "", belt: "" };

export function CoachSignupForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [stepOne, setStepOne] = useState<StepOneForm>(emptyStepOne);
  const [professional, setProfessional] = useState<ProfessionalForm>(emptyProfessional);

  const goTo = (next: number) => {
    setStep(next);
    window.scrollTo({ top: 0 });
  };

  const updateStepOne = <K extends StepOneField>(field: K, value: StepOneForm[K]) => {
    setStepOne((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push("/signup/mobile?role=coach");
  };

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

          <form className="mt-4 flex flex-1 flex-col" onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-4">
              <PhotoPicker label="تصویر پروفایل" hint="JPG یا PNG — حداکثر ۵ مگابایت" optional />

              <AuthField label="تاریخ تولد" htmlFor="birthDate" optional>
                <DatePicker
                  id="birthDate"
                  title="تاریخ تولد"
                  value={professional.birthDate}
                  onChange={(value) => setProfessional((current) => ({ ...current, birthDate: value }))}
                  defaultValue="1365/01/01"
                  fromYear={1345}
                  toYear={1405}
                />
              </AuthField>

              <BeltPicker
                label="کمربند مربی"
                required={false}
                optional
                value={professional.belt || null}
                options={COACH_BELTS}
                onChange={(value) => setProfessional((current) => ({ ...current, belt: value ?? "" }))}
                hint="اگر کمربند دان ۴ به بالا ندارید، این بخش را خالی بگذارید."
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

            <Link href="/signup/mobile?role=coach" className="mt-3 block text-center text-[11.5px] font-bold text-ink-subtle">
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
            goTo(1);
          }}
          noValidate
        >
          <StepOneFields
            form={stepOne}
            onChange={updateStepOne}
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
