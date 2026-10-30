import { StudentAttendanceReport } from "@/features/coach/components/students/student-attendance-report";

export const metadata = { title: "گزارش حضور و غیاب" };

export default async function StudentAttendancePage({ params }: PageProps<"/coach/students/[id]/attendance">) {
  const { id } = await params;

  return <StudentAttendanceReport studentId={id} />;
}
