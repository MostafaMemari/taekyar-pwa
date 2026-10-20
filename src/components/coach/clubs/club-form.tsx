"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { FormDock } from "@/components/coach/coach-form";
import { type ClubFormState, type ClubFormUpdater, clubToForm, emptyClubForm } from "@/lib/coach/club-form-model";
import type { Club } from "@/lib/coach/coach-data";
import { ClubAdmissionFields, ClubCoverFields, ClubInfoFields } from "./club-form-fields";

export function ClubForm({ mode, club }: { mode: "create" | "edit"; club?: Club }) {
  const router = useRouter();
  const [form, setForm] = useState<ClubFormState>(() => (club ? clubToForm(club) : emptyClubForm()));

  const update: ClubFormUpdater = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(club ? `/coach/clubs/${club.id}` : "/coach/clubs");
  };

  return (
    <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <ClubCoverFields />
      <ClubInfoFields form={form} onChange={update} />
      <ClubAdmissionFields form={form} onChange={update} />

      <FormDock
        cancelHref={club ? `/coach/clubs/${club.id}` : "/coach/clubs"}
        submitLabel={mode === "edit" ? "ذخیره تغییرات" : "ایجاد باشگاه"}
      />
    </form>
  );
}
