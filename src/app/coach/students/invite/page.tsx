import { CoachPageHeader } from "@/components/coach/coach-page-header";
import { InviteForm } from "@/components/coach/students/invite-form";

export const metadata = { title: "افزودن / دعوت هنرجو" };

export default function InviteStudentPage() {
  return (
    <main className="min-h-dvh px-4 pb-44 pt-[max(1rem,env(safe-area-inset-top))] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <CoachPageHeader title="افزودن / دعوت هنرجو" backHref="/coach/students" />
      <InviteForm />
    </main>
  );
}
