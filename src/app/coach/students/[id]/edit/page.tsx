import { notFound } from "next/navigation";
import { CoachPageHeader } from "@/components/coach/coach-page-header";
import { StudentForm } from "@/components/coach/students/student-form";
import { getStudentProfile } from "@/lib/coach/student-profile-data";

export const metadata = { title: "ویرایش اطلاعات هنرجو" };

export default async function EditStudentPage({ params }: PageProps<"/coach/students/[id]/edit">) {
  const { id } = await params;
  const profile = getStudentProfile(id);

  if (!profile) notFound();

  return (
    <main className="min-h-dvh px-4 pb-44 pt-[max(1rem,env(safe-area-inset-top))] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <CoachPageHeader title="ویرایش اطلاعات هنرجو" subtitle={profile.name} backHref={`/coach/students/${profile.id}`} />
      <StudentForm mode="edit" profile={profile} />
    </main>
  );
}
