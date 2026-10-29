"use client";

import { Info, Timer } from "lucide-react";
import { type Control, Controller } from "react-hook-form";
import { AuthField } from "@/components/shared/auth-field";
import { TimePicker } from "@/components/shared/time-picker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FormSection } from "@/features/coach/components/form-section";
import type { WeekDay } from "@/features/coach/lib/coach-data";
import type { SessionFormValues } from "@/features/coach/lib/session-form-model";
import { SESSION_DAY_OPTIONS } from "@/features/coach/lib/session-form-options";

type FieldsProps = {
  control: Control<SessionFormValues>;
  weekDaysError?: string;
  startTimeError?: string;
  endTimeError?: string;
};

export function SessionScheduleFields({ control, weekDaysError, startTimeError, endTimeError }: FieldsProps) {
  return (
    <FormSection icon={Timer} title="زمان بندی برگزاری" tone="sky">
      <Field>
        <FieldLabel className="text-[13px] font-semibold text-ink-body">
          روزهای برگزاری<span className="text-accent-ink"> *</span>
        </FieldLabel>
        <Controller
          control={control}
          name="weekDays"
          render={({ field }) => (
            <ToggleGroup
              aria-label="روزهای برگزاری"
              multiple
              value={field.value}
              onValueChange={(next) => field.onChange(next as WeekDay[])}
              variant="outline"
              spacing={2}
              className="flex w-full flex-wrap"
            >
              {SESSION_DAY_OPTIONS.map((day) => (
                <ToggleGroupItem
                  key={day.value}
                  value={day.value}
                  className="h-9 rounded-full px-3.5 text-[11px] font-bold aria-pressed:border-primary/35 aria-pressed:bg-brand-50 aria-pressed:text-accent-ink"
                >
                  {day.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        />
        {weekDaysError ? <FieldError className="text-start text-[11px] font-semibold">{weekDaysError}</FieldError> : null}
        <FieldDescription className="text-start text-[11px] font-medium leading-5 text-ink-muted">
          حداقل یک روز برگزاری را انتخاب کنید. ساعت پایان باید بعد از ساعت شروع باشد.
        </FieldDescription>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <AuthField label="ساعت شروع" htmlFor="startTime" required error={startTimeError}>
          <Controller
            control={control}
            name="startTime"
            render={({ field }) => (
              <TimePicker id="startTime" title="ساعت شروع" value={field.value} onChange={field.onChange} defaultValue="17:00" />
            )}
          />
        </AuthField>

        <AuthField label="ساعت پایان" htmlFor="endTime" required error={endTimeError}>
          <Controller
            control={control}
            name="endTime"
            render={({ field }) => (
              <TimePicker id="endTime" title="ساعت پایان" value={field.value} onChange={field.onChange} defaultValue="18:30" />
            )}
          />
        </AuthField>
      </div>

      <Alert className="rounded-xl border-none bg-info-soft/60 p-3 text-start">
        <Info className="text-info" aria-hidden="true" />
        <AlertDescription className="text-[11px] leading-5 text-ink-muted">
          بازه زمانی باید معتبر باشد (شروع قبل از پایان). برای هر کلاس سقف ظرفیت تعیین نمی شود و هنرجویان بعد از ساخت کلاس اضافه می شوند.
        </AlertDescription>
      </Alert>
    </FormSection>
  );
}
