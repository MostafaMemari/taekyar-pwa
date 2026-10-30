"use client";

import { User } from "lucide-react";
import { type Control, Controller, type FieldErrors } from "react-hook-form";
import { AuthField } from "@/components/shared/auth-field";
import { AuthSelect } from "@/components/shared/auth-select";
import { DatePicker } from "@/components/shared/date-picker";
import { Segmented } from "@/components/shared/segmented";
import { Input } from "@/components/ui/input";
import { FormSection } from "@/features/coach/components/form-section";
import type { StudentFormValues } from "@/features/coach/lib/student-form-model";
import { GENDER_OPTIONS } from "@/features/coach/lib/student-form-options";
import { digitsOnly, toPersianDigits } from "@/lib/digits";
import { PROVINCES } from "@/lib/provinces";

type FieldsProps = {
  control: Control<StudentFormValues>;
  errors: FieldErrors<StudentFormValues>;
  locked?: boolean;
};

export function StudentPersonalFields({ control, errors, locked = false }: FieldsProps) {
  return (
    <FormSection icon={User} title="مشخصات فردی">
      <AuthField label="نام و نام خانوادگی" htmlFor="fullName" required error={errors.fullName?.message}>
        <Controller
          control={control}
          name="fullName"
          render={({ field }) => (
            <Input
              id="fullName"
              name={field.name}
              autoComplete="name"
              placeholder="مثلاً سامان رستمی"
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
              ref={field.ref}
              className="h-12 rounded-xl px-4 text-sm"
            />
          )}
        />
      </AuthField>

      <AuthField
        label="کد ملی"
        htmlFor="nationalCode"
        required
        hint="کد ملی باید در سامانه یکتا باشد."
        error={errors.nationalCode?.message}
      >
        <Controller
          control={control}
          name="nationalCode"
          render={({ field }) => (
            <Input
              id="nationalCode"
              name={field.name}
              dir="ltr"
              inputMode="numeric"
              autoComplete="off"
              maxLength={10}
              placeholder={toPersianDigits("0012345678")}
              value={toPersianDigits(field.value)}
              onChange={(event) => field.onChange(digitsOnly(event.target.value, 10))}
              onBlur={field.onBlur}
              ref={field.ref}
              className="h-12 rounded-xl px-4 text-center text-sm font-bold tracking-widest"
            />
          )}
        />
      </AuthField>

      <Controller
        control={control}
        name="gender"
        render={({ field }) => (
          <Segmented
            label="جنسیت"
            value={field.value}
            options={GENDER_OPTIONS}
            onChange={field.onChange}
            required={!locked}
            disabled={locked}
            error={errors.gender?.message}
            hint={locked ? "جنسیت هنرجو پس از ثبت قابل تغییر نیست." : "جنسیت هنرجو باید با جنسیت شما یکسان باشد."}
          />
        )}
      />

      <div className="grid grid-cols-2 gap-3">
        <AuthField label="تاریخ تولد" htmlFor="birthDate" required error={errors.birthDate?.message}>
          <Controller
            control={control}
            name="birthDate"
            render={({ field }) => (
              <DatePicker
                id="birthDate"
                title="تاریخ تولد"
                value={field.value}
                onChange={field.onChange}
                defaultValue="1388/01/01"
                fromYear={1345}
                toYear={1405}
              />
            )}
          />
        </AuthField>

        <AuthField label="نام پدر" htmlFor="fatherName" optional error={errors.fatherName?.message}>
          <Controller
            control={control}
            name="fatherName"
            render={({ field }) => (
              <Input
                id="fatherName"
                name={field.name}
                autoComplete="off"
                placeholder="مثلاً علی"
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
                ref={field.ref}
                className="h-12 rounded-xl px-4 text-sm"
              />
            )}
          />
        </AuthField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <AuthField label="شماره تماس" htmlFor="phone" optional error={errors.phone?.message}>
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <Input
                id="phone"
                name={field.name}
                dir="ltr"
                inputMode="tel"
                autoComplete="tel"
                maxLength={11}
                placeholder={toPersianDigits("09121234567")}
                value={toPersianDigits(field.value)}
                onChange={(event) => field.onChange(digitsOnly(event.target.value, 11))}
                onBlur={field.onBlur}
                ref={field.ref}
                className="h-12 rounded-xl px-3 text-center text-sm font-semibold"
              />
            )}
          />
        </AuthField>

        <AuthField label="تلفن ثابت" htmlFor="landline" optional error={errors.landline?.message}>
          <Controller
            control={control}
            name="landline"
            render={({ field }) => (
              <Input
                id="landline"
                name={field.name}
                dir="ltr"
                inputMode="tel"
                autoComplete="off"
                maxLength={11}
                placeholder={toPersianDigits("02144556677")}
                value={toPersianDigits(field.value)}
                onChange={(event) => field.onChange(digitsOnly(event.target.value, 11))}
                onBlur={field.onBlur}
                ref={field.ref}
                className="h-12 rounded-xl px-3 text-center text-sm font-semibold"
              />
            )}
          />
        </AuthField>
      </div>

      <AuthField label="استان" htmlFor="province" required error={errors.province?.message}>
        <Controller
          control={control}
          name="province"
          render={({ field }) => (
            <AuthSelect
              id="province"
              value={field.value || null}
              onValueChange={(value) => field.onChange(value ?? "")}
              placeholder="انتخاب استان"
              options={PROVINCES}
            />
          )}
        />
      </AuthField>
    </FormSection>
  );
}
