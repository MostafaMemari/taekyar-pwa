"use client";

import { CalendarDays, Landmark } from "lucide-react";
import { type Control, Controller, type UseFormSetValue, useWatch } from "react-hook-form";
import { AuthField } from "@/components/shared/auth-field";
import { AuthSelect } from "@/components/shared/auth-select";
import { FormSection } from "@/features/coach/components/form-section";
import { useClubs } from "@/features/coach/hooks/use-clubs";
import { useSessions } from "@/features/coach/hooks/use-sessions";
import { weekDayLabels } from "@/features/coach/lib/coach-data";
import type { StudentFormValues } from "@/features/coach/lib/student-form-model";
import { toPersianDigits } from "@/lib/digits";

// Optional club and class at first registration; the form enrolls the created student after POST /student succeeds.
export function StudentEnrollFields({
  control,
  setValue,
}: {
  control: Control<StudentFormValues>;
  setValue: UseFormSetValue<StudentFormValues>;
}) {
  const clubId = useWatch({ control, name: "clubId" });
  const { data } = useClubs();
  const { data: sessionsData } = useSessions();

  const clubs = (data?.clubs ?? []).filter((club) => club.isActive);
  const sessions = (sessionsData?.sessions ?? []).filter((session) => session.isActive && session.clubId === clubId);

  return (
    <FormSection icon={Landmark} title="باشگاه و کلاس">
      <AuthField label="باشگاه" htmlFor="enrollClub" optional>
        <Controller
          control={control}
          name="clubId"
          render={({ field }) => (
            <AuthSelect
              id="enrollClub"
              placeholder="انتخاب باشگاه"
              value={field.value || null}
              onValueChange={(value) => {
                field.onChange(value ?? "");
                // Sessions belong to their club, so a club change clears the stale pick.
                setValue("sessionId", "");
              }}
              options={clubs.map((club) => ({ value: club.id, label: club.name }))}
              icon={Landmark}
            />
          )}
        />
      </AuthField>

      <AuthField label="کلاس" htmlFor="enrollSession" optional>
        <Controller
          control={control}
          name="sessionId"
          render={({ field }) => (
            <AuthSelect
              id="enrollSession"
              placeholder={clubId ? (sessions.length > 0 ? "انتخاب کلاس" : "کلاس فعال ثبت نشده است") : "ابتدا باشگاه را انتخاب کنید"}
              disabled={!clubId || sessions.length === 0}
              value={field.value || null}
              onValueChange={(value) => field.onChange(value ?? "")}
              options={sessions.map((session) => ({
                value: session.id,
                label: session.name,
                description: `${weekDayLabels(session.weekDays).join(" · ")} · ${toPersianDigits(session.startTime)} تا ${toPersianDigits(session.endTime)}`,
              }))}
              icon={CalendarDays}
            />
          )}
        />
      </AuthField>
    </FormSection>
  );
}
