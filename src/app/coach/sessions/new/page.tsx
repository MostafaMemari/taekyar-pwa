import { CoachPageHeader } from "@/components/coach/coach-page-header";
import { SessionForm } from "@/components/coach/sessions/session-form";

export const metadata = { title: "ثبت کلاس جدید" };

export default function NewSessionPage() {
  return (
    <main className="min-h-dvh px-4 pb-44 pt-[max(1rem,env(safe-area-inset-top))] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <CoachPageHeader title="کلاس جدید" backHref="/coach/sessions" />
      <SessionForm mode="create" />
    </main>
  );
}
