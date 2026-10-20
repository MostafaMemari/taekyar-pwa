"use client";

import { CalendarDays, Info, Landmark, Timer } from "lucide-react";
import { FormSection } from "@/components/coach/coach-form";
import { AuthField, AuthSelect } from "@/components/shared/auth-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CLUBS } from "@/lib/coach/coach-data";
import type { SessionFormState, SessionFormUpdater } from "@/lib/coach/session-form-model";
import { SESSION_DAYS } from "@/lib/coach/session-form-options";
import { digitsOnly, toPersianDigits } from "@/lib/digits";

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
          placeholder="مثلاً کلاس سبک کیوروگی"
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

      <AuthField label="ظرفیت کلاس (نفر)" htmlFor="capacity" hint="سقف هنرجویان قابل ثبت در این کلاس.">
        <Input
          id="capacity"
          name="capacity"
          dir="ltr"
          inputMode="numeric"
          maxLength={3}
          placeholder={toPersianDigits("24")}
          value={toPersianDigits(form.capacity)}
          onChange={(event) => onChange("capacity", digitsOnly(event.target.value, 3))}
          className="h-12 rounded-xl px-4 text-center text-sm font-semibold"
        />
      </AuthField>
    </FormSection>
  );
}

export function SessionScheduleFields({ form, onChange }: FieldsProps) {
  return (
    <FormSection icon={Timer} title="زمان بندی برگزاری" tone="sky">
      <Field>
        <FieldLabel className="text-[13px] font-semibold text-ink-body">
          روزهای برگزاری<span className="text-accent-ink"> *</span>
        </FieldLabel>
        <ToggleGroup
          aria-label="روزهای برگزاری"
          multiple
          value={form.days}
          onValueChange={(next) => onChange("days", next)}
          variant="outline"
          spacing={2}
          className="flex w-full flex-wrap"
        >
          {SESSION_DAYS.map((day) => (
            <ToggleGroupItem
              key={day}
              value={day}
              className="h-9 rounded-full px-3.5 text-[11px] font-bold aria-pressed:border-primary/35 aria-pressed:bg-brand-50 aria-pressed:text-accent-ink"
            >
              {day}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <FieldDescription className="text-start text-[11px] font-medium leading-5 text-ink-muted">
          حداقل یک روز برگزاری را انتخاب کنید.
        </FieldDescription>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <AuthField label="ساعت شروع" htmlFor="startTime" required>
          <Input
            id="startTime"
            name="startTime"
            type="time"
            dir="ltr"
            value={form.start}
            onChange={(event) => onChange("start", event.target.value)}
            className="h-12 rounded-xl px-3 text-center text-sm font-semibold tabular-nums"
          />
        </AuthField>

        <AuthField label="ساعت پایان" htmlFor="endTime" required>
          <Input
            id="endTime"
            name="endTime"
            type="time"
            dir="ltr"
            value={form.end}
            onChange={(event) => onChange("end", event.target.value)}
            className="h-12 rounded-xl px-3 text-center text-sm font-semibold tabular-nums"
          />
        </AuthField>
      </div>

      <Alert className="rounded-xl border-none bg-info-soft/60 p-3 text-start">
        <Info className="text-info" aria-hidden="true" />
        <AlertDescription className="text-[11px] leading-5 text-ink-muted">
          اگر بازه زمانی با کلاس دیگری از همین باشگاه هم پوشانی داشته باشد، هنگام ثبت اخطار نمایش داده می شود.
        </AlertDescription>
      </Alert>
    </FormSection>
  );
}
