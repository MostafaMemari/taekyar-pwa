import { ClubForm } from "@/components/coach/clubs/club-form";
import { CoachPageHeader } from "@/components/coach/coach-page-header";

export const metadata = { title: "ثبت باشگاه جدید" };

export default function NewClubPage() {
  return (
    <main className="min-h-dvh px-4 pb-44 pt-[max(1rem,env(safe-area-inset-top))] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <CoachPageHeader title="ثبت باشگاه جدید" backHref="/coach/clubs" />
      <ClubForm mode="create" />
    </main>
  );
}
