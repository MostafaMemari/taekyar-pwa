"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ding-toaster";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { FormDock } from "@/features/coach/components/form-dock";
import { useAddClubStudent } from "@/features/coach/hooks/use-club-mutations";
import { useAddStudentsToSession } from "@/features/coach/hooks/use-session-mutations";
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
import { StudentEnrollFields } from "./student-enroll-fields";
import { StudentMembershipField } from "./student-membership-field";
import { StudentPersonalFields } from "./student-personal-fields";
import { StudentPhotoFields } from "./student-photo-fields";
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
  const joinClub = useAddClubStudent();
  const joinSession = useAddStudentsToSession();

  const {
    control,
    handleSubmit,
    setValue,
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

      const studentId = await create.trigger(studentFormToInput(values));

      // The student already exists, so an enrollment failure only toasts; blocking here would
      // invite a resubmit that the backend rejects as a duplicate national code.
      if (values.clubId) {
        try {
          if (values.sessionId) {
            await joinSession.trigger({ sessionId: values.sessionId, clubId: values.clubId, studentIds: [studentId] });
          } else {
            await joinClub.trigger({ clubId: values.clubId, studentId });
          }
        } catch (enrollError) {
          toast.error(apiErrorMessage(enrollError));
        }
      }

      router.push("/coach/students");
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
    }
  });

  const failure = mode === "edit" ? update.error : create.error;

  return (
    <form className="mt-4 flex flex-col gap-4" onSubmit={submit} noValidate>
      {mode === "create" ? (
        <>
          <StudentPhotoFields control={control} mode={mode} photo={photo} />
          <StudentPersonalFields control={control} errors={errors} />
          <StudentSportsFields control={control} errors={errors} mode={mode} />
          <StudentMembershipField control={control} errors={errors} />
          <StudentEnrollFields control={control} setValue={setValue} />
        </>
      ) : (
        <>
          <StudentPhotoFields control={control} mode={mode} photo={photo} />
          <StudentPersonalFields control={control} errors={errors} locked />
        </>
      )}

      <AuthFormError message={failure ? apiErrorMessage(failure) : ""} />

      <FormDock
        cancelHref={student ? `/coach/students/${student.id}` : "/coach/students"}
        submitLabel={mode === "edit" ? "ذخیره تغییرات" : "ثبت هنرجو"}
        pending={isSubmitting}
      />
    </form>
  );
}
