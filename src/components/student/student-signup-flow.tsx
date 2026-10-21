"use client";

import { ChevronLeft, Ruler, Scale } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { AuthPageLead, AuthPageTitle } from "@/components/shared/auth-brand-header";
import { AuthField, AuthInput } from "@/components/shared/auth-field";
import { AuthScreen } from "@/components/shared/auth-screen";
import { type BeltOption, BeltPicker } from "@/components/shared/belt-picker";
import { DatePicker } from "@/components/shared/date-picker";
import { PhotoPicker } from "@/components/shared/photo-picker";
import { type StepOneField, StepOneFields, type StepOneForm } from "@/components/shared/step-one-fields";
import { Stepper } from "@/components/shared/stepper";
import { Button } from "@/components/ui/button";
import { digitsOnly, toPersianDigits } from "@/lib/digits";

const STEPS = [{ label: "اطلاعات پایه" }, { label: "کمربند" }, { label: "مدارک" }];

const BELTS: readonly BeltOption[] = [
  { value: "WHITE", label: "سفید", color: "#F3F4F6", outline: "#D1D5DB", knotColor: "#E5E7EB" },
  { value: "YELLOW", label: "زرد", color: "#FBBF24", knotColor: "#F59E0B" },
  { value: "GREEN", label: "سبز", color: "#22C55E", knotColor: "#16A34A" },
  { value: "BLUE", label: "آبی", color: "#3B82F6", knotColor: "#2563EB" },
  { value: "RED", label: "قرمز", color: "#EF4444", knotColor: "#DC2626" },
  { value: "POOM_1", label: "پوم ۱", color: "#1F2937", bottomColor: "#DC2626", knotColor: "#111827", stripes: 1 },
  { value: "DAN_1", label: "دان ۱", color: "#1F2937", knotColor: "#111827", stripes: 1 },
  { value: "DAN_2", label: "دان ۲", color: "#1F2937", knotColor: "#111827", stripes: 2 },
  { value: "DAN_3", label: "دان ۳", color: "#1F2937", knotColor: "#111827", stripes: 3 },
];

type BeltForm = { belt: string; beltDate: string };
type DocumentsForm = { insuranceDate: string; weight: string; height: string };

const emptyStepOne: StepOneForm = { fullName: "", nationalCode: "", gender: "MALE", province: "", birthDate: "" };
const emptyBelt: BeltForm = { belt: "", beltDate: "" };
const emptyDocuments: DocumentsForm = { insuranceDate: "", weight: "", height: "" };

const loginFooter = (
  <>
    قبلاً ثبت نام کرده اید؟
    <Link href="/login" className="ms-1 font-bold text-accent-ink">
      ورود
    </Link>
  </>
);

export function StudentSignupFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [stepOne, setStepOne] = useState<StepOneForm>(emptyStepOne);
  const [belt, setBelt] = useState<BeltForm>(emptyBelt);
  const [documents, setDocuments] = useState<DocumentsForm>(emptyDocuments);

  const goTo = (next: number) => {
    setStep(next);
    window.scrollTo({ top: 0 });
  };

  const updateStepOne = <K extends StepOneField>(field: K, value: StepOneForm[K]) => {
    setStepOne((current) => ({ ...current, [field]: value }));
  };

  const updateDocuments = <K extends keyof DocumentsForm>(field: K, value: DocumentsForm[K]) => {
    setDocuments((current) => ({ ...current, [field]: value }));
  };

  const handleBeltSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    goTo(2);
  };

  const handleDocumentsSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push("/signup/mobile?role=student");
  };

  if (step === 2) {
    return (
      <AuthScreen subtitle="ثبت نام هنرجو" backHref="/" showHeader={false} footer={loginFooter}>
        <Stepper steps={STEPS} current={2} label="مراحل ثبت نام" />

        <div className="mt-6 flex flex-1 flex-col">
          <AuthPageTitle className="text-[22px] leading-8">مدارک و مشخصات</AuthPageTitle>
          <AuthPageLead>
            عکس، بیمه و مشخصات جسمی؛ <b className="font-extrabold text-ink-body">همه اختیاری</b>.
          </AuthPageLead>

          <form className="mt-4 flex flex-1 flex-col" onSubmit={handleDocumentsSubmit} noValidate>
            <PhotoPicker label="عکس پروفایل" hint="JPG یا PNG — حداکثر ۵ مگابایت" optional />

            <div className="mt-4 grid gap-4">
              <AuthField label="تاریخ بیمه ورزشی" htmlFor="insuranceDate" optional hint="۷ روز قبل از انقضا یادآوری می شود.">
                <DatePicker
                  id="insuranceDate"
                  title="تاریخ بیمه ورزشی"
                  value={documents.insuranceDate}
                  onChange={(value) => updateDocuments("insuranceDate", value)}
                  fromYear={1395}
                  toYear={1406}
                />
              </AuthField>

              <div className="grid grid-cols-2 gap-3">
                <AuthField label="وزن (کیلوگرم)" htmlFor="weight" optional hint="تعیین رده وزنی">
                  <AuthInput
                    id="weight"
                    name="weight"
                    dir="ltr"
                    inputMode="numeric"
                    maxLength={3}
                    icon={Scale}
                    placeholder={toPersianDigits("60")}
                    value={toPersianDigits(documents.weight)}
                    onChange={(event) => updateDocuments("weight", digitsOnly(event.target.value, 3))}
                  />
                </AuthField>

                <AuthField label="قد (سانتی متر)" htmlFor="height" optional>
                  <AuthInput
                    id="height"
                    name="height"
                    dir="ltr"
                    inputMode="numeric"
                    maxLength={3}
                    icon={Ruler}
                    placeholder={toPersianDigits("170")}
                    value={toPersianDigits(documents.height)}
                    onChange={(event) => updateDocuments("height", digitsOnly(event.target.value, 3))}
                  />
                </AuthField>
              </div>
            </div>

            <div className="cta-dock cta-row mt-6 gap-3">
              <Button type="button" variant="outline" size="cta" onClick={() => goTo(1)}>
                بازگشت
              </Button>
              <Button type="submit" variant="brand" size="cta">
                <span>ثبت و دریافت کد تایید</span>
                <ChevronLeft data-icon="inline-end" aria-hidden="true" />
              </Button>
            </div>

            <Link href="/signup/mobile?role=student" className="mt-3 block text-center text-[11.5px] font-bold text-ink-subtle">
              رد کردن — بعداً تکمیل می کنم
            </Link>
          </form>
        </div>
      </AuthScreen>
    );
  }

  if (step === 1) {
    return (
      <AuthScreen subtitle="ثبت نام هنرجو" backHref="/" showHeader={false} footer={loginFooter}>
        <Stepper steps={STEPS} current={1} label="مراحل ثبت نام" />

        <div className="mt-6 flex flex-1 flex-col">
          <AuthPageTitle className="text-[22px] leading-8">کمربند فعلی</AuthPageTitle>
          <AuthPageLead>کمربند فعلی و تاریخ دریافت آن را انتخاب کنید.</AuthPageLead>

          <form className="mt-4 flex flex-1 flex-col" onSubmit={handleBeltSubmit} noValidate>
            <div className="flex flex-col gap-4">
              <BeltPicker
                label="کمربند فعلی"
                value={belt.belt || null}
                options={BELTS}
                onChange={(value) => setBelt((current) => ({ ...current, belt: value ?? "" }))}
              />

              <AuthField label="تاریخ دریافت کمربند" htmlFor="beltDate" required>
                <DatePicker
                  id="beltDate"
                  title="تاریخ دریافت کمربند"
                  value={belt.beltDate}
                  onChange={(value) => setBelt((current) => ({ ...current, beltDate: value }))}
                  defaultValue="1402/01/01"
                  fromYear={1390}
                  toYear={1405}
                />
              </AuthField>
            </div>

            <div className="cta-dock cta-row mt-6 gap-3">
              <Button type="button" variant="outline" size="cta" onClick={() => goTo(0)}>
                بازگشت
              </Button>
              <Button type="submit" variant="brand" size="cta">
                <span>مرحله بعد</span>
                <ChevronLeft data-icon="inline-end" aria-hidden="true" />
              </Button>
            </div>
          </form>
        </div>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen subtitle="ثبت نام هنرجو" backHref="/" showHeader={false} footer={loginFooter}>
      <Stepper steps={STEPS} current={0} label="مراحل ثبت نام" />

      <div className="mt-6 flex flex-1 flex-col">
        <AuthPageTitle className="text-[22px] leading-8">اطلاعات پایه</AuthPageTitle>
        <AuthPageLead>
          برای ساخت پروفایل هنرجو، <b className="font-extrabold text-ink-body">همه موارد اجباری</b> است.
        </AuthPageLead>

        <form
          className="mt-4 flex flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            goTo(1);
          }}
          noValidate
        >
          <StepOneFields form={stepOne} onChange={updateStepOne} withBirthDate sampleName="سارا محمدی" genderLabel="جنسیت" />

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
    </AuthScreen>
  );
}
