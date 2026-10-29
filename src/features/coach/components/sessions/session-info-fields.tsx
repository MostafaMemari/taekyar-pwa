"use client";

import { CalendarDays, Landmark } from "lucide-react";
import { type Control, Controller } from "react-hook-form";
import { AuthField } from "@/components/shared/auth-field";
import { AuthSelect } from "@/components/shared/auth-select";
import { Input } from "@/components/ui/input";
import { FormSection } from "@/features/coach/components/form-section";
import { useClubs } from "@/features/coach/hooks/use-clubs";
import type { SessionFormValues } from "@/features/coach/lib/session-form-model";

type FieldsProps = {
  control: Control<SessionFormValues>;
  clubLocked?: boolean;
  nameError?: string;
  clubIdError?: string;
};

export function SessionInfoFields({ control, clubLocked, nameError, clubIdError }: FieldsProps) {
  const { data } = useClubs();
  const clubOptions = (data?.clubs ?? []).map((club) => ({ value: club.id, label: club.name }));

  return (
    <FormSection icon={CalendarDays} title="اطلاعات کلاس">
      <AuthField label="نام کلاس" htmlFor="name" required hint="۲ تا ۸۰ کاراکتر" error={nameError}>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input
              id="name"
              name={field.name}
              maxLength={80}
              placeholder="مثلاً کیوروگی آقایان"
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
              ref={field.ref}
              className="h-12 rounded-xl px-4 text-sm"
            />
          )}
        />
      </AuthField>

      <AuthField label="باشگاه" htmlFor="clubId" required error={clubIdError}>
        <Controller
          control={control}
          name="clubId"
          render={({ field }) => (
            <AuthSelect
              id="clubId"
              value={field.value || null}
              onValueChange={(value) => field.onChange(value ?? "")}
              placeholder="انتخاب باشگاه"
              options={clubOptions}
              icon={Landmark}
              disabled={clubLocked}
            />
          )}
        />
      </AuthField>

      <p className="text-start text-[11px] font-medium leading-5 text-ink-muted">
        {clubLocked
          ? "باشگاه کلاس پس از ساخت تغییر نمی کند؛ برای جابه جایی کلاس، یک کلاس در باشگاه دیگر بسازید."
          : "کلاس به باشگاه انتخاب شده متصل می شود؛ افزودن هنرجو پس از ساخت کلاس انجام می شود."}
      </p>
    </FormSection>
  );
}
