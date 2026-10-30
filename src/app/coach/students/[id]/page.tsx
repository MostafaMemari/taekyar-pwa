import { StudentDetail } from "@/features/coach/components/students/student-detail";

export default async function CoachStudentPage({ params }: PageProps<"/coach/students/[id]">) {
  const { id } = await params;

  return <StudentDetail studentId={id} />;
}
