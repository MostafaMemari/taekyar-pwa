import { notFound } from "next/navigation";
import { StudentDetail } from "@/components/coach/students/student-detail";
import { getStudentProfile } from "@/lib/coach/student-profile-data";

export default async function CoachStudentPage({ params }: PageProps<"/coach/students/[id]">) {
  const { id } = await params;
  const profile = getStudentProfile(id);

  if (!profile) notFound();

  return <StudentDetail profile={profile} />;
}
