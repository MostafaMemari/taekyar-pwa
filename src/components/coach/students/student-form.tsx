"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { FormDock } from "@/components/coach/coach-form";
import { emptyStudentForm, type StudentFormState, type StudentFormUpdater, studentToForm } from "@/lib/coach/student-form-model";
import type { StudentProfile } from "@/lib/coach/student-profile-data";
import { StudentEnrollmentFields, StudentPersonalFields, StudentSessionsFields, StudentSportsFields } from "./student-form-fields";

export function StudentForm({ mode, profile }: { mode: "create" | "edit"; profile?: StudentProfile }) {
  const router = useRouter();
  const [form, setForm] = useState<StudentFormState>(() => (profile ? studentToForm(profile) : emptyStudentForm()));

  const update: StudentFormUpdater = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(profile ? `/coach/students/${profile.id}` : "/coach/students");
  };

  return (
    <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <StudentPersonalFields form={form} onChange={update} locked={mode === "edit"} />
      <StudentSportsFields form={form} onChange={update} locked={mode === "edit"} />
      <StudentEnrollmentFields form={form} onChange={update} showImageExpiry={mode === "edit"} />
      <StudentSessionsFields form={form} onChange={update} locked={mode === "edit"} />

      <FormDock
        cancelHref={profile ? `/coach/students/${profile.id}` : "/coach/students"}
        submitLabel={mode === "edit" ? "ذخیره تغییرات" : "ثبت هنرجو"}
      />
    </form>
  );
}
