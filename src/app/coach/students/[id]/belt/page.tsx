import { StudentBeltForm } from "@/features/coach/components/students/student-belt-form";

export const metadata = { title: "تخصیص کمربند" };

export default async function StudentBeltPage({ params }: PageProps<"/coach/students/[id]/belt">) {
  const { id } = await params;

  return <StudentBeltForm studentId={id} />;
}
