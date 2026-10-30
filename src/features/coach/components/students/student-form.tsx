"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { FormDock } from "@/features/coach/components/form-dock";
import { useCreateStudent } from "@/features/coach/hooks/use-student-mutations";
import {
  emptyStudentForm,
  type StudentFormValues,
  studentFormSchema,
  studentFormToInput,
  studentToForm,
} from "@/features/coach/lib/student-form-model";
import type { StudentProfile } from "@/features/coach/lib/student-profile-data";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { StudentEnrollmentFields } from "./student-enrollment-fields";
import { StudentPersonalFields } from "./student-personal-fields";
import { StudentSportsFields } from "./student-sports-fields";

export function StudentForm({ mode, profile }: { mode: "create" | "edit"; profile?: StudentProfile }) {
  const router = useRouter();
  const create = useCreateStudent();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: profile ? studentToForm(profile) : emptyStudentForm,
  });

  const submit = handleSubmit(async (values) => {
    if (mode === "edit") {
      router.push(`/coach/students/${profile?.id ?? ""}`);
      return;
    }

    try {
      await create.trigger(studentFormToInput(values));
      router.push("/coach/students");
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
    }
  });

  return (
    <form className="mt-4 flex flex-col gap-4" onSubmit={submit} noValidate>
      <StudentPersonalFields control={control} errors={errors} locked={mode === "edit"} />
      <StudentSportsFields control={control} errors={errors} mode={mode} />
      <StudentEnrollmentFields control={control} errors={errors} showImageExpiry={mode === "edit"} />

      <AuthFormError message={create.error ? apiErrorMessage(create.error) : ""} />

      <FormDock
        cancelHref={profile ? `/coach/students/${profile.id}` : "/coach/students"}
        submitLabel={mode === "edit" ? "ذخیره تغییرات" : "ثبت هنرجو"}
        pending={isSubmitting}
      />
    </form>
  );
}
