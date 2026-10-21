"use client";

import { Medal, Ruler, Scale, ShieldCheck, User } from "lucide-react";
import { FormSection } from "@/components/coach/coach-form";
import { AuthField, AuthInput, AuthSelect } from "@/components/shared/auth-field";
import { BeltPicker } from "@/components/shared/belt-picker";
import { DatePicker } from "@/components/shared/date-picker";
import { PhotoPicker } from "@/components/shared/photo-picker";
import { Segmented } from "@/components/shared/segmented";
import { BeltStrip } from "@/components/shared/taekyar-mark";
import { Input } from "@/components/ui/input";
import type { StudentFormState, StudentFormUpdater } from "@/lib/coach/student-form-model";
import { GENDER_OPTIONS } from "@/lib/coach/student-form-options";
import { digitsOnly, toPersianDigits } from "@/lib/digits";
import { PROVINCES } from "@/lib/provinces";
import { getStudentBeltMeta, STUDENT_BELT_GROUPS } from "@/lib/student-belts";

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

export function StudentSportsFields({ form, onChange, mode }: FieldsProps & { mode: "create" | "edit" }) {
  const belt = form.belt ? getStudentBeltMeta(form.belt) : null;

  return (
    <FormSection icon={Medal} title="اطلاعات تکواندو" tone="amber">
      {mode === "create" ? (
        <>
          <BeltPicker
            label="کمربند فعلی"
            value={form.belt || null}
            groups={STUDENT_BELT_GROUPS}
            onChange={(value) => onChange("belt", (value ?? "") as StudentFormState["belt"])}
            hint="کمربند و تاریخ دریافت آن فقط هنگام ثبت اولیه تعیین می شود."
          />

          <AuthField label="تاریخ دریافت کمربند فعلی" htmlFor="beltDate" required>
            <DatePicker
              id="beltDate"
              title="تاریخ دریافت کمربند"
              value={form.beltDate}
              onChange={(value) => onChange("beltDate", value)}
              defaultValue="1404/06/10"
              fromYear={1390}
              toYear={1405}
            />
          </AuthField>

          <div className="grid grid-cols-2 gap-3">
            <AuthField label="قد (سانتی متر)" htmlFor="height" optional>
              <AuthInput
                id="height"
                name="height"
                dir="ltr"
                inputMode="numeric"
                maxLength={3}
                icon={Ruler}
                placeholder={toPersianDigits("170")}
                value={toPersianDigits(form.height)}
                onChange={(event) => onChange("height", digitsOnly(event.target.value, 3))}
              />
            </AuthField>

            <AuthField label="وزن (کیلوگرم)" htmlFor="weight" optional>
              <AuthInput
                id="weight"
                name="weight"
                dir="ltr"
                inputMode="numeric"
                maxLength={3}
                icon={Scale}
                placeholder={toPersianDigits("60")}
                value={toPersianDigits(form.weight)}
                onChange={(event) => onChange("weight", digitsOnly(event.target.value, 3))}
              />
            </AuthField>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-field p-3.5">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-ink-subtle">کمربند فعلی</p>
              <p className="mt-1 text-[13px] font-extrabold text-ink">{belt?.label ?? "ثبت نشده"}</p>
            </div>
            {belt ? (
              <BeltStrip
                color={belt.color}
                bottomColor={belt.bottomColor}
                outline={belt.outline}
                stripes={belt.stripeCount}
                className="size-auto w-16"
              />
            ) : null}
          </div>

          <p className="text-start text-[11px] font-medium leading-5 text-ink-muted">
            برای تغییر کمربند از گزینه «تخصیص کمربند» در پرونده هنرجو استفاده کنید. قد، وزن و تاریخ کمربند فقط در زمان ثبت اولیه قابل ثبت
            هستند.
          </p>
        </>
      )}
    </FormSection>
  );
}

export function StudentEnrollmentFields({ form, onChange, showImageExpiry = false }: FieldsProps & { showImageExpiry?: boolean }) {
  return (
    <FormSection icon={ShieldCheck} title="عضویت و بیمه" tone="sky">
      <div className="grid grid-cols-2 gap-3">
        <AuthField label="سال عضویت" htmlFor="membershipYear" optional>
          <Input
            id="membershipYear"
            name="membershipYear"
            dir="ltr"
            inputMode="numeric"
            maxLength={4}
            placeholder={toPersianDigits("1404")}
            value={toPersianDigits(form.membershipYear)}
            onChange={(event) => onChange("membershipYear", digitsOnly(event.target.value, 4))}
            className="h-12 rounded-xl px-3 text-center text-sm font-semibold"
          />
        </AuthField>

        <AuthField label="تاریخ بیمه ورزشی" htmlFor="insuranceDate" optional>
          <DatePicker
            id="insuranceDate"
            title="تاریخ بیمه ورزشی"
            value={form.insuranceDate}
            onChange={(value) => onChange("insuranceDate", value)}
            defaultValue="1405/02/19"
            fromYear={1395}
            toYear={1406}
          />
        </AuthField>
      </div>

      {showImageExpiry ? (
        <AuthField
          label="تاریخ انقضای عکس پرونده"
          htmlFor="expireImageDate"
          optional
          hint="یادآوری تمدید عکس، ۷ روز قبل از انقضا برای شما ارسال می شود."
        >
          <DatePicker
            id="expireImageDate"
            title="تاریخ انقضای عکس پرونده"
            value={form.expireImageDate}
            onChange={(value) => onChange("expireImageDate", value)}
            defaultValue="1405/08/01"
            fromYear={1395}
            toYear={1406}
          />
        </AuthField>
      ) : null}

      <PhotoPicker label="تصویر هنرجو" optional hint="JPG یا PNG — حداکثر ۵ مگابایت" />
    </FormSection>
  );
}
