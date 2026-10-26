import { notFound } from "next/navigation";
import { StudentDetail } from "@/features/coach/components/students/student-detail";
import { getStudentProfile } from "@/features/coach/lib/student-profile-data";

export default async function CoachStudentPage({ params }: PageProps<"/coach/students/[id]">) {
  const { id } = await params;
  const profile = getStudentProfile(id);

  if (!profile) notFound();

  return <StudentDetail profile={profile} />;
}
