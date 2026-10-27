"use client";

import { CalendarDays, Landmark } from "lucide-react";
import { AuthField } from "@/components/shared/auth-field";
import { AuthSelect } from "@/components/shared/auth-select";
import { Input } from "@/components/ui/input";
import { FormSection } from "@/features/coach/components/form-section";
import { CLUBS } from "@/features/coach/lib/coach-data";
import type { SessionFormState, SessionFormUpdater } from "@/features/coach/lib/session-form-model";

type FieldsProps = {
  form: SessionFormState;
  onChange: SessionFormUpdater;
};

const CLUB_OPTIONS = CLUBS.map((club) => ({ value: club.id, label: club.name }));

export function SessionInfoFields({ form, onChange }: FieldsProps) {
  return (
    <FormSection icon={CalendarDays} title="اطلاعات کلاس">
      <AuthField label="نام کلاس" htmlFor="name" required>
        <Input
          id="name"
          name="name"
          placeholder="مثلاً کیوروگی آقایان"
          value={form.name}
          onChange={(event) => onChange("name", event.target.value)}
          className="h-12 rounded-xl px-4 text-sm"
        />
      </AuthField>

      <AuthField label="باشگاه" htmlFor="clubId" required>
        <AuthSelect
          id="clubId"
          value={form.clubId || null}
          onValueChange={(value) => onChange("clubId", value ?? "")}
          placeholder="انتخاب باشگاه"
          options={CLUB_OPTIONS}
          icon={Landmark}
        />
      </AuthField>

      <p className="text-start text-[11px] font-medium leading-5 text-ink-muted">
        کلاس به باشگاه انتخاب شده متصل می شود؛ افزودن هنرجو پس از ساخت کلاس انجام می شود.
      </p>
    </FormSection>
  );
}
