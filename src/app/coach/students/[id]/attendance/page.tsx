import { notFound } from "next/navigation";
import { StudentAttendanceReport } from "@/features/coach/components/students/student-attendance-report";
import { getStudentProfile } from "@/features/coach/lib/student-profile-data";

export const metadata = { title: "گزارش حضور و غیاب" };

export default async function StudentAttendancePage({ params }: PageProps<"/coach/students/[id]/attendance">) {
  const { id } = await params;
  const profile = getStudentProfile(id);

  if (!profile) notFound();

  return <StudentAttendanceReport profile={profile} />;
}
