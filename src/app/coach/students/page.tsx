import { StudentsDirectory } from "@/components/coach/students-directory";

export const metadata = { title: "هنرجویان" };

export default function CoachStudentsPage() {
  return (
    <main className="min-h-dvh px-4 pb-44 pt-[max(1rem,env(safe-area-inset-top))] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <StudentsDirectory />
    </main>
  );
}
