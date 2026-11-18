"use client";

import { Landmark } from "lucide-react";
import { type Control, Controller } from "react-hook-form";
import { AuthField } from "@/components/shared/auth-field";
import { AuthInput } from "@/components/shared/auth-input";
import { AuthSelect } from "@/components/shared/auth-select";
import { useClubs } from "@/features/coach/hooks/use-clubs";
import type { SessionFormValues } from "@/features/coach/lib/session-form-model";

type FieldsProps = {
  control: Control<SessionFormValues>;
  clubLocked?: boolean;
  initialClubId?: string;
  nameError?: string;
  clubIdError?: string;
};

// Plain field flow, matching the other form sheets — no bordered section cards inside SheetFrame.
export function SessionInfoFields({ control, clubLocked, initialClubId, nameError, clubIdError }: FieldsProps) {
  const { data } = useClubs();
  // Inactive clubs take no new classes; a pinned club stays visible so the locked select shows its name.
  const clubOptions = (data?.clubs ?? [])
    .filter((club) => club.isActive || club.id === initialClubId)
    .map((club) => ({ value: club.id, label: club.name }));
  // A club passed from the club context is locked once its option exists; until the list loads the select stays open.
  const clubPinned = clubLocked || (initialClubId !== undefined && clubOptions.some((option) => option.value === initialClubId));
  const presetLabel = clubOptions.find((option) => option.value === initialClubId)?.label;

  return (
    <div className="flex flex-col gap-3.5">
      <AuthField label="نام کلاس" htmlFor="name" required error={nameError}>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <AuthInput
              id="name"
              name={field.name}
              maxLength={80}
              placeholder="مثلا کیوروگی آقایان"
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
              ref={field.ref}
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
              icon={Landmark}
              value={field.value || null}
              onValueChange={(value) => field.onChange(value ?? "")}
              placeholder="انتخاب باشگاه"
              options={clubOptions}
              disabled={clubPinned}
            />
          )}
        />
      </AuthField>

      {presetLabel || clubLocked ? (
        <p className="rounded-xl bg-info-soft/60 p-3 text-[12px] leading-5 text-ink-muted">
          {clubLocked
            ? "باشگاه کلاس پس از ساخت تغییر نمی کند؛ برای جابه جایی کلاس، یک کلاس در باشگاه دیگر بسازید"
            : `کلاس به باشگاه ${presetLabel} متصل می شود؛ افزودن هنرجو پس از ساخت کلاس انجام می شود`}
        </p>
      ) : null}
    </div>
  );
}
