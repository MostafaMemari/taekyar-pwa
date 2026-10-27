"use client";

import { Fingerprint, MapPin, Mars, UserRound, Venus } from "lucide-react";
import { type Control, Controller, type FieldErrors } from "react-hook-form";
import { AuthField } from "@/components/shared/auth-field";
import { AuthInput } from "@/components/shared/auth-input";
import { AuthSelect } from "@/components/shared/auth-select";
import { DatePicker } from "@/components/shared/date-picker";
import { Segmented } from "@/components/shared/segmented";
import { FieldGroup } from "@/components/ui/field";
import type { StepOneForm } from "@/features/auth/schemas";
import { digitsOnly, toPersianDigits } from "@/lib/digits";
import { PROVINCES } from "@/lib/provinces";

const GENDER_OPTIONS = [
  { value: "MALE", label: "مرد", icon: Mars },
  { value: "FEMALE", label: "زن", icon: Venus },
] as const;

type StepOneFieldsProps = {
  control: Control<StepOneForm>;
  errors: FieldErrors<StepOneForm>;
  withBirthDate: boolean;
  birthDateHint?: string;
  genderHint?: string;
  sampleName: string;
  genderLabel: string;
};

export function StepOneFields({ control, errors, withBirthDate, birthDateHint, genderHint, sampleName, genderLabel }: StepOneFieldsProps) {
  return (
    <FieldGroup className="gap-3.5">
      <AuthField label="نام و نام خانوادگی" htmlFor="fullName" required error={errors.fullName?.message}>
        <Controller
          control={control}
          name="fullName"
          render={({ field }) => (
            <AuthInput
              id="fullName"
              name={field.name}
              autoComplete="name"
              autoFocus
              icon={UserRound}
              placeholder={`مثلاً ${sampleName}`}
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
              ref={field.ref}
            />
          )}
        />
      </AuthField>

      <AuthField label="کد ملی" htmlFor="nationalCode" required hint="۱۰ رقم، بدون خط تیره" error={errors.nationalCode?.message}>
        <Controller
          control={control}
          name="nationalCode"
          render={({ field }) => (
            <AuthInput
              id="nationalCode"
              name={field.name}
              dir="ltr"
              inputMode="numeric"
              autoComplete="off"
              maxLength={10}
              icon={Fingerprint}
              className="text-center font-bold tracking-widest"
              placeholder={toPersianDigits("0012345678")}
              value={toPersianDigits(field.value)}
              onChange={(event) => field.onChange(digitsOnly(event.target.value, 10))}
              onBlur={field.onBlur}
              ref={field.ref}
            />
          )}
        />
      </AuthField>

      <Controller
        control={control}
        name="gender"
        render={({ field }) => (
          <Segmented
            label={genderLabel}
            value={field.value || null}
            options={GENDER_OPTIONS}
            onChange={(value) => field.onChange(value)}
            hint={genderHint}
            error={errors.gender?.message}
          />
        )}
      />

      {withBirthDate ? (
        <AuthField label="تاریخ تولد" htmlFor="birthDate" required hint={birthDateHint} error={errors.birthDate?.message}>
          <Controller
            control={control}
            name="birthDate"
            render={({ field }) => (
              <DatePicker
                id="birthDate"
                title="تاریخ تولد"
                value={field.value}
                onChange={(value) => field.onChange(value)}
                defaultValue="1387/01/01"
                fromYear={1345}
                toYear={1405}
              />
            )}
          />
        </AuthField>
      ) : null}

      <AuthField label="استان" htmlFor="province" required error={errors.province?.message}>
        <Controller
          control={control}
          name="province"
          render={({ field }) => (
            <AuthSelect
              id="province"
              icon={MapPin}
              value={field.value || null}
              onValueChange={(value) => field.onChange(value ?? "")}
              placeholder="انتخاب استان"
              options={PROVINCES}
            />
          )}
        />
      </AuthField>
    </FieldGroup>
  );
}
