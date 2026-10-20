"use client";

import { Check, ChevronRight, Mars, Venus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { AuthField, AuthInput } from "@/components/shared/auth-field";
import { DatePicker } from "@/components/shared/date-picker";
import { Segmented } from "@/components/shared/segmented";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { digitsOnly, toPersianDigits } from "@/lib/digits";

const GENDER_OPTIONS = [
  { value: "MALE", label: "مرد", icon: Mars },
  { value: "FEMALE", label: "زن", icon: Venus },
] as const;

type ProfileForm = {
  fullName: string;
  nationalCode: string;
  gender: string;
  birthDate: string;
  fatherName: string;
  phoneNumber: string;
};

const emptyProfile: ProfileForm = {
  fullName: "",
  nationalCode: "",
  gender: "MALE",
  birthDate: "",
  fatherName: "",
  phoneNumber: "",
};

export function CompleteProfileForm() {
  const router = useRouter();
  const [form, setForm] = useState<ProfileForm>(emptyProfile);

  const update = <K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push("/student");
  };

  return (
    <main className="app-frame min-h-dvh">
      <form className="mx-auto w-full max-w-md px-5 pb-40 pt-6" onSubmit={handleSubmit} noValidate>
        <header className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="size-10 rounded-full"
            render={<Link href="/student" />}
            nativeButton={false}
            aria-label="بازگشت"
          >
            <ChevronRight data-icon="inline-start" aria-hidden="true" />
          </Button>
          <h1 className="min-w-0 flex-1 text-[17px] font-extrabold text-ink">تکمیل پروفایل هنرجو</h1>
        </header>

        <Card className="mt-6 rounded-[22px]">
          <CardContent>
            <FieldGroup className="gap-4">
              <AuthField label="نام و نام خانوادگی" htmlFor="fullName">
                <AuthInput
                  id="fullName"
                  name="fullName"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={(event) => update("fullName", event.target.value)}
                />
              </AuthField>

              <AuthField
                label="کد ملی"
                htmlFor="nationalCode"
                hint="اگر مربی شما پیش تر پروفایلی برای شما ساخته است، همان کد ملی را وارد کنید تا پروفایل به حساب شما متصل شود."
              >
                <AuthInput
                  id="nationalCode"
                  name="nationalCode"
                  dir="ltr"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={10}
                  className="text-center font-bold tracking-widest"
                  placeholder={toPersianDigits("0012345678")}
                  value={toPersianDigits(form.nationalCode)}
                  onChange={(event) => update("nationalCode", digitsOnly(event.target.value, 10))}
                />
              </AuthField>

              <Segmented
                label="جنسیت"
                required={false}
                value={form.gender || null}
                options={GENDER_OPTIONS}
                onChange={(value) => update("gender", value)}
              />

              <AuthField label="تاریخ تولد" htmlFor="birthDate">
                <DatePicker
                  id="birthDate"
                  title="تاریخ تولد"
                  value={form.birthDate}
                  onChange={(value) => update("birthDate", value)}
                  defaultValue="1387/01/01"
                  fromYear={1345}
                  toYear={1405}
                />
              </AuthField>

              <AuthField label="نام پدر" htmlFor="fatherName">
                <AuthInput
                  id="fatherName"
                  name="fatherName"
                  value={form.fatherName}
                  onChange={(event) => update("fatherName", event.target.value)}
                />
              </AuthField>

              <AuthField label="شماره تماس" htmlFor="phoneNumber">
                <AuthInput
                  id="phoneNumber"
                  name="phoneNumber"
                  dir="ltr"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={11}
                  className="text-center font-bold tracking-widest"
                  value={toPersianDigits(form.phoneNumber)}
                  onChange={(event) => update("phoneNumber", digitsOnly(event.target.value, 11))}
                />
              </AuthField>
            </FieldGroup>
          </CardContent>
        </Card>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-5 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur">
          <div className="mx-auto flex w-full max-w-md items-center gap-3">
            <Button variant="outline" size="cta" className="flex-1" render={<Link href="/student" />} nativeButton={false}>
              انصراف
            </Button>
            <Button type="submit" variant="brand" size="cta" className="flex-[2]">
              <span>ذخیره اطلاعات</span>
              <Check data-icon="inline-end" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
