"use client";

import { Camera } from "lucide-react";
import { type Control, Controller } from "react-hook-form";
import { AuthField } from "@/components/shared/auth-field";
import { DatePicker } from "@/components/shared/date-picker";
import { PhotoPicker } from "@/components/shared/photo-picker";
import { FormSection } from "@/features/coach/components/form-section";
import type { StudentFormValues } from "@/features/coach/lib/student-form-model";

type FieldsProps = {
  control: Control<StudentFormValues>;
  mode: "create" | "edit";
  photo?: { imageSrc?: string | null; pending?: boolean; error?: string; onSelectFile?: (file: File) => void };
};

export function StudentPhotoFields({ control, mode, photo }: FieldsProps) {
  return (
    <FormSection icon={Camera} title="عکس پرونده">
      <PhotoPicker
        label="تصویر هنرجو"
        optional
        hint="JPG، PNG یا WebP، حداکثر ۵ مگابایت"
        imageSrc={photo?.imageSrc}
        pending={photo?.pending}
        onSelectFile={photo?.onSelectFile}
      />
      {photo?.error ? <p className="text-[12px] font-bold leading-5 text-danger">{photo.error}</p> : null}

      {mode === "edit" ? (
        <AuthField
          label="تاریخ انقضای عکس پرونده"
          htmlFor="expireImageDate"
          optional
          hint="یادآوری تمدید عکس، ۷ روز قبل از انقضا برای شما ارسال می شود"
        >
          <Controller
            control={control}
            name="expireImageDate"
            render={({ field }) => (
              <DatePicker
                id="expireImageDate"
                title="تاریخ انقضای عکس پرونده"
                value={field.value}
                onChange={field.onChange}
                defaultValue="1405/08/01"
                fromYear={1395}
                toYear={1406}
              />
            )}
          />
        </AuthField>
      ) : null}
    </FormSection>
  );
}
