"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { FormDock } from "@/features/coach/components/form-dock";
import { useCreateStudent, useUpdateStudent } from "@/features/coach/hooks/use-student-mutations";
import type { StudentDetailRecord } from "@/features/coach/lib/student-api";
import {
  emptyStudentForm,
  type StudentFormValues,
  studentDetailToForm,
  studentEditFormSchema,
  studentFormSchema,
  studentFormToInput,
  studentFormToUpdateInput,
} from "@/features/coach/lib/student-form-model";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { StudentEnrollmentFields } from "./student-enrollment-fields";
import { StudentPersonalFields } from "./student-personal-fields";
import { StudentSportsFields } from "./student-sports-fields";

export function StudentForm({
  mode,
  student,
  photo,
}: {
  mode: "create" | "edit";
  student?: StudentDetailRecord;
  photo?: { imageSrc?: string | null; pending?: boolean; error?: string; onSelectFile?: (file: File) => void };
}) {
  const router = useRouter();
  const create = useCreateStudent();
  const update = useUpdateStudent();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(mode === "edit" ? studentEditFormSchema : studentFormSchema),
    defaultValues: student ? studentDetailToForm(student) : emptyStudentForm,
  });

  const submit = handleSubmit(async (values) => {
    try {
      if (mode === "edit" && student) {
        await update.trigger({ id: student.id, input: studentFormToUpdateInput(values) });
        router.push(`/coach/students/${student.id}`);
        return;
      }

      await create.trigger(studentFormToInput(values));
      router.push("/coach/students");
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
    }
  });

  const failure = mode === "edit" ? update.error : create.error;

  return (
    <form className="mt-4 flex flex-col gap-4" onSubmit={submit} noValidate>
      <StudentPersonalFields control={control} errors={errors} locked={mode === "edit"} />
      <StudentSportsFields control={control} errors={errors} mode={mode} />
      <StudentEnrollmentFields control={control} errors={errors} showImageExpiry={mode === "edit"} photo={photo} />

      <AuthFormError message={failure ? apiErrorMessage(failure) : ""} />

      <FormDock
        cancelHref={student ? `/coach/students/${student.id}` : "/coach/students"}
        submitLabel={mode === "edit" ? "ذخیره تغییرات" : "ثبت هنرجو"}
        pending={isSubmitting}
      />
    </form>
  );
}
