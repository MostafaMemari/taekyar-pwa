"use client";

import { NotFoundScreen } from "@/components/shared/not-found-screen";
import { Skeleton } from "@/components/ui/skeleton";
import { CoachPageHeader } from "@/features/coach/components/coach-page-header";
import { ErrorState } from "@/features/coach/components/error-state";
import { useStudent } from "@/features/coach/hooks/use-student";
import { useUploadStudentImage } from "@/features/coach/hooks/use-student-mutations";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { imageUrlOf } from "@/lib/images";
import { StudentForm } from "./student-form";

export function StudentEditScreen({ studentId }: { studentId: string }) {
  const student = useStudent(studentId);
  const uploadImage = useUploadStudentImage(studentId);

  if (student.error) {
    const missing = student.error instanceof ApiError && student.error.status === 404;

    return (
      <main className="min-h-dvh px-4 pb-44 pt-[max(1rem,env(safe-area-inset-top))]">
        <CoachPageHeader title="ویرایش اطلاعات هنرجو" backHref={`/coach/students/${studentId}`} />
        {missing ? (
          <NotFoundScreen
            className="mt-4"
            title="این هنرجو پیدا نشد"
            description="پرونده ای با این نشانی در فهرست هنرجویان شما نیست. ممکن است حذف شده باشد یا متعلق به مربی دیگری باشد."
            backHref="/coach/students"
            backLabel="بازگشت به هنرجویان"
          />
        ) : (
          <ErrorState
            className="mt-4"
            title="خواندن پرونده هنرجو انجام نشد"
            message={apiErrorMessage(student.error)}
            onRetry={() => void student.mutate()}
          />
        )}
      </main>
    );
  }

  if (!student.data) {
    return (
      <main className="min-h-dvh px-4 pb-44 pt-[max(1rem,env(safe-area-inset-top))]">
        <CoachPageHeader title="ویرایش اطلاعات هنرجو" backHref={`/coach/students/${studentId}`} />
        <Skeleton className="mt-4 h-64 rounded-2xl" />
        <Skeleton className="mt-4 h-72 rounded-2xl" />
      </main>
    );
  }

  return (
    <main className="min-h-dvh px-4 pb-44 pt-[max(1rem,env(safe-area-inset-top))] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <CoachPageHeader title="ویرایش اطلاعات هنرجو" subtitle={student.data.fullName} backHref={`/coach/students/${studentId}`} />
      <StudentForm
        mode="edit"
        student={student.data}
        photo={{
          imageSrc: imageUrlOf(student.data.imageKey),
          pending: uploadImage.isMutating,
          error: uploadImage.error ? apiErrorMessage(uploadImage.error) : undefined,
          onSelectFile: (file) => void uploadImage.trigger(file),
        }}
      />
    </main>
  );
}
