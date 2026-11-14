import { AbsentStudentsList } from "@/features/coach/components/students/absent-students-list";

export const metadata = { title: "غیبت ها" };

export default function CoachStudentsAbsencesPage() {
  return (
    <main className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <AbsentStudentsList />
    </main>
  );
}
