"use client";

import { Camera, Landmark, UserCheck } from "lucide-react";
import { FormSection } from "@/components/coach/coach-form";
import { AuthField } from "@/components/shared/auth-field";
import { Segmented } from "@/components/shared/segmented";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ClubFormState, ClubFormUpdater } from "@/lib/coach/club-form-model";
import { CLUB_ADMISSION_OPTIONS } from "@/lib/coach/club-options";
import { CLUB_DISCIPLINES } from "@/lib/coach/coach-data";
import { digitsOnly, toPersianDigits } from "@/lib/digits";

type FieldsProps = {
  form: ClubFormState;
  onChange: ClubFormUpdater;
};

export function ClubCoverFields() {
  return (
    <FormSection icon={Camera} title="تصویر کاور" tone="sky">
      <Button type="button" variant="outline" className="h-24 w-full rounded-xl border-dashed text-[12px] font-bold text-ink-muted">
        <Camera data-icon="inline-start" aria-hidden="true" />
        تصویر کاور باشگاه
      </Button>
      <p className="text-start text-[11px] font-medium leading-5 text-ink-muted">در نسخه نمایشی، تصویر کاور نمایشی است و آپلود نمی شود.</p>
    </FormSection>
  );
}

export function ClubInfoFields({ form, onChange }: FieldsProps) {
  return (
    <FormSection icon={Landmark} title="اطلاعات باشگاه">
      <AuthField label="نام باشگاه" htmlFor="name" required>
        <Input
          id="name"
          name="name"
          placeholder="مثلاً باشگاه تکواندو پارس"
          value={form.name}
          onChange={(event) => onChange("name", event.target.value)}
          className="h-12 rounded-xl px-4 text-sm"
        />
      </AuthField>

      <AuthField label="تلفن باشگاه" htmlFor="phone" hint="شماره ثابت سالن برای هماهنگی هنرجویان.">
        <Input
          id="phone"
          name="phone"
          dir="ltr"
          inputMode="tel"
          autoComplete="tel"
          maxLength={11}
          placeholder={toPersianDigits("02188452310")}
          value={toPersianDigits(form.phone)}
          onChange={(event) => onChange("phone", digitsOnly(event.target.value, 11))}
          className="h-12 rounded-xl px-4 text-center text-sm font-semibold tracking-wider"
        />
      </AuthField>

      <AuthField label="آدرس" htmlFor="address">
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
    </FormSection>
  );
}

export function ClubAdmissionFields({ form, onChange }: FieldsProps) {
  return (
    <FormSection icon={UserCheck} title="پذیرش و رشته ها" tone="emerald">
      <Segmented
        label="جنسیت پذیرش"
        value={form.admission}
        options={CLUB_ADMISSION_OPTIONS}
        onChange={(value) => onChange("admission", value as ClubFormState["admission"])}
        columns={3}
        required={false}
        hint="فقط هنرجویان با همین جنسیت به باشگاه دعوت می شوند."
      />

      <Field>
        <FieldLabel className="text-[13px] font-semibold text-ink-body">رشته های فعال</FieldLabel>
        <ToggleGroup
          aria-label="رشته های فعال"
          multiple
          value={form.disciplines}
          onValueChange={(next) => onChange("disciplines", next)}
          variant="outline"
          spacing={2}
          className="flex w-full flex-wrap"
        >
          {CLUB_DISCIPLINES.map((discipline) => (
            <ToggleGroupItem
              key={discipline}
              value={discipline}
              className="h-9 rounded-full px-3.5 text-[11px] font-bold aria-pressed:border-primary/35 aria-pressed:bg-brand-50 aria-pressed:text-accent-ink"
            >
              {discipline}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <FieldDescription className="text-start text-[11px] font-medium leading-5 text-ink-muted">
          رشته های انتخابی در پروفایل باشگاه نمایش داده می شوند.
        </FieldDescription>
      </Field>
    </FormSection>
  );
}
