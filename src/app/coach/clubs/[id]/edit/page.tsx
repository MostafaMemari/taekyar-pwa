import { notFound } from "next/navigation";
import { ClubForm } from "@/components/coach/clubs/club-form";
import { CoachPageHeader } from "@/components/coach/coach-page-header";
import { getClub } from "@/lib/coach/coach-data";

export const metadata = { title: "ویرایش باشگاه" };

export default async function EditClubPage({ params }: PageProps<"/coach/clubs/[id]/edit">) {
  const { id } = await params;
  const club = getClub(id);

  if (!club) notFound();

  return (
    <main className="min-h-dvh px-4 pb-44 pt-[max(1rem,env(safe-area-inset-top))] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <CoachPageHeader title="ویرایش باشگاه" subtitle={club.name} backHref={`/coach/clubs/${club.id}`} />
      <ClubForm mode="edit" club={club} />
    </main>
  );
}
