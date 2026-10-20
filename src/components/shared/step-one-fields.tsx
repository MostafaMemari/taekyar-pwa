"use client";

import { Fingerprint, MapPin, Mars, UserRound, Venus } from "lucide-react";
import { AuthField, AuthInput, AuthSelect } from "@/components/shared/auth-field";
import { DatePicker } from "@/components/shared/date-picker";
import { Segmented } from "@/components/shared/segmented";
import { FieldGroup } from "@/components/ui/field";
import { digitsOnly, toPersianDigits } from "@/lib/digits";
import { PROVINCES } from "@/lib/provinces";

const GENDER_OPTIONS = [
  { value: "MALE", label: "مرد", icon: Mars },
  { value: "FEMALE", label: "زن", icon: Venus },
] as const;

export type StepOneForm = {
  fullName: string;
  nationalCode: string;
  gender: string;
  province: string;
  birthDate: string;
};

export type StepOneField = keyof StepOneForm;

type StepOneFieldsProps = {
  form: StepOneForm;
  onChange: <K extends StepOneField>(field: K, value: StepOneForm[K]) => void;
  withBirthDate: boolean;
  birthDateHint?: string;
  genderHint?: string;
  sampleName: string;
  genderLabel: string;
};

export function StepOneFields({ form, onChange, withBirthDate, birthDateHint, genderHint, sampleName, genderLabel }: StepOneFieldsProps) {
  return (
    <FieldGroup className="gap-3.5">
      <AuthField label="نام و نام خانوادگی" htmlFor="fullName" required>
        <AuthInput
          id="fullName"
          name="fullName"
          autoComplete="name"
          icon={UserRound}
          placeholder={`مثلاً ${sampleName}`}
          value={form.fullName}
          onChange={(event) => onChange("fullName", event.target.value)}
        />
      </AuthField>

      <AuthField label="کد ملی" htmlFor="nationalCode" required hint="۱۰ رقم، بدون خط تیره">
        <AuthInput
          id="nationalCode"
          name="nationalCode"
          dir="ltr"
          inputMode="numeric"
          autoComplete="off"
          maxLength={10}
          icon={Fingerprint}
          className="text-center font-bold tracking-widest"
          placeholder={toPersianDigits("0012345678")}
          value={toPersianDigits(form.nationalCode)}
          onChange={(event) => onChange("nationalCode", digitsOnly(event.target.value, 10))}
        />
      </AuthField>

      <Segmented
        label={genderLabel}
        value={form.gender || null}
        options={GENDER_OPTIONS}
        onChange={(value) => onChange("gender", value)}
        hint={genderHint}
      />

      {withBirthDate ? (
        <AuthField label="تاریخ تولد" htmlFor="birthDate" required hint={birthDateHint}>
          <DatePicker
            id="birthDate"
            title="تاریخ تولد"
            value={form.birthDate}
            onChange={(value) => onChange("birthDate", value)}
            defaultValue="1387/01/01"
            fromYear={1345}
            toYear={1405}
          />
        </AuthField>
      ) : null}

      <AuthField label="استان" htmlFor="province" required>
        <AuthSelect
          id="province"
          icon={MapPin}
          value={form.province || null}
          onValueChange={(value) => onChange("province", value ?? "")}
          placeholder="انتخاب استان"
          options={PROVINCES}
        />
      </AuthField>
    </FieldGroup>
  );
}
