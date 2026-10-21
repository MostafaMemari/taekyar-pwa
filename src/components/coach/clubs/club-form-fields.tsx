"use client";

import { Camera, Info, Landmark } from "lucide-react";
import { FormSection } from "@/components/coach/coach-form";
import { AuthField } from "@/components/shared/auth-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ClubFormState, ClubFormUpdater } from "@/lib/coach/club-form-model";
import { COACH, GENDER_META } from "@/lib/coach/coach-data";
import { toPersianDigits } from "@/lib/digits";

type FieldsProps = {
  form: ClubFormState;
  onChange: ClubFormUpdater;
};

export function ClubCoverFields() {
  return (
    <FormSection icon={Camera} title="تصویر باشگاه" tone="sky">
      <Button type="button" variant="outline" className="h-24 w-full rounded-xl border-dashed text-[12px] font-bold text-ink-muted">
        <Camera data-icon="inline-start" aria-hidden="true" />
        انتخاب تصویر باشگاه (اختیاری)
      </Button>
      <p className="text-start text-[11px] font-medium leading-5 text-ink-muted">
        تصویر به صورت اختیاری ثبت می شود؛ در نسخه نمایشی آپلود انجام نمی شود.
      </p>
    </FormSection>
  );
}

export function ClubInfoFields({ form, onChange }: FieldsProps) {
  return (
    <FormSection icon={Landmark} title="اطلاعات باشگاه">
      <AuthField label="نام باشگاه" htmlFor="name" required hint="۲ تا ۸۰ کاراکتر">
        <Input
          id="name"
          name="name"
          maxLength={80}
          placeholder="مثلاً باشگاه بلوار مارلیک"
          value={form.name}
          onChange={(event) => onChange("name", event.target.value)}
          className="h-12 rounded-xl px-4 text-sm"
        />
      </AuthField>

      <AuthField label="آدرس" htmlFor="address" hint="اختیاری — ۵ تا ۲۰۰ کاراکتر">
        <Textarea
          id="address"
          name="address"
          rows={3}
          maxLength={200}
          placeholder="آدرس کامل سالن ورزشی..."
          value={form.address}
          onChange={(event) => onChange("address", event.target.value)}
          className="min-h-24 resize-none rounded-xl px-4 py-3 text-sm leading-6"
        />
        <p className="text-end text-[10px] font-semibold text-ink-faint" dir="ltr">
          {toPersianDigits(String(form.address.length))} / {toPersianDigits("200")}
        </p>
      </AuthField>

      <Alert className="rounded-xl border-none bg-info-soft/60 p-3 text-start">
        <Info className="text-info" aria-hidden="true" />
        <AlertDescription className="text-[11px] leading-5 text-ink-muted">
          جنسیت باشگاه از پروفایل مربی گرفته می شود و روی «{GENDER_META[COACH.gender].clubLabel}» ثابت است؛ فقط هنرجویان هم جنس قابل افزودن
          هستند.
        </AlertDescription>
      </Alert>
    </FormSection>
  );
}
