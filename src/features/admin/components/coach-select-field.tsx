"use client";

import { AuthField } from "@/components/shared/auth-field";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, createItems } from "@/components/ui/combobox";
import { useCoaches } from "@/features/admin/hooks/use-coaches";

type CoachSelectFieldProps = {
  id: string;
  value: string | null;
  onValueChange: (value: string | null) => void;
  error?: string;
};

// The autocomplete select from the shadcn combobox docs: typing in the field itself filters
// the list, and picking a coach fills the field with their name.
export function CoachSelectField({ id, value, onValueChange, error }: CoachSelectFieldProps) {
  const { data: coaches } = useCoaches();
  const coachItems = createItems(coaches ?? [], {
    getValue: (coach) => coach.id,
    getLabel: (coach) => coach.fullName,
  });

  return (
    <AuthField label="مربی" htmlFor={id} required error={error}>
      <Combobox items={coachItems} value={value ?? null} onValueChange={(coachId) => onValueChange(coachId ?? null)}>
        <ComboboxInput id={id} placeholder="جستجو و انتخاب مربی" className="h-12 w-full rounded-xl" />
        <ComboboxContent className="min-w-0">
          <ComboboxEmpty>مربی ای با این نام ثبت نشده است</ComboboxEmpty>
          <ComboboxList>
            {(coach) => (
              // RTL: the check indicator sits at the logical end of the row.
              <ComboboxItem key={coach.id} value={coach.id} className="pr-1.5 pl-8 [&>span]:right-auto [&>span]:left-2">
                {coach.fullName}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </AuthField>
  );
}
