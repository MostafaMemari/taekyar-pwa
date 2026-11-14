"use client";

import { ChevronDown, Clock } from "lucide-react";
import { type Control, Controller } from "react-hook-form";
import { AuthField } from "@/components/shared/auth-field";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { WeekDay } from "@/features/coach/lib/coach-data";
import type { SessionFormValues } from "@/features/coach/lib/session-form-model";
import { SESSION_DAY_OPTIONS } from "@/features/coach/lib/session-form-options";
import { toPersianDigits } from "@/lib/digits";

type FieldsProps = {
  control: Control<SessionFormValues>;
  weekDaysError?: string;
  // Opens the embedded time view in the parent sheet instead of stacking a second sheet.
  onPickTime?: (field: "startTime" | "endTime") => void;
  startTimeError?: string;
  endTimeError?: string;
};

// Same trigger shell as TimePicker; the wheels open as a view inside the parent sheet.
function TimeTrigger({ id, ariaLabel, value, onOpen }: { id: string; ariaLabel: string; value: string; onOpen: () => void }) {
  const display = value.match(/^(\d{1,2}):(\d{2})$/);

  return (
    <Button
      id={id}
      type="button"
      variant="field"
      aria-haspopup="dialog"
      aria-label={ariaLabel}
      className="relative h-12 w-full rounded-xl px-11 text-sm font-semibold text-ink"
      onClick={onOpen}
    >
      <Clock className="pointer-events-none absolute start-3.5 text-ink-subtle" aria-hidden="true" />
      <span className="truncate tabular-nums">
        {display ? toPersianDigits(`${display[1].padStart(2, "0")}:${display[2]}`) : "انتخاب ساعت"}
      </span>
      <ChevronDown className="pointer-events-none absolute end-3.5 text-ink-subtle" aria-hidden="true" />
    </Button>
  );
}

export function SessionScheduleFields({ control, weekDaysError, onPickTime, startTimeError, endTimeError }: FieldsProps) {
  return (
    <div className="flex flex-col gap-3.5">
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
                  className="h-9 rounded-full px-3.5 text-[12px] font-bold aria-pressed:border-primary/35 aria-pressed:bg-brand-50 aria-pressed:text-accent-ink"
                >
                  {day.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        />
        {weekDaysError ? <FieldError className="text-start text-[12px] font-semibold">{weekDaysError}</FieldError> : null}
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <AuthField label="ساعت شروع" htmlFor="startTime" required error={startTimeError}>
          <Controller
            control={control}
            name="startTime"
            render={({ field }) => (
              <TimeTrigger id="startTime" ariaLabel="ساعت شروع" value={field.value} onOpen={() => onPickTime?.("startTime")} />
            )}
          />
        </AuthField>

        <AuthField label="ساعت پایان" htmlFor="endTime" required error={endTimeError}>
          <Controller
            control={control}
            name="endTime"
            render={({ field }) => (
              <TimeTrigger id="endTime" ariaLabel="ساعت پایان" value={field.value} onOpen={() => onPickTime?.("endTime")} />
            )}
          />
        </AuthField>
      </div>
    </div>
  );
}
