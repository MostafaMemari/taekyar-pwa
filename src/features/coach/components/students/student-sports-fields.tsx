"use client";

import { Medal, Ruler, Scale } from "lucide-react";
import { type Control, Controller, type FieldErrors, useWatch } from "react-hook-form";
import { AuthField } from "@/components/shared/auth-field";
import { AuthInput } from "@/components/shared/auth-input";
import { BeltPicker } from "@/components/shared/belt-picker";
import { DatePicker } from "@/components/shared/date-picker";
import { BeltStrip } from "@/components/shared/taekyar-mark";
import { FormSection } from "@/features/coach/components/form-section";
import type { StudentFormValues } from "@/features/coach/lib/student-form-model";
import { digitsOnly, toPersianDigits } from "@/lib/digits";
import { getStudentBeltMeta, STUDENT_BELT_GROUPS, type StudentBeltKey } from "@/lib/student-belts";

type FieldsProps = {
  control: Control<StudentFormValues>;
  errors: FieldErrors<StudentFormValues>;
  mode: "create" | "edit";
};

export function StudentSportsFields({ control, errors, mode }: FieldsProps) {
  const beltValue = useWatch({ control, name: "belt" });
  const belt = beltValue ? getStudentBeltMeta(beltValue as StudentBeltKey) : null;

  return (
    <FormSection icon={Medal} title="اطلاعات تکواندو" tone="amber">
      {mode === "create" ? (
        <>
          <Controller
            control={control}
            name="belt"
            render={({ field }) => (
              <BeltPicker
                label="کمربند فعلی"
                value={field.value || null}
                groups={STUDENT_BELT_GROUPS}
                onChange={(value) => field.onChange(value ?? "")}
                error={errors.belt?.message}
                hint="کمربند و تاریخ دریافت آن فقط هنگام ثبت اولیه تعیین می شود."
              />
            )}
          />

          <AuthField label="تاریخ دریافت کمربند فعلی" htmlFor="beltDate" required error={errors.beltDate?.message}>
            <Controller
              control={control}
              name="beltDate"
              render={({ field }) => (
                <DatePicker
                  id="beltDate"
                  title="تاریخ دریافت کمربند"
                  value={field.value}
                  onChange={field.onChange}
                  defaultValue="1404/06/10"
                  fromYear={1390}
                  toYear={1405}
                />
              )}
            />
          </AuthField>

          <div className="grid grid-cols-2 gap-3">
            <AuthField label="قد (سانتی متر)" htmlFor="height" optional error={errors.height?.message}>
              <Controller
                control={control}
                name="height"
                render={({ field }) => (
                  <AuthInput
                    id="height"
                    name={field.name}
                    dir="ltr"
                    inputMode="numeric"
                    maxLength={3}
                    icon={Ruler}
                    placeholder={toPersianDigits("170")}
                    value={toPersianDigits(field.value)}
                    onChange={(event) => field.onChange(digitsOnly(event.target.value, 3))}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                )}
              />
            </AuthField>

            <AuthField label="وزن (کیلوگرم)" htmlFor="weight" optional error={errors.weight?.message}>
              <Controller
                control={control}
                name="weight"
                render={({ field }) => (
                  <AuthInput
                    id="weight"
                    name={field.name}
                    dir="ltr"
                    inputMode="numeric"
                    maxLength={3}
                    icon={Scale}
                    placeholder={toPersianDigits("60")}
                    value={toPersianDigits(field.value)}
                    onChange={(event) => field.onChange(digitsOnly(event.target.value, 3))}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                )}
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
