import { SessionsDirectory } from "@/components/coach/sessions-directory";

export const metadata = { title: "کلاس ها" };

export default function CoachSessionsPage() {
  return (
    <main className="min-h-dvh px-4 pb-32 pt-[max(1rem,env(safe-area-inset-top))] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <SessionsDirectory />
    </main>
  );
}
