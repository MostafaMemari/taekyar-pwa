import { StudentEditScreen } from "@/features/coach/components/students/student-edit-screen";

export const metadata = { title: "ویرایش اطلاعات هنرجو" };

export default async function EditStudentPage({ params }: PageProps<"/coach/students/[id]/edit">) {
  const { id } = await params;

  return <StudentEditScreen studentId={id} />;
}
