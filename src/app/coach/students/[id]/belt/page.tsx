import { notFound } from "next/navigation";
import { CoachPageHeader } from "@/components/coach/coach-page-header";
import { StudentBeltForm } from "@/components/coach/students/student-belt-form";
import { getStudentProfile } from "@/lib/coach/student-profile-data";

export const metadata = { title: "تخصیص کمربند" };

export default async function StudentBeltPage({ params }: PageProps<"/coach/students/[id]/belt">) {
  const { id } = await params;
  const profile = getStudentProfile(id);

  if (!profile) notFound();

  return (
    <main className="min-h-dvh px-4 pb-44 pt-[max(1rem,env(safe-area-inset-top))] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <CoachPageHeader title="تخصیص کمربند" subtitle={profile.name} backHref={`/coach/students/${profile.id}`} />
      <StudentBeltForm profile={profile} />
    </main>
  );
}
