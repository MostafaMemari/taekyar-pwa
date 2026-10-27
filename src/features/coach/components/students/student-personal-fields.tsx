"use client";

import { User } from "lucide-react";
import { AuthField } from "@/components/shared/auth-field";
import { AuthSelect } from "@/components/shared/auth-select";
import { DatePicker } from "@/components/shared/date-picker";
import { Segmented } from "@/components/shared/segmented";
import { Input } from "@/components/ui/input";
import { FormSection } from "@/features/coach/components/form-section";
import type { StudentFormState, StudentFormUpdater } from "@/features/coach/lib/student-form-model";
import { GENDER_OPTIONS } from "@/features/coach/lib/student-form-options";
import { digitsOnly, toPersianDigits } from "@/lib/digits";
import { PROVINCES } from "@/lib/provinces";

type FieldsProps = {
  form: StudentFormState;
  onChange: StudentFormUpdater;
};

export function StudentPersonalFields({ form, onChange, locked = false }: FieldsProps & { locked?: boolean }) {
  return (
    <FormSection icon={User} title="مشخصات فردی">
      <AuthField label="نام و نام خانوادگی" htmlFor="fullName" required>
        <Input
          id="fullName"
          name="fullName"
          autoComplete="name"
          placeholder="مثلاً سامان رستمی"
          value={form.fullName}
          onChange={(event) => onChange("fullName", event.target.value)}
          className="h-12 rounded-xl px-4 text-sm"
        />
      </AuthField>

      <AuthField label="کد ملی" htmlFor="nationalCode" required hint="کد ملی باید در سامانه یکتا باشد.">
        <Input
          id="nationalCode"
          name="nationalCode"
          dir="ltr"
          inputMode="numeric"
          autoComplete="off"
          maxLength={10}
          placeholder={toPersianDigits("0012345678")}
          value={toPersianDigits(form.nationalCode)}
          onChange={(event) => onChange("nationalCode", digitsOnly(event.target.value, 10))}
          className="h-12 rounded-xl px-4 text-center text-sm font-bold tracking-widest"
        />
      </AuthField>

      <Segmented
        label="جنسیت"
        value={form.gender}
        options={GENDER_OPTIONS}
        onChange={(value) => onChange("gender", value as StudentFormState["gender"])}
        required={!locked}
        disabled={locked}
        hint={locked ? "جنسیت هنرجو پس از ثبت قابل تغییر نیست." : "جنسیت هنرجو باید با جنسیت شما یکسان باشد."}
      />

      <div className="grid grid-cols-2 gap-3">
        <AuthField label="تاریخ تولد" htmlFor="birthDate" required>
          <DatePicker
            id="birthDate"
            title="تاریخ تولد"
            value={form.birthDate}
            onChange={(value) => onChange("birthDate", value)}
            defaultValue="1388/01/01"
            fromYear={1345}
            toYear={1405}
          />
        </AuthField>

        <AuthField label="نام پدر" htmlFor="fatherName" optional>
          <Input
            id="fatherName"
            name="fatherName"
            autoComplete="off"
            placeholder="مثلاً علی"
            value={form.fatherName}
            onChange={(event) => onChange("fatherName", event.target.value)}
            className="h-12 rounded-xl px-4 text-sm"
          />
        </AuthField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <AuthField label="شماره تماس" htmlFor="phone" optional>
          <Input
            id="phone"
            name="phone"
            dir="ltr"
            inputMode="tel"
            autoComplete="tel"
            maxLength={11}
            placeholder={toPersianDigits("09121234567")}
            value={toPersianDigits(form.phone)}
            onChange={(event) => onChange("phone", digitsOnly(event.target.value, 11))}
            className="h-12 rounded-xl px-3 text-center text-sm font-semibold"
          />
        </AuthField>

        <AuthField label="تلفن ثابت" htmlFor="landline" optional>
          <Input
            id="landline"
            name="landline"
            dir="ltr"
            inputMode="tel"
            autoComplete="off"
            maxLength={11}
            placeholder={toPersianDigits("02144556677")}
            value={toPersianDigits(form.landline)}
            onChange={(event) => onChange("landline", digitsOnly(event.target.value, 11))}
            className="h-12 rounded-xl px-3 text-center text-sm font-semibold"
          />
        </AuthField>
      </div>

      <AuthField label="استان" htmlFor="province" required>
        <AuthSelect
          id="province"
          value={form.province || null}
          onValueChange={(value) => onChange("province", value ?? "")}
          placeholder="انتخاب استان"
          options={PROVINCES}
        />
      </AuthField>
    </FormSection>
  );
}
