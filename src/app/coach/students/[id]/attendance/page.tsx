import { notFound } from "next/navigation";
import { StudentAttendanceReport } from "@/components/coach/students/student-attendance-report";
import { getStudentProfile } from "@/lib/coach/student-profile-data";

export const metadata = { title: "گزارش حضور و غیاب" };

export default async function StudentAttendancePage({ params }: PageProps<"/coach/students/[id]/attendance">) {
  const { id } = await params;
  const profile = getStudentProfile(id);

  if (!profile) notFound();

  return <StudentAttendanceReport profile={profile} />;
}
